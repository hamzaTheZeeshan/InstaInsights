import { useMemo, useState } from 'react';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColor(count: number): string {
  if (count === 0) return '#1f2937';
  if (count < 5) return '#4c1d95';
  if (count < 15) return '#6d28d9';
  if (count < 30) return '#7c3aed';
  if (count < 50) return '#8b5cf6';
  return '#a78bfa';
}

function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function YearlyHeatmap({ messages }: Props) {
  // build message count per day
  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const msg of messages) {
      const key = toDateKey(new Date(msg.timestamp));
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [messages]);

  // get all years in the chat
  const years = useMemo(() => {
    if (messages.length === 0) return [];
    const first = new Date(messages[0].timestamp).getFullYear();
    const last = new Date(messages[messages.length - 1].timestamp).getFullYear();
    const result: number[] = [];
    for (let y = first; y <= last; y++) result.push(y);
    return result;
  }, [messages]);

  const [selectedYear, setSelectedYear] = useState<number>(() => years[years.length - 1] ?? new Date().getFullYear());

  // build weeks grid for selected year
  const weeks = useMemo(() => {
    const days = getDaysInYear(selectedYear);
    const firstDayOfWeek = days[0].getDay(); // 0 = Sunday

    // pad start so day 1 aligns to correct column
    const grid: (Date | null)[] = Array(firstDayOfWeek).fill(null).concat(days);

    // chunk into weeks of 7
    const result: (Date | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      result.push(grid.slice(i, i + 7));
    }
    return result;
  }, [selectedYear]);

  // month label positions
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    const days = getDaysInYear(selectedYear);
    const firstDayOfWeek = days[0].getDay();
    let lastMonth = -1;

    days.forEach((day) => {
      const month = day.getMonth();
      if (month !== lastMonth) {
        const dayOfYear = Math.floor((day.getTime() - new Date(selectedYear, 0, 1).getTime()) / 86400000);
        const weekIndex = Math.floor((dayOfYear + firstDayOfWeek) / 7);
        labels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    });
    return labels;
  }, [selectedYear]);

  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  if (years.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">Yearly Activity</h3>
        {/* Year tabs */}
        <div className="flex gap-2">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedYear === y
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Total for year */}
      <p className="text-gray-500 text-sm mb-4">
        {Object.entries(countByDay)
          .filter(([k]) => k.startsWith(String(selectedYear)))
          .reduce((sum, [, v]) => sum + v, 0)
          .toLocaleString()} messages in {selectedYear}
      </p>

      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: `${weeks.length * 14}px` }}>

          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: '28px' }}>
            {weeks.map((_, wi) => {
              const label = monthLabels.find(l => l.weekIndex === wi);
              return (
                <div key={wi} style={{ width: '14px', flexShrink: 0 }}>
                  {label && (
                    <span className="text-gray-500 text-xs">{label.month}</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-0">
            {/* Day labels */}
            <div className="flex flex-col mr-1" style={{ gap: '2px' }}>
              {DAYS.map((d, i) => (
                <div key={d} style={{ height: '12px', fontSize: '9px' }}
                  className={`text-gray-600 flex items-center ${i % 2 === 0 ? 'opacity-0' : ''}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex" style={{ gap: '2px' }}>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col" style={{ gap: '2px' }}>
                  {week.map((day, di) => {
                    if (!day) {
                      return <div key={di} style={{ width: '12px', height: '12px' }} />;
                    }
                    const key = toDateKey(day);
                    const count = countByDay[key] ?? 0;
                    return (
                      <div
                        key={di}
                        style={{
                          width: '12px',
                          height: '12px',
                          backgroundColor: getColor(count),
                          borderRadius: '2px',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            date: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                            count,
                            x: rect.left,
                            y: rect.top,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4">
        <span className="text-gray-500 text-xs">0</span>
        {[0, 5, 15, 30, 50].map(v => (
          <div
            key={v}
            style={{ width: '12px', height: '12px', backgroundColor: getColor(v), borderRadius: '2px' }}
          />
        ))}
        <span className="text-gray-500 text-xs">50+</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 16, top: tooltip.y - 40 }}
        >
          <span className="font-semibold">{tooltip.count} messages</span>
          <br />
          {tooltip.date}
        </div>
      )}
    </div>
  );
}