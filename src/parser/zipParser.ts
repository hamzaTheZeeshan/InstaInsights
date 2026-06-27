import { unzip } from 'fflate';
import { parseInstagramExport, decodeInstagramText } from './instagramParser';
import type { RawInstagramExport } from '../types/instagram';

export interface InboxPreview {
  folderName: string;
  title: string;
  participants: string[];
  messageFiles: string[];
}

function uint8ToString(buf: Uint8Array): string {
  return new TextDecoder('utf-8').decode(buf);
}

function unzipFile(file: File): Promise<Record<string, Uint8Array>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      unzip(new Uint8Array(buffer), (err, unzipped) => {
        if (err) reject(err);
        else resolve(unzipped);
      });
    };
    reader.onerror = () => reject(new Error('Could not read file.'));
    reader.readAsArrayBuffer(file);
  });
}

export async function extractZip(file: File): Promise<Record<string, Uint8Array>> {
  return await unzipFile(file);
}

export async function scanInboxes(
  unzipped: Record<string, Uint8Array>
): Promise<InboxPreview[]> {
  const inboxes: InboxPreview[] = [];
  const inboxFolders = new Set<string>();

  for (const path of Object.keys(unzipped)) {
    const match = path.match(
      /your_instagram_activity\/messages\/inbox\/([^/]+)\/message_1\.json$/
    );
    if (match) inboxFolders.add(match[1]);
  }

  for (const folderName of inboxFolders) {
    const basePath = Object.keys(unzipped).find(p =>
      p.includes(`/inbox/${folderName}/message_1.json`)
    )?.replace('message_1.json', '');

    if (!basePath) continue;

    const msg1Data = unzipped[`${basePath}message_1.json`];
    if (!msg1Data) continue;

    try {
      const text = uint8ToString(msg1Data);
      const raw = parseInstagramExport(text);

      const messageFiles = Object.keys(unzipped)
        .filter(p => p.startsWith(basePath) && p.match(/message_\d+\.json$/))
        .sort((a, b) => {
          const na = parseInt(a.match(/message_(\d+)\.json$/)?.[1] ?? '0');
          const nb = parseInt(b.match(/message_(\d+)\.json$/)?.[1] ?? '0');
          return na - nb;
        });

      const decodedTitle = raw.title ? decodeInstagramText(raw.title) : '';
      const decodedParticipants = raw.participants.map(p => decodeInstagramText(p.name));

      inboxes.push({
        folderName,
        title: decodedTitle || decodedParticipants.join(', '),
        participants: decodedParticipants,
        messageFiles,
      });
    } catch {
      // skip malformed inboxes
    }
  }

  return inboxes.sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadInboxMessages(
  unzipped: Record<string, Uint8Array>,
  messageFiles: string[]
): Promise<RawInstagramExport[]> {
  const exports: RawInstagramExport[] = [];

  for (const filePath of messageFiles) {
    const data = unzipped[filePath];
    if (!data) continue;
    try {
      const text = uint8ToString(data);
      const raw = parseInstagramExport(text);
      exports.push(raw);
    } catch {
      // skip malformed files
    }
  }

  return exports;
}