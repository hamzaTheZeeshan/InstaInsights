import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import { loadInboxMessages } from '../parser/zipParser';
import { mergeAndNormalizeExports, extractReelShares } from '../parser/normalizeMessages';
import './SelectInboxPage.css';

export default function SelectInboxPage() {
  const navigate = useNavigate();
  const {
    zip, inboxes, isLoading,
    setMessages, setParticipants, setReelShares,
    setIsLoading, setError, setSelectedInbox, reset,
  } = useChatContext();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!zip || inboxes.length === 0) navigate('/');
  }, [zip, inboxes, navigate]);

  const filtered = inboxes.filter(inbox =>
    inbox.title.toLowerCase().includes(query.toLowerCase()) ||
    inbox.participants.some(p => p.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = async (inbox: typeof inboxes[0]) => {
    if (!zip) return;
    setIsLoading(true);
    setError(null);
    setSelectedInbox(inbox);

    try {
      const exports = await loadInboxMessages(zip, inbox.messageFiles);
      const msgs = mergeAndNormalizeExports(exports);
      const reels = extractReelShares(exports);
      setMessages(msgs);
      setParticipants(inbox.participants);
      setReelShares(reels);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="select-page">
      <div className="select-header">
        <h1 className="select-title">Choose a Conversation</h1>
        <p className="select-subtitle">
          Found {inboxes.length} conversation{inboxes.length !== 1 ? 's' : ''} in your export.
          Select one to analyze.
        </p>
        <button className="select-back" onClick={() => { reset(); navigate('/'); }}>
          ← Upload different file
        </button>
      </div>

      {/* Search bar */}
      <div className="select-search-wrapper">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="🔍 Search conversations..."
          className="select-search"
        />
        {query && (
          <span className="select-search-count">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {isLoading && (
        <p className="select-loading">⏳ Loading conversation...</p>
      )}

      <div className="select-grid">
        {filtered.map(inbox => (
          <div
            key={inbox.folderName}
            className="inbox-card"
            onClick={() => handleSelect(inbox)}
          >
            <div className="inbox-avatar">
              {inbox.title.charAt(0).toUpperCase()}
            </div>
            <div className="inbox-info">
              <p className="inbox-name">{inbox.title}</p>
              <p className="inbox-meta">
                {inbox.participants.join(' & ')} · {inbox.messageFiles.length} file{inbox.messageFiles.length !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="inbox-arrow">→</span>
          </div>
        ))}

        {filtered.length === 0 && query && (
          <div className="select-empty">
            No conversations found for "<strong>{query}</strong>"
          </div>
        )}
      </div>
    </div>
  );
}