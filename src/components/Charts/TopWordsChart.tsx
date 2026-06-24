import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { WordStats } from '../../types/analytics';

interface Props {
  wordStats: WordStats;
}

export default function TopWordsChart({ wordStats }: Props) {
  const data = wordStats.topWords.slice(0, 10);

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Top Words</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis dataKey="word" type="category" stroke="#9ca3af" tick={{ fontSize: 12 }} width={60} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#34d399' }}
          />
          <Bar dataKey="count" fill="#34d399" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}