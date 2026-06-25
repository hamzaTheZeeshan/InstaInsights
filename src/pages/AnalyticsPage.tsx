import Layout from '../components/Layout/Layout';
import EmojiBarChart from '../components/Charts/EmojiBarChart';
import TopWordsChart from '../components/Charts/TopWordsChart';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChatData } from '../hooks/useChatData';
import YearlyHeatmap from '../components/Charts/YearlyHeatmap';

export default function AnalyticsPage() {
  const { messageStats, wordStats, emojiStats, mediaStats, responseStats } = useAnalytics();
  const { messages } = useChatData();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-gray-400">Deep dive into your conversation</p>
      </div>

      {/* Message insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-1">Avg Message Length</p>
          <p className="text-white text-2xl font-bold">{messageStats.averageLength} chars</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-1">Fastest Replier</p>
          <p className="text-white text-2xl font-bold">{responseStats.fastestReplier || '—'}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-1">Links Shared</p>
          <p className="text-white text-2xl font-bold">{mediaStats.links.toLocaleString()}</p>
        </div>
      </div>

      {/* Longest message + Oldest message */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-2">📏 Longest Message — {messageStats.longestMessage.sender}</p>
          <p className="text-white text-sm leading-relaxed line-clamp-4">
            {messageStats.longestMessage.content || '—'}
          </p>
          <p className="text-gray-600 text-xs mt-2">{messageStats.longestMessage.length} characters</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-6">
          <p className="text-gray-400 text-sm mb-2">💬 Oldest Message — {messages[0]?.sender}</p>
          <p className="text-purple-400 text-xs font-semibold mb-2">
            {messages[0] ? new Date(messages[0].timestamp).toLocaleDateString() : '—'}
          </p>
          <p className="text-white text-sm leading-relaxed line-clamp-4">
            {messages[0]?.content || '(no text — attachment or share)'}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <TopWordsChart wordStats={wordStats} />
        <EmojiBarChart emojiStats={emojiStats} />
      </div>

      {/* Top phrases */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-8">
        <h3 className="text-white font-semibold text-lg mb-4">Top Phrases</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {wordStats.topPhrases.slice(0, 8).map(({ phrase, count }) => (
            <div key={phrase} className="bg-gray-800 rounded-xl p-3">
              <p className="text-white text-sm font-medium">"{phrase}"</p>
              <p className="text-gray-500 text-xs mt-1">{count} times</p>
            </div>
          ))}
        </div>
      </div>

      {/* Double texts */}
      <div className="bg-gray-900 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-4">Double Texts</h3>
        <div className="flex gap-6">
          {Object.entries(responseStats.doubleTexts).map(([sender, count]) => (
            <div key={sender}>
              <p className="text-purple-400 font-semibold">{sender}</p>
              <p className="text-white text-2xl font-bold">{count}</p>
              <p className="text-gray-500 text-xs">times</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <YearlyHeatmap messages={messages} />
      </div>
    </Layout>
  );
}