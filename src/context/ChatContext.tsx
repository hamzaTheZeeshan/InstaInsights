import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';

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
  setMessages: (msgs: Message[]) => void;
  setParticipants: (names: string[]) => void;
  setReelShares: (reels: ReelShare[]) => void;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [reelShares, setReelShares] = useState<ReelShare[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMessages([]);
    setParticipants([]);
    setReelShares([]);
    setIsLoading(false);
    setError(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      participants,
      reelShares,
      isLoading,
      error,
      setMessages,
      setParticipants,
      setReelShares,
      setIsLoading,
      setError,
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