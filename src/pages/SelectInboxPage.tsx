import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../context/ChatContext';
import { loadInboxFromZip } from '../parser/zipParser';
import { mergeAndNormalizeExports, extractReelShares } from '../parser/normalizeMessages';
import Layout from '../components/Layout/Layout';
import './SelectInboxPage.css';

export default function SelectInboxPage() {
  const navigate = useNavigate();
  const {
    zipFile, inboxes,
    setMessages, setParticipants, setReelShares,
    setIsLoading, setError, setSelectedInbox, reset,
  } = useChatContext();

  const [query, setQuery] = useState('');
  const [loadingInbox, setLoadingInbox] = useState<string | null>(null);

  useEffect(() => {
    if (!zipFile || inboxes.length === 0) navigate('/');
  }, [zipFile, inboxes, navigate]);

  const filtered = inboxes.filter(inbox =>
    inbox.title.toLowerCase().includes(query.toLowerCase()) ||
    inbox.participants.some(p => p.toLowerCase().includes(query.toLowerCase()))
  );

  const handleSelect = async (inbox: typeof inboxes[0]) => {
    if (!zipFile) return;
    setLoadingInbox(inbox.folderName);
    setIsLoading(true);
    setError(null);

    try {
      const { exports, resolvedInbox } = await loadInboxFromZip(zipFile, inbox);
      const msgs = mergeAndNormalizeExports(exports);
      const reels = extractReelShares(exports);
      setMessages(msgs);
      setParticipants(resolvedInbox.participants);
      setReelShares(reels);
      setSelectedInbox(resolvedInbox);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inbox.');
    } finally {
      setIsLoading(false);
      setLoadingInbox(null);
    }
  };

  return (
    <Layout>
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

        <div className="select-grid">
          {filtered.map(inbox => (
            <div
              key={inbox.folderName}
              className={`inbox-card ${loadingInbox === inbox.folderName ? 'inbox-card--loading' : ''}`}
              onClick={() => !loadingInbox && handleSelect(inbox)}
            >
              <div className="inbox-avatar">
                {inbox.title.charAt(0).toUpperCase()}
              </div>
              <div className="inbox-info">
                <p className="inbox-name">{inbox.title}</p>
                <p className="inbox-meta">
                  {inbox.participants.length > 0
                    ? inbox.participants.join(' & ')
                    : 'Tap to load'} · {inbox.messageFiles.length} file{inbox.messageFiles.length !== 1 ? 's' : ''}
                </p>
              </div>
              {loadingInbox === inbox.folderName
                ? <span className="inbox-loading">⏳</span>
                : <span className="inbox-arrow">→</span>
              }
            </div>
          ))}

          {filtered.length === 0 && query && (
            <div className="select-empty">
              No conversations found for "<strong>{query}</strong>"
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}