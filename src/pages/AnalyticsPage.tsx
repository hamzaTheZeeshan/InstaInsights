import './AnalyticsPage.css';
import Layout from '../components/Layout/Layout';
import EmojiBarChart from '../components/Charts/EmojiBarChart';
import TopWordsChart from '../components/Charts/TopWordsChart';
import YearlyHeatmap from '../components/Charts/YearlyHeatmap';
import { useAnalytics } from '../hooks/useAnalytics';
import { useChatData } from '../hooks/useChatData';

export default function AnalyticsPage() {
  const { messageStats, wordStats, emojiStats, mediaStats, responseStats } = useAnalytics();
  const { messages } = useChatData();

  return (
    <Layout>
      <div className="analytics-page">

        {/* Header */}
        <div className="analytics-header">
          <h1 className="analytics-title">Analytics</h1>
          <p className="analytics-subtitle">Deep dive into your conversation</p>
        </div>

        {/* Top insight stat cards */}
        <div className="insight-grid">
          <div className="insight-card insight-card--purple">
            <p className="insight-card-label">Avg Message Length</p>
            <p className="insight-card-value">{messageStats.averageLength} chars</p>
          </div>
          <div className="insight-card insight-card--pink">
            <p className="insight-card-label">Fastest Replier</p>
            <p className="insight-card-value">{responseStats.fastestReplier || '—'}</p>
          </div>
          <div className="insight-card insight-card--blue">
            <p className="insight-card-label">Links Shared</p>
            <p className="insight-card-value">{mediaStats.links.toLocaleString()}</p>
          </div>
        </div>

        {/* Spotlight — longest & oldest message */}
        <div className="spotlight-grid">
          <div className="spotlight-card">
            <p className="spotlight-card-meta">
              📏 Longest Message — {messageStats.longestMessage.sender}
            </p>
            <p className="spotlight-card-content">
              {messageStats.longestMessage.content || '—'}
            </p>
            <p className="spotlight-card-footer">
              {messageStats.longestMessage.length} characters
            </p>
          </div>

          <div className="spotlight-card">
            <p className="spotlight-card-meta">
              💬 Oldest Message — {messages[0]?.sender}
            </p>
            <p className="spotlight-card-date">
              {messages[0] ? new Date(messages[0].timestamp).toLocaleDateString() : '—'}
            </p>
            <p className="spotlight-card-content">
              {messages[0]?.content || '(no text — attachment or share)'}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="analytics-charts-grid">
          <div className="analytics-chart-card">
            <TopWordsChart wordStats={wordStats} />
          </div>
          <div className="analytics-chart-card">
            <EmojiBarChart emojiStats={emojiStats} />
          </div>
        </div>

        {/* Top phrases */}
        <div className="phrases-card">
          <h3 className="analytics-section-title">Top Phrases</h3>
          <div className="phrases-grid">
            {wordStats.topPhrases.slice(0, 8).map(({ phrase, count }) => (
              <div key={phrase} className="phrase-chip">
                <p className="phrase-chip-text">"{phrase}"</p>
                <p className="phrase-chip-count">{count} times</p>
              </div>
            ))}
          </div>
        </div>

        {/* Double texts */}
        <div className="double-texts-card">
          <h3 className="analytics-section-title">Double Texts</h3>
          <div className="double-texts-row">
            {Object.entries(responseStats.doubleTexts).map(([sender, count]) => (
              <div key={sender}>
                <p className="double-text-item-name">{sender}</p>
                <p className="double-text-item-count">{count}</p>
                <p className="double-text-item-label">times</p>
              </div>
            ))}
          </div>
        </div>

        {/* Yearly Heatmap */}
        <div className="yearly-heatmap-card">
          <YearlyHeatmap messages={messages} />
        </div>

      </div>
    </Layout>
  );
}