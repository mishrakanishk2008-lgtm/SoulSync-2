import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarHeart,
  Plus,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Heart,
  Trash2,
  Bell,
  BellOff,
  Compass,
  Smile,
  X,
  Calendar,
  MapPin,
  Map,
  Navigation,
  Edit,
  Star,
  Search,
} from 'lucide-react';
import {
  Milestone,
  MilestoneCategory,
  DailyChecklistItem,
  MoodCheckin,
  DailyMoodRecord,
  MoodHistoryMap,
  SomedayItem,
  StreakData,
  PartnerProfile,
  InspirationBlockInfo,
  LoveMapSpot,
  DateEmotionalImpact,
} from '../types';
import { sound } from '../utils/audio';
import { MOOD_CATEGORIES, findMoodInfo } from '../utils/moods';
import { MoodTrendChart } from '../components/MoodTrendChart';
import { DateQualityTrendsCard } from '../components/DateQualityTrendsCard';
import {
  EMOTIONAL_IMPACTS,
  getEmotionalImpactInfo,
  RATING_DESCRIPTIONS,
} from '../utils/dateQuality';
import { storage } from '../utils/storage';

interface TogetherTabProps {
  milestones: Milestone[];
  checklist: DailyChecklistItem[];
  moods: MoodCheckin;
  moodHistory?: MoodHistoryMap;
  someday: SomedayItem[];
  streak: StreakData;
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  inspirationBlock?: InspirationBlockInfo;
  onAddMilestone: (m: Omit<Milestone, 'id'>) => void;
  onDeleteMilestone: (id: string) => void;
  onToggleMilestoneReminder: (id: string) => void;
  onToggleChecklist: (id: string) => void;
  onAddChecklist: (text: string) => void;
  onDeleteChecklist?: (id: string) => void;
  onUpdateMood: (partner: 'p1' | 'p2', emoji: string, label: string, category?: string) => void;
  onToggleSomeday: (id: string) => void;
  onAddSomeday: (text: string) => void;
  onDeleteSomeday: (id: string) => void;
  onOpenInspiration: () => void;
  onSetBackground?: (gradient: string, id: string) => void;
  onShowToast: (msg: string) => void;
}

