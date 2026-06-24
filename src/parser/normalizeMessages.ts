import type { RawInstagramExport, RawMessage } from '../types/instagram';
import type { Message, Attachment } from '../types/message';
import { decodeInstagramText } from './instagramParser';

function decodeReaction(reaction: string): string {
  try {
    const bytes = new Uint8Array(reaction.split('').map(c => c.charCodeAt(0)));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return reaction;
  }
}

function extractAttachments(raw: RawMessage): Attachment[] {
  const attachments: Attachment[] = [];
  if (raw.photos) raw.photos.forEach(p => attachments.push({ type: 'photo', uri: p.uri }));
  if (raw.videos) raw.videos.forEach(v => attachments.push({ type: 'video', uri: v.uri }));
  if (raw.audio_files) raw.audio_files.forEach(a => attachments.push({ type: 'audio', uri: a.uri }));
  if (raw.share?.link) attachments.push({ type: 'link', uri: raw.share.link });
  return attachments;
}

function extractContent(raw: RawMessage): string {
  if (raw.share?.link && raw.content === 'You sent an attachment.') {
    return raw.share.share_text ? decodeInstagramText(raw.share.share_text) : raw.share.link;
  }
  return raw.content ? decodeInstagramText(raw.content) : '';
}

export function normalizeMessages(data: RawInstagramExport): Message[] {
  return data.messages.map((raw, index) => ({
    id: `msg_${index}_${raw.timestamp_ms}`,
    sender: decodeInstagramText(raw.sender_name),
    timestamp: raw.timestamp_ms,
    content: extractContent(raw),
    reactions: (raw.reactions ?? []).map(r => decodeReaction(r.reaction)),
    attachments: extractAttachments(raw),
    isUnsent: raw.is_unsent_image_by_messenger_kid_parent ?? false,
  }));
}

export function mergeAndNormalizeExports(exports: RawInstagramExport[]): Message[] {
  const allMessages = exports.flatMap((data, exportIndex) =>
    data.messages.map((raw, index) => ({
      id: `msg_${exportIndex}_${index}_${raw.timestamp_ms}`,
      sender: decodeInstagramText(raw.sender_name),
      timestamp: raw.timestamp_ms,
      content: extractContent(raw),
      reactions: (raw.reactions ?? []).map(r => decodeReaction(r.reaction)),
      attachments: extractAttachments(raw),
      isUnsent: raw.is_unsent_image_by_messenger_kid_parent ?? false,
    }))
  );

  // sort by timestamp oldest to newest, remove duplicates
  const seen = new Set<number>();
  return allMessages
    .filter(m => {
      if (seen.has(m.timestamp)) return false;
      seen.add(m.timestamp);
      return true;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}