import './DropZone.css';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { strFromU8 } from 'fflate';
import { parseInstagramExport } from '../../parser/instagramParser';
import { mergeAndNormalizeExports, extractReelShares } from '../../parser/normalizeMessages';
import {
  buildZipIndex,
  scanInboxesFromIndex,
  resolveInboxTitles,
  extractFilesFromZip,
} from '../../parser/zipParser';
import { useChatContext } from '../../context/ChatContext';
import type { RawInstagramExport } from '../../types/instagram';
import { useThemeContext } from '../../hooks/ThemeContext';

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Detect "my name" from a set of exports.
 *
 * Strategy: the account owner appears in EVERY conversation's participants list.
 * We collect participant sets from each inbox's first export and find the
 * intersection — the name present in all of them is you.
 *
 * Fallback: if only one inbox or intersection fails, fall back to the most
 * frequent sender (original heuristic).
 */
function detectMyName(allExports: RawInstagramExport[], inboxExportMap: Map<string, RawInstagramExport[]>): string {
  // Build participant sets per inbox (using the first export of each inbox)
  const participantSets: Set<string>[] = [];
  for (const [, exports] of inboxExportMap) {
    if (exports.length === 0) continue;
    const names = new Set(exports[0].participants.map(p => p.name));
    participantSets.push(names);
  }

  if (participantSets.length >= 2) {
    // Intersection: names that appear in every inbox's participant list
    let intersection = participantSets[0];
    for (let i = 1; i < participantSets.length; i++) {
      intersection = new Set([...intersection].filter(n => participantSets[i].has(n)));
    }
    if (intersection.size === 1) {
      return [...intersection][0];
    }
    // If multiple names in intersection (e.g. group chats with same people),
    // pick the one who sent the most messages overall
    if (intersection.size > 1) {
      const counts: Record<string, number> = {};
      for (const exp of allExports) {
        for (const msg of exp.messages) {
          if (intersection.has(msg.sender_name)) {
            counts[msg.sender_name] = (counts[msg.sender_name] || 0) + 1;
          }
        }
      }
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    }
  }

  // Fallback: most frequent sender across all messages
  const counts: Record<string, number> = {};
  for (const exp of allExports) {
    for (const msg of exp.messages) {
      counts[msg.sender_name] = (counts[msg.sender_name] || 0) + 1;
    }
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');

  const {
    setMessages,
    setParticipants,
    setReelShares,
    setZipFile,
    setInboxes,
    setAllMessages,
    setMyName,
    setAllInboxData,
  } = useChatContext();

  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeContext();

  const processFiles = useCallback(async (files: File[]) => {
    setError(null);
    setIsLoading(true);

    const zipFile = files.find(f => f.name.endsWith('.zip'));
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));

    if (zipFile) {
      try {
        setStatus('Reading zip structure...');
        const index = await buildZipIndex(zipFile);

        setStatus('Finding conversations...');
        const rawInboxes = scanInboxesFromIndex(index);

        if (rawInboxes.length === 0) {
          setError('No Instagram message inboxes found in this zip file.');
          setIsLoading(false);
          return;
        }

        setStatus(`Resolving ${rawInboxes.length} conversation names...`);
        const resolvedInboxes = await resolveInboxTitles(zipFile, rawInboxes);

        setZipFile(zipFile);
        setInboxes(resolvedInboxes);

        // Collect ALL message file paths
        const allMessagePaths = new Set<string>();
        for (const inbox of resolvedInboxes) {
          for (const path of inbox.messageFiles) {
            allMessagePaths.add(path);
          }
        }

        setStatus(`Loading ${allMessagePaths.size} message files in one pass...`);

        const extractedFiles = await extractFilesFromZip(zipFile, allMessagePaths);

        // Parse every extracted file, tracking which exports belong to which inbox
        const allExports: RawInstagramExport[] = [];
        const inboxExportMap = new Map<string, RawInstagramExport[]>();

        for (const inbox of resolvedInboxes) {
          const inboxExports: RawInstagramExport[] = [];
          for (const filePath of inbox.messageFiles) {
            const data = extractedFiles[filePath];
            if (!data) continue;
            try {
              const text = strFromU8(data);
              const raw = parseInstagramExport(text);
              allExports.push(raw);
              inboxExports.push(raw);
            } catch (err) {
              console.warn(`Skipping malformed file: ${filePath}`, err);
            }
          }
          inboxExportMap.set(inbox.folderName, inboxExports);
        }

        setStatus('Identifying your account...');
        const detectedName = detectMyName(allExports, inboxExportMap);
        setMyName(detectedName);

        // Build per-inbox message lists and aggregate — same shape as useAllInboxesData
        // This happens here while files are already in memory, so the stats page
        // never needs to re-read the zip.
        setStatus('Preparing stats...');
        const perInbox = resolvedInboxes.map(inbox => {
          const exports = inboxExportMap.get(inbox.folderName) ?? [];
          const msgs = mergeAndNormalizeExports(exports);
          return { inbox, messages: msgs };
        }).filter(d => d.messages.length > 0);

        const allMsgs = perInbox.flatMap(d => d.messages);
        setAllMessages(allMsgs);
        setAllInboxData({ allMessages: allMsgs, inboxDataList: perInbox });

        setIsLoading(false);
        navigate('/select');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to read zip. Try JSON files instead.'
        );
        setIsLoading(false);
      }
      return;
    }

    // JSON file handling
    if (jsonFiles.length === 0) {
      setError('Please upload a .zip file or one or more .json files.');
      setIsLoading(false);
      return;
    }

    setStatus(`Parsing ${jsonFiles.length} file${jsonFiles.length > 1 ? 's' : ''}...`);

    const readers = jsonFiles.map(file =>
      new Promise<RawInstagramExport>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            resolve(parseInstagramExport(e.target?.result as string));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsText(file);
      })
    );

    try {
      const exports = await Promise.all(readers);

      const participants = exports[0].participants.map(p => p.name);
      const msgs = mergeAndNormalizeExports(exports);
      const reels = extractReelShares(exports);

      // For JSON uploads: you are the participant who sent the most
      const counts: Record<string, number> = {};
      for (const exp of exports) {
        for (const msg of exp.messages) {
          counts[msg.sender_name] = (counts[msg.sender_name] || 0) + 1;
        }
      }
      const detectedName = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
      setMyName(detectedName);

      setMessages(msgs);
      setParticipants(participants);
      setReelShares(reels);
      setAllMessages(msgs);

      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse files.');
      setIsLoading(false);
    }
  }, [
    setMessages,
    setParticipants,
    setReelShares,
    setZipFile,
    setInboxes,
    setAllMessages,
    setMyName,
    setAllInboxData,
    navigate,
  ]);

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

        <div className="hero-header">
          <h1 className="upload-hero-title">InstaInsights</h1>

          <button
            type="button"
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={
              theme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        <p className="upload-hero-subtitle">
          Upload your Instagram chat export and get deep insights.
        </p>

        <p className="upload-hero-privacy">
          🔒 Everything stays on your device. Nothing is uploaded.
        </p>

      </div>

      <div className="dropzone-wrapper">
        <div
          className={`dropzone-card ${isDragging ? 'dropzone-card--dragging' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <span className="dropzone-icon">📂</span>

          <p className="dropzone-title">
            Drop your ZIP or JSON files here
          </p>

          <p className="dropzone-subtitle">
            Upload the full ZIP export or individual message JSON files
          </p>

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
          <p className="dropzone-loading">
            ⏳ {status}
          </p>
        )}

        {error && (
          <p className="dropzone-error">
            ⚠️ {error}
          </p>
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
          <span key={f} className="feature-pill">
            {f}
          </span>
        ))}
      </div>

      <div className="instructions-card">
        <p className="instructions-title">
          📥 How to export your Instagram messages
        </p>

        <p className="instructions-subtitle">
          To download only your messages instead of your entire account data,
          use the "Download Your Information" tool in the app. Filtering by
          "Messages" dramatically reduces file size and processing time.
        </p>

        <div className="instructions-steps">
          {[
            <> <strong>Open the Instagram app</strong> and tap your <strong>Profile picture</strong> in the bottom right corner.</>,
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