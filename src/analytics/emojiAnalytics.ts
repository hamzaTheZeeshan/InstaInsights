import type { Message } from '../types/message';
import type { EmojiStats } from '../types/analytics';

const EMOJI_REGEX = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu;

function extractEmojis(text: string): string[] {
  return text.match(EMOJI_REGEX) ?? [];
}

export function getEmojiStats(messages: Message[]): EmojiStats {
  const globalCount: Record<string, number> = {};
  const perParticipantCount: Record<string, Record<string, number>> = {};

  for (const msg of messages) {
    const emojis = extractEmojis(msg.content);
    if (emojis.length === 0) continue;

    if (!perParticipantCount[msg.sender]) {
      perParticipantCount[msg.sender] = {};
    }

    for (const emoji of emojis) {
      globalCount[emoji] = (globalCount[emoji] ?? 0) + 1;
      perParticipantCount[msg.sender][emoji] =
        (perParticipantCount[msg.sender][emoji] ?? 0) + 1;
    }
  }

  const topEmojis = Object.entries(globalCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([emoji, count]) => ({ emoji, count }));

  const perParticipant: Record<string, { emoji: string; count: number }[]> = {};
  for (const sender in perParticipantCount) {
    perParticipant[sender] = Object.entries(perParticipantCount[sender])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([emoji, count]) => ({ emoji, count }));
  }

  return { topEmojis, perParticipant };
}