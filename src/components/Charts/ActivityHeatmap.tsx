import type { ActivityStats } from '../../types/analytics';

interface Props {
  activityStats: ActivityStats;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ActivityHeatmap({ activityStats }: Props) {
  const maxCount = Math.max(...Object.values(activityStats.byHour));

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-800';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-purple-900';
    if (intensity < 0.5) return 'bg-purple-700';
    if (intensity < 0.75) return 'bg-purple-500';
    return 'bg-purple-400';
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Activity by Hour</h3>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded ${getColor(activityStats.byHour[hour] ?? 0)}`}
              title={`${hour}:00 — ${activityStats.byHour[hour] ?? 0} messages`}
            />
            <span className="text-gray-600 text-xs">{hour}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 items-center">
        <span className="text-gray-500 text-xs">Less</span>
        <div className="w-4 h-4 rounded bg-gray-800" />
        <div className="w-4 h-4 rounded bg-purple-900" />
        <div className="w-4 h-4 rounded bg-purple-700" />
        <div className="w-4 h-4 rounded bg-purple-500" />
        <div className="w-4 h-4 rounded bg-purple-400" />
        <span className="text-gray-500 text-xs">More</span>
      </div>
    </div>
  );
}