import { useMemo } from 'react';
import { useChatData } from './useChatData';
import { useChatContext } from '../context/ChatContext';
import { getMessageStats } from '../analytics/messageAnalytics';
import { getActivityStats } from '../analytics/activityAnalytics';
import { getResponseStats } from '../analytics/responseAnalytics';
import { getWordStats } from '../analytics/wordAnalytics';
import { getEmojiStats } from '../analytics/emojiAnalytics';
import { getMediaStats } from '../analytics/userAnalytics';

export function useAnalytics() {
  const { messages } = useChatData();
  const { reelShares } = useChatContext();

  const messageStats = useMemo(() => getMessageStats(messages), [messages]);
  const activityStats = useMemo(() => getActivityStats(messages), [messages]);
  const responseStats = useMemo(() => getResponseStats(messages), [messages]);
  const wordStats = useMemo(() => getWordStats(messages), [messages]);
  const emojiStats = useMemo(() => getEmojiStats(messages), [messages]);
  const mediaStats = useMemo(() => getMediaStats(messages, reelShares), [messages, reelShares]);

  return {
    messageStats,
    activityStats,
    responseStats,
    wordStats,
    emojiStats,
    mediaStats,
  };
}