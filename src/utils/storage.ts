import {
  LoveNote,
  ChatMessage,
  SnapPhoto,
  Milestone,
  DailyChecklistItem,
  MoodCheckin,
  DailyMoodRecord,
  MoodHistoryMap,
  SomedayItem,
  PartnerProfile,
  CoupleSettings,
  StreakData,
  InspirationTrack,
  InspirationBlockInfo,
  VibesPair,
  VibesDailyCache,
  SpotifyTrackItem,
  PartnerWeeklyVibes,
  ArchivedWeekVibes,
  LoveMapSpot,
  DatePlan,
  DateVoiceMemo,
} from '../types';
import { normalizeThemeKey, applyThemeToDOM } from './themes';

const STORAGE_KEYS = {
  PARTNERS: 'soulsync_partners',
  NOTES: 'soulsync_notes',
  MESSAGES: 'soulsync_messages',
  SNAPS: 'soulsync_snaps',
  MILESTONES: 'soulsync_milestones',
  CHECKLIST: 'soulsync_checklist',
  MOODS: 'soulsync_moods',
  MOOD_HISTORY: 'soulsync_mood_history',
  SOMEDAY: 'soulsync_someday',
  SETTINGS: 'soulsync_settings',
  STREAK: 'soulsync_streak',
  RECENT_DATE_IDEAS: 'soulsync_recent_date_ideas',
  DATE_VOICE_MEMOS: 'soulsync_date_voice_memos',
  INSPIRATION_CACHE: 'soulsync_inspiration_cache',
  VIBES_CACHE: 'soulsync_vibes_daily_cache',
  WEEKLY_VIBES: 'soulsync_partner_vibes',
  VIBES_HISTORY: 'soulsync_vibes_history',
  ACTIVE_PARTNER_ID: 'soulsync_active_partner_id',
  LOVE_MAP: 'soulsync_love_map',
  THEME: 'soulsync_theme',
  COUPLE_CODE: 'soulsync_coupleCode',
  QUOTE_SEQUENCE_INDEX: 'soulsync_quote_sequence_index',
};

export interface LocalUserIdentity {
  userId: string;
  slotId: 'p1' | 'p2';
  name: string;
  avatarEmoji: string;
  avatarColor: string;
}

const CURRENT_USER_KEY = 'soulsync_currentUser';

// Initial default seeds
export const DEFAULT_PARTNERS: PartnerProfile[] = [
  {
    id: 'p1',
    name: '',
    avatarEmoji: '🌸',
    avatarColor: '#f43f5e', // Rose
  },
  {
    id: 'p2',
    name: '',
    avatarEmoji: '☕',
    avatarColor: '#d97706', // Warm Amber
  },
];

export const DEFAULT_SETTINGS: CoupleSettings = {
  pin: '1234',
  stayLoggedIn: true,
  activeTheme: 'blush',
  customBackgroundId: null,
  customBackgroundGradient: null,
  anniversaryDate: new Date().toISOString().split('T')[0],
  hasOnboarded: false,
};

export const DEFAULT_NOTES: LoveNote[] = [];

export const DEFAULT_MESSAGES: ChatMessage[] = [];

export const DEFAULT_SNAPS: SnapPhoto[] = [];

export const DEFAULT_MILESTONES: Milestone[] = [];

export const DEFAULT_CHECKLIST: DailyChecklistItem[] = [];

export const DEFAULT_MOODS: MoodCheckin = {
  partner1Mood: '❓',
  partner1Label: 'Not Checked In',
  partner1Category: 'Neutral',
  partner2Mood: '❓',
  partner2Label: 'Not Checked In',
  partner2Category: 'Neutral',
  lastUpdated: new Date().toISOString(),
};

export function generateDefaultMoodHistory(): MoodHistoryMap {
  return {};
}

export const DEFAULT_SOMEDAY: SomedayItem[] = [];

export const DEFAULT_LOVE_MAP_SPOTS: LoveMapSpot[] = [];

export const DEFAULT_DATE_IDEAS: DatePlan[] = [];

export const DAILY_PHOTO_PROMPTS = [
  { title: "Snap your coffee or tea today ☕", icon: '☕' },
  { title: "A photo of what made you smile 😊", icon: '✨' },
  { title: "Your cozy shoes or socks right now 🧦", icon: '🛋️' },
  { title: "The sky above you right this second ☁️", icon: '🌤️' },
  { title: "Show off today's outfit or accessories 👟", icon: '🌸' },
  { title: "A quick sweet selfie making a silly face 😜", icon: '📸' },
  { title: "Something green or blooming near you 🌿", icon: '🍃' },
];

