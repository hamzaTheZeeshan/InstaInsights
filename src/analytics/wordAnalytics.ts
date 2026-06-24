import type { Message } from '../types/message';
import type { WordStats } from '../types/analytics';
import { STOP_WORDS } from '../data/stopWords';

function extractWords(content: string): string[] {
  return content
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function extractBigrams(words: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  return bigrams;
}

export function getWordStats(messages: Message[]): WordStats {
  const wordCount: Record<string, number> = {};
  const phraseCount: Record<string, number> = {};

  for (const msg of messages) {
    if (!msg.content.trim()) continue;

    const words = extractWords(msg.content);

    for (const word of words) {
      wordCount[word] = (wordCount[word] ?? 0) + 1;
    }

    const bigrams = extractBigrams(words);
    for (const phrase of bigrams) {
      phraseCount[phrase] = (phraseCount[phrase] ?? 0) + 1;
    }
  }

  const topWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));

  const topPhrases = Object.entries(phraseCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([phrase, count]) => ({ phrase, count }));

  return { topWords, topPhrases };
}