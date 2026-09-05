export type UserRole = 'admin' | 'member';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface User {
  username?: string;
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  registeredAt: string;
  phone?: string;
  notes?: string;
}

export interface Paragraph {
  html?: string;
  kind?: string;
  id: string;
  text: string;
  subtitle?: string;
  quote?: {
    text: string;
    source?: string;
  };
}


export interface Conversation {
  id: string;
  title: string;
  category: string;
  speaker: string;
  date: string;
  estimatedMinutes: number;
  description: string;
  paragraphs: Paragraph[];
  order: number;
}

export interface ShortVideo {
  id: string;
  order?: number;
  title: string;
  description: string;
  duration: string; // e.g. "02:15"
  videoUrl: string; // Native site video file path, e.g. "/videos/short1.mp4"
  thumbnailUrl?: string;
  sourceType?: 'upload' | 'youtube' | 'instagram';
  category?: string;
  assignedConversationIds: string[]; // multi-select of conversation IDs
  createdAt: string;
}

export type HighlightColor = 'amber' | 'emerald' | 'sky' | 'rose';

export interface Highlight {
  startOffset?: number;
  endOffset?: number;
  id: string;
  userId: string;
  conversationId: string;
  conversationTitle: string;
  paragraphId: string;
  selectedText: string;
  color: HighlightColor;
  note?: string;
  createdAt: string;
}

export interface LiveStream {
  isLive: boolean;
  title: string;
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  zoomMeetingId: string;
  zoomPasscode: string;
  zoomDirectUrl: string;
  streamEmbedUrl?: string;
  activeViewerCount: number;
}

export interface ReadingSettings {
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  fontFamily: 'serif' | 'sans';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  theme: 'paper' | 'light' | 'dark';
}
