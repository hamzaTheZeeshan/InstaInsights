import type { RawInstagramExport, RawMessage } from '../types/instagram';
import type { Message, Attachment } from '../types/message';
import { decodeInstagramText } from './instagramParser';

const SYSTEM_MESSAGE_PATTERNS = [
  'liked a message',
  'reacted to your message',
  'reacted to a message',
  'sent an attachment',
  'you sent an attachment',
  'missed a video call',
  'missed a voice call',
  'started a video call',
  'started a voice call',
  'in a call',
  'ended the video call',
];

const SYSTEM_SENDERS = [
  'meta ai',
  'instagram',
];

function isSystemMessage(raw: RawMessage): boolean {
  // filter by sender
  const senderLower = raw.sender_name.toLowerCase();
  if (SYSTEM_SENDERS.some(s => senderLower.includes(s))) return true;

  // filter by content
  if (!raw.content) return false;
  const lower = raw.content.toLowerCase();
  return SYSTEM_MESSAGE_PATTERNS.some(pattern => lower.includes(pattern));
}

function isShareOnly(raw: RawMessage): boolean {
  return (
    !!raw.share?.link &&
    (!raw.content || raw.content === 'You sent an attachment.')
  );
}

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
  if (isShareOnly(raw)) return '';
  if (isSystemMessage(raw)) return '';
  if (raw.content && raw.content !== 'You sent an attachment.') {
    return decodeInstagramText(raw.content);
  }
  return '';
}

export function normalizeMessages(data: RawInstagramExport): Message[] {
  return data.messages
    .filter(raw => !isSystemMessage(raw))
    .map((raw, index) => ({
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
    data.messages
      .filter(raw => !isSystemMessage(raw))
      .map((raw, index) => ({
        id: `msg_${exportIndex}_${index}_${raw.timestamp_ms}`,
        sender: decodeInstagramText(raw.sender_name),
        timestamp: raw.timestamp_ms,
        content: extractContent(raw),
        reactions: (raw.reactions ?? []).map(r => decodeReaction(r.reaction)),
        attachments: extractAttachments(raw),
        isUnsent: raw.is_unsent_image_by_messenger_kid_parent ?? false,
      }))
  );

  const seen = new Set<number>();
  return allMessages
    .filter(m => {
      if (seen.has(m.timestamp)) return false;
      seen.add(m.timestamp);
      return true;
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}