import { useState, useMemo } from 'react';
import './SearchPage.css';
import Layout from '../components/Layout/Layout';
import { useSearch } from '../hooks/useSearch';
import { useChatData } from '../hooks/useChatData';
import { highlightText } from '../search/regexSearch';

type SearchMode = 'keyword' | 'date';

export default function SearchPage() {
  const { participants, messages } = useChatData();
  const { results, options, setOptions } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const [mode, setSearchMode] = useState<SearchMode>('keyword');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStart, setAppliedStart] = useState('');
  const [appliedEnd, setAppliedEnd] = useState('');

  const handleSearch = () => {
    setOptions({ ...options, query: inputValue });
  };

  const dateResults = useMemo(() => {
    if (mode !== 'date' || (!appliedStart && !appliedEnd)) return [];
    return messages.filter(m => {
      const msgDate = new Date(m.timestamp);
      if (appliedStart) {
        const start = new Date(appliedStart);
        start.setHours(0, 0, 0, 0);
        if (msgDate < start) return false;
      }
      if (appliedEnd) {
        const end = new Date(appliedEnd);
        end.setHours(23, 59, 59, 999);
        if (msgDate > end) return false;
      }
      return true;
    });
  }, [messages, appliedStart, appliedEnd, mode]);

  const renderHighlighted = (content: string) => {
    const highlighted = highlightText(content, options.query, options.useRegex);
    const parts = highlighted.split('%%%');
    return parts.map((part, i) =>
      i % 2 === 1
        ? <mark key={i} className="search-highlight">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <Layout>
      <div className="search-page">

        {/* Header */}
        <div className="search-header">
          <h1 className="search-title">Search</h1>
          <p className="search-subtitle">Search through your messages</p>
        </div>

        {/* Mode toggle */}
        <div className="search-mode-toggle">
          <button
            onClick={() => setSearchMode('keyword')}
            className={mode === 'keyword' ? 'mode-btn mode-btn--active' : 'mode-btn mode-btn--inactive'}
          >
            🔍 Keyword Search
          </button>
          <button
            onClick={() => setSearchMode('date')}
            className={mode === 'date' ? 'mode-btn mode-btn--active' : 'mode-btn mode-btn--inactive'}
          >
            📅 Date Range
          </button>
        </div>

        {/* Keyword mode */}
        {mode === 'keyword' && (
          <div className="search-control-card">
            <div className="search-input-row">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search messages..."
                className="search-input"
              />
              <button onClick={handleSearch} className="search-btn">
                Search
              </button>
            </div>

            <div className="search-filters-row">
              <select
                value={options.sender}
                onChange={e => setOptions({ ...options, sender: e.target.value })}
                className="search-select"
              >
                <option value="">All participants</option>
                {participants.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <div className="search-date-range">
                <span className="search-date-label">From</span>
                <input
                  type="date"
                  onChange={e => setOptions({
                    ...options,
                    startDate: e.target.value ? new Date(e.target.value).getTime() : null,
                  })}
                  className="search-date-input"
                />
                <span className="search-date-label">To</span>
                <input
                  type="date"
                  onChange={e => setOptions({
                    ...options,
                    endDate: e.target.value ? new Date(e.target.value + 'T23:59:59').getTime() : null,
                  })}
                  className="search-date-input"
                />
              </div>

              <label className="search-regex-label">
                <input
                  type="checkbox"
                  checked={options.useRegex}
                  onChange={e => setOptions({ ...options, useRegex: e.target.checked })}
                />
                Regex
              </label>
            </div>
          </div>
        )}

        {/* Date mode */}
        {mode === 'date' && (
          <div className="search-control-card">
            <div className="search-date-mode-row">
              <div className="search-date-range">
                <span className="search-date-label">From</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="search-date-input"
                />
              </div>
              <div className="search-date-range">
                <span className="search-date-label">To</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="search-date-input"
                />
              </div>
              <button
                onClick={() => { setAppliedStart(startDate); setAppliedEnd(endDate); }}
                className="search-btn"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        {mode === 'keyword' && options.query && (
          <p className="search-results-count">
            {results.length} result{results.length !== 1 ? 's' : ''}
            {results.length === 200 ? ' (capped at 200)' : ''}
          </p>
        )}
        {mode === 'date' && (appliedStart || appliedEnd) && (
          <p className="search-results-count">
            {dateResults.length} message{dateResults.length !== 1 ? 's' : ''} in this range
          </p>
        )}

        {/* Keyword results */}
        {mode === 'keyword' && (
          <div className="search-results-list">
            {results.map((result, i) => (
              <div key={i} className="search-result-card">
                {result.context.map((msg, j) => (
                  <div
                    key={msg.id}
                    className={
                      j === result.matchIndex
                        ? 'search-result-row search-result-row--match'
                        : 'search-result-row'
                    }
                  >
                    <span className="search-result-sender">
                      {msg.sender.split(' ')[0]}
                    </span>
                    <span className="search-result-content">
                      {j === result.matchIndex
                        ? renderHighlighted(msg.content)
                        : msg.content}
                    </span>
                    <span className="search-result-date">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Date results */}
        {mode === 'date' && (
          <div className="date-results-list">
            {dateResults.map(msg => (
              <div key={msg.id} className="date-result-card">
                <span className="date-result-sender">
                  {msg.sender.split(' ')[0]}
                </span>
                <span className={msg.content ? 'date-result-content' : 'date-result-content date-result-content--empty'}>
                  {msg.content || 'attachment / share'}
                </span>
                <span className="date-result-timestamp">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </Layout>
  );
}