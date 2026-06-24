import type { Message } from '../types/message';
import type { MessageStats } from '../types/analytics';

export function getMessageStats(messages: Message[]): MessageStats {
  if (messages.length === 0) {
    return {
      total: 0,
      perParticipant: {},
      percentagePerParticipant: {},
      firstMessage: 0,
      lastMessage: 0,
      longestMessage: { content: '', sender: '', length: 0 },
      shortestMessage: { content: '', sender: '', length: 0 },
      averageLength: 0,
    };
  }

  const perParticipant: Record<string, number> = {};
  const percentagePerParticipant: Record<string, number> = {};

  let longestMessage = messages[0];
  let shortestMessage: Message | null = null;
  let totalLength = 0;

  for (const msg of messages) {
    // per participant count
    perParticipant[msg.sender] = (perParticipant[msg.sender] ?? 0) + 1;

    // longest
    if (msg.content.length > longestMessage.content.length) {
      longestMessage = msg;
    }

    // shortest (non-empty)
    if (msg.content.trim().length > 0) {
      if (!shortestMessage || msg.content.length < shortestMessage.content.length) {
        shortestMessage = msg;
      }
    }

    totalLength += msg.content.length;
  }

  // percentages
  for (const sender in perParticipant) {
    percentagePerParticipant[sender] = parseFloat(
      ((perParticipant[sender] / messages.length) * 100).toFixed(1)
    );
  }

  return {
    total: messages.length,
    perParticipant,
    percentagePerParticipant,
    firstMessage: messages[0].timestamp,
    lastMessage: messages[messages.length - 1].timestamp,
    longestMessage: {
      content: longestMessage.content,
      sender: longestMessage.sender,
      length: longestMessage.content.length,
    },
    shortestMessage: shortestMessage
      ? {
          content: shortestMessage.content,
          sender: shortestMessage.sender,
          length: shortestMessage.content.length,
        }
      : { content: '', sender: '', length: 0 },
    averageLength: parseFloat((totalLength / messages.length).toFixed(1)),
  };
}