const CATEGORY_COLORS: Record<MilestoneCategory, { badge: string; icon: string }> = {
  Anniversary: { badge: 'bg-rose-100 text-rose-700 border-rose-200', icon: '🥂' },
  'Date Night': { badge: 'bg-pink-100 text-pink-700 border-pink-200', icon: '🕯️' },
  Trip: { badge: 'bg-amber-100 text-amber-700 border-amber-200', icon: '✈️' },
  Birthday: { badge: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🎂' },
  Reminder: { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '⏰' },
};

const MOOD_OPTIONS = [
  { emoji: '🥰', label: 'In love & grateful' },
  { emoji: '😊', label: 'Happy & glowing' },
  { emoji: '☕', label: 'Cozy & relaxed' },
  { emoji: '😴', label: 'Sleepy & tired' },
  { emoji: '🥺', label: 'Missing you lots' },
  { emoji: '🥳', label: 'Excited & hyped' },
  { emoji: '🌧️', label: 'Need a warm hug' },
];

const GRID_COLS = 6;
const GRID_ROWS = 4;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ROW_LABELS = ['1', '2', '3', '4'];

const SECTOR_NAMES: string[][] = [
  ['Sunset Pier', 'Harbor Boardwalk', 'Rose Garden', 'Whispering Pines', 'Sunset Hill', 'Moonlight Point'],
  ['Old Town Square', 'Bistro Alley', 'Riverwalk', 'Artisan Bakery', 'Lantern Walk', 'Velvet Cinema'],
  ['Vintage Arcade', 'Botanical Glasshouse', 'Gelato Corner', 'Books & Brews', 'Cherry Blossom Lane', 'Jazz Cellar'],
  ['Canal Bridge', 'Candlelit Terrace', 'Sweet Creperie', 'Hidden Lagoon', 'Rooftop Garden', 'Lovers Bridge'],
];

const SPOT_CATEGORIES: { id: string; label: string; icon: string; bg: string }[] = [
  { id: 'dinner', label: 'Dinner', icon: '🍷', bg: 'bg-rose-100 text-rose-700' },
  { id: 'cafe', label: 'Cafe & Sweets', icon: '☕', bg: 'bg-amber-100 text-amber-700' },
  { id: 'view', label: 'Scenic View', icon: '🌅', bg: 'bg-orange-100 text-orange-700' },
  { id: 'dessert', label: 'Dessert', icon: '🍦', bg: 'bg-pink-100 text-pink-700' },
  { id: 'movies', label: 'Movie & Arts', icon: '🎬', bg: 'bg-purple-100 text-purple-700' },
  { id: 'nature', label: 'Nature & Park', icon: '🌲', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'special', label: 'Special Date', icon: '✨', bg: 'bg-indigo-100 text-indigo-700' },
];

export function TogetherTab({
  milestones,
  checklist,
  moods,
  moodHistory,
  someday,
  streak,
  partners,
  activePartnerId,
  inspirationBlock,
  onAddMilestone,
  onDeleteMilestone,
  onToggleMilestoneReminder,
  onToggleChecklist,
  onAddChecklist,
  onDeleteChecklist,
  onUpdateMood,
  onToggleSomeday,
  onAddSomeday,
  onDeleteSomeday,
  onOpenInspiration,
  onSetBackground,
  onShowToast,
}: TogetherTabProps) {
  const activePartner = partners.find(p => p.id === activePartnerId) || partners[0];
  const p1 = partners[0] || { name: 'Partner 1', avatarEmoji: '🌸' };
  const p2 = partners[1] || { name: 'Partner 2', avatarEmoji: '☕' };

  // Current time ticker for real-time countdown updates
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check 24-hour reminder toasts on mount / update
  useEffect(() => {
    milestones.forEach(m => {
      if (m.reminderEnabled) {
        const diffMs = new Date(m.date).getTime() - Date.now();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 24) {
          // Alert user softly
          const alertedKey = `alerted_${m.id}_24h`;
          if (!sessionStorage.getItem(alertedKey)) {
            sessionStorage.setItem(alertedKey, 'true');
            onShowToast(`Reminder: "${m.title}" is in less than 24 hours! 🎉`);
          }
        }
      }
    });
  }, [milestones, onShowToast]);

  // Milestone Form state
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mCategory, setMCategory] = useState<MilestoneCategory>('Date Night');
  const [mReminder, setMReminder] = useState(true);

  // Mood inventory & category tab state
  const [selectedMoodCategory, setSelectedMoodCategory] = useState<string>('happy');
  const [isPickerExpanded, setIsPickerExpanded] = useState<boolean>(true);
  const [showAllMoods, setShowAllMoods] = useState<boolean>(false);
  const [inspectingPartner, setInspectingPartner] = useState<'p1' | 'p2' | null>(null);
  const [moodSearchQuery, setMoodSearchQuery] = useState<string>('');

  const activeCategoryGroup = useMemo(() => {
    return MOOD_CATEGORIES.find(c => c.id === selectedMoodCategory) || MOOD_CATEGORIES[0];
  }, [selectedMoodCategory]);

  const QUICK_COUPLE_MOODS = useMemo(() => [
    { emoji: '🥰', label: 'In Love & Cherished', category: 'Love/Affection' },
    { emoji: '😊', label: 'Happy & Glowing', category: 'Happy/Positive' },
    { emoji: '☕', label: 'Cozy & Resting', category: 'Calm/Content' },
    { emoji: '🥺', label: 'Need a Warm Hug', category: 'Sad/Down' },
    { emoji: '🥱', label: 'Slow & Unwinding', category: 'Calm/Content' },
    { emoji: '🔥', label: 'Fired Up & Passionate', category: 'Excited/Energetic' },
  ], []);

  const filteredMoodList = useMemo(() => {
    if (!moodSearchQuery.trim()) return null;
    const q = moodSearchQuery.toLowerCase().trim();
    const matches: { emoji: string; label: string; categoryName: string }[] = [];
    MOOD_CATEGORIES.forEach(cat => {
      cat.moods.forEach(m => {
        if (m.label.toLowerCase().includes(q) || m.emoji.includes(q) || cat.name.toLowerCase().includes(q)) {
          matches.push({ emoji: m.emoji, label: m.label, categoryName: cat.name });
        }
      });
    });
    return matches;
  }, [moodSearchQuery]);

  const last7Days = useMemo(() => {
    const days = [];
    const today = new Date();
    const history = moodHistory || {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' });
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString(undefined, { month: 'short' });
      const record = history[dateKey];

      const p1Info = record?.p1Mood
        ? {
            mood: record.p1Mood,
            label: record.p1Label || 'Feeling good',
            category: record.p1Category || 'Love/Affection',
          }
        : i === 0
        ? {
            mood: moods.partner1Mood || '🥰',
            label: moods.partner1Label || 'In Love & Cherished',
            category: moods.partner1Category || 'Love/Affection',
          }
        : null;

      const p2Info = record?.p2Mood
        ? {
            mood: record.p2Mood,
            label: record.p2Label || 'Feeling good',
            category: record.p2Category || 'Happy/Positive',
          }
        : i === 0
        ? {
            mood: moods.partner2Mood || '😊',
            label: moods.partner2Label || 'Happy & Glowing',
            category: moods.partner2Category || 'Happy/Positive',
          }
        : null;

      days.push({
        dateKey,
        dayLabel,
        dayNum,
        monthShort,
        isToday: i === 0,
        p1: p1Info,
        p2: p2Info,
      });
    }
    return days;
  }, [moodHistory, moods]);

  const getCategoryBadge = (categoryName?: string) => {
    const match = MOOD_CATEGORIES.find(
      c => c.name.toLowerCase() === (categoryName || '').toLowerCase()
    );
    return match
      ? { badge: match.badgeClass, name: match.name, icon: match.icon }
      : { badge: 'bg-stone-100 text-stone-700 border-stone-200', name: categoryName || 'General', icon: '✨' };
  };

  // New Checklist / Someday item states
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newSomedayText, setNewSomedayText] = useState('');

  // Flame level based on streak count
  const flameLevel = useMemo(() => {
    if (streak.count >= 30) return { icon: '🔥🔥🔥', text: 'Unstoppable Flame', color: 'text-amber-600' };
    if (streak.count >= 14) return { icon: '🔥🔥', text: 'Blazing Love', color: 'text-rose-600' };
    if (streak.count >= 7) return { icon: '🔥', text: 'Steady Spark', color: 'text-orange-500' };
    return { icon: '✨', text: 'Kindling', color: 'text-amber-500' };
  }, [streak.count]);

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle.trim() || !mDate) return;

    sound.playHeartReaction();
    onAddMilestone({
      title: mTitle.trim(),
      date: new Date(mDate).toISOString(),
      category: mCategory,
      reminderEnabled: mReminder,
    });

    setMTitle('');
    setMDate('');
    setShowAddMilestoneModal(false);
    onShowToast('New milestone countdown created! ⏳');
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    sound.playSoftChime();
    onAddChecklist(newChecklistText.trim());
    setNewChecklistText('');
  };

  const handleAddSomedayItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSomedayText.trim()) return;
    sound.playSoftChime();
    onAddSomeday(newSomedayText.trim());
    setNewSomedayText('');
  };

  // Helper for countdown calculations
  const calculateTimeLeft = (targetDate: string) => {
    const diff = new Date(targetDate).getTime() - now;
    if (diff <= 0) {
      return { isPast: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { isPast: false, days, hours, minutes, seconds };
  };

  return (
    <div className="space-y-6 pb-24">
      {/* DAILY MOOD CHECK-IN: EXPANDED INVENTORY & SIDE-BY-SIDE */}
      <section className="rounded-3xl border border-rose-200/70 bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-amber-50/60 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-rose-100/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-2xs">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-stone-800">
                Daily Mood Check-In
              </h2>
              <p className="text-[11px] text-stone-500">
                Emotional heartbeat & mutual check-ins across 10 feelings
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPickerExpanded(prev => !prev)}
            className="flex items-center space-x-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-rose-700 shadow-2xs border border-rose-100 hover:bg-white transition-all cursor-pointer"
          >
            <Sparkles className="h-3 w-3" />
            <span>{isPickerExpanded ? 'Hide Picker' : 'Change Mood'}</span>
          </button>
        </div>

        {/* Side-by-Side Mood Display for Both Partners */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
          {/* Partner 1 Card */}
          {(() => {
            const currentUser = storage.getCurrentUser();
            const isMe = currentUser
              ? currentUser.slotId === 'p1' || currentUser.userId === 'p1'
              : activePartnerId === 'p1';
            const badge = getCategoryBadge(moods.partner1Category);
            const isInspecting = inspectingPartner === 'p1';

            return (
              <div
                onClick={() => {
                  if (isMe) {
                    setIsPickerExpanded(true);
                  } else {
                    setInspectingPartner(isInspecting ? null : 'p1');
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-center transition-all cursor-pointer ${
                  isMe
                    ? 'border-rose-400 bg-white/95 shadow-sm ring-2 ring-rose-200/80 hover:border-rose-500'
                    : 'border-rose-100 bg-white/80 hover:bg-white hover:border-rose-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{p1.avatarEmoji}</span>
                    <span className="text-xs font-bold text-stone-800">{p1.name}</span>
                  </div>
                  {isMe ? (
                    <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                      You
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-400">Partner</span>
                  )}
                </div>

                <div className="my-2 flex flex-col items-center">
                  <div className="text-4xl sm:text-5xl filter drop-shadow-xs transition-transform group-hover:scale-110">
                    {moods.partner1Mood || '🥰'}
                  </div>
                  <p className="mt-1.5 font-bold text-xs sm:text-sm text-stone-800 line-clamp-1 leading-tight">
                    {moods.partner1Label || 'In Love & Cherished'}
                  </p>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.badge}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{moods.partner1Category || 'Love/Affection'}</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-2 text-[10px] text-stone-400 truncate">
                  {isMe ? '✨ Tap to switch your mood' : '❤️ Shared with you'}
                </div>
              </div>
            );
          })()}

          {/* Partner 2 Card */}
          {(() => {
            const currentUser = storage.getCurrentUser();
            const isMe = currentUser
              ? currentUser.slotId === 'p2' || currentUser.userId === 'p2'
              : activePartnerId === 'p2';
            const badge = getCategoryBadge(moods.partner2Category);
            const isInspecting = inspectingPartner === 'p2';


            return (
              <div
                onClick={() => {
                  if (isMe) {
                    setIsPickerExpanded(true);
                  } else {
                    setInspectingPartner(isInspecting ? null : 'p2');
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 text-center transition-all cursor-pointer ${
                  isMe
                    ? 'border-amber-300 bg-white/95 shadow-sm ring-2 ring-amber-200/80 hover:border-amber-400'
                    : 'border-amber-100 bg-white/80 hover:bg-white hover:border-amber-200 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base">{p2.avatarEmoji}</span>
                    <span className="text-xs font-bold text-stone-800">{p2.name}</span>
                  </div>
                  {isMe ? (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                      You
                    </span>
                  ) : (
                    <span className="text-[9px] text-stone-400">Partner</span>
                  )}
                </div>

                <div className="my-2 flex flex-col items-center">
                  <div className="text-4xl sm:text-5xl filter drop-shadow-xs transition-transform group-hover:scale-110">
                    {moods.partner2Mood || '☕'}
                  </div>
                  <p className="mt-1.5 font-bold text-xs sm:text-sm text-stone-800 line-clamp-1 leading-tight">
                    {moods.partner2Label || 'Happy & Glowing'}
                  </p>
                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badge.badge}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{moods.partner2Category || 'Happy/Positive'}</span>
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-2 text-[10px] text-stone-400 truncate">
                  {isMe ? '✨ Tap to switch your mood' : '❤️ Shared with you'}
                </div>
              </div>
            );
          })()}
        </div>

        {/* REFINED MOBILE-FIRST MOOD INVENTORY PICKER */}
        {/* REFINED MOBILE-FIRST MOOD INVENTORY PICKER (FULL SCREEN / BOTTOM-SHEET MODAL) */}
        {isPickerExpanded && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 p-0 sm:p-4 backdrop-blur-sm animate-fade-in"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsPickerExpanded(false);
            }}
          >
            <div className="flex max-h-[88dvh] sm:max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-rose-100 bg-white shadow-2xl overflow-hidden animate-slide-up">
              {/* Header: Partner Name + View Mode Toggle + Close Button */}
              <div className="flex items-center justify-between gap-2 border-b border-rose-100/80 px-4 py-3 sm:px-5 bg-gradient-to-r from-rose-50/60 to-pink-50/40">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 shadow-2xs text-lg">
                    {activePartner.avatarEmoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                      How is <span className="text-rose-600 font-extrabold">{activePartner.name}</span> feeling?
                    </h3>
                    <p className="text-[10px] text-stone-400 truncate">
                      Tap any emoji to check in & sync in real-time 💕
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSoftChime();
                      setShowAllMoods(prev => !prev);
                      setMoodSearchQuery('');
                    }}
                    className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border ${
                      showAllMoods
                        ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200/80 hover:bg-stone-50'
                    }`}
                  >
                    {showAllMoods ? '📂 By Category' : '✨ All 50+'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPickerExpanded(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Picker Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-3.5 py-3 sm:px-5 space-y-3">
                {/* Quick 1-Tap Couple Shortcuts */}
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-600 mb-1.5">
                    <span className="flex items-center gap-1">
                      <span>Quick Check-Ins</span>
                      <span>⚡</span>
                    </span>
                    <span className="text-[9px] text-stone-400 font-normal">Most loved daily</span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 -mx-1 px-1">
                    {QUICK_COUPLE_MOODS.map(qm => {
                      const currentMoodEmoji =
                        activePartnerId === 'p1' ? moods.partner1Mood : moods.partner2Mood;
                      const isSelected = currentMoodEmoji === qm.emoji;

                      return (
                        <button
                          key={qm.emoji}
                          type="button"
                          onClick={() => {
                            sound.playHeartReaction();
                            onUpdateMood(activePartnerId, qm.emoji, qm.label, qm.category);
                            onShowToast(`Mood updated to ${qm.emoji} ${qm.label.split('&')[0].trim()}! 💕`);
                            setIsPickerExpanded(false);
                          }}
                          className={`group flex items-center space-x-1.5 shrink-0 rounded-2xl border px-2.5 py-1.5 text-xs transition-all cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'border-rose-400 bg-rose-100 text-rose-900 font-bold ring-2 ring-rose-300 shadow-2xs'
                              : 'border-stone-200/80 bg-rose-50/50 hover:bg-white text-stone-700 hover:border-rose-200'
                          }`}
                          title={qm.label}
                        >
                          <span className="text-lg transition-transform group-hover:scale-125">{qm.emoji}</span>
                          <span className="text-[10px] font-semibold whitespace-nowrap">{qm.label.split('&')[0].trim()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={moodSearchQuery}
                    onChange={e => setMoodSearchQuery(e.target.value)}
                    placeholder="Search 50+ feelings (e.g. hug, tired, cuddly, happy)..."
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/80 pl-8 pr-7 py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:bg-white focus:outline-none"
                  />
                  {moodSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setMoodSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* SEARCH RESULTS VIEW */}
                {filteredMoodList ? (
                  <div>
                    {filteredMoodList.length === 0 ? (
                      <div className="py-8 text-center text-xs text-stone-400">
                        <p className="font-semibold">No moods matching "{moodSearchQuery}"</p>
                        <p className="text-[10px] text-stone-400 mt-1">Try searching another feeling, like happy, tired, or cuddle.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                        {filteredMoodList.map(m => {
                          const currentMoodEmoji =
                            activePartnerId === 'p1' ? moods.partner1Mood : moods.partner2Mood;
                          const isSelected = currentMoodEmoji === m.emoji;

                          return (
                            <button
                              key={`${m.categoryName}-${m.emoji}`}
                              type="button"
                              onClick={() => {
                                sound.playHeartReaction();
                                onUpdateMood(activePartnerId, m.emoji, m.label, m.categoryName);
                                onShowToast(`Mood updated to ${m.emoji} ${m.label}! 💕`);
                                setIsPickerExpanded(false);
                              }}
                              className={`group relative flex flex-col items-center justify-center rounded-2xl border p-1.5 text-center transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-rose-400 bg-rose-50/95 ring-2 ring-rose-300 shadow-xs scale-102'
                                  : 'border-stone-200/80 bg-stone-50/60 hover:border-amber-300 hover:bg-white shadow-2xs hover:scale-102'
                              }`}
                            >
                              <span className="text-2xl transition-transform group-hover:scale-120 drop-shadow-2xs">
                                {m.emoji}
                              </span>
                              <p className="mt-1 font-semibold text-[10px] text-stone-800 leading-tight line-clamp-1 w-full text-center">
                                {m.label}
                              </p>
                              {isSelected && (
                                <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : !showAllMoods ? (
                  <>
                    {/* Horizontal Swipeable Category Navigation Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-1 px-1 snap-x">
                      {MOOD_CATEGORIES.map(cat => {
                        const isActive = selectedMoodCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              sound.playSoftChime();
                              setSelectedMoodCategory(cat.id);
                            }}
                            className={`flex shrink-0 items-center space-x-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer snap-start ${
                              isActive
                                ? cat.pillActiveClass
                                : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/70 hover:text-stone-900'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.name.split('/')[0]}</span>
                            <span className="text-[9px] opacity-75">({cat.moods.length})</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Responsive Emoji Tiles Grid for Active Category */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 pt-1">
                      {activeCategoryGroup.moods.map(m => {
                        const currentMoodEmoji =
                          activePartnerId === 'p1' ? moods.partner1Mood : moods.partner2Mood;
                        const isSelected = currentMoodEmoji === m.emoji;

                        return (
                          <button
                            key={m.emoji}
                            type="button"
                            onClick={() => {
                              sound.playHeartReaction();
                              onUpdateMood(activePartnerId, m.emoji, m.label, activeCategoryGroup.name);
                              onShowToast(`Mood updated to ${m.emoji} ${m.label}! 💕`);
                              setIsPickerExpanded(false);
                            }}
                            className={`group relative flex flex-col items-center justify-center rounded-2xl border p-1.5 text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-rose-400 bg-rose-50/95 ring-2 ring-rose-300 shadow-xs scale-102'
                                : 'border-stone-200/80 bg-stone-50/60 hover:border-amber-300 hover:bg-white shadow-2xs hover:scale-102'
                            }`}
                          >
                            <span className="text-2xl transition-transform group-hover:scale-120 drop-shadow-2xs">
                              {m.emoji}
                            </span>
                            <p className="mt-1 font-semibold text-[10px] text-stone-800 leading-tight line-clamp-1 w-full text-center">
                              {m.label}
                            </p>
                            {isSelected && (
                              <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  /* All 50+ Emojis View */
                  <div className="space-y-4 pt-1">
                    {MOOD_CATEGORIES.map(cat => (
                      <div key={cat.id} className="space-y-2">
                        <div className="flex items-center space-x-1.5 border-b border-stone-100 pb-1">
                          <span className="text-sm">{cat.icon}</span>
                          <h4 className="text-xs font-bold text-stone-700">{cat.name}</h4>
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.2 text-[9px] font-semibold ${cat.badgeClass}`}>
                            {cat.moods.length} emojis
                          </span>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                          {cat.moods.map(m => {
                            const currentMoodEmoji =
                              activePartnerId === 'p1' ? moods.partner1Mood : moods.partner2Mood;
                            const isSelected = currentMoodEmoji === m.emoji;

                            return (
                              <button
                                key={m.emoji}
                                type="button"
                                onClick={() => {
                                  sound.playHeartReaction();
                                  onUpdateMood(activePartnerId, m.emoji, m.label, cat.name);
                                  onShowToast(`Mood updated to ${m.emoji} ${m.label}! 💕`);
                                  setIsPickerExpanded(false);
                                }}
                                className={`group relative flex flex-col items-center justify-center rounded-2xl border p-1.5 text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'border-rose-400 bg-rose-50/95 ring-2 ring-rose-300 shadow-xs scale-102'
                                    : 'border-stone-200/80 bg-stone-50/60 hover:border-amber-300 hover:bg-white shadow-2xs hover:scale-102'
                                }`}
                              >
                                <span className="text-2xl transition-transform group-hover:scale-120 drop-shadow-2xs">
                                  {m.emoji}
                                </span>
                                <p className="mt-1 font-semibold text-[10px] text-stone-800 leading-tight line-clamp-1 w-full text-center">
                                  {m.label}
                                </p>
                                {isSelected && (
                                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MOOD THIS WEEK (LAST 7 DAYS) MINI-STRIP */}
        <div className="mt-4 rounded-2xl border border-rose-100/80 bg-white/90 p-3.5 shadow-xs">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-rose-500" />
              <h3 className="text-xs font-bold text-stone-800">
                Mood This Week (Last 7 Days)
              </h3>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              Synced & Persisted
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {last7Days.map(day => (
              <div
                key={day.dateKey}
                className={`flex flex-col items-center justify-between rounded-xl border p-1.5 sm:p-2 text-center transition-all ${
                  day.isToday
                    ? 'border-rose-300 bg-rose-50/95 ring-1 ring-rose-200 shadow-2xs'
                    : 'border-stone-100 bg-stone-50/60 hover:bg-stone-100/70'
                }`}
                title={`${day.dayLabel}, ${day.monthShort} ${day.dayNum}:
${p1.name}: ${day.p1?.mood || '—'} (${day.p1?.label || ''} • ${day.p1?.category || ''})
${p2.name}: ${day.p2?.mood || '—'} (${day.p2?.label || ''} • ${day.p2?.category || ''})`}
              >
                <span
                  className={`text-[10px] sm:text-xs font-bold ${
                    day.isToday ? 'text-rose-700' : 'text-stone-600'
                  }`}
                >
                  {day.dayLabel}
                </span>
                <span className="text-[8px] text-stone-400">
                  {day.monthShort} {day.dayNum}
                </span>

                {/* Both Partners' Mood Emojis */}
                <div className="my-1.5 flex items-center justify-center space-x-1 text-base sm:text-lg">
                  <span
                    className="transition-transform hover:scale-125"
                    title={`${p1.name}: ${day.p1?.mood} ${day.p1?.label || ''} (${day.p1?.category || ''})`}
                  >
                    {day.p1?.mood || '—'}
                  </span>
                  <span className="text-[8px] text-stone-300">•</span>
                  <span
                    className="transition-transform hover:scale-125"
                    title={`${p2.name}: ${day.p2?.mood} ${day.p2?.label || ''} (${day.p2?.category || ''})`}
                  >
                    {day.p2?.mood || '—'}
                  </span>
                </div>

                <span className="text-[8px] font-semibold text-stone-500 truncate max-w-full">
                  {day.isToday ? 'Today' : day.p1?.category?.split('/')[0] || 'Vibe'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 30-DAY MOOD TRENDS LINE CHART (RECHARTS) */}
      <section>
        <MoodTrendChart moods={moods} moodHistory={moodHistory} partners={partners} />
      </section>

      {/* STREAK & DAILY HABITS CHECKLIST */}
      <section className="rounded-3xl border border-stone-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Flame className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="font-serif-title text-base font-bold text-stone-800">
                Daily Love Habits & Streak
              </h2>
              <p className="text-[11px] text-stone-500">
                Small consistent gestures that keep our spark blazing
              </p>
            </div>
          </div>

          {/* Flame streak badge */}
          <div className="flex items-center space-x-1.5 rounded-2xl bg-orange-50 border border-orange-200/80 px-3 py-1.5 shadow-xs">
            <span className="text-base">{flameLevel.icon}</span>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-orange-700">{streak.count}</span>
                <span className="text-[10px] text-orange-600 font-medium">Day Streak</span>
              </div>
            </div>
          </div>
        </div>

        {/* Habits Checklist */}
        <div className="mt-4 space-y-2">
          {checklist.map(item => (
            <div
              key={item.id}
              onClick={() => {
                sound.playHeartReaction();
                onToggleChecklist(item.id);
              }}
              className={`flex items-center justify-between rounded-2xl border p-3 cursor-pointer transition-all ${
                item.completed
                  ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900'
                  : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:border-rose-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-100" />
                ) : (
                  <Circle className="h-5 w-5 text-stone-400" />
                )}
                <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-70' : ''}`}>
                  {item.text}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center gap-1 text-[9px] font-semibold">
                  <span
                    className={`rounded-full px-1.5 py-0.5 border ${
                      item.p1Completed
                        ? 'bg-rose-100 text-rose-700 border-rose-200'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    {p1.name || 'P1'} {item.p1Completed ? '✓' : '○'}
                  </span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 border ${
                      item.p2Completed
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}
                  >
                    {p2.name || 'P2'} {item.p2Completed ? '✓' : '○'}
                  </span>
                </div>
                {item.completed && (
                  <span className="text-[10px] font-bold text-emerald-600 hidden sm:inline">
                    Both done! 🔥
                  </span>
                )}
                {onDeleteChecklist && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playSoftChime();
                      onDeleteChecklist(item.id);
                      onShowToast('Habit removed 🗑️');
                    }}
                    className="p-1 text-stone-300 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Delete habit"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Add custom reminder habit */}
        <form onSubmit={handleAddChecklistItem} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newChecklistText}
            onChange={e => setNewChecklistText(e.target.value)}
            placeholder="Add new daily shared habit (e.g. 5-min cuddle)..."
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-stone-800 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-stone-900"
          >
            Add
          </button>
        </form>
      </section>

      {/* MILESTONE COUNTDOWNS */}
      <section className="rounded-3xl border border-rose-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <CalendarHeart className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-base font-bold text-stone-800">
                Milestone Countdowns
              </h2>
              <p className="text-[11px] text-stone-500">
                Anticipating anniversaries, dates & upcoming journeys
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playSoftChime();
              setShowAddMilestoneModal(true);
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Milestones Cards */}
        {milestones.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No milestones added yet. Add an anniversary or upcoming date night! 🥂
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {milestones.map(m => {
              const { isPast, days, hours, minutes, seconds } = calculateTimeLeft(m.date);
              const catConfig = CATEGORY_COLORS[m.category] || CATEGORY_COLORS['Date Night'];
              const isUnder24Hours = !isPast && days === 0 && hours < 24;

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border p-4 transition-all shadow-xs ${
                    isUnder24Hours
                      ? 'border-amber-300 bg-amber-50/60 ring-2 ring-amber-200/50'
                      : 'border-stone-200/80 bg-stone-50/40 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{catConfig.icon}</span>
                      <div>
                        <h4 className="font-serif-title text-sm font-bold text-stone-800 sm:text-base">
                          {m.title}
                        </h4>
                        <p className="text-[10px] text-stone-500">
                          {new Date(m.date).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          sound.playSoftChime();
                          onToggleMilestoneReminder(m.id);
                          onShowToast(m.reminderEnabled ? 'Reminder disabled' : '24h Reminder activated! 🔔');
                        }}
                        title={m.reminderEnabled ? 'Reminders active' : 'Reminders off'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          m.reminderEnabled ? 'text-amber-600 bg-amber-100' : 'text-stone-300 hover:text-stone-500'
                        }`}
                      >
                        {m.reminderEnabled ? <Bell className="h-3.5 w-3.5" /> : <BellOff className="h-3.5 w-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSoftChime();
                          onDeleteMilestone(m.id);
                          onShowToast(`Milestone "${m.title}" deleted 🗑️`);
                        }}
                        className="p-1.5 text-stone-300 hover:text-rose-500 cursor-pointer transition-colors"
                        title="Delete countdown"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Countdown Digital Timer */}
                  <div className="mt-3.5 flex items-center justify-around rounded-xl bg-white p-2.5 shadow-inner border border-stone-100 text-center">
                    {isPast ? (
                      <span className="text-xs font-bold text-rose-600">
                        🎉 Milestone Reached & Celebrated!
                      </span>
                    ) : (
                      <>
                        <div className="flex flex-col">
                          <span className="font-mono text-base font-bold text-stone-800">{days}</span>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">Days</span>
                        </div>
                        <span className="text-stone-300 font-bold">:</span>
                        <div className="flex flex-col">
                          <span className="font-mono text-base font-bold text-stone-800">
                            {String(hours).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">Hours</span>
                        </div>
                        <span className="text-stone-300 font-bold">:</span>
                        <div className="flex flex-col">
                          <span className="font-mono text-base font-bold text-stone-800">
                            {String(minutes).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">Mins</span>
                        </div>
                        <span className="text-stone-300 font-bold">:</span>
                        <div className="flex flex-col">
                          <span className="font-mono text-base font-bold text-rose-500">
                            {String(seconds).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider text-stone-400">Secs</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SOMEDAY BUCKET LIST */}
      <section className="rounded-3xl border border-stone-200/70 bg-white/90 p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-base font-bold text-stone-800">
                Our Someday Bucket List
              </h2>
              <p className="text-[11px] text-stone-500">
                Dreams, future trips, culinary bucket list & cozy goals
              </p>
            </div>
          </div>
        </div>

        {/* Someday Items */}
        <div className="mt-4 space-y-2">
          {someday.map(item => (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded-2xl border p-3 transition-all ${
                item.completed
                  ? 'border-purple-200 bg-purple-50/50 text-purple-900'
                  : 'border-stone-200 bg-stone-50/50 text-stone-700'
              }`}
            >
              <div
                onClick={() => {
                  sound.playHeartReaction();
                  onToggleSomeday(item.id);
                }}
                className="flex flex-1 items-center space-x-3 cursor-pointer"
              >
                {item.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-purple-500 fill-purple-100" />
                ) : (
                  <Circle className="h-5 w-5 text-stone-400" />
                )}
                <span className={`text-xs font-medium ${item.completed ? 'line-through opacity-70' : ''}`}>
                  {item.text}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-stone-400">
                  Added by {item.addedBy}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sound.playSoftChime();
                    onDeleteSomeday(item.id);
                    onShowToast('Someday dream removed 🗑️');
                  }}
                  className="p-1 text-stone-300 hover:text-rose-500 cursor-pointer transition-colors"
                  title="Remove dream"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddSomedayItem} className="mt-3 flex gap-2">
          <input
            type="text"
            value={newSomedayText}
            onChange={e => setNewSomedayText(e.target.value)}
            placeholder="Add a someday dream (e.g. Cabin in Switzerland)..."
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-purple-700"
          >
            Add Dream
          </button>
        </form>
      </section>

      {/* ADD MILESTONE MODAL */}
      {showAddMilestoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-title text-lg font-bold text-stone-800">
                Add Milestone Countdown ⏳
              </h3>
              <button
                onClick={() => setShowAddMilestoneModal(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMilestone} className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Event Title</label>
                <input
                  type="text"
                  required
                  value={mTitle}
                  onChange={e => setMTitle(e.target.value)}
                  placeholder="e.g. 2nd Anniversary Trip 🥂"
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={mDate}
                  onChange={e => setMDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Category</label>
                <select
                  value={mCategory}
                  onChange={e => setMCategory(e.target.value as MilestoneCategory)}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                >
                  <option value="Anniversary">Anniversary 🥂</option>
                  <option value="Date Night">Date Night 🕯️</option>
                  <option value="Trip">Trip / Vacation ✈️</option>
                  <option value="Birthday">Birthday 🎂</option>
                  <option value="Reminder">Reminder ⏰</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-stone-50 p-2.5">
                <span className="text-xs text-stone-700">Send 24-hour reminder alert</span>
                <input
                  type="checkbox"
                  checked={mReminder}
                  onChange={e => setMReminder(e.target.checked)}
                  className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMilestoneModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose-500 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-600"
                >
                  Start Countdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