import {
  TAYLOR_SWIFT_QUOTES,
  CRISTIANO_RONALDO_QUOTES,
  QuoteTheme,
  QuoteItem,
} from '../data/quotes';

export const THEME_VISUALS: Record<QuoteTheme, { gradient: string; textColor: string; accentBadge: string; themeName: string }> = {
  love: {
    gradient: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 40%, #fb7185 100%)',
    textColor: '#831843',
    accentBadge: '🌸 Love & Connection',
    themeName: 'Lover Rose Quartz',
  },
  resilience: {
    gradient: 'linear-gradient(135deg, #fed7aa 0%, #fb923c 45%, #ea580c 100%)',
    textColor: '#7c2d12',
    accentBadge: '⚡ Resilience & Grit',
    themeName: 'Amber Fire & Courage',
  },
  ambition: {
    gradient: 'linear-gradient(135deg, #fef08a 0%, #facc15 45%, #ca8a04 100%)',
    textColor: '#713f12',
    accentBadge: '🏆 Relentless Ambition',
    themeName: 'Championship Gold',
  },
  gratitude: {
    gradient: 'linear-gradient(135deg, #dcfce7 0%, #86efac 45%, #22c55e 100%)',
    textColor: '#14532d',
    accentBadge: '🌱 Gratitude & Peace',
    themeName: 'Spring Meadow Green',
  },
  hope: {
    gradient: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 45%, #6366f1 100%)',
    textColor: '#312e81',
    accentBadge: '✨ Hope & Light',
    themeName: 'Starlight Lavender',
  },
  'self-belief': {
    gradient: 'linear-gradient(135deg, #f3e8ff 0%, #d8b4fe 45%, #a855f7 100%)',
    textColor: '#581c87',
    accentBadge: '💎 Unshakable Belief',
    themeName: 'Amethyst Radiance',
  },
  growth: {
    gradient: 'linear-gradient(135deg, #ccfbf1 0%, #5eead4 45%, #0d9488 100%)',
    textColor: '#134e4a',
    accentBadge: '🌿 Personal Growth',
    themeName: 'Eucalyptus Serenity',
  },
  friendship: {
    gradient: 'linear-gradient(135deg, #ffedd5 0%, #fed7aa 45%, #f97316 100%)',
    textColor: '#7c2d12',
    accentBadge: '🤝 True Loyalty',
    themeName: 'Warm Sunset Glow',
  },
  'hard work': {
    gradient: 'linear-gradient(135deg, #fee2e2 0%, #fca5a5 45%, #ef4444 100%)',
    textColor: '#7f1d1d',
    accentBadge: '🔥 Daily Work Ethic',
    themeName: 'Crimson Dedication',
  },
  joy: {
    gradient: 'linear-gradient(135deg, #fef9c3 0%, #fef08a 45%, #eab308 100%)',
    textColor: '#713f12',
    accentBadge: '☀️ Pure Joy',
    themeName: 'Sunlit Daylight',
  },
  heartbreak: {
    gradient: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 45%, #64748b 100%)',
    textColor: '#1e293b',
    accentBadge: '🌧️ Healing & Reflection',
    themeName: 'Soft Slate Dawn',
  },
  confidence: {
    gradient: 'linear-gradient(135deg, #fae8ff 0%, #f0abfc 45%, #c026d3 100%)',
    textColor: '#701a75',
    accentBadge: '👑 Bold Confidence',
    themeName: 'Royal Magenta Radiance',
  },
};

export function quoteToInspirationTrack(quote: QuoteItem): InspirationTrack {
  const visuals = THEME_VISUALS[quote.theme] || THEME_VISUALS.love;
  return {
    id: quote.person === 'Taylor Swift' ? 'taylor' : 'ronaldo',
    name: quote.person === 'Taylor Swift' ? 'Taylor Swift Quote' : 'Cristiano Ronaldo Quote',
    category: `${quote.theme.charAt(0).toUpperCase() + quote.theme.slice(1)} • ${quote.source}`,
    quote: quote.text,
    attribution: `${quote.person} (${quote.attribution})`,
    themeName: visuals.themeName,
    gradient: visuals.gradient,
    textColor: visuals.textColor,
    accentBadge: visuals.accentBadge,
    description: `Words from ${quote.person}'s documented ${quote.source} (${quote.attribution}).`,
  };
}

