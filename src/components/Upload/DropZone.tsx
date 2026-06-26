import './DropZone.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseInstagramExport } from '../../parser/instagramParser';
import { mergeAndNormalizeExports, extractReelShares } from '../../parser/normalizeMessages';
import { extractZip, scanInboxes } from '../../parser/zipParser';
import { useChatContext } from '../../context/ChatContext';
import type { RawInstagramExport } from '../../types/instagram';

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const { setMessages, setParticipants, setReelShares, setZip, setInboxes } = useChatContext();
  const navigate = useNavigate();

  const processFiles = useCallback(async (files: File[]) => {
    setError(null);
    setIsLoading(true);

    const zipFile = files.find(f => f.name.endsWith('.zip'));
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    // ZIP flow
    if (zipFile) {
      try {
        setStatus('Extracting zip...');
        const zip = await extractZip(zipFile);
        setStatus('Scanning inboxes...');
        const inboxes = await scanInboxes(zip);

        if (inboxes.length === 0) {
          setError('No Instagram message inboxes found in this zip file.');
          setIsLoading(false);
          return;
        }

        setZip(zip);
        setInboxes(inboxes);
        setIsLoading(false);
        navigate('/select');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read zip file.');
        setIsLoading(false);
      }
      return;
    }

    // JSON flow (existing)
    if (jsonFiles.length === 0) {
      setError('Please upload a .zip file or one or more .json files.');
      setIsLoading(false);
      return;
    }

    setStatus(`Parsing ${jsonFiles.length} file${jsonFiles.length > 1 ? 's' : ''}...`);

    const readers = jsonFiles.map(file =>
      new Promise<RawInstagramExport>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            resolve(parseInstagramExport(e.target?.result as string));
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      })
    );

    try {
      const exports = await Promise.all(readers);
      const participants = exports[0].participants.map(p => p.name);
      const msgs = mergeAndNormalizeExports(exports);
      const reels = extractReelShares(exports);
      setMessages(msgs);
      setParticipants(participants);
      setReelShares(reels);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse files.');
      setIsLoading(false);
    }
  }, [setMessages, setParticipants, setReelShares, setZip, setInboxes, navigate]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files ?? []));
  };

  return (
    <div className="upload-page">
      <div className="upload-hero">
        <h1 className="upload-hero-title">InstaInsights</h1>
        <p className="upload-hero-subtitle">Upload your Instagram chat export and get deep insights.</p>
        <p className="upload-hero-privacy">🔒 Everything stays on your device. Nothing is uploaded.</p>
      </div>

      <div className="dropzone-wrapper">
        <div
          className={`dropzone-card ${isDragging ? 'dropzone-card--dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <span className="dropzone-icon">📂</span>
          <p className="dropzone-title">Drop your ZIP or JSON files here</p>
          <p className="dropzone-subtitle">Upload the full ZIP export or individual message JSON files</p>
          <p className="dropzone-hint">or click to browse</p>
          <input
            id="fileInput"
            type="file"
            accept=".zip,.json"
            multiple
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
        </div>

        {isLoading && (
          <p className="dropzone-loading">⏳ {status}</p>
        )}

        {error && (
          <p className="dropzone-error">⚠️ {error}</p>
        )}
      </div>

      <div className="upload-features">
        {[
          '📊 Message Analytics',
          '🔍 Smart Search',
          '🎬 Reel Counts',
          '📅 Activity Heatmap',
          '😄 Emoji Stats',
          '💬 Word Frequency',
        ].map(f => (
          <span key={f} className="feature-pill">{f}</span>
        ))}
      </div>

      <div className="instructions-card">
        <p className="instructions-title">📥 How to export your Instagram messages</p>
        <p className="instructions-subtitle">
          To download only your messages instead of your entire account data, use the
          "Download Your Information" tool in the app. Filtering by "Messages" dramatically
          reduces file size and processing time.
        </p>
        <div className="instructions-steps">
          {[
            <><strong>Open the Instagram app</strong> and tap your <strong>Profile picture</strong> in the bottom right corner.</>,
            <>Tap the <strong>Hamburger Menu</strong> (three horizontal lines) in the top-right, then select <strong>Settings and Activity</strong>.</>,
            <>Tap <strong>Accounts Center</strong> and go to <strong>Your Information and Permissions</strong>.</>,
            <>Select <strong>Download Your Information</strong> (or Export Your Information) and tap <strong>Create Export</strong>.</>,
            <>Choose your Instagram account and tap <strong>Next</strong>.</>,
            <>Choose <strong>Some of Your Information</strong>, scroll down, and check only <strong>Messages</strong>. Tap <strong>Next</strong>.</>,
            <>Select <strong>Download to device</strong>.</>,
            <>Customize your <strong>Date range</strong> to All Time and choose <strong>JSON</strong> as your file format.</>,
            <>Enter your email, set media quality to <strong>High</strong>, and tap <strong>Create files</strong> or <strong>Start export</strong>.</>,
          ].map((step, i) => (
            <div key={i} className="instructions-step">
              <span className="step-number">{i + 1}</span>
              <p className="step-text">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}