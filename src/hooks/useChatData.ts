import { useChatContext } from '../context/ChatContext';

export function useChatData() {
  const { messages, participants, isLoading, error, reset } = useChatContext();
  return { messages, participants, isLoading, error, reset };
}