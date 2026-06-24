import type { Message } from '../types/message';
import { filterBySender, filterByDateRange } from './filterMessages';
import { regexSearch } from './regexSearch';

export interface SearchParams {
  query: string;
  sender?: string;
  startDate?: number | null;
  endDate?: number | null;
  useRegex?: boolean;
  contextSize?: number;
}

export interface SearchResult {
  message: Message;
  context: Message[];
  matchIndex: number;
}

export function searchMessages(
  allMessages: Message[],
  params: SearchParams
): SearchResult[] {
  const {
    query,
    sender = '',
    startDate = null,
    endDate = null,
    useRegex = false,
    contextSize = 2,
  } = params;

  if (!query.trim()) return [];

  // apply filters
  let pool = allMessages;
  pool = filterBySender(pool, sender);
  pool = filterByDateRange(pool, startDate, endDate);

  // find matching message indices in the FULL array for context
  const results: SearchResult[] = [];

  for (let i = 0; i < allMessages.length; i++) {
    const msg = allMessages[i];

    // skip if not in filtered pool
    if (!pool.includes(msg)) continue;

    let isMatch = false;

    if (useRegex) {
      const rxResults = regexSearch([msg], query);
      isMatch = rxResults.length > 0;
    } else {
      isMatch = msg.content.toLowerCase().includes(query.toLowerCase());
    }

    if (isMatch) {
      const start = Math.max(0, i - contextSize);
      const end = Math.min(allMessages.length - 1, i + contextSize);
      const context = allMessages.slice(start, end + 1);

      results.push({
        message: msg,
        context,
        matchIndex: i - start,
      });
    }
  }

  return results.slice(0, 200);
}