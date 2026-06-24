import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ActivityStats } from '../../types/analytics';

interface Props {
  activityStats: ActivityStats;
}

export default function MessageTrendChart({ activityStats }: Props) {
  const data = useMemo(() => {
    return Object.entries(activityStats.byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [activityStats]);

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Messages Over Time</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#fff' }}
            itemStyle={{ color: '#a78bfa' }}
          />
          <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}