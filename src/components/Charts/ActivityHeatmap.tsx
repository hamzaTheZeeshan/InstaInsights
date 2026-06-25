import './ActivityHeatmap.css';
import type { ActivityStats } from '../../types/analytics';

interface Props {
  activityStats: ActivityStats;
}

export default function ActivityHeatmap({ activityStats }: Props) {
  const maxCount = Math.max(...Object.values(activityStats.byHour), 1);

  const getCellClass = (count: number) => {
    if (count === 0) return 'heatmap-cell heatmap-cell--empty';
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'heatmap-cell heatmap-cell--low';
    if (intensity < 0.5)  return 'heatmap-cell heatmap-cell--mid';
    if (intensity < 0.75) return 'heatmap-cell heatmap-cell--high';
    return 'heatmap-cell heatmap-cell--peak';
  };

  return (
    <>
      <h3 className="chart-card-title">Activity by Hour</h3>
      <div className="heatmap-row">
        {Array.from({ length: 24 }, (_, hour) => (
          <div key={hour} className="heatmap-col">
            <div
              className={getCellClass(activityStats.byHour[hour] ?? 0)}
              title={`${hour}:00 — ${activityStats.byHour[hour] ?? 0} messages`}
            />
            <span className="heatmap-hour-label">{hour}</span>
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span className="heatmap-legend-label">Less</span>
        <div className="heatmap-cell heatmap-cell--empty heatmap-legend-swatch" />
        <div className="heatmap-cell heatmap-cell--low heatmap-legend-swatch" />
        <div className="heatmap-cell heatmap-cell--mid heatmap-legend-swatch" />
        <div className="heatmap-cell heatmap-cell--high heatmap-legend-swatch" />
        <div className="heatmap-cell heatmap-cell--peak heatmap-legend-swatch" />
        <span className="heatmap-legend-label">More</span>
      </div>
    </>
  );
}