import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { MessageStats } from '../../types/analytics';

const COLORS = ['#7c3aed', '#ec4899', '#3b82f6', '#0d9488', '#f59e0b'];

interface Props {
  messageStats: MessageStats;
}

export default function UserContributionChart({ messageStats }: Props) {
  const data = Object.entries(messageStats.perParticipant).map(([name, count]) => ({
    name,
    count,
  }));

  return (
    <>
      <h3 className="chart-card-title">Message Contribution</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }}
            labelStyle={{ color: '#1e1b4b', fontWeight: 600, fontSize: 12 }}
            itemStyle={{ fontSize: 12 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', color: '#6b7280', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}