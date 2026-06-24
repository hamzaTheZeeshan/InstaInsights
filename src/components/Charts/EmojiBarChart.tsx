import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { EmojiStats } from '../../types/analytics';

interface Props {
  emojiStats: EmojiStats;
}

export default function EmojiBarChart({ emojiStats }: Props) {
  const data = emojiStats.topEmojis.slice(0, 10);

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Top Emojis</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 11 }} />
          <YAxis dataKey="emoji" type="category" stroke="#9ca3af" tick={{ fontSize: 16 }} width={35} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
            itemStyle={{ color: '#a78bfa' }}
          />
          <Bar dataKey="count" fill="#a78bfa" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}