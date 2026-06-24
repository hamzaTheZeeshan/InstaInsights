import type { Message } from '../types/message';
import type { ActivityStats } from '../types/analytics';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function getActivityStats(messages: Message[]): ActivityStats {
  const byHour: Record<number, number> = {};
  const byDay: Record<string, number> = {};
  const byMonth: Record<string, number> = {};
  const byDate: Record<string, number> = {};

  // init hours 0-23
  for (let i = 0; i < 24; i++) byHour[i] = 0;

  for (const msg of messages) {
    const date = new Date(msg.timestamp);

    // by hour
    const hour = date.getHours();
    byHour[hour]++;

    // by day of week
    const day = DAY_NAMES[date.getDay()];
    byDay[day] = (byDay[day] ?? 0) + 1;

    // by month
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    byMonth[month] = (byMonth[month] ?? 0) + 1;

    // by date (for streak calculation)
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    byDate[dateKey] = (byDate[dateKey] ?? 0) + 1;
  }

  // most active hour
  const mostActiveHour = Number(
    Object.entries(byHour).sort((a, b) => b[1] - a[1])[0][0]
  );

  // most active day
  const mostActiveDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  // streak calculation
  const sortedDates = Object.keys(byDate).sort();
  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  return {
    byHour,
    byDay,
    byMonth,
    mostActiveHour,
    mostActiveDay,
    streak: maxStreak,
  };
}