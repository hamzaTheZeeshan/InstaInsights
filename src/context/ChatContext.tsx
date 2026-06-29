// ChatContext.tsx
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';
import type { InboxPreview } from '../parser/zipParser';
import type { InboxData } from '../hooks/useAllInboxesData';

interface ReelShare {
  sender: string;
  uri: string;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  allMessages: Message[];
  participants: string[];
  reelShares: ReelShare[];
  isLoading: boolean;
  error: string | null;
  zipFile: File | null;
  inboxes: InboxPreview[];
  selectedInbox: InboxPreview | null;
  myName: string;

  // ── Cached overall-stats data (persists across navigation) ──
  allInboxData: { allMessages: Message[]; inboxDataList: InboxData[] } | null;
  setAllInboxData: (data: { allMessages: Message[]; inboxDataList: InboxData[] } | null) => void;

  setMessages: (msgs: Message[]) => void;
  setAllMessages: (msgs: Message[]) => void;
  setParticipants: (names: string[]) => void;
  setReelShares: (reels: ReelShare[]) => void;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  setZipFile: (file: File | null) => void;
  setInboxes: (inboxes: InboxPreview[]) => void;
  setSelectedInbox: (inbox: InboxPreview | null) => void;
  setMyName: (name: string) => void;
  reset: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [reelShares, setReelShares] = useState<ReelShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [inboxes, setInboxes] = useState<InboxPreview[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<InboxPreview | null>(null);
  const [myName, setMyName] = useState<string>('');
  const [allInboxData, setAllInboxData] = useState<{
    allMessages: Message[];
    inboxDataList: InboxData[];
  } | null>(null);

  const reset = () => {
    setMessages([]);
    setAllMessages([]);
    setParticipants([]);
    setReelShares([]);
    setIsLoading(false);
    setError(null);
    setZipFile(null);
    setInboxes([]);
    setSelectedInbox(null);
    setMyName('');
    setAllInboxData(null); // clear cache on full reset
  };

  return (
    <ChatContext.Provider value={{
      messages,
      allMessages,
      participants,
      reelShares,
      isLoading,
      error,
      zipFile,
      inboxes,
      selectedInbox,
      myName,
      allInboxData,
      setAllInboxData,
      setMessages,
      setAllMessages,
      setParticipants,
      setReelShares,
      setIsLoading,
      setError,
      setZipFile,
      setInboxes,
      setSelectedInbox,
      setMyName,
      reset,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used inside ChatProvider');
  return ctx;
}