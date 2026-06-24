import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MessageStats } from '../../types/analytics';

const COLORS = ['#a78bfa', '#34d399', '#f472b6', '#60a5fa', '#fbbf24'];

interface Props {
  messageStats: MessageStats;
}

export default function UserContributionChart({ messageStats }: Props) {
  const data = Object.entries(messageStats.perParticipant).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Message Contribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            innerRadius={40}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}