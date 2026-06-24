import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseInstagramExport } from '../../parser/instagramParser';
import { mergeAndNormalizeExports } from '../../parser/normalizeMessages';
import { useChatContext } from '../../context/ChatContext';
import type { RawInstagramExport } from '../../types/instagram';

export default function DropZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const { setMessages, setParticipants } = useChatContext();
  const navigate = useNavigate();

  const processFiles = useCallback((files: File[]) => {
    const jsonFiles = files.filter(f => f.name.endsWith('.json'));
    if (jsonFiles.length === 0) {
      setError('Please upload at least one .json file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setFileCount(jsonFiles.length);

    const readers = jsonFiles.map(file =>
      new Promise<RawInstagramExport>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const raw = parseInstagramExport(e.target?.result as string);
            resolve(raw);
          } catch (err) {
            reject(err);
          }
        };
        reader.readAsText(file);
      })
    );

    Promise.all(readers)
      .then(exports => {
        const participants = exports[0].participants.map(p => p.name);
        const msgs = mergeAndNormalizeExports(exports);
        setMessages(msgs);
        setParticipants(participants);
        navigate('/dashboard');
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to parse files.');
        setIsLoading(false);
      });
  }, [setMessages, setParticipants, navigate]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, [processFiles]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    processFiles(files);
  };

  return (
    <div className="w-full max-w-lg">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
          ${isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-gray-700 bg-gray-900 hover:border-purple-600 hover:bg-gray-800'
          }`}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <div className="text-5xl mb-4">📂</div>
        <p className="text-white font-semibold text-lg">Drop your JSON files here</p>
        <p className="text-gray-500 text-sm mt-1">Select multiple files at once — we'll merge them</p>
        <p className="text-gray-600 text-xs mt-1">or click to browse</p>
        <input
          id="fileInput"
          type="file"
          accept=".json"
          multiple
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {isLoading && (
        <p className="text-purple-400 text-center mt-4 animate-pulse">
          Parsing {fileCount} file{fileCount > 1 ? 's' : ''} and merging...
        </p>
      )}

      {error && (
        <p className="text-red-400 text-center mt-4">{error}</p>
      )}
    </div>
  );
}