import Layout from '../components/Layout/Layout';
import MessageTrendChart from '../components/Charts/MessageTrendChart';
import UserContributionChart from '../components/Charts/UserContributionChart';
import ActivityHeatmap from '../components/Charts/ActivityHeatmap';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChatData } from '../hooks/useChatData';

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value}</p>
    </div>
  );
}

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-gray-400">
          {participants.join(' & ')}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Messages" value={messageStats.total.toLocaleString()} />
        <StatCard label="First Message" value={formatDate(messageStats.firstMessage)} />
        <StatCard label="Last Message" value={formatDate(messageStats.lastMessage)} />
        <StatCard label="Longest Streak" value={`${activityStats.streak} days`} />
      </div>

      {/* Per participant */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {participants.map(p => (
          <div key={p} className="bg-gray-900 rounded-2xl p-6">
            <p className="text-purple-400 font-semibold mb-3">{p}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-gray-500 text-xs">Messages</p>
                <p className="text-white font-bold">{(messageStats.perParticipant[p] ?? 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Share</p>
                <p className="text-white font-bold">{messageStats.percentagePerParticipant[p] ?? 0}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Avg Response</p>
                <p className="text-white font-bold">
                  {responseStats.averageResponseTime[p]
                    ? formatTime(responseStats.averageResponseTime[p])
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Convo Starters</p>
                <p className="text-white font-bold">{responseStats.conversationStarters[p] ?? 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <MessageTrendChart activityStats={activityStats} />
        <UserContributionChart messageStats={messageStats} />
      </div>

      <ActivityHeatmap activityStats={activityStats} />
    </Layout>
  );
}