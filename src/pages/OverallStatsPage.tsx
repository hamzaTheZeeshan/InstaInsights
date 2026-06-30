import Layout from '../components/Layout/Layout';
import TimelineChart from '../components/Charts/TimelineChart';
import InboxBreakdownChart from '../components/Charts/InboxBreakdownChart';
import { useOverallStats } from '../hooks/useOverallStats';
import './OverallStatsPage.css';

/* ── Helpers ────────────────────────────────────────────────── */
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function truncate(str: string, max = 120) {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

/* ── Page ───────────────────────────────────────────────────── */
export default function OverallStatsPage() {
  const {
    isLoading,
    progress,
    error,
    totalMessages,
    totalPeople,
    daysActive,
    avgPerDay,
    personStats,
    mostTalkedTo,
    firstMsgRecipient,
    firstMsg,
    lastMsg,
    timelineData,
    myPhrases,
  } = useOverallStats();

  /* ── Loading state ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <Layout>
        <div className="os-page">
          <div className="os-empty">
            <span className="os-empty-icon">⏳</span>
            <p className="os-empty-text">Loading all conversations…</p>
            <div className="os-progress-track">
              <div
                className="os-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="os-progress-label">{progress}%</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Error state ────────────────────────────────────────── */
  if (error) {
    return (
      <Layout>
        <div className="os-page">
          <div className="os-empty">
            <span className="os-empty-icon">⚠️</span>
            <p className="os-empty-text">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ── Empty state ────────────────────────────────────────── */
  if (!totalMessages) {
    return (
      <Layout>
        <div className="os-page">
          <div className="os-empty">
            <span className="os-empty-icon">📭</span>
            <p className="os-empty-text">
              No data loaded yet. Upload a conversation first.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="os-page">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="os-header">
          <h1 className="os-title">Overall Stats</h1>
          <p className="os-subtitle">
            A bird's-eye view across all your conversations
            {firstMsg && lastMsg && (
              <>
                {' '}· {formatDate(firstMsg.timestamp)} → {formatDate(lastMsg.timestamp)}
              </>
            )}
          </p>
        </div>

        {/* ── Top stat cards ──────────────────────────────── */}
        <div className="os-stat-grid">
          <div className="os-stat-card os-stat-card--purple">
            <div className="os-stat-card-circle" />
            <p className="os-stat-label">Total Messages</p>
            <p className="os-stat-value">{totalMessages.toLocaleString()}</p>
          </div>
          <div className="os-stat-card os-stat-card--pink">
            <div className="os-stat-card-circle" />
            <p className="os-stat-label">People Messaged</p>
            <p className="os-stat-value">{totalPeople}</p>
          </div>
          <div className="os-stat-card os-stat-card--blue">
            <div className="os-stat-card-circle" />
            <p className="os-stat-label">Days Active</p>
            <p className="os-stat-value">{daysActive.toLocaleString()}</p>
          </div>
          <div className="os-stat-card os-stat-card--teal">
            <div className="os-stat-card-circle" />
            <p className="os-stat-label">Avg / Day</p>
            <p className="os-stat-value">{avgPerDay.toLocaleString()}</p>
          </div>
        </div>

        {/* ── Most talked to + first message ──────────────── */}
        <div className="os-highlight-grid">

          {mostTalkedTo && (
            <div className="os-highlight-card">
              <p className="os-card-eyebrow">🏆 Most Talked To</p>
              <p className="os-highlight-name">{mostTalkedTo.name}</p>
              <p className="os-highlight-big">
                {mostTalkedTo.count.toLocaleString()} <span>msgs</span>
              </p>
              <div className="os-pct-bar-track">
                <div
                  className="os-pct-bar-fill os-pct-bar-fill--purple"
                  style={{ width: `${mostTalkedTo.pct}%` }}
                />
              </div>
              <p className="os-pct-label">{mostTalkedTo.pct}% of your total inbox</p>
            </div>
          )}

          {firstMsg && (
            <div className="os-highlight-card">
              <p className="os-card-eyebrow">🌱 Your Very First Message</p>
              <p className="os-first-date">{formatDate(firstMsg.timestamp)}</p>
              <p className="os-first-sender">
                To: <strong>{firstMsgRecipient}</strong>
              </p>
              <p className="os-first-content">
                "{truncate(firstMsg.content ?? '[media]', 140)}"
              </p>
            </div>
          )}
        </div>

        {/* ── Inbox share breakdown ────────────────────────── */}
        <div className="os-section-card">
          <p className="os-section-title">Inbox Share Breakdown</p>
          <p className="os-section-sub">
            How your messages are distributed across people
          </p>
          <InboxBreakdownChart personStats={personStats} limit={10} />
        </div>

        {/* ── Timeline chart ───────────────────────────────── */}
        {timelineData.length > 1 && (
          <div className="os-section-card">
            <p className="os-section-title">Messages Over Time</p>
            <p className="os-section-sub">
              Monthly volume across all conversations
            </p>
            <TimelineChart data={timelineData} />
          </div>
        )}

        {/* ── Signature phrases ────────────────────────────── */}
        {myPhrases.length > 0 && (
          <div className="os-section-card">
            <p className="os-section-title">Your Signature Phrases</p>
            <p className="os-section-sub">
              Recurring phrases you use across conversations — patterns you might not even notice
            </p>
            <div className="os-phrases-grid">
              {myPhrases.map(({ phrase, count }) => (
                <div key={phrase} className="os-phrase-chip">
                  <p className="os-phrase-text">"{phrase}"</p>
                  <p className="os-phrase-count">used {count}× across all chats</p>/
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── First → Last bookend ─────────────────────────── */}
        {firstMsg && lastMsg && (
          <div className="os-bookend-grid">
            <div className="os-bookend-card os-bookend-card--start">
              <p className="os-bookend-label">First Message</p>
              <p className="os-bookend-date">{formatDate(firstMsg.timestamp)}</p>
              <p className="os-bookend-sender">{firstMsg.sender}</p>
              <p className="os-bookend-content">
                {truncate(firstMsg.content ?? '[media]', 100)}
              </p>
            </div>
            <div className="os-bookend-divider">
              <span className="os-bookend-arrow">→</span>
            </div>
            <div className="os-bookend-card os-bookend-card--end">
              <p className="os-bookend-label">Latest Message</p>
              <p className="os-bookend-date">{formatDate(lastMsg.timestamp)}</p>
              <p className="os-bookend-sender">{lastMsg.sender}</p>
              <p className="os-bookend-content">
                {truncate(lastMsg.content ?? '[media]', 100)}
              </p>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}