import { useState, useMemo } from 'react';
import { useChatData } from './useChatData';
import type { Message } from '../types/message';

interface SearchOptions {
  query: string;
  sender: string;
  useRegex: boolean;
  startDate: number | null;
  endDate: number | null;
  contextSize: number;
}

interface SearchResult {
  message: Message;
  context: Message[];
  matchIndex: number;
}

export function useSearch() {
  const { messages } = useChatData();
  const [options, setOptions] = useState<SearchOptions>({
    query: '',
    sender: '',
    useRegex: false,
    startDate: null,
    endDate: null,
    contextSize: 2,
  });

  const results = useMemo<SearchResult[]>(() => {
    if (!options.query.trim()) return [];

    let filtered = messages;

    // sender filter
    if (options.sender) {
      filtered = filtered.filter(m => m.sender === options.sender);
    }

    // date filter
    if (options.startDate) {
      filtered = filtered.filter(m => m.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      filtered = filtered.filter(m => m.timestamp <= options.endDate!);
    }

    // text/regex match
    const matched: SearchResult[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];

      // skip if sender filter active and doesn't match
      if (options.sender && msg.sender !== options.sender) continue;

      // skip if outside date range
      if (options.startDate && msg.timestamp < options.startDate) continue;
      if (options.endDate && msg.timestamp > options.endDate) continue;

      let isMatch = false;

      if (options.useRegex) {
        try {
          const regex = new RegExp(options.query, 'i');
          isMatch = regex.test(msg.content);
        } catch {
          isMatch = false;
        }
      } else {
        isMatch = msg.content.toLowerCase().includes(options.query.toLowerCase());
      }

      if (isMatch) {
        const start = Math.max(0, i - options.contextSize);
        const end = Math.min(messages.length - 1, i + options.contextSize);
        const context = messages.slice(start, end + 1);

        matched.push({
          message: msg,
          context,
          matchIndex: i - start,
        });
      }
    }

    return matched.slice(0, 200); // cap at 200 results
  }, [messages, options]);

  return { results, options, setOptions };
}