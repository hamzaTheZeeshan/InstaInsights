import { useMemo, useState } from 'react';
import './YearlyHeatmap.css';
import type { Message } from '../../types/message';

interface Props {
  messages: Message[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* Purple intensity scale — light theme friendly */
function getColor(count: number): string {
  if (count === 0)   return '#ede9fe'; /* purple-100 — empty */
  if (count < 5)    return '#c4b5fd'; /* purple-300 */
  if (count < 15)   return '#a78bfa'; /* purple-400 */
  if (count < 30)   return '#7c3aed'; /* purple-600 */
  if (count < 50)   return '#6d28d9'; /* purple-700 */
  return '#4c1d95';                   /* purple-900 — peak */
}

const LEGEND_VALUES = [0, 5, 15, 30, 50, 60];

function getDaysInYear(year: number): Date[] {
  const days: Date[] = [];
  const end = new Date(year, 11, 31);
  for (let d = new Date(year, 0, 1); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d));
  }
  return days;
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function YearlyHeatmap({ messages }: Props) {
  const countByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const msg of messages) {
      const key = toDateKey(new Date(msg.timestamp));
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [messages]);

  const years = useMemo(() => {
    if (messages.length === 0) return [];
    const first = new Date(messages[0].timestamp).getFullYear();
    const last  = new Date(messages[messages.length - 1].timestamp).getFullYear();
    const result: number[] = [];
    for (let y = first; y <= last; y++) result.push(y);
    return result;
  }, [messages]);

  const [selectedYear, setSelectedYear] = useState<number>(
    () => years[years.length - 1] ?? new Date().getFullYear()
  );

  const weeks = useMemo(() => {
    const days = getDaysInYear(selectedYear);
    const firstDayOfWeek = days[0].getDay();
    const grid: (Date | null)[] = Array(firstDayOfWeek).fill(null).concat(days);
    const result: (Date | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) result.push(grid.slice(i, i + 7));
    return result;
  }, [selectedYear]);

  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    const days = getDaysInYear(selectedYear);
    const firstDayOfWeek = days[0].getDay();
    let lastMonth = -1;
    days.forEach(day => {
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

  const [tooltip, setTooltip] = useState<{
    date: string; count: number; x: number; y: number;
  } | null>(null);

  if (years.length === 0) return null;

  const yearTotal = Object.entries(countByDay)
    .filter(([k]) => k.startsWith(String(selectedYear)))
    .reduce((sum, [, v]) => sum + v, 0);

  return (
    <>
      {/* Header */}
      <div className="yheatmap-header">
        <h3 className="chart-card-title">Yearly Activity</h3>
        <div className="yheatmap-year-tabs">
          {years.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={
                selectedYear === y
                  ? 'yheatmap-year-btn yheatmap-year-btn--active'
                  : 'yheatmap-year-btn yheatmap-year-btn--inactive'
              }
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Year total */}
      <p className="yheatmap-total">
        {yearTotal.toLocaleString()} messages in {selectedYear}
      </p>

      {/* Grid */}
      <div className="yheatmap-scroll">
        <div style={{ minWidth: `${weeks.length * 14}px`, position: 'relative' }}>

          {/* Month labels */}
          <div className="yheatmap-month-row">
            {weeks.map((_, wi) => {
              const label = monthLabels.find(l => l.weekIndex === wi);
              return (
                <div key={wi} className="yheatmap-month-cell">
                  {label && <span className="yheatmap-month-label">{label.month}</span>}
                </div>
              );
            })}
          </div>

          <div className="yheatmap-grid">
            {/* Day labels */}
            <div className="yheatmap-day-labels">
              {DAYS.map((d, i) => (
                <div
                  key={d}
                  className={
                    i % 2 === 0
                      ? 'yheatmap-day-label yheatmap-day-label--hidden'
                      : 'yheatmap-day-label'
                  }
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Heatmap cells */}
            <div className="yheatmap-weeks">
              {weeks.map((week, wi) => (
                <div key={wi} className="yheatmap-week-col">
                  {week.map((day, di) => {
                    if (!day) return <div key={di} className="yheatmap-cell-empty" />;
                    const key = toDateKey(day);
                    const count = countByDay[key] ?? 0;
                    return (
                      <div
                        key={di}
                        className="yheatmap-cell"
                        style={{ backgroundColor: getColor(count) }}
                        onMouseEnter={e => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            date: day.toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            }),
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
      <div className="yheatmap-legend">
        <span className="yheatmap-legend-label">Less</span>
        {LEGEND_VALUES.map(v => (
          <div
            key={v}
            className="yheatmap-legend-swatch"
            style={{ backgroundColor: getColor(v) }}
          />
        ))}
        <span className="yheatmap-legend-label">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="yheatmap-tooltip"
          style={{ left: tooltip.x + 16, top: tooltip.y - 44 }}
        >
          <span className="yheatmap-tooltip-count">{tooltip.count} messages</span>
          <br />
          {tooltip.date}
        </div>
      )}
    </>
  );
}