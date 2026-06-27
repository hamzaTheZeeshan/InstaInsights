import { Unzip, UnzipInflate, strFromU8 } from 'fflate';
import type { UnzipFile } from 'fflate';
import { parseInstagramExport, decodeInstagramText } from './instagramParser';
import type { RawInstagramExport } from '../types/instagram';

export interface InboxPreview {
  folderName: string;
  title: string;
  participants: string[];
  messageFiles: string[];
}

export interface ZipIndex {
  file: File;
  entries: Record<string, { offset: number; size: number }>;
}

// ── Step 1: Stream through ZIP and build index of file paths ─────────────────
export function buildZipIndex(file: File): Promise<ZipIndex> {
  return new Promise((resolve, reject) => {
    const entries: Record<string, { offset: number; size: number }> = {};
    const unzip = new Unzip();

    unzip.register(UnzipInflate);
    unzip.onfile = (entry: UnzipFile) => {
      entries[entry.name] = { offset: 0, size: entry.size ?? 0 };
      entry.ondata = () => {};
      entry.start();
    };

    const reader = file.stream().getReader();
    const pump = (): Promise<void> =>
      reader.read().then(({ done, value }) => {
        if (done) {
          resolve({ file, entries });
          return;
        }
        try {
          unzip.push(value, done);
        } catch (e) {
          reject(e);
          return;
        }
        return pump();
      });

    pump().catch(reject);
  });
}

// ── Step 2: Scan inbox folders from index ────────────────────────────────────
export function scanInboxesFromIndex(index: ZipIndex): InboxPreview[] {
  const inboxFolders = new Set<string>();
  const allPaths = Object.keys(index.entries);

  for (const path of allPaths) {
    const match = path.match(
      /your_instagram_activity\/messages\/inbox\/([^/]+)\/message_1\.json$/
    );
    if (match) inboxFolders.add(match[1]);
  }

  const inboxes: InboxPreview[] = [];

  for (const folderName of inboxFolders) {
    const basePath = allPaths.find(p =>
      p.includes(`/inbox/${folderName}/message_1.json`)
    )?.replace('message_1.json', '');

    if (!basePath) continue;

    const messageFiles = allPaths
      .filter(p => p.startsWith(basePath) && p.match(/message_\d+\.json$/))
      .sort((a, b) => {
        const na = parseInt(a.match(/message_(\d+)\.json$/)?.[1] ?? '0');
        const nb = parseInt(b.match(/message_(\d+)\.json$/)?.[1] ?? '0');
        return na - nb;
      });

    if (messageFiles.length === 0) continue;

    const displayName = folderName.replace(/_\d+$/, '').replace(/_/g, ' ');

    inboxes.push({
      folderName,
      title: displayName,
      participants: [],
      messageFiles,
    });
  }

  return inboxes.sort((a, b) => a.title.localeCompare(b.title));
}

// ── Step 3: Extract specific files from ZIP on demand ────────────────────────
export function extractFilesFromZip(
  file: File,
  targetPaths: Set<string>
): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    const results: Record<string, Uint8Array> = {};
    const remaining = new Set(targetPaths);
    const unzip = new Unzip();

    unzip.register(UnzipInflate);
    unzip.onfile = (entry: UnzipFile) => {
      if (!remaining.has(entry.name)) {
        entry.ondata = () => {};
        entry.start();
        return;
      }

      const chunks: Uint8Array[] = [];

      entry.ondata = (err, chunk, final) => {
        if (err) { reject(err); return; }
        chunks.push(chunk);
        if (final) {
          const total = chunks.reduce((s, c) => s + c.length, 0);
          const merged = new Uint8Array(total);
          let offset = 0;
          for (const c of chunks) { merged.set(c, offset); offset += c.length; }
          results[entry.name] = merged;
          remaining.delete(entry.name);
          if (remaining.size === 0) resolve(results);
        }
      };

      entry.start();
    };

    const reader = file.stream().getReader();
    const pump = (): Promise<void> =>
      reader.read().then(({ done, value }) => {
        if (done) {
          resolve(results);
          return;
        }
        try {
          unzip.push(value, done);
        } catch (e) {
          reject(e);
          return;
        }
        return pump();
      });

    pump().catch(reject);
  });
}

// ── Step 4: Load one inbox's messages on demand ──────────────────────────────
export async function loadInboxFromZip(
  zipFile: File,
  inbox: InboxPreview
): Promise<{ exports: RawInstagramExport[]; resolvedInbox: InboxPreview }> {
  const targetPaths = new Set(inbox.messageFiles);
  const files = await extractFilesFromZip(zipFile, targetPaths);

  const exports: RawInstagramExport[] = [];

  for (const filePath of inbox.messageFiles) {
    const data = files[filePath];
    if (!data) continue;
    try {
      const text = strFromU8(data);
      const raw = parseInstagramExport(text);
      exports.push(raw);
    } catch {
      // skip malformed
    }
  }

  let resolvedTitle = inbox.title;
  let resolvedParticipants = inbox.participants;

  if (exports.length > 0) {
    const first = exports[0];
    resolvedTitle = first.title
      ? decodeInstagramText(first.title)
      : first.participants.map(p => decodeInstagramText(p.name)).join(', ');
    resolvedParticipants = first.participants.map(p => decodeInstagramText(p.name));
  }

  return {
    exports,
    resolvedInbox: {
      ...inbox,
      title: resolvedTitle,
      participants: resolvedParticipants,
    },
  };
}

// ── Step 5: Resolve inbox titles by reading message_1.json for each ──────────
export async function resolveInboxTitles(
  zipFile: File,
  inboxes: InboxPreview[]
): Promise<InboxPreview[]> {
  const targetPaths = new Set(inboxes.map(i => i.messageFiles[0]).filter(Boolean));
  const files = await extractFilesFromZip(zipFile, targetPaths);

  return inboxes.map(inbox => {
    const data = files[inbox.messageFiles[0]];
    if (!data) return inbox;
    try {
      const text = strFromU8(data);
      const raw = parseInstagramExport(text);
      const title = raw.title
        ? decodeInstagramText(raw.title)
        : raw.participants.map(p => decodeInstagramText(p.name)).join(', ');
      const participants = raw.participants.map(p => decodeInstagramText(p.name));
      return { ...inbox, title, participants };
    } catch {
      return inbox;
    }
  }).sort((a, b) => a.title.localeCompare(b.title));
}