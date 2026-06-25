import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import type { WordStats } from '../../types/analytics';

interface Props {
  wordStats: WordStats;
}

export default function TopWordsChart({ wordStats }: Props) {
  const data = wordStats.topWords.slice(0, 10);

  return (
    <>
      <h3 className="chart-card-title">Top Words</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis
            type="number"
            stroke="#9ca3af"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="word"
            type="category"
            stroke="#9ca3af"
            tick={{ fontSize: 12, fill: '#374151' }}
            width={62}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ color: '#1e1b4b', fontWeight: 600, fontSize: 12 }}
            itemStyle={{ color: '#3b82f6', fontSize: 12 }}
          />
          <Bar dataKey="count" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}