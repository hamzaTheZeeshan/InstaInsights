/* ── Types ─────────────────────────────────────────────────── */
interface PersonStat {
  name: string;
  count: number;
  pct: number;
}

interface InboxBreakdownChartProps {
  personStats: PersonStat[];
  /** Max rows to render (default 10) */
  limit?: number;
}

/* ── Bar colours cycling ────────────────────────────────────── */
const BAR_COLORS = [
  '#7c3aed', '#ec4899', '#3b82f6',
  '#0d9488', '#f59e0b', '#a855f7',
];

/* ── Component ──────────────────────────────────────────────── */
export default function InboxBreakdownChart({
  personStats,
  limit = 10,
}: InboxBreakdownChartProps) {
  const rows = personStats.slice(0, limit);

  if (!rows.length) return null;

  return (
    <div className="os-breakdown-list">
      {rows.map((p, i) => (
        <div key={p.name} className="os-breakdown-row">
          <span className="os-breakdown-rank">{i + 1}</span>
          <span className="os-breakdown-name">{p.name}</span>
          <div className="os-breakdown-bar-track">
            <div
              className="os-breakdown-bar-fill"
              style={{
                width: `${p.pct}%`,
                background: BAR_COLORS[i % BAR_COLORS.length],
              }}
            />
          </div>
          <span className="os-breakdown-pct">{p.pct}%</span>
          <span className="os-breakdown-count">{p.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}