import type { Message } from '../types/message';

export function filterBySender(messages: Message[], sender: string): Message[] {
  if (!sender) return messages;
  return messages.filter(m => m.sender === sender);
}

export function filterByDateRange(
  messages: Message[],
  startDate: number | null,
  endDate: number | null
): Message[] {
  return messages.filter(m => {
    if (startDate && m.timestamp < startDate) return false;
    if (endDate && m.timestamp > endDate) return false;
    return true;
  });
}

export function filterByHasMedia(messages: Message[]): Message[] {
  return messages.filter(m => m.attachments.length > 0);
}

export function filterByHasReaction(messages: Message[]): Message[] {
  return messages.filter(m => m.reactions.length > 0);
}