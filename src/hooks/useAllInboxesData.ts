import { useChatContext } from '../context/ChatContext';
import type { Message } from '../types/message';
import type { InboxPreview } from '../parser/zipParser';

export interface InboxData {
  inbox: InboxPreview;
  messages: Message[];
}

export interface AllInboxesData {
  allMessages: Message[];
  inboxDataList: InboxData[];
  isLoading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Returns the pre-built inbox data from context.
 * All loading happens in DropZone while the zip is already in memory —
 * so this hook is just a reader, never a loader. Navigation is instant.
 */
export function useAllInboxesData(): AllInboxesData {
  const { allInboxData, isLoading, error } = useChatContext();

  if (allInboxData) {
    return {
      allMessages: allInboxData.allMessages,
      inboxDataList: allInboxData.inboxDataList,
      isLoading: false,
      progress: 100,
      error: null,
    };
  }

  return {
    allMessages: [],
    inboxDataList: [],
    isLoading,
    progress: 0,
    error,
  };
}