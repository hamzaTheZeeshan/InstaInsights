import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';
import type { InboxPreview } from '../parser/zipParser';
import JSZip from 'jszip';

interface ReelShare {
  sender: string;
  uri: string;
  timestamp: number;
}

interface ChatContextType {
  messages: Message[];
  participants: string[];
  reelShares: ReelShare[];
  isLoading: boolean;
  error: string | null;
  zip: JSZip | null;
  inboxes: InboxPreview[];
  selectedInbox: InboxPreview | null;
  setMessages: (msgs: Message[]) => void;
  setParticipants: (names: string[]) => void;
  setReelShares: (reels: ReelShare[]) => void;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  setZip: (zip: JSZip | null) => void;
  setInboxes: (inboxes: InboxPreview[]) => void;
  setSelectedInbox: (inbox: InboxPreview | null) => void;
  reset: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [reelShares, setReelShares] = useState<ReelShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zip, setZip] = useState<JSZip | null>(null);
  const [inboxes, setInboxes] = useState<InboxPreview[]>([]);
  const [selectedInbox, setSelectedInbox] = useState<InboxPreview | null>(null);

  const reset = () => {
    setMessages([]);
    setParticipants([]);
    setReelShares([]);
    setIsLoading(false);
    setError(null);
    setZip(null);
    setInboxes([]);
    setSelectedInbox(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      participants,
      reelShares,
      isLoading,
      error,
      zip,
      inboxes,
      selectedInbox,
      setMessages,
      setParticipants,
      setReelShares,
      setIsLoading,
      setError,
      setZip,
      setInboxes,
      setSelectedInbox,
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