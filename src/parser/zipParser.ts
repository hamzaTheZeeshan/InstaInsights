import JSZip from 'jszip';
import { parseInstagramExport } from './instagramParser';
import { decodeInstagramText } from './instagramParser';
import type { RawInstagramExport } from '../types/instagram';

export interface InboxPreview {
  folderName: string;
  title: string;
  participants: string[];
  messageFiles: string[];
}

export async function extractZip(file: File): Promise<JSZip> {
  const zip = new JSZip();
  return await zip.loadAsync(file);
}

export async function scanInboxes(zip: JSZip): Promise<InboxPreview[]> {
  const inboxes: InboxPreview[] = [];
  const inboxPaths = new Set<string>();

  zip.forEach((relativePath) => {
    const match = relativePath.match(
      /your_instagram_activity\/messages\/inbox\/([^/]+)\/message_1\.json$/
    );
    if (match) {
      inboxPaths.add(match[1]);
    }
  });

  for (const folderName of inboxPaths) {
    const basePath = findInboxBasePath(zip, folderName);
    if (!basePath) continue;

    const msg1Path = `${basePath}message_1.json`;
    const file = zip.file(msg1Path);
    if (!file) continue;

    try {
      const text = await file.async('string');
      const raw = parseInstagramExport(text);
      const messageFiles = findMessageFiles(zip, basePath);

      // decode title and participant names properly
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

function findInboxBasePath(zip: JSZip, folderName: string): string | null {
  let result: string | null = null;
  zip.forEach((relativePath) => {
    if (relativePath.includes(`/inbox/${folderName}/message_1.json`)) {
      result = relativePath.replace('message_1.json', '');
    }
  });
  return result;
}

function findMessageFiles(zip: JSZip, basePath: string): string[] {
  const files: string[] = [];
  zip.forEach((relativePath) => {
    if (
      relativePath.startsWith(basePath) &&
      relativePath.match(/message_\d+\.json$/)
    ) {
      files.push(relativePath);
    }
  });
  return files.sort((a, b) => {
    const numA = parseInt(a.match(/message_(\d+)\.json$/)?.[1] ?? '0');
    const numB = parseInt(b.match(/message_(\d+)\.json$/)?.[1] ?? '0');
    return numA - numB;
  });
}

export async function loadInboxMessages(
  zip: JSZip,
  messageFiles: string[]
): Promise<RawInstagramExport[]> {
  const exports: RawInstagramExport[] = [];

  for (const filePath of messageFiles) {
    const file = zip.file(filePath);
    if (!file) continue;
    try {
      const text = await file.async('string');
      const raw = parseInstagramExport(text);
      exports.push(raw);
    } catch {
      // skip malformed files
    }
  }

  return exports;
}