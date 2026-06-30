import { useState } from 'react';

const GEMINI_API_KEY = 'AQ.Ab8RN6IKhabelgidlUOvrnSAgrqe3cLWnwADGc1VIkZrZb67QA'; // must start with AIza...
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function callModel(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 600,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? 'Gemini API error');
  }

  const data = await res.json();

  if (!data?.candidates || data.candidates.length === 0) {
    const blockReason = data?.promptFeedback?.blockReason;
    throw new Error(blockReason ? `BLOCKED:${blockReason}` : 'EMPTY_RESPONSE');
  }

  const candidate = data.candidates[0];
  const text = candidate?.content?.parts?.[0]?.text ?? '';

  // finishReason "MAX_TOKENS" confirms truncation if it still happens
  if (candidate?.finishReason === 'MAX_TOKENS' && (!text || text.trim().length < 20)) {
    throw new Error('EMPTY_RESPONSE');
  }

  if (!text || !text.trim()) {
    throw new Error('EMPTY_RESPONSE');
  }

  return text;
}

interface GrokContext {
  messageStats: any;
  activityStats: any;
  responseStats: any;
  wordStats: any;
  emojiStats: any;
  mediaStats: any;
  sampleMessages: { sender: string; content: string; date: string }[];
}

export type Persona = 'frank' | 'roast' | 'wholesome' | 'detective';

const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  frank:
    'Be frank like a person giving honest opinions, casual and a little funny.',
  roast:
    'Be a playful roast — teasing, sarcastic, a bit savage but never genuinely mean. Think comedian friend, not bully.',
  wholesome:
    'Be warm, affectionate, and hype them up like a supportive best friend who is genuinely happy for them.',
  detective:
    'Narrate like a noir detective examining "the evidence" — dry, deadpan, dramatic about mundane chat facts.',
};

// Score messages by keyword overlap with the question, pick the most relevant
function pickSamples(
  userQuestion: string,
  sampleMessages: GrokContext['sampleMessages'],
  count = 4,
): string {
  if (sampleMessages.length === 0) return '';

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'what', 'who',
    'when', 'where', 'why', 'how', 'we', 'i', 'you', 'our', 'my', 'your', 'to', 'of',
    'in', 'on', 'for', 'and', 'or', 'about', 'us', 'them', 'it', 'this', 'that',
  ]);

  const qWords = userQuestion
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const scored = sampleMessages.map(m => {
    const content = m.content.toLowerCase();
    const score = qWords.reduce(
      (acc, w) => acc + (content.includes(w) ? 1 : 0),
      0,
    );
    return { m, score };
  });

  const anyMatch = scored.some(s => s.score > 0);
  let chosen;
  if (anyMatch) {
    chosen = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, count)
      .map(s => s.m);
  } else {
    const step = Math.max(1, Math.floor(sampleMessages.length / count));
    chosen = sampleMessages.filter((_, i) => i % step === 0).slice(0, count);
  }

  return chosen
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

// Pull every standalone number out of the context block so we can sanity-check
// the model's answer against numbers that actually exist in the data
function extractValidNumbers(dataBlock: string): Set<string> {
  const matches = dataBlock.match(/\d+(\.\d+)?%?/g) || [];
  return new Set(matches);
}

function buildPrompt(
  userQuestion: string,
  ctx: GrokContext,
  persona: Persona,
): { prompt: string; dataBlock: string } {
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

  const samples = pickSamples(userQuestion, sampleMessages, 4);

  const dataBlock = `- PARTICIPANTS: ${participantLine(messageStats)}
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
- REELS SHARED: ${mediaStats.reels}`;

  const prompt = `You are analyzing a real Instagram DM conversation. Answer the user's question using only the data provided below. Never invent numbers — only reference figures that appear in CONVERSATION DATA.

CONVERSATION DATA:
${dataBlock}

EXAMPLE MESSAGES (chosen for relevance to the question):
${samples}

User's question: "${userQuestion}"

Instructions:
1. Answer in three sentences, directly addressing the question, in simple English.
2. ${PERSONA_INSTRUCTIONS[persona]}
3. Reference specific numbers and data points from the conversation data — never make up a stat.
4. Use the example messages to add authenticity when relevant.
5. No bullet points or markdown formatting.
6. If the question isn't answerable from the provided data, kindly say so and suggest what data would help.
7. Be specific and insightful — interpret the numbers, don't just restate them.

Answer:`;

  return { prompt, dataBlock };
}

export function useGrok() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const ask = async (
    userQuestion: string,
    ctx: GrokContext,
    persona: Persona = 'frank',
  ) => {
    if (!userQuestion.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setActiveQuestion(userQuestion);

    try {
      const { prompt, dataBlock } = buildPrompt(userQuestion, ctx, persona);
      const validNumbers = extractValidNumbers(dataBlock);

      let text: string;
      try {
        text = await callModel(prompt);
      } catch (e: any) {
        if (e.message === 'EMPTY_RESPONSE') {
          text = await callModel(`${prompt}\n\nKeep your reasoning brief and prioritize giving a final answer.`);
        } else if (typeof e.message === 'string' && e.message.startsWith('BLOCKED:')) {
          throw new Error(
            "That question touched on something Gemini's safety filter blocked — try rephrasing it more neutrally.",
          );
        } else {
          throw e;
        }
      }

      const answerNumbers = text.match(/\d+(\.\d+)?%?/g) || [];
      const suspicious = answerNumbers.some(
        (n: string) => !validNumbers.has(n) && Number(n.replace('%', '')) > 1,
      );

      if (suspicious) {
        const retryPrompt = `${prompt}\n\nReminder: only use numbers that literally appear in CONVERSATION DATA above. Do not calculate or estimate new numbers.`;
        try {
          text = await callModel(retryPrompt);
        } catch {
          // keep original answer if the accuracy retry also fails
        }
      }

      setAnswer(text.trim());
    } catch (e: any) {
      setError(e.message === 'EMPTY_RESPONSE'
        ? "Couldn't generate an answer for that one — try rephrasing the question"
        : e.message ?? 'Something went wrong');
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