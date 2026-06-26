import type { RawInstagramExport, RawMessage } from '../types/instagram';
import type { Message, Attachment } from '../types/message';
import { decodeInstagramText } from './instagramParser';

const SYSTEM_SENDERS = ['meta ai', 'instagram'];

function isSystemMessage(raw: RawMessage): boolean {
  // never filter media messages — they are real messages
  if (raw.photos || raw.videos || raw.audio_files) return false;

  // never filter reel shares — handled separately
  if (raw.share?.link) return false;

  // filter by sender
  const senderLower = raw.sender_name.toLowerCase();
  if (SYSTEM_SENDERS.some(s => senderLower.includes(s))) return true;

  if (!raw.content) return false;
  const lower = raw.content.toLowerCase();

  if (lower.includes('reacted')) return true;
  if (lower.includes('liked a')) return true;
  if (lower.includes('sent an attachment')) return true;
  // Call system messages — match fragments since Instagram prepends sender name
  // e.g. "rayyangosling1 started an audio call", "Call ended", "Missed video chat"
  if (lower.includes('audio call')) return true;
  if (lower.includes('video call')) return true;
  if (lower.includes('voice call')) return true;
  if (lower.includes('video chat')) return true;
  if (lower.includes('started audio')) return true;
  if (lower.includes('started video')) return true;
  if (lower.includes('call ended')) return true;
  if (lower.includes('missed audio')) return true;
  if (lower.includes('missed video')) return true;
  if (lower.includes('in a call')) return true;
  if (lower.includes('joined the call')) return true;
  if (lower.includes('left the call')) return true;

  return false;
}

function isReelShare(raw: RawMessage): boolean {
  return !!raw.share?.link;
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
  if (!raw.content) return '';
  if (raw.content === 'You sent an attachment.') return '';
  return decodeInstagramText(raw.content);
}

function processMessage(raw: RawMessage, id: string): Message {
  return {
    id,
    sender: decodeInstagramText(raw.sender_name),
    timestamp: raw.timestamp_ms,
    content: extractContent(raw),
    reactions: (raw.reactions ?? []).map(r => decodeReaction(r.reaction)),
    attachments: extractAttachments(raw),
    isUnsent: raw.is_unsent_image_by_messenger_kid_parent ?? false,
  };
}

export function normalizeMessages(data: RawInstagramExport): Message[] {
  return data.messages
    .filter(raw => !isSystemMessage(raw) && !isReelShare(raw))
    .map((raw, index) => processMessage(raw, `msg_${index}_${raw.timestamp_ms}`));
}

export function mergeAndNormalizeExports(exports: RawInstagramExport[]): Message[] {
  const allMessages = exports.flatMap((data, exportIndex) =>
    data.messages
      .filter(raw => !isSystemMessage(raw) && !isReelShare(raw))
      .map((raw, index) => processMessage(raw, `msg_${exportIndex}_${index}_${raw.timestamp_ms}`))
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

export function extractReelShares(exports: RawInstagramExport[]): { sender: string; uri: string; timestamp: number }[] {
  return exports.flatMap(data =>
    data.messages
      .filter(raw => isReelShare(raw) && !isSystemMessage(raw))
      .map(raw => ({
        sender: decodeInstagramText(raw.sender_name),
        uri: raw.share!.link!,
        timestamp: raw.timestamp_ms,
      }))
  );
}