export type NoteColor = 'yellow' | 'pink' | 'mint' | 'lavender';

export interface LoveNote {
  id: string;
  text: string;
  color: NoteColor;
  pinned: boolean;
  senderId: string;
  senderName: string;
  timestamp: string;
  createdAt?: string;
  reactions?: Record<string, string | number>;
}

export interface ChatMediaAttachment {
  type: 'image' | 'gif' | 'video';
  url: string;
  fileName?: string;
  fileSize?: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type?: 'text' | 'image' | 'gif' | 'video' | 'sticker';
  timestamp: string;
  createdAt?: string;
  sticker?: string;
  media?: ChatMediaAttachment;
  reactions?: Record<string, string | string[]>;
}

export type SnapFilter = 'normal' | 'vintage' | 'warm' | 'bw' | 'pastel';
export type SnapSticker = 'none' | 'heart' | 'tape' | 'sparkle' | 'cupid' | 'person';

export interface SnapPhoto {
  id: string;
  imageUrl?: string;
  imageData?: string;
  caption: string;
  timestamp: string;
  createdAt?: string;
  senderId: string;
  senderName: string;
  rotation: number;
  pinX?: number;
  pinY?: number;
  filter: SnapFilter;
  sticker?: SnapSticker;
  stickers?: string;
  loves?: number;
  reactions?: Record<string, string | number>;
  isNew?: boolean;
  pinned?: boolean;
}

export type MilestoneCategory = 'Anniversary' | 'Date Night' | 'Trip' | 'Reminder' | 'Birthday';

export interface Milestone {
  id: string;
  title: string;
  date: string; // ISO string or YYYY-MM-DDTHH:mm
  category: MilestoneCategory;
  reminderEnabled: boolean;
  creator?: string;
  createdAt?: string;
}


export type DateEmotionalImpact =
  | 'magical'
  | 'deep-connection'
  | 'joyful-fun'
  | 'peaceful-cozy'
  | 'spontaneous'
  | 'comforting';

export interface LoveMapSpot {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  x: number; // grid column (0-5)
  y: number; // grid row (0-3)
  category?: 'dinner' | 'cafe' | 'view' | 'nature' | 'adventure' | 'special' | 'dessert' | 'movies' | string;
  icon?: string;
  note?: string;
  pinnedBy: string;
  isNew?: boolean;
  rating?: number; // 1 to 5 Hearts / Stars
  emotionalImpact?: DateEmotionalImpact;
  highlightMoment?: string; // Best memory or highlight from the date
}

export interface DailyChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  p1Completed?: boolean;
  p2Completed?: boolean;
}


export interface MoodCheckin {
  partner1Mood: string;
  partner1Label: string;
  partner1Category?: string;
  partner2Mood: string;
  partner2Label: string;
  partner2Category?: string;
  lastUpdated: string;
}

export interface DailyMoodRecord {
  date: string; // YYYY-MM-DD
  p1Mood?: string;
  p1Label?: string;
  p1Category?: string;
  p2Mood?: string;
  p2Label?: string;
  p2Category?: string;
  updatedAt?: string;
}

export type MoodHistoryMap = Record<string, DailyMoodRecord>;

export interface SomedayItem {
  id: string;
  text: string;
  completed: boolean;
  addedBy: string;
  completedDate?: string;
}

export interface PartnerProfile {
  id: 'p1' | 'p2';
  name: string;
  avatarEmoji: string;
  avatarColor: string; // Tailwind hex or class
}

export type AppThemePreset =
  | 'blush'
  | 'mint-whisper'
  | 'lavender-dream'
  | 'golden-hour'
  | 'sky-cotton'
  | 'cocoa-cream'
  | 'berry-soft'
  | 'sage-garden'
  | 'mint'
  | 'lavender';

export interface CoupleSettings {
  pin: string;
  stayLoggedIn: boolean;
  activeTheme: AppThemePreset;
  customBackgroundId: string | null; // e.g. inspiration background ID or null
  customBackgroundGradient?: string | null;
  anniversaryDate: string;
  hasOnboarded: boolean;
}

export interface StreakData {
  count: number;
  lastCompletedDate: string; // YYYY-MM-DD
}

export interface DateVoiceMemo {
  id: string;
  audioDataUrl: string;
  durationSeconds: number;
  recordedAt: string;
  recordedBy: string;
  partnerId: 'p1' | 'p2';
  caption?: string;
}

export interface DatePlan {
  id?: string;
  title: string;
  vibe: string;
  steps: string[];
  budgetEstimate: string;
  prepTip: string;
  voiceMemos?: DateVoiceMemo[];
}

export interface InspirationTrack {
  id: 'taylor' | 'ronaldo';
  name: string;
  category: string;
  quote: string;
  attribution: string;
  themeName: string;
  gradient: string;
  textColor: string;
  accentBadge: string;
  description: string;
}

export interface InspirationBlockInfo {
  blockKey: string;
  blockLabel: string;
  cachedAt: number;
  nextRotationTime: string;
  hoursRemaining: number;
  taylor: InspirationTrack;
  ronaldo: InspirationTrack;
}

export interface VibesPair {
  pairIndex: number; // 0, 1, 2, 3
  taylor: InspirationTrack;
  ronaldo: InspirationTrack;
}

export interface VibesDailyCache {
  dateStr: string;
  cachedAt: number;
  pairs: VibesPair[];
}

export interface SpotifyTrackItem {
  id: string; // Spotify track ID
  title: string;
  artist: string;
  albumArt: string;
  spotifyUrl?: string;
  addedBy: 'p1' | 'p2';
  addedByName: string;
  addedAt: string;
  hearts?: Record<string, boolean>; // e.g. { 'p1': true, 'p2': true }
}

export interface PartnerWeeklyVibes {
  weekKey: string; // YYYY-MM-DD for Monday of current week
  p1Tracks: SpotifyTrackItem[];
  p2Tracks: SpotifyTrackItem[];
}

export interface ArchivedWeekVibes {
  weekKey: string;
  weekLabel: string;
  p1Tracks: SpotifyTrackItem[];
  p2Tracks: SpotifyTrackItem[];
}

export type QuoteTheme =
  | 'love'
  | 'resilience'
  | 'ambition'
  | 'gratitude'
  | 'hope'
  | 'self-belief'
  | 'growth'
  | 'friendship'
  | 'hard work'
  | 'joy'
  | 'heartbreak'
  | 'confidence';

export type QuoteSource = 'interview' | 'speech' | 'social post';

export interface QuoteItem {
  id: string;
  text: string;
  person: 'Taylor Swift' | 'Cristiano Ronaldo';
  theme: QuoteTheme;
  source: QuoteSource;
  attribution: string;
}


