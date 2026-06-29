import { useMemo } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useAllInboxesData } from './useAllInboxesData';
import type { Message } from '../types/message';
import type { InboxData } from './useAllInboxesData';

// ── Constants ─────────────────────────────────────────────────────────────────

// Deleted/deactivated Instagram accounts always appear with this name
const IGNORED_SENDERS = new Set(['instagram user']);

function isIgnored(name: string) {
  return IGNORED_SENDERS.has(name.toLowerCase().trim());
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUniqueDays(messages: Message[]): number {
  const days = new Set<string>();
  for (const msg of messages) {
    const d = new Date(msg.timestamp);
    days.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  return days.size;
}

function getTimelineData(messages: Message[]) {
  const map = new Map<string, number>();
  for (const msg of messages) {
    const d = new Date(msg.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function getTopPhrasesForSender(messages: Message[], sender: string, limit = 5) {
  const STOP_WORDS = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'have', 'from', 'they', 'will',
    'been', 'were', 'are', 'was', 'but', 'not', 'you', 'all', 'can', 'her', 'him',
    'his', 'she', 'our', 'out', 'one', 'had', 'has', 'its', 'who', 'did', 'get',
    'got', 'just', 'know', 'like', 'more', 'also', 'than', 'then', 'what', 'when',
    'your', 'hai', 'nhi', 'kar', 'kya', 'bhi', 'tha', 'thi', 'aur', 'mein', 'hain',
    'mujhe', 'tujhe', 'mere', 'tera', 'uska', 'unka', 'woh', 'yeh', 'hum', 'tum',
  ]);

  const bigrams: Record<string, number> = {};
  for (const msg of messages) {
    if (msg.sender !== sender || !msg.content) continue;
    const tokens = msg.content
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !/^\d+$/.test(w) && !STOP_WORDS.has(w));

    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      bigrams[bigram] = (bigrams[bigram] || 0) + 1;
    }
  }

  return Object.entries(bigrams)
    .filter(([, count]) => count >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([phrase, count]) => ({ phrase, count }));
}

/**
 * Per-contact stats:
 * - Counts ALL inboxes (1-on-1 and group) for totalPeople
 * - Breakdown bar uses 1-on-1 conversation sizes only (no group inflation)
 * - Ignores deleted accounts ("Instagram User")
 */
function getPerContactStats(
  inboxDataList: InboxData[],
  myName: string
): Array<{ name: string; count: number; pct: number }> {
  if (!myName || inboxDataList.length === 0) return [];

  const contactCounts: Record<string, number> = {};

  for (const { inbox, messages } of inboxDataList) {
    const contacts = inbox.participants.filter(
      p => p !== myName && !isIgnored(p)
    );

    if (contacts.length === 0) continue;

    if (contacts.length === 1) {
      // 1-on-1: total messages in this inbox = full conversation with this person
      const contact = contacts[0];
      contactCounts[contact] = (contactCounts[contact] || 0) + messages.length;
    } else {
      // Group chat: still count each unique contact for totalPeople,
      // but don't add to message counts (avoids inflation)
      for (const contact of contacts) {
        if (!(contact in contactCounts)) {
          contactCounts[contact] = 0;
        }
      }
    }
  }

  const total = Object.values(contactCounts).reduce((s, c) => s + c, 0) || 1;

  return Object.entries(contactCounts)
    // Sort: people with actual message counts first, then group-only contacts
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      count,
      pct: count > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
    }));
}

/**
 * Find who the first message was actually sent to by looking up which inbox
 * contains that message (by timestamp + sender match), then returning the
 * other participant(s) from that inbox.
 */
function resolveFirstMsgRecipient(
  firstMsg: Message,
  inboxDataList: InboxData[],
  myName: string
): string {
  for (const { inbox, messages } of inboxDataList) {
    const found = messages.some(
      m => m.timestamp === firstMsg.timestamp && m.sender === firstMsg.sender
    );
    if (!found) continue;

    const recipients = inbox.participants.filter(
      p => p !== myName && !isIgnored(p)
    );
    if (recipients.length > 0) return recipients.join(', ');
  }
  // Fallback: show sender if we can't resolve (shouldn't normally happen)
  return firstMsg.sender !== myName ? firstMsg.sender : '?';
}

// ── Main hook ─────────────────────────────────────────────────────────────────

export function useOverallStats() {
  const { myName } = useChatContext();
  const { allMessages, inboxDataList, isLoading, progress, error } = useAllInboxesData();

  const stats = useMemo(() => {
    if (allMessages.length === 0) {
      return {
        totalMessages: 0,
        totalPeople: 0,
        daysActive: 0,
        avgPerDay: 0,
        personStats: [],
        mostTalkedTo: null,
        firstMsg: null as Message | null,
        firstMsgRecipient: '',
        lastMsg: null as Message | null,
        timelineData: [],
        myPhrases: [],
      };
    }

    // 1. Per-contact stats (includes group chat participants for totalPeople)
    const personStats = getPerContactStats(inboxDataList, myName);
    const totalPeople = personStats.length;

    // 2. Most talked to = top of 1-on-1 counts
    const mostTalkedTo = personStats.find(p => p.count > 0) ?? null;

    // 3. First message sent by you; fallback to earliest overall
    const myMessages = myName
      ? allMessages.filter(m => m.sender === myName)
      : [];
    const firstMsg =
      (myMessages.length > 0 ? myMessages : allMessages)
        .reduce<Message | null>((earliest, m) =>
          !earliest || m.timestamp < earliest.timestamp ? m : earliest
        , null);

    // 4. Who was the first message actually sent to?
    const firstMsgRecipient = firstMsg
      ? resolveFirstMsgRecipient(firstMsg, inboxDataList, myName)
      : '';

    // 5. Last message in entire dataset
    const lastMsg = allMessages.reduce<Message | null>((latest, m) =>
      !latest || m.timestamp > latest.timestamp ? m : latest
    , null);

    // 6. Days active & avg per day
    const daysActive = getUniqueDays(allMessages);
    const avgPerDay = daysActive > 0 ? allMessages.length / daysActive : 0;

    // 7. Monthly timeline
    const timelineData = getTimelineData(allMessages);

    // 8. Signature phrases
    const myPhrases = myName
      ? getTopPhrasesForSender(allMessages, myName, 5)
      : [];

    return {
      totalMessages: allMessages.length,
      totalPeople,
      daysActive,
      avgPerDay: parseFloat(avgPerDay.toFixed(1)),
      personStats,
      mostTalkedTo,
      firstMsg,
      firstMsgRecipient,
      lastMsg,
      timelineData,
      myPhrases,
    };
  }, [allMessages, inboxDataList, myName]);

  return {
    isLoading,
    progress,
    error,
    myName,
    ...stats,
  };
}