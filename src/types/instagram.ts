export interface RawReaction {
  reaction: string;
  actor: string;
}

export interface RawAttachment {
  uri: string;
  creation_timestamp?: number;
}

export interface RawShare {
  link?: string;
  share_text?: string;
  original_content_owner?: string;
}

export interface RawMessage {
  sender_name: string;
  timestamp_ms: number;
  content?: string;
  reactions?: RawReaction[];
  photos?: RawAttachment[];
  videos?: RawAttachment[];
  audio_files?: RawAttachment[];
  share?: RawShare;
  is_geoblocked_for_viewer?: boolean;
  is_unsent_image_by_messenger_kid_parent?: boolean;
}

export interface RawParticipant {
  name: string;
}

export interface RawInstagramExport {
  participants: RawParticipant[];
  messages: RawMessage[];
  title?: string;
  thread_type?: string;
}