import './DashboardPage.css';
import Layout from '../components/Layout/Layout';
import MessageTrendChart from '../components/Charts/MessageTrendChart';
import UserContributionChart from '../components/Charts/UserContributionChart';
import ActivityHeatmap from '../components/Charts/ActivityHeatmap';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChatData } from '../hooks/useChatData';

/* ── Types ────────────────────────────────────────────────── */
type StatCardVariant = 'purple' | 'pink' | 'blue' | 'teal';

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: StatCardVariant;
}

/* ── StatCard ─────────────────────────────────────────────── */
function StatCard({ label, value, variant = 'purple' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{value}</p>
    </div>
  );
}

/* ── DashboardPage ────────────────────────────────────────── */
export default function DashboardPage() {
  const { participants } = useChatData();
  const { messageStats, activityStats, responseStats } = useAnalytics();

  const formatDate = (ts: number) =>
    ts ? new Date(ts).toLocaleDateString() : '—';

  const formatTime = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    return `${(mins / 60).toFixed(1)}h`;
  };

  return (
    <Layout>
      <div className="dashboard-page">

        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">{participants.join(' & ')}</p>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          <StatCard
            label="Total Messages"
            value={messageStats.total.toLocaleString()}
            variant="purple"
          />
          <StatCard
            label="First Message"
            value={formatDate(messageStats.firstMessage)}
            variant="pink"
          />
          <StatCard
            label="Last Message"
            value={formatDate(messageStats.lastMessage)}
            variant="blue"
          />
          <StatCard
            label="Longest Streak"
            value={`${activityStats.streak} days`}
            variant="teal"
          />
        </div>

        {/* Per-participant breakdown */}
        <div className="participant-grid">
          {participants.map((p) => (
            <div key={p} className="participant-card">
              <p className="participant-name">{p}</p>
              <div className="participant-stats-grid">
                <div>
                  <p className="participant-stat-label">Messages</p>
                  <p className="participant-stat-value">
                    {(messageStats.perParticipant[p] ?? 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="participant-stat-label">Share</p>
                  <p className="participant-stat-value">
                    {messageStats.percentagePerParticipant[p] ?? 0}%
                  </p>
                </div>
                <div>
                  <p className="participant-stat-label">Avg Response</p>
                  <p className="participant-stat-value">
                    {responseStats.averageResponseTime[p]
                      ? formatTime(responseStats.averageResponseTime[p])
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="participant-stat-label">Convo Starters</p>
                  <p className="participant-stat-value">
                    {responseStats.conversationStarters[p] ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <MessageTrendChart activityStats={activityStats} />
          </div>
          <div className="chart-card">
            <UserContributionChart messageStats={messageStats} />
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="heatmap-card">
          <ActivityHeatmap activityStats={activityStats} />
        </div>

      </div>
    </Layout>
  );
}