// Deterministically generate InspirationTrack objects from verified quotes
export const INSPIRATION_TRACKS: Record<'taylor' | 'ronaldo', InspirationTrack[]> = {
  taylor: TAYLOR_SWIFT_QUOTES.map(quoteToInspirationTrack),
  ronaldo: CRISTIANO_RONALDO_QUOTES.map(quoteToInspirationTrack),
};


// Storage utility wrapper
export const storage = {
  getPartners(): PartnerProfile[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTNERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(DEFAULT_PARTNERS));
      return DEFAULT_PARTNERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PARTNERS;
    }
  },

  savePartners(partners: PartnerProfile[]) {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(partners));
  },

  getActivePartnerId(): 'p1' | 'p2' {
    const val = localStorage.getItem(STORAGE_KEYS.ACTIVE_PARTNER_ID);
    if (val === 'p1' || val === 'p2') return val;
    return 'p1';
  },

  setActivePartnerId(id: 'p1' | 'p2') {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PARTNER_ID, id);
  },

  getSettings(): CoupleSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const dedicatedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (!raw) {
      const initial = {
        ...DEFAULT_SETTINGS,
        activeTheme: dedicatedTheme ? normalizeThemeKey(dedicatedTheme) : DEFAULT_SETTINGS.activeTheme,
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initial));
      applyThemeToDOM(initial.activeTheme);
      return initial;
    }
    try {
      const parsed = JSON.parse(raw);
      const activeTheme = normalizeThemeKey(dedicatedTheme || parsed.activeTheme || DEFAULT_SETTINGS.activeTheme);
      const settings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        activeTheme,
      };
      applyThemeToDOM(settings.activeTheme);
      return settings;
    } catch {
      applyThemeToDOM(DEFAULT_SETTINGS.activeTheme);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: CoupleSettings) {
    const activeTheme = normalizeThemeKey(settings.activeTheme);
    const updated = { ...settings, activeTheme };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEYS.THEME, activeTheme);
    applyThemeToDOM(activeTheme);
  },

  getNotes(): LoveNote[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTES;
    }
  },

  saveNotes(notes: LoveNote[]) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getMessages(): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
      return DEFAULT_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MESSAGES;
    }
  },

  saveMessages(messages: ChatMessage[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  },

  getSnaps(): SnapPhoto[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SNAPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SNAPS, JSON.stringify(DEFAULT_SNAPS));
      return DEFAULT_SNAPS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SNAPS;
    }
  },

  saveSnaps(snaps: SnapPhoto[]) {
    localStorage.setItem(STORAGE_KEYS.SNAPS, JSON.stringify(snaps));
  },

  getMilestones(): Milestone[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(DEFAULT_MILESTONES));
      return DEFAULT_MILESTONES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MILESTONES;
    }
  },

  saveMilestones(milestones: Milestone[]) {
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones));
  },

  getChecklist(): DailyChecklistItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(DEFAULT_CHECKLIST));
      return DEFAULT_CHECKLIST;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CHECKLIST;
    }
  },

  saveChecklist(list: DailyChecklistItem[]) {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(list));
  },

  getMoods(): MoodCheckin {
    const raw = localStorage.getItem(STORAGE_KEYS.MOODS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(DEFAULT_MOODS));
      return DEFAULT_MOODS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_MOODS;
    }
  },

  saveMoods(moods: MoodCheckin) {
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(moods));
  },

  getMoodHistory(): MoodHistoryMap {
    const raw = localStorage.getItem(STORAGE_KEYS.MOOD_HISTORY);
    if (!raw) {
      const initial = generateDefaultMoodHistory();
      localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return generateDefaultMoodHistory();
    }
  },

  saveMoodHistory(history: MoodHistoryMap) {
    localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(history));
  },

  recordPartnerDailyMood(
    partnerId: 'p1' | 'p2',
    emoji: string,
    label: string,
    category: string,
    dateStr?: string
  ): MoodHistoryMap {
    const today = dateStr || new Date().toISOString().split('T')[0];
    const history = this.getMoodHistory();
    const existing: DailyMoodRecord = history[today] || { date: today };
    if (partnerId === 'p1') {
      existing.p1Mood = emoji;
      existing.p1Label = label;
      existing.p1Category = category;
    } else {
      existing.p2Mood = emoji;
      existing.p2Label = label;
      existing.p2Category = category;
    }
    existing.updatedAt = new Date().toISOString();
    history[today] = existing;
    this.saveMoodHistory(history);
    return history;
  },

  getSomeday(): SomedayItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOMEDAY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(DEFAULT_SOMEDAY));
      return DEFAULT_SOMEDAY;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_SOMEDAY;
    }
  },

  saveSomeday(items: SomedayItem[]) {
    localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(items));
  },

  getStreak(): StreakData {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) {
      const init: StreakData = {
        count: 7,
        lastCompletedDate: new Date().toISOString().split('T')[0],
      };
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(init));
      return init;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return { count: 7, lastCompletedDate: new Date().toISOString().split('T')[0] };
    }
  },

  saveStreak(streak: StreakData) {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  },

  getRecentDateIdeaTitles(): string[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT_DATE_IDEAS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  pushRecentDateIdeaTitles(titles: string[]) {
    const existing = this.getRecentDateIdeaTitles();
    const merged = Array.from(new Set([...titles, ...existing])).slice(0, 12);
    localStorage.setItem(STORAGE_KEYS.RECENT_DATE_IDEAS, JSON.stringify(merged));
  },

  getDateVoiceMemos(): Record<string, DateVoiceMemo[]> {
    const raw = localStorage.getItem(STORAGE_KEYS.DATE_VOICE_MEMOS);
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  },

  saveDateVoiceMemos(memos: Record<string, DateVoiceMemo[]>) {
    localStorage.setItem(STORAGE_KEYS.DATE_VOICE_MEMOS, JSON.stringify(memos));
  },

  saveVoiceMemoForDate(dateKey: string, memo: DateVoiceMemo): Record<string, DateVoiceMemo[]> {
    const all = this.getDateVoiceMemos();
    const existing = all[dateKey] || [];
    all[dateKey] = [memo, ...existing];
    this.saveDateVoiceMemos(all);
    return all;
  },

  deleteVoiceMemoForDate(dateKey: string, memoId: string): Record<string, DateVoiceMemo[]> {
    const all = this.getDateVoiceMemos();
    if (all[dateKey]) {
      all[dateKey] = all[dateKey].filter(m => m.id !== memoId);
      this.saveDateVoiceMemos(all);
    }
    return all;
  },

  // Daily Inspiration 12-hour deterministic rotation (12:00 AM–12:00 PM and 12:00 PM–12:00 AM)
  getDailyInspirations(): InspirationBlockInfo {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const isAM = hour < 12;
    const blockKey = `${todayStr}-${isAM ? 'AM' : 'PM'}`;
    const blockLabel = isAM ? '12:00 AM – 12:00 PM' : '12:00 PM – 12:00 AM';

    const nextRotation = new Date(now);
    if (isAM) {
      nextRotation.setHours(12, 0, 0, 0);
    } else {
      nextRotation.setDate(nextRotation.getDate() + 1);
      nextRotation.setHours(0, 0, 0, 0);
    }

    const msRemaining = Math.max(0, nextRotation.getTime() - now.getTime());
    const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));

    const raw = localStorage.getItem(STORAGE_KEYS.INSPIRATION_CACHE);
    if (raw) {
      try {
        const cached = JSON.parse(raw);
        if (cached.blockKey === blockKey && cached.taylor && cached.ronaldo && cached.cachedAt) {
          return {
            ...cached,
            blockLabel,
            nextRotationTime: nextRotation.toISOString(),
            hoursRemaining,
          };
        }
      } catch {
        // ignore
      }
    }

    // Hash 12-hour blockKey string into an index
    let hash = 0;
    for (let i = 0; i < blockKey.length; i++) {
      hash = (hash << 5) - hash + blockKey.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);

    const taylorList = INSPIRATION_TRACKS.taylor;
    const ronaldoList = INSPIRATION_TRACKS.ronaldo;

    const taylor = taylorList[positiveHash % taylorList.length];
    const ronaldo = ronaldoList[(positiveHash + 1) % ronaldoList.length];

    const blockInfo: InspirationBlockInfo = {
      blockKey,
      blockLabel,
      cachedAt: Date.now(),
      nextRotationTime: nextRotation.toISOString(),
      hoursRemaining,
      taylor,
      ronaldo,
    };

    localStorage.setItem(STORAGE_KEYS.INSPIRATION_CACHE, JSON.stringify(blockInfo));
    return blockInfo;
  },

  // Daily Vibes 6-hour rotation logic (00:00-05:59, 06:00-11:59, 12:00-17:59, 18:00-23:59)
  getVibesDailyPairs(): { pairs: VibesPair[]; currentBlockIndex: number } {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const hour = now.getHours();
    const currentBlockIndex = Math.floor(hour / 6); // 0, 1, 2, or 3

    const raw = localStorage.getItem(STORAGE_KEYS.VIBES_CACHE);
    if (raw) {
      try {
        const cached: VibesDailyCache = JSON.parse(raw);
        if (cached && cached.dateStr === todayStr && Array.isArray(cached.pairs) && cached.pairs.length === 4) {
          return { pairs: cached.pairs, currentBlockIndex };
        }
      } catch {
        // regenerate
      }
    }

    // Deterministic pair generation for all 4 6-hour blocks of today
    // Using a persistent index to cycle through all quotes
    const taylorList = INSPIRATION_TRACKS.taylor;
    const ronaldoList = INSPIRATION_TRACKS.ronaldo;

    let seqIdx = parseInt(localStorage.getItem(STORAGE_KEYS.QUOTE_SEQUENCE_INDEX) || '0', 10);

    const pairs: VibesPair[] = [0, 1, 2, 3].map(blockIdx => {
      const taylor = taylorList[seqIdx % taylorList.length];
      const ronaldo = ronaldoList[seqIdx % ronaldoList.length];
      seqIdx++;
      return {
        pairIndex: blockIdx,
        taylor,
        ronaldo,
      };
    });
    localStorage.setItem(STORAGE_KEYS.QUOTE_SEQUENCE_INDEX, seqIdx.toString());

    const cacheData: VibesDailyCache = {
      dateStr: todayStr,
      cachedAt: Date.now(),
      pairs,
    };

    localStorage.setItem(STORAGE_KEYS.VIBES_CACHE, JSON.stringify(cacheData));
    return { pairs, currentBlockIndex };
  },


  getMondayDateKey(d: Date = new Date()): string {
    const date = new Date(d);
    const day = date.getDay(); // 0 is Sun, 1 is Mon...
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    return monday.toISOString().split('T')[0];
  },

  formatWeekLabel(mondayStr: string): string {
    const date = new Date(mondayStr);
    return `Week of ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  },

  getWeeklyVibes(): PartnerWeeklyVibes {
    const currentMonday = this.getMondayDateKey();
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKLY_VIBES);

    const defaultInitial: PartnerWeeklyVibes = {
      weekKey: currentMonday,
      p1Tracks: [],
      p2Tracks: [],
    };

    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_VIBES, JSON.stringify(defaultInitial));
      return defaultInitial;
    }

    try {
      const stored: PartnerWeeklyVibes = JSON.parse(raw);
      if (stored && stored.weekKey === currentMonday) {
        return stored;
      }

      // Auto-reset every Monday & archive previous week
      if (stored && stored.weekKey && stored.weekKey !== currentMonday) {
        const history = this.getArchivedVibes();
        const archivedItem: ArchivedWeekVibes = {
          weekKey: stored.weekKey,
          weekLabel: this.formatWeekLabel(stored.weekKey),
          p1Tracks: stored.p1Tracks || [],
          p2Tracks: stored.p2Tracks || [],
        };
        const updatedHistory = [archivedItem, ...history.filter(h => h.weekKey !== stored.weekKey)];
        this.saveArchivedVibes(updatedHistory);

        const newWeek: PartnerWeeklyVibes = {
          weekKey: currentMonday,
          p1Tracks: [],
          p2Tracks: [],
        };
        localStorage.setItem(STORAGE_KEYS.WEEKLY_VIBES, JSON.stringify(newWeek));
        return newWeek;
      }

      return stored || defaultInitial;
    } catch {
      return defaultInitial;
    }
  },

  saveWeeklyVibes(vibes: PartnerWeeklyVibes): void {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_VIBES, JSON.stringify(vibes));
  },

  getArchivedVibes(): ArchivedWeekVibes[] {
    const raw = localStorage.getItem(STORAGE_KEYS.VIBES_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) || [];
    } catch {
      return [];
    }
  },

  saveArchivedVibes(history: ArchivedWeekVibes[]): void {
    localStorage.setItem(STORAGE_KEYS.VIBES_HISTORY, JSON.stringify(history));
  },

  getLoveMapSpots(): LoveMapSpot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LOVE_MAP);
    if (!raw) return DEFAULT_LOVE_MAP_SPOTS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : DEFAULT_LOVE_MAP_SPOTS;
    } catch {
      return DEFAULT_LOVE_MAP_SPOTS;
    }
  },

  saveLoveMapSpots(spots: LoveMapSpot[]) {
    localStorage.setItem(STORAGE_KEYS.LOVE_MAP, JSON.stringify(spots));
  },

  // Backup all memories as a JSON string
  exportBackupJSON(): string {
    const data = {
      version: 1,
      appName: 'SoulSync',
      exportedAt: new Date().toISOString(),
      partners: this.getPartners(),
      settings: this.getSettings(),
      notes: this.getNotes(),
      messages: this.getMessages(),
      snaps: this.getSnaps(),
      milestones: this.getMilestones(),
      checklist: this.getChecklist(),
      moods: this.getMoods(),
      someday: this.getSomeday(),
      streak: this.getStreak(),
      loveMapSpots: this.getLoveMapSpots(),
      dateVoiceMemos: this.getDateVoiceMemos(),
      weeklyVibes: this.getWeeklyVibes(),
      archivedVibes: this.getArchivedVibes(),
    };
    return JSON.stringify(data, null, 2);
  },

  // Import and restore memories
  importBackupJSON(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      if (Array.isArray(data.partners)) this.savePartners(data.partners);
      if (data.settings) this.saveSettings(data.settings);
      if (Array.isArray(data.notes)) this.saveNotes(data.notes);
      if (Array.isArray(data.messages)) this.saveMessages(data.messages);
      if (Array.isArray(data.snaps)) this.saveSnaps(data.snaps);
      if (Array.isArray(data.milestones)) this.saveMilestones(data.milestones);
      if (Array.isArray(data.checklist)) this.saveChecklist(data.checklist);
      if (data.moods) this.saveMoods(data.moods);
      if (Array.isArray(data.someday)) this.saveSomeday(data.someday);
      if (data.streak) this.saveStreak(data.streak);
      if (Array.isArray(data.loveMapSpots)) this.saveLoveMapSpots(data.loveMapSpots);
      if (data.dateVoiceMemos && typeof data.dateVoiceMemos === 'object') this.saveDateVoiceMemos(data.dateVoiceMemos);
      if (data.weeklyVibes) this.saveWeeklyVibes(data.weeklyVibes);
      if (Array.isArray(data.archivedVibes)) this.saveArchivedVibes(data.archivedVibes);

      return { success: true, message: 'Memories restored successfully! 💖' };
    } catch {
      return { success: false, message: 'Could not parse JSON backup file.' };
    }
  },

  getCurrentUser(): LocalUserIdentity | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  saveCurrentUser(user: LocalUserIdentity): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCoupleCode(): string | null {
    return localStorage.getItem(STORAGE_KEYS.COUPLE_CODE);
  },

  saveCoupleCode(code: string): void {
    localStorage.setItem(STORAGE_KEYS.COUPLE_CODE, code);
  },

  // Reset to default sample memories
  resetToSampleData() {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(DEFAULT_PARTNERS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(DEFAULT_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.SNAPS, JSON.stringify(DEFAULT_SNAPS));
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(DEFAULT_MILESTONES));
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(DEFAULT_CHECKLIST));
    localStorage.setItem(STORAGE_KEYS.MOODS, JSON.stringify(DEFAULT_MOODS));
    localStorage.setItem(STORAGE_KEYS.MOOD_HISTORY, JSON.stringify(generateDefaultMoodHistory()));
    localStorage.setItem(STORAGE_KEYS.SOMEDAY, JSON.stringify(DEFAULT_SOMEDAY));
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify({ count: 7, lastCompletedDate: new Date().toISOString().split('T')[0] }));
    localStorage.setItem(STORAGE_KEYS.LOVE_MAP, JSON.stringify(DEFAULT_LOVE_MAP_SPOTS));
    localStorage.setItem(STORAGE_KEYS.THEME, 'blush');
    applyThemeToDOM('blush');
  },
};
