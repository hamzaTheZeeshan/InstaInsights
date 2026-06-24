export type AttachmentType = 'photo' | 'video' | 'audio' | 'link' | 'share';

export interface Attachment {
  type: AttachmentType;
  uri: string;
}

export interface Message {
  id: string;
  sender: string;
  timestamp: number;
  content: string;
  reactions: string[];
  attachments: Attachment[];
  isUnsent: boolean;
}