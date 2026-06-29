import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

/* ── Types ─────────────────────────────────────────────────── */
interface TimelinePoint {
  month: string;
  count: number;
}

interface TimelineChartProps {
  data: TimelinePoint[];
}

/* ── Custom Tooltip ─────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="os-tooltip">
      <p className="os-tooltip-label">{label}</p>
      <p className="os-tooltip-value">{payload[0].value} msgs</p>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────── */
export default function TimelineChart({ data }: TimelineChartProps) {
  if (data.length <= 1) return null;

  return (
    <div className="os-chart-wrap">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#7c3aed' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}