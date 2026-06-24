import type { Message } from '../types/message';

export interface RegexSearchResult {
  message: Message;
  matches: string[];
}

export function regexSearch(
  messages: Message[],
  pattern: string
): RegexSearchResult[] {
  let regex: RegExp;

  try {
    regex = new RegExp(pattern, 'gi');
  } catch {
    return [];
  }

  const results: RegexSearchResult[] = [];

  for (const msg of messages) {
    const matches = msg.content.match(regex);
    if (matches) {
      results.push({ message: msg, matches });
    }
  }

  return results;
}

export function highlightText(content: string, query: string, useRegex: boolean): string {
  if (!query.trim()) return content;

  try {
    const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${pattern})`, 'gi');
    return content.replace(regex, '%%%$1%%%');
  } catch {
    return content;
  }
}