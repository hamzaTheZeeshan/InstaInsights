import { useState } from 'react';
import Layout from '../components/Layout/Layout';
import { useSearch } from '../hooks/useSearch';
import { useChatData } from '../hooks/useChatData';
import { highlightText } from '../search/regexSearch';

export default function SearchPage() {
  const { participants } = useChatData();
  const { results, options, setOptions } = useSearch();
  const [inputValue, setInputValue] = useState('');

  const handleSearch = () => {
    setOptions({ ...options, query: inputValue });
  };

  const renderHighlighted = (content: string) => {
    const highlighted = highlightText(content, options.query, options.useRegex);
    const parts = highlighted.split('%%%');
    return parts.map((part, i) =>
      i % 2 === 1
        ? <mark key={i} className="bg-purple-500 text-white rounded px-0.5">{part}</mark>
        : <span key={i}>{part}</span>
    );
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Search</h1>
        <p className="text-gray-400">Search through your messages</p>
      </div>

      {/* Search bar */}
      <div className="bg-gray-900 rounded-2xl p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search messages..."
            className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
          />
          <button
            onClick={handleSearch}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Search
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 flex-wrap">
          <select
            value={options.sender}
            onChange={e => setOptions({ ...options, sender: e.target.value })}
            className="bg-gray-800 text-gray-300 rounded-xl px-4 py-2 outline-none text-sm"
          >
            <option value="">All participants</option>
            {participants.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={options.useRegex}
              onChange={e => setOptions({ ...options, useRegex: e.target.checked })}
              className="accent-purple-500"
            />
            Regex
          </label>
        </div>
      </div>

      {/* Results */}
      {options.query && (
        <p className="text-gray-500 text-sm mb-4">
          {results.length} result{results.length !== 1 ? 's' : ''}
          {results.length === 200 ? ' (capped at 200)' : ''}
        </p>
      )}

      <div className="flex flex-col gap-4">
        {results.map((result, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-4">
            {result.context.map((msg, j) => (
              <div
                key={msg.id}
                className={`flex gap-3 py-2 px-3 rounded-xl mb-1 ${
                  j === result.matchIndex ? 'bg-gray-800' : ''
                }`}
              >
                <span className="text-purple-400 text-sm font-semibold min-w-24 shrink-0">
                  {msg.sender.split(' ')[0]}
                </span>
                <span className="text-gray-300 text-sm">
                  {j === result.matchIndex
                    ? renderHighlighted(msg.content)
                    : msg.content}
                </span>
                <span className="text-gray-600 text-xs ml-auto shrink-0">
                  {new Date(msg.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Layout>
  );
}
