import type { RawInstagramExport } from '../types/instagram';

export function decodeInstagramText(str: string): string {
  try {
    const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return str;
  }
}

export function parseInstagramExport(jsonString: string): RawInstagramExport {
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON file. Please upload a valid Instagram export.');
  }

  const data = parsed as Record<string, unknown>;

  if (!data.participants || !data.messages) {
    throw new Error('This does not look like an Instagram chat export.');
  }

  if (!Array.isArray(data.messages)) {
    throw new Error('Messages field is not an array.');
  }

  return parsed as RawInstagramExport;
}