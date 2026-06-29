import { useState } from 'react';

const GROQ_API_KEY = 'grokkeyhere';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GrokContext {
  messageStats: any;
  activityStats: any;
  responseStats: any;
  wordStats: any;
  emojiStats: any;
  mediaStats: any;
  sampleMessages: { sender: string; content: string; date: string }[];
}

// Returns 2 sample messages instead of all of them, filtered for relevance
function pickSamples(
  sampleMessages: GrokContext['sampleMessages'],
  count = 2,
): string {
  return sampleMessages
    .slice(0, count)
    .map(m => `"${m.content}" — ${m.sender} on ${m.date}`)
    .join('\n');
}

function participantLine(messageStats: any): string {
  return Object.keys(messageStats.perParticipant)
    .map(
      p =>
        `${p}: ${messageStats.perParticipant[p]} msgs (${messageStats.percentagePerParticipant[p]}%)`,
    )
    .join(', ');
}

function buildPrompt(userQuestion: string, ctx: GrokContext): string {
  const { messageStats, activityStats, responseStats, wordStats, emojiStats, mediaStats, sampleMessages } = ctx;

  const mostActiveMonth = Object.entries(activityStats.byMonth as Record<string, number>)
    .sort((a, b) => b[1] - a[1])[0];

  const topEmojis = emojiStats.topEmojis
    .slice(0, 5)
    .map((e: any) => `${e.emoji}(${e.count}x)`)
    .join(' ');

  const topWords = wordStats.topWords
    .slice(0, 6)
    .map((w: any) => `"${w.word}"(${w.count}x)`)
    .join(', ');

  const topPhrases = wordStats.topPhrases
    ?.slice(0, 2)
    .map((p: any) => `"${p.phrase}"(${p.count}x)`)
    .join(', ') || '';

  const avgTimes = Object.entries(responseStats.averageResponseTime)
    .map(([p, t]) => `${p}: ${t} mins`)
    .join(', ');

  const starters = Object.entries(responseStats.conversationStarters)
    .map(([p, c]) => `${p}: ${c} times`)
    .join(', ');

  const doubles = Object.entries(responseStats.doubleTexts)
    .map(([p, c]) => `${p}: ${c} times`)
    .join(', ');

  const samples = pickSamples(sampleMessages, 2);

  return `You are analyzing a real Instagram DM conversation. Answer the user's question using only the data provided below.

CONVERSATION DATA:
- PARTICIPANTS: ${participantLine(messageStats)}
- TOTAL MESSAGES: ${messageStats.total}
- STARTED: ${new Date(messageStats.firstMessage).toLocaleDateString()}
- MOST ACTIVE DAY: ${activityStats.mostActiveDay}
- MOST ACTIVE HOUR: ${activityStats.mostActiveHour}:00
- MOST ACTIVE MONTH: ${mostActiveMonth?.[0]} (${mostActiveMonth?.[1]} messages)
- LONGEST STREAK: ${activityStats.streak} days in a row
- FASTEST REPLIER: ${responseStats.fastestReplier}
- AVG RESPONSE TIMES: ${avgTimes}
- CONVERSATION STARTERS: ${starters}
- DOUBLE TEXTS: ${doubles}
- TOP EMOJIS: ${topEmojis}
- TOP WORDS: ${topWords}
${topPhrases ? `- TOP PHRASES: ${topPhrases}` : ''}
- PHOTOS SHARED: ${mediaStats.photos}
- VIDEOS SHARED: ${mediaStats.videos}
- REELS SHARED: ${mediaStats.reels}

EXAMPLE MESSAGES:
${samples}

User's question: "${userQuestion}"

Instructions:
1. Answer in three sentences and be on point and try to answer the user query directly and use simple english words and be frank like a person giving honest opinions and funny too.
2. Reference specific numbers and data points from the conversation data
3. Use the example messages to add authenticity when relevant
4. No bullet points or markdown formatting
5. If the question isn't answerable from the provided data, kindly say so and suggest what data would help
6. Be specific and insightful - don't just state facts, interpret them

Answer:`;
}

export function useGrok() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const ask = async (userQuestion: string, ctx: GrokContext) => {
    if (!userQuestion.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setActiveQuestion(userQuestion);

    try {
      const prompt = buildPrompt(userQuestion, ctx);

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.85,
          max_tokens: 250,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error?.message ?? 'Groq API error');
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content ?? '';
      setAnswer(text.trim());
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setAnswer(null);
    setError(null);
    setActiveQuestion(null);
  };

  return { ask, answer, loading, error, activeQuestion, reset };
}