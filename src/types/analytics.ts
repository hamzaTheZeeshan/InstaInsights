export interface MessageStats {
  total: number;
  perParticipant: Record<string, number>;
  percentagePerParticipant: Record<string, number>;
  firstMessage: number;
  lastMessage: number;
  longestMessage: { content: string; sender: string; length: number };
  shortestMessage: { content: string; sender: string; length: number };
  averageLength: number;
}

export interface ActivityStats {
  byHour: Record<number, number>;
  byDay: Record<string, number>;
  byMonth: Record<string, number>;
  mostActiveHour: number;
  mostActiveDay: string;
  streak: number;
}

export interface ResponseStats {
  averageResponseTime: Record<string, number>;
  fastestReplier: string;
  conversationStarters: Record<string, number>;
  doubleTexts: Record<string, number>;
}

export interface WordStats {
  topWords: { word: string; count: number }[];
  topPhrases: { phrase: string; count: number }[];
}

export interface EmojiStats {
  topEmojis: { emoji: string; count: number }[];
  perParticipant: Record<string, { emoji: string; count: number }[]>;
}

export interface MediaStats {
  photos: number;
  videos: number;
  audio: number;
  links: number;
  reels: number;
  perParticipant: Record<string, { photos: number; videos: number; audio: number; links: number; reels: number }>;
}

export interface AllAnalytics {
  messageStats: MessageStats;
  activityStats: ActivityStats;
  responseStats: ResponseStats;
  wordStats: WordStats;
  emojiStats: EmojiStats;
  mediaStats: MediaStats;
}