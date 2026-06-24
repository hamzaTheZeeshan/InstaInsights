import type { Message } from '../types/message';
import type { ResponseStats } from '../types/analytics';

const CONVERSATION_GAP_MS = 60 * 60 * 1000; // 1 hour gap = new conversation

export function getResponseStats(messages: Message[]): ResponseStats {
  const responseTimes: Record<string, number[]> = {};
  const conversationStarters: Record<string, number> = {};
  const doubleTexts: Record<string, number> = {};

  for (let i = 1; i < messages.length; i++) {
    const prev = messages[i - 1];
    const curr = messages[i];
    const gap = curr.timestamp - prev.timestamp;

    // conversation starter — first message after a long gap
    if (gap > CONVERSATION_GAP_MS) {
      conversationStarters[curr.sender] = (conversationStarters[curr.sender] ?? 0) + 1;
    }

    // double text — same sender twice in a row
    if (curr.sender === prev.sender) {
      doubleTexts[curr.sender] = (doubleTexts[curr.sender] ?? 0) + 1;
    }

    // response time — different sender, gap under 1 hour
    if (curr.sender !== prev.sender && gap < CONVERSATION_GAP_MS) {
      if (!responseTimes[curr.sender]) responseTimes[curr.sender] = [];
      responseTimes[curr.sender].push(gap);
    }
  }

  // average response time per participant in minutes
  const averageResponseTime: Record<string, number> = {};
  for (const sender in responseTimes) {
    const times = responseTimes[sender];
    const avgMs = times.reduce((a, b) => a + b, 0) / times.length;
    averageResponseTime[sender] = parseFloat((avgMs / 1000 / 60).toFixed(1));
  }

  // fastest replier = lowest average response time
  const fastestReplier = Object.entries(averageResponseTime)
    .sort((a, b) => a[1] - b[1])[0]?.[0] ?? '';

  return {
    averageResponseTime,
    fastestReplier,
    conversationStarters,
    doubleTexts,
  };
}