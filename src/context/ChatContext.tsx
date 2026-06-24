import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Message } from '../types/message';
interface ChatContextType {
  messages: Message[];
  participants: string[];
  isLoading: boolean;
  error: string | null;
  setMessages: (msgs: Message[]) => void;
  setParticipants: (names: string[]) => void;
  setIsLoading: (val: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMessages([]);
    setParticipants([]);
    setIsLoading(false);
    setError(null);
  };

  return (
    <ChatContext.Provider value={{
      messages,
      participants,
      isLoading,
      error,
      setMessages,
      setParticipants,
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