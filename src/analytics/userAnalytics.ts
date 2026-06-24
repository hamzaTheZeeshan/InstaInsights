import type { Message } from '../types/message';
import type { MediaStats } from '../types/analytics';

export function getMediaStats(messages: Message[]): MediaStats {
  let photos = 0;
  let videos = 0;
  let audio = 0;
  let links = 0;

  const perParticipant: Record<string, {
    photos: number; videos: number; audio: number; links: number;
  }> = {};

  for (const msg of messages) {
    if (!perParticipant[msg.sender]) {
      perParticipant[msg.sender] = { photos: 0, videos: 0, audio: 0, links: 0 };
    }

    for (const att of msg.attachments) {
      if (att.type === 'photo') {
        photos++;
        perParticipant[msg.sender].photos++;
      } else if (att.type === 'video') {
        videos++;
        perParticipant[msg.sender].videos++;
      } else if (att.type === 'audio') {
        audio++;
        perParticipant[msg.sender].audio++;
      } else if (att.type === 'link') {
        links++;
        perParticipant[msg.sender].links++;
      }
    }
  }

  return { photos, videos, audio, links, perParticipant };
}