import React, { useState, useMemo } from 'react';
import {
  Wand2,
  Sparkles,
  Heart,
  Pin,
  Clock,
  DollarSign,
  Smile,
  Feather,
  RefreshCw,
  Copy,
  Check,
  Lightbulb,
  Mic,
  Volume2,
  MapPin,
  Compass,
  Map,
  Plus,
  Star,
  Trash2,
  Calendar,
  Edit,
  X,
  Navigation,
} from 'lucide-react';
import {
  DatePlan,
  DateVoiceMemo,
  PartnerProfile,
  NoteColor,
  LoveMapSpot,
  DateEmotionalImpact,
} from '../types';
import { storage, DEFAULT_DATE_IDEAS } from '../utils/storage';
import { sound } from '../utils/audio';
import { DateVoiceMemoRecorder } from '../components/DateVoiceMemoRecorder';
import { DateVoiceMemoPlayer } from '../components/DateVoiceMemoPlayer';
import { DateQualityTrendsCard } from '../components/DateQualityTrendsCard';
import {
  EMOTIONAL_IMPACTS,
  getEmotionalImpactInfo,
  RATING_DESCRIPTIONS,
} from '../utils/dateQuality';

interface DateAITabProps {
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  loveMapSpots: LoveMapSpot[];
  onAddLoveMapSpot: (spot: Omit<LoveMapSpot, 'id'> & { id?: string }) => void;
  onUpdateLoveMapSpot?: (spot: LoveMapSpot) => void;
  onDeleteLoveMapSpot: (id: string) => void;
  onPinToNotes: (text: string, color?: NoteColor) => void;
  onShowToast: (msg: string) => void;
}

const MOODS = [
  'Cozy & Relaxed 🛋️',
  'Adventurous & Spontaneous 🌲',
  'Romantic & Fancy 🥂',
  'Playful & Game Night 🎲',
  'Low-Energy & Chill 🍵',
  'Under the Stars ✨',
];

const BUDGETS = [
  { id: '$', label: 'Free to Cheap ($0 - $15)' },
  { id: '$$', label: 'Sweet & Moderate ($15 - $40)' },
  { id: '$$$', label: 'Fancy Splurge ($40+)' },
];

const TIME_WINDOWS = [
  'Quick Hour (1 hr)',
  'Evening Chill (2-3 hrs)',
  'Full Day Adventure',
  'Late Night Whim (10 PM+)',
];

const NOTE_TONES = [
  { id: 'Poetic', label: 'Poetic & Lyrical 🌸', desc: 'Heartfelt, emotional rhythm and imagery' },
  { id: 'Funny', label: 'Playful & Funny 😄', desc: 'Warm teasing, cute banter & smiles' },
  { id: 'Formal-cute', label: 'Formal-Cute 📜', desc: 'Vintage courtship letter & royal decree' },
  { id: 'Short & Sweet', label: 'Short & Sweet 💌', desc: 'Concise, punchy flutter of love' },
];

const GRID_COLS = 6;
const GRID_ROWS = 4;
const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
const ROW_LABELS = ['1', '2', '3', '4'];

const SECTOR_NAMES: string[][] = [
  ['North Bay Waterfront', 'Golden Skyline Pier', 'Harbor Sunset Point', 'Starlight Promenade', 'East Cliff Overlook', 'Beacon Hill Lighthouse'],
  ['Historic Cobblestone Alley', 'Secret Garden Cafe', 'Velvet Lounge & Jazz Bar', 'Old Town Square Fountain', 'Vintage Books & Teahouse', 'Boutique Gelato Parlor'],
  ['Sunset Hill Park', 'Pine Forest Hiking Trail', 'Quiet Botanical Glasshouse', 'Meadow Picnic Glade', 'Whispering Pines Grove', 'Lakeside Dock & Boats'],
  ['Hidden Speakeasy Nook', 'Candlelit Bistro Terrace', 'Rooftop Lounge Stargazing', 'Retro Arcade & Bowling', 'Late Night Dessert Vault', 'Cozy Fireside Courtyard'],
];

const SPOT_CATEGORIES = [
  { id: 'dinner', label: 'Dinner & Food', icon: '🍷', bg: 'bg-rose-100 text-rose-700' },
  { id: 'cafe', label: 'Cafe & Tea', icon: '☕', bg: 'bg-amber-100 text-amber-700' },
  { id: 'view', label: 'Scenic View', icon: '🌅', bg: 'bg-orange-100 text-orange-700' },
  { id: 'dessert', label: 'Dessert', icon: '🍦', bg: 'bg-pink-100 text-pink-700' },
  { id: 'movies', label: 'Movie & Arts', icon: '🎬', bg: 'bg-purple-100 text-purple-700' },
  { id: 'nature', label: 'Nature & Park', icon: '🌲', bg: 'bg-emerald-100 text-emerald-700' },
  { id: 'special', label: 'Special Date', icon: '✨', bg: 'bg-indigo-100 text-indigo-700' },
];

export function DateAITab({
  partners,
  activePartnerId,
  loveMapSpots,
  onAddLoveMapSpot,
  onUpdateLoveMapSpot,
  onDeleteLoveMapSpot,
  onPinToNotes,
  onShowToast,
}: DateAITabProps) {
  const activePartner = partners.find(p => p.id === activePartnerId) || partners[0];
  const otherPartner = partners.find(p => p.id !== activePartnerId) || partners[1] || partners[0];

  // Active Sub Tab: 'love_map' | 'ai_ideas' | 'note_polisher'
  const [activeSection, setActiveSection] = useState<'love_map' | 'ai_ideas' | 'note_polisher'>('love_map');

  // LOVE MAP STATE
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [newlyPinnedSpotId, setNewlyPinnedSpotId] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinFormX, setPinFormX] = useState<number>(0);
  const [pinFormY, setPinFormY] = useState<number>(0);
  const [pinFormName, setPinFormName] = useState('');
  const [pinFormDate, setPinFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pinFormCategory, setPinFormCategory] = useState('dinner');
  const [pinFormIcon, setPinFormIcon] = useState('🍷');
  const [pinFormNote, setPinFormNote] = useState('');
  const [pinFormPartner, setPinFormPartner] = useState(activePartner.name);
  const [pinFormRating, setPinFormRating] = useState<number>(5);
  const [pinFormEmotionalImpact, setPinFormEmotionalImpact] = useState<DateEmotionalImpact>('magical');
  const [pinFormHighlight, setPinFormHighlight] = useState('');

  // Spot Directory Filter & In-Place Edit state
  const [spotFilter, setSpotFilter] = useState<string>('all');
  const [isEditingSpot, setIsEditingSpot] = useState(false);
  const [editRating, setEditRating] = useState<number>(5);
  const [editImpact, setEditImpact] = useState<DateEmotionalImpact>('magical');
  const [editHighlight, setEditHighlight] = useState('');
  const [editNote, setEditNote] = useState('');

  // AI Date Ideas State
  const [selectedMood, setSelectedMood] = useState(MOODS[0]);
  const [selectedBudget, setSelectedBudget] = useState('$$');
  const [selectedTime, setSelectedTime] = useState(TIME_WINDOWS[1]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [dateIdeas, setDateIdeas] = useState<DatePlan[]>(() => DEFAULT_DATE_IDEAS);
  const [ideasSource, setIdeasSource] = useState<string | null>('curated');

  // Voice Memos state mapped by date idea title
  const [voiceMemosMap, setVoiceMemosMap] = useState<Record<string, DateVoiceMemo[]>>(() =>
    storage.getDateVoiceMemos()
  );
  const [recordingForDateTitle, setRecordingForDateTitle] = useState<string | null>(null);

  // Polish Note State
  const [noteDraft, setNoteDraft] = useState('');
  const [selectedTone, setSelectedTone] = useState('Poetic');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedResult, setPolishedResult] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedPolish, setCopiedPolish] = useState(false);

  // Filter Love Map spots based on selected filter
  const filteredSpots = useMemo(() => {
    if (spotFilter === 'all') return loveMapSpots;
    if (spotFilter === '5star') return loveMapSpots.filter(s => (s.rating || 5) === 5);
    return loveMapSpots.filter(s => (s.emotionalImpact || 'magical') === spotFilter);
  }, [loveMapSpots, spotFilter]);

  const selectedSpot = useMemo(() => {
    return loveMapSpots.find(s => s.id === selectedSpotId) || null;
  }, [loveMapSpots, selectedSpotId]);

  // LOVE MAP HANDLERS
  const handleCellClick = (x: number, y: number) => {
    sound.playSoftChime();
    const existing = loveMapSpots.find(s => s.x === x && s.y === y);
    if (existing) {
      setSelectedSpotId(existing.id);
      setIsEditingSpot(false);
    } else {
      setPinFormX(x);
      setPinFormY(y);
      setPinFormName('');
      setPinFormNote('');
      setPinFormCategory('dinner');
      setPinFormIcon('🍷');
      setPinFormPartner(activePartner.name);
      setPinFormDate(new Date().toISOString().split('T')[0]);
      setPinFormRating(5);
      setPinFormEmotionalImpact('magical');
      setPinFormHighlight('');
      setShowPinModal(true);
    }
  };

  const handleQuickRateSpot = (spot: LoveMapSpot, rating: number) => {
    sound.playHeartReaction();
    const updated: LoveMapSpot = { ...spot, rating };
    if (onUpdateLoveMapSpot) {
      onUpdateLoveMapSpot(updated);
    } else {
      onAddLoveMapSpot(updated);
    }
    onShowToast(`Rated date "${spot.name}" ${rating} Stars 💖`);
  };

  const handleQuickChangeImpact = (spot: LoveMapSpot, impact: DateEmotionalImpact) => {
    sound.playSoftChime();
    const updated: LoveMapSpot = { ...spot, emotionalImpact: impact };
    if (onUpdateLoveMapSpot) {
      onUpdateLoveMapSpot(updated);
    } else {
      onAddLoveMapSpot(updated);
    }
    const info = getEmotionalImpactInfo(impact);
    onShowToast(`Updated vibe to ${info.icon} ${info.label}!`);
  };

  const handleSaveSpotEdit = (e: React.FormEvent, spot: LoveMapSpot) => {
    e.preventDefault();
    sound.playHeartReaction();
    const updated: LoveMapSpot = {
      ...spot,
      highlightMoment: editHighlight.trim() || undefined,
      note: editNote.trim() || spot.note,
    };
    if (onUpdateLoveMapSpot) {
      onUpdateLoveMapSpot(updated);
    } else {
      onAddLoveMapSpot(updated);
    }
    setIsEditingSpot(false);
    onShowToast('Date memory updated! ✨');
  };

  const handleCreateSpotFromModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinFormName.trim()) return;

    sound.playHeartReaction();
    const newId = `spot-${Date.now()}`;
    const newSpot: LoveMapSpot = {
      id: newId,
      name: pinFormName.trim(),
      date: pinFormDate || new Date().toISOString().split('T')[0],
      x: pinFormX,
      y: pinFormY,
      category: pinFormCategory,
      icon: pinFormIcon,
      note: pinFormNote.trim() || undefined,
      pinnedBy: pinFormPartner,
      rating: pinFormRating,
      emotionalImpact: pinFormEmotionalImpact,
      highlightMoment: pinFormHighlight.trim() || undefined,
      isNew: true,
    };

    onAddLoveMapSpot(newSpot);
    setSelectedSpotId(newId);
    setNewlyPinnedSpotId(newId);
    setShowPinModal(false);
    onShowToast(`Pinned "${newSpot.name}" to Love Map! 📍`);

    setTimeout(() => setNewlyPinnedSpotId(null), 3000);
  };

  // Voice Memo Handlers
  const handleSaveVoiceMemo = (dateTitle: string, memo: DateVoiceMemo) => {
    const updated = storage.saveVoiceMemoForDate(dateTitle, memo);
    setVoiceMemosMap(updated);
    setRecordingForDateTitle(null);
  };

  const handleDeleteVoiceMemo = (dateTitle: string, memoId: string) => {
    const updated = storage.deleteVoiceMemoForDate(dateTitle, memoId);
    setVoiceMemosMap(updated);
    sound.playSoftChime();
    onShowToast('Voice note removed.');
  };

  // Generate Date Ideas with Gemini backend
  const handleGenerateDateIdeas = async () => {
    setIsGeneratingIdeas(true);
    sound.playSoftChime();

    const recentTitles = storage.getRecentDateIdeaTitles();

    try {
      const res = await fetch('/api/gemini/date-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: selectedMood,
          budget: selectedBudget,
          time: selectedTime,
          partner1Name: partners[0]?.name || 'Partner 1',
          partner2Name: partners[1]?.name || 'Partner 2',
          excludeTitles: recentTitles,
        }),
      });

      if (!res.ok) throw new Error('Network error generating ideas');
      const data = await res.json();

      if (data.ideas && Array.isArray(data.ideas)) {
        setDateIdeas(data.ideas);
        setIdeasSource(data.source);
        const newTitles = data.ideas.map((d: DatePlan) => d.title);
        storage.pushRecentDateIdeaTitles(newTitles);
        sound.playHeartReaction();
        onShowToast('3 fresh date plans generated! ✨');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Unable to connect to AI server. Please try again.');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Polish Romantic Note with Gemini backend
  const handlePolishNote = async () => {
    if (!noteDraft.trim()) {
      onShowToast('Please write a quick draft first!');
      return;
    }

    setIsPolishing(true);
    sound.playSoftChime();

    try {
      const res = await fetch('/api/gemini/polish-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: noteDraft,
          tone: selectedTone,
          senderName: activePartner.name,
          receiverName: otherPartner.name,
        }),
      });

      if (!res.ok) throw new Error('Network error polishing note');
      const data = await res.json();

      if (data.polished) {
        setPolishedResult(data.polished);
        sound.playHeartReaction();
        onShowToast('Your note has been polished into poetry! ✨');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Unable to connect to AI server. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSavePolishedToNotes = () => {
    if (!polishedResult) return;
    sound.playPinDrop();
    onPinToNotes(polishedResult, 'lavender');
    onShowToast('Saved to Notes Board! 📌');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER & SECTION TABS */}
      <section className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-amber-50/60 to-purple-50/70 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-md shadow-rose-200">
              <Compass className="h-5 w-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-800">
                  Our Dates
                </h1>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                  {loveMapSpots.length} Memories Pinned
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Love Map coordinates, date quality trends & AI date planner
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setPinFormX(0);
              setPinFormY(0);
              setPinFormName('');
              setPinFormNote('');
              setPinFormCategory('dinner');
              setPinFormIcon('🍷');
              setPinFormPartner(activePartner.name);
              setPinFormDate(new Date().toISOString().split('T')[0]);
              setPinFormRating(5);
              setPinFormEmotionalImpact('magical');
              setPinFormHighlight('');
              setShowPinModal(true);
            }}
            className="flex items-center space-x-1.5 rounded-2xl bg-amber-700 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-800 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Pin Date Spot 📍</span>
          </button>
        </div>

        {/* SECTION NAVIGATION PILLS */}
        <div className="mt-4 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setActiveSection('love_map');
            }}
            className={`flex items-center space-x-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'love_map'
                ? 'bg-amber-700 text-white shadow-md scale-102'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Love Map & Quality Trends ({loveMapSpots.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setActiveSection('ai_ideas');
            }}
            className={`flex items-center space-x-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'ai_ideas'
                ? 'bg-purple-700 text-white shadow-md scale-102'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>AI Date Planner & Voice Notes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setActiveSection('note_polisher');
            }}
            className={`flex items-center space-x-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'note_polisher'
                ? 'bg-rose-600 text-white shadow-md scale-102'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <Feather className="h-4 w-4" />
            <span>Poetic Note Polisher</span>
          </button>
        </div>
      </section>

      {/* SECTION 1: LOVE MAP & DATE QUALITY TRENDS */}
      {(activeSection === 'love_map' || activeSection === 'ai_ideas') && (
        <section className="space-y-6">
          {/* Date Quality Trends Card */}
          <DateQualityTrendsCard
            spots={loveMapSpots}
            partners={partners}
            selectedFilter={spotFilter}
            onSelectFilter={f => setSpotFilter(f)}
            onSelectSpot={id => setSelectedSpotId(id)}
          />

          {/* Interactive Coordinates Map Grid */}
          <div className="rounded-3xl border border-amber-200/80 bg-[#fdfbf7] p-4 shadow-sm sm:p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 pointer-events-none opacity-5 text-amber-900">
              <Compass className="h-64 w-64" />
            </div>

            {/* Section Title */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/50 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 shadow-inner">
                  <MapPin className="h-5 w-5 fill-amber-700/20 text-amber-800" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="font-serif-title text-base font-bold text-stone-800 sm:text-lg">
                      Our Interactive Love Map
                    </h2>
                    <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                      {loveMapSpots.length} Spots Pinned
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Coordinates grid with quality ratings & emotional milestone highlights
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playSoftChime();
                  setPinFormX(0);
                  setPinFormY(0);
                  setPinFormName('');
                  setPinFormNote('');
                  setPinFormCategory('dinner');
                  setPinFormIcon('🍷');
                  setPinFormPartner(activePartner.name);
                  setPinFormDate(new Date().toISOString().split('T')[0]);
                  setPinFormRating(5);
                  setPinFormEmotionalImpact('magical');
                  setPinFormHighlight('');
                  setShowPinModal(true);
                }}
                className="flex items-center space-x-1.5 rounded-xl bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-800 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Pin & Rate Date Location</span>
              </button>
            </div>

            {/* Coordinates Grid */}
            <div className="mt-4">
              <div className="rounded-2xl border border-amber-300/60 bg-[#fffdf9] p-3 shadow-inner">
                {/* Column Coordinates A-F */}
                <div className="grid grid-cols-[28px_repeat(6,1fr)] gap-1.5 mb-1.5 text-center text-[10px] font-bold text-amber-800/70">
                  <div className="flex items-center justify-center">
                    <Compass className="h-3.5 w-3.5 text-amber-500" />
                  </div>
                  {COL_LABELS.map(col => (
                    <div key={col} className="py-0.5">
                      Sector {col}
                    </div>
                  ))}
                </div>

                {/* Grid Rows 1-4 */}
                <div className="space-y-1.5">
                  {ROW_LABELS.map((rowLabel, y) => (
                    <div key={rowLabel} className="grid grid-cols-[28px_repeat(6,1fr)] gap-1.5">
                      <div className="flex items-center justify-center font-bold text-[10px] text-amber-800/70 bg-amber-50/60 rounded-lg">
                        {rowLabel}
                      </div>

                      {COL_LABELS.map((_, x) => {
                        const spot = loveMapSpots.find(s => s.x === x && s.y === y);
                        const isSelected = selectedSpotId === spot?.id;
                        const isNewlyPinned = spot ? (spot.id === newlyPinnedSpotId || spot.isNew) : false;
                        const sectorTitle = SECTOR_NAMES[y]?.[x] || `Sector ${COL_LABELS[x]}${ROW_LABELS[y]}`;
                        const impact = spot ? getEmotionalImpactInfo(spot.emotionalImpact) : null;

                        return (
                          <div
                            key={`${x}-${y}`}
                            onClick={() => handleCellClick(x, y)}
                            className={`group relative flex min-h-[82px] flex-col justify-between rounded-xl border p-1.5 transition-all cursor-pointer ${
                              spot
                                ? isNewlyPinned
                                  ? 'border-rose-400 bg-rose-50/95 shadow-md ring-2 ring-rose-400 scale-[1.03] z-20'
                                  : isSelected
                                  ? 'border-amber-500 bg-amber-50/95 shadow-md ring-2 ring-amber-300 scale-[1.02] z-10'
                                  : 'border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/60 shadow-2xs'
                                : 'border-dashed border-stone-200/90 bg-white/60 hover:border-amber-400 hover:bg-amber-50/40'
                            }`}
                            title={
                              spot
                                ? `${spot.name} (${spot.date}) - Rated ${spot.rating || 5}★ • ${impact?.label} • Pinned by ${spot.pinnedBy}`
                                : `Empty Spot: ${sectorTitle} (${COL_LABELS[x]}${ROW_LABELS[y]}). Tap to pin & rate a date!`
                            }
                          >
                            <div className="flex items-center justify-between text-[9px] text-stone-400">
                              <span className="font-mono font-medium">
                                {COL_LABELS[x]}{ROW_LABELS[y]}
                              </span>
                              {spot && (
                                <span className="font-bold text-amber-700 bg-amber-100/90 px-1 rounded-sm text-[8px]">
                                  {spot.rating || 5}★
                                </span>
                              )}
                            </div>

                            {spot ? (
                              <div
                                className={`my-auto flex flex-col items-center text-center ${
                                  isNewlyPinned ? 'animate-map-pin-bounce' : ''
                                }`}
                              >
                                <div className="relative">
                                  <span className="text-xl filter drop-shadow-xs transition-transform group-hover:scale-125 inline-block">
                                    {spot.icon || '📍'}
                                  </span>
                                  {impact && (
                                    <span className="absolute -top-1 -right-2 text-[10px]" title={impact.label}>
                                      {impact.icon}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 line-clamp-1 font-serif-title text-[10px] font-bold text-stone-800 leading-tight">
                                  {spot.name}
                                </p>
                                <span className="text-[9px] font-semibold text-rose-600">
                                  {new Date(spot.date).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </span>
                              </div>
                            ) : (
                              <div className="my-auto flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-stone-400">
                                <Plus className="h-4 w-4 text-amber-600" />
                                <span className="text-[9px] text-amber-800 font-medium">Pin date</span>
                              </div>
                            )}

                            <div className="text-[8px] text-stone-400 truncate opacity-70">
                              {sectorTitle}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Spot Inspector Card */}
            {selectedSpot && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 shadow-md animate-pin-pop">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl shadow-inner">
                      {selectedSpot.icon || '📍'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-amber-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                          Sector {COL_LABELS[selectedSpot.x]}{ROW_LABELS[selectedSpot.y]} •{' '}
                          {SECTOR_NAMES[selectedSpot.y]?.[selectedSpot.x]}
                        </span>
                        {(() => {
                          const imp = getEmotionalImpactInfo(selectedSpot.emotionalImpact);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${imp.badgeBg}`}
                            >
                              <span>{imp.icon}</span>
                              <span>{imp.label}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900 mt-1">
                        {selectedSpot.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-0.5">
                        <div className="flex items-center space-x-1 text-rose-600 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            {new Date(selectedSpot.date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <span>•</span>
                        <span>Pinned by {selectedSpot.pinnedBy}</span>
                      </div>

                      {/* Heart Rating Row */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-xl bg-amber-50/80 p-2 border border-amber-100/80">
                        <span className="text-[11px] font-bold text-stone-700">Date Quality:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map(starNum => {
                            const currentRating = selectedSpot.rating || 5;
                            const isFilled = starNum <= currentRating;
                            return (
                              <button
                                key={starNum}
                                type="button"
                                onClick={() => handleQuickRateSpot(selectedSpot, starNum)}
                                className="text-lg transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                                title={`Rate ${starNum} Stars (${RATING_DESCRIPTIONS[starNum]?.title || ''})`}
                              >
                                {isFilled ? '💖' : '🤍'}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-xs font-bold text-amber-900 ml-1">
                          {RATING_DESCRIPTIONS[selectedSpot.rating || 5]?.title || 'Pure Magic! 💖'}
                        </span>
                      </div>

                      {/* Emotional Impact Switcher */}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-stone-500 mr-1">
                          Change Emotional Impact:
                        </span>
                        {EMOTIONAL_IMPACTS.map(imp => {
                          const isCurrent = (selectedSpot.emotionalImpact || 'magical') === imp.id;
                          return (
                            <button
                              key={imp.id}
                              type="button"
                              onClick={() => handleQuickChangeImpact(selectedSpot, imp.id)}
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                                isCurrent
                                  ? `${imp.badgeBg} ring-1 ring-amber-400 font-bold shadow-2xs`
                                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60'
                              }`}
                            >
                              <span>{imp.icon} {imp.shortLabel}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedSpot.highlightMoment && (
                        <div className="mt-2.5 rounded-xl bg-rose-50/70 p-2.5 border border-rose-100">
                          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wide">
                            🌟 Highlight Moment
                          </span>
                          <p className="font-handwriting text-base text-stone-800 mt-0.5">
                            “{selectedSpot.highlightMoment}”
                          </p>
                        </div>
                      )}

                      {selectedSpot.note && (
                        <p className="mt-2 font-handwriting text-base text-stone-700 bg-amber-50/70 rounded-xl p-2.5 border border-amber-100">
                          “{selectedSpot.note}”
                        </p>
                      )}

                      {isEditingSpot ? (
                        <form
                          onSubmit={e => handleSaveSpotEdit(e, selectedSpot)}
                          className="mt-3 space-y-2.5 rounded-xl border border-amber-200 bg-stone-50/60 p-3"
                        >
                          <h5 className="text-xs font-bold text-stone-800">
                            Edit Date Review & Highlight
                          </h5>

                          <div>
                            <label className="text-[10px] font-semibold text-stone-600">
                              Highlight / Unforgettable Moment:
                            </label>
                            <input
                              type="text"
                              value={editHighlight}
                              onChange={e => setEditHighlight(e.target.value)}
                              placeholder="e.g. Watching shooting stars while wrapped in one blanket..."
                              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-rose-400 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center justify-end space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingSpot(false)}
                              className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rounded-lg bg-amber-700 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-800"
                            >
                              Save Updates
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="mt-3 flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingSpot(true)}
                            className="flex items-center space-x-1 text-xs font-semibold text-amber-800 hover:text-amber-900 underline"
                          >
                            <Edit className="h-3 w-3" />
                            <span>{selectedSpot.highlightMoment ? 'Edit Highlight Memory' : '+ Add Highlight Memory'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playSoftChime();
                        onDeleteLoveMapSpot(selectedSpot.id);
                        setSelectedSpotId(null);
                        onShowToast(`Removed "${selectedSpot.name}" from Love Map 🗑️`);
                      }}
                      className="rounded-xl border border-stone-200 p-1.5 text-stone-400 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove location pin"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedSpotId(null)}
                      className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Directory of Pinned Spots */}
            {loveMapSpots.length > 0 && (
              <div className="mt-5 pt-4 border-t border-amber-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600">
                      All Special Locations ({loveMapSpots.length})
                    </h4>
                    {spotFilter !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSpotFilter('all')}
                        className="text-[10px] text-amber-700 underline font-semibold"
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSpotFilter('all')}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                        spotFilter === 'all'
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      All ({loveMapSpots.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSpotFilter('5star')}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                        spotFilter === '5star'
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
                      }`}
                    >
                      💖 5★ Favorites
                    </button>

                    {EMOTIONAL_IMPACTS.map(imp => {
                      const count = loveMapSpots.filter(s => (s.emotionalImpact || 'magical') === imp.id).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={imp.id}
                          type="button"
                          onClick={() => setSpotFilter(imp.id)}
                          className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all cursor-pointer ${
                            spotFilter === imp.id
                              ? 'bg-amber-700 text-white shadow-2xs'
                              : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50'
                          }`}
                        >
                          <span>{imp.icon}</span>
                          <span>{imp.shortLabel} ({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {filteredSpots.map(spot => {
                    const isSelected = spot.id === selectedSpotId;
                    const impact = getEmotionalImpactInfo(spot.emotionalImpact);

                    return (
                      <div
                        key={spot.id}
                        onClick={() => {
                          sound.playSoftChime();
                          setSelectedSpotId(isSelected ? null : spot.id);
                        }}
                        className={`flex items-center justify-between rounded-xl border p-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-xs ring-1 ring-amber-300'
                            : 'border-stone-200/90 bg-white hover:border-amber-300 hover:bg-amber-50/40'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span className="text-xl">{spot.icon || '📍'}</span>
                          <div className="truncate">
                            <div className="flex items-center space-x-1.5 truncate">
                              <p className="font-serif-title text-xs font-semibold text-stone-800 truncate">
                                {spot.name}
                              </p>
                              <span className="text-[10px]" title={impact.label}>
                                {impact.icon}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-400">
                              {spot.date} • {COL_LABELS[spot.x]}{ROW_LABELS[spot.y]} •{' '}
                              <span className="text-amber-700 font-bold">{spot.rating || 5}★</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            sound.playSoftChime();
                            onDeleteLoveMapSpot(spot.id);
                            if (selectedSpotId === spot.id) setSelectedSpotId(null);
                            onShowToast(`Removed "${spot.name}" from Love Map 🗑️`);
                          }}
                          className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                          title="Remove location pin"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* SECTION 2: AI DATE IDEAS & VOICE MEMOS */}
      {(activeSection === 'ai_ideas' || activeSection === 'love_map') && (
        <section className="rounded-3xl border border-purple-200/80 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 border-b border-purple-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-stone-800">
                AI Date Planner & Voice Notes
              </h2>
              <p className="text-[11px] text-stone-500">
                Customized date ideas with built-in voice memo audio clips
              </p>
            </div>
          </div>

          {/* Generator Controls */}
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-stone-600">Current Vibe or Mood</label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMood(m)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      selectedMood === m
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Budget Range</label>
                <div className="mt-1 flex gap-1.5">
                  {BUDGETS.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBudget(b.id)}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        selectedBudget === b.id
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {b.id}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Time Window</label>
                <select
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 focus:border-purple-400 focus:bg-white focus:outline-none"
                >
                  {TIME_WINDOWS.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={isGeneratingIdeas}
              onClick={handleGenerateDateIdeas}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-rose-500 py-3 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingIdeas ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Curating Fresh Date Ideas...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Generate 3 Custom Date Ideas ✨</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Ideas Cards */}
          <div className="mt-6 space-y-4">
            {dateIdeas.map((idea, idx) => {
              const memos = voiceMemosMap[idea.title] || [];
              const isRecording = recordingForDateTitle === idea.title;

              return (
                <div
                  key={idea.id || `idea-${idx}`}
                  className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/50 to-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold text-purple-700">
                        {idea.vibe}
                      </span>
                      <h3 className="font-serif-title text-base font-bold text-stone-800 mt-1">
                        {idea.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
                      {idea.budgetEstimate}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1.5 text-xs text-stone-600">
                    {idea.steps.map((step, sIdx) => (
                      <li key={sIdx} className="flex items-start space-x-2">
                        <span className="text-purple-500 font-bold">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  {idea.prepTip && (
                    <div className="mt-3 rounded-xl bg-purple-100/60 p-2.5 text-[11px] text-purple-900 border border-purple-200/50 flex items-start space-x-1.5">
                      <Lightbulb className="h-3.5 w-3.5 text-purple-600 shrink-0 mt-0.5" />
                      <span>{idea.prepTip}</span>
                    </div>
                  )}

                  {/* VOICE MEMOS SECTION FOR THIS DATE IDEA */}
                  <div className="mt-4 pt-3 border-t border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                        <Mic className="h-3.5 w-3.5 text-purple-600" />
                        Voice Memos & Audio Whispers ({memos.length})
                      </span>
                      {!isRecording && (
                        <button
                          type="button"
                          onClick={() => setRecordingForDateTitle(idea.title)}
                          className="flex items-center space-x-1 rounded-xl bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-800 hover:bg-purple-200 cursor-pointer"
                        >
                          <Mic className="h-3 w-3" />
                          <span>Record Audio Note</span>
                        </button>
                      )}
                    </div>

                    {isRecording && (
                      <DateVoiceMemoRecorder
                        dateTitle={idea.title}
                        activePartner={activePartner}
                        onSaveMemo={(memo) => handleSaveVoiceMemo(idea.title, memo)}
                        onCancel={() => setRecordingForDateTitle(null)}
                        onShowToast={onShowToast}
                      />
                    )}

                    {memos.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {memos.map(m => (
                          <DateVoiceMemoPlayer
                            key={m.id}
                            memo={m}
                            partners={partners}
                            onDelete={() => handleDeleteVoiceMemo(idea.title, m.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* SECTION 3: POETIC NOTE POLISHER */}
      {(activeSection === 'note_polisher' || activeSection === 'ai_ideas') && (
        <section className="rounded-3xl border border-rose-200/80 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 border-b border-rose-100 pb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-inner">
              <Feather className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-stone-800">
                Poetic Love Note Polisher
              </h2>
              <p className="text-[11px] text-stone-500">
                Transform rough romantic thoughts into beautiful poetry or playful banter
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-stone-600">Your Rough Draft</label>
              <textarea
                rows={3}
                value={noteDraft}
                onChange={e => setNoteDraft(e.target.value)}
                placeholder="e.g. hey i loved when we ate ice cream yesterday you looked super cute in that oversized jacket and i want to kiss you..."
                className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600">Choose Desired Tone</label>
              <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {NOTE_TONES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id)}
                    className={`rounded-xl border p-2.5 text-left transition-all cursor-pointer ${
                      selectedTone === t.id
                        ? 'border-rose-400 bg-rose-50/80 ring-1 ring-rose-300'
                        : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100'
                    }`}
                  >
                    <p className="font-semibold text-xs text-stone-800">{t.label}</p>
                    <p className="text-[10px] text-stone-500 leading-tight mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={isPolishing || !noteDraft.trim()}
              onClick={handlePolishNote}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 text-xs font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              {isPolishing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Polishing with Sweetness...</span>
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  <span>Polish My Note ✨</span>
                </>
              )}
            </button>
          </div>

          {polishedResult && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-4 animate-develop">
              <div className="flex items-center justify-between text-xs text-rose-700">
                <span className="font-semibold">Polished Version ({selectedTone})</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(polishedResult);
                    setCopiedPolish(true);
                    setTimeout(() => setCopiedPolish(false), 2000);
                    onShowToast('Copied to clipboard! 📋');
                  }}
                  className="flex items-center space-x-1 text-[11px] font-medium text-rose-800 hover:underline cursor-pointer"
                >
                  {copiedPolish ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedPolish ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="mt-2 font-handwriting text-xl text-rose-950 leading-relaxed bg-white/80 p-3 rounded-xl border border-rose-100">
                "{polishedResult}"
              </p>

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePolishedToNotes}
                  className="flex items-center space-x-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 active:scale-95 cursor-pointer"
                >
                  <Pin className="h-3.5 w-3.5 fill-current" />
                  <span>Save to Notes Board 📌</span>
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* PIN DATE LOCATION MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-amber-700" />
                <h3 className="font-serif-title text-lg font-bold text-stone-800">
                  Pin Date on Love Map 🗺️
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPinModal(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpotFromModal} className="mt-4 space-y-3.5">
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Date Spot Name</label>
                <input
                  type="text"
                  required
                  value={pinFormName}
                  onChange={e => setPinFormName(e.target.value)}
                  placeholder="e.g. Sunset Point Pier, Little French Bistro..."
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Date</label>
                  <input
                    type="date"
                    required
                    value={pinFormDate}
                    onChange={e => setPinFormDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-600">Grid Coordinate</label>
                  <select
                    value={`${pinFormX}-${pinFormY}`}
                    onChange={e => {
                      const [x, y] = e.target.value.split('-').map(Number);
                      setPinFormX(x);
                      setPinFormY(y);
                    }}
                    className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                  >
                    {ROW_LABELS.map((_, y) =>
                      COL_LABELS.map((col, x) => (
                        <option key={`${x}-${y}`} value={`${x}-${y}`}>
                          {col}{y + 1} • {SECTOR_NAMES[y][x]}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Category & Vibe Icon</label>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {SPOT_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setPinFormCategory(cat.id);
                        setPinFormIcon(cat.icon);
                      }}
                      className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs transition-all cursor-pointer ${
                        pinFormCategory === cat.id
                          ? 'bg-amber-600 text-white font-bold shadow-xs scale-102'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rate Date Quality */}
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Rate Date Quality & Romance</label>
                <div className="mt-1 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/50 p-2.5">
                  <div className="flex items-center space-x-1.5">
                    {[1, 2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          sound.playHeartReaction();
                          setPinFormRating(num);
                        }}
                        className="text-2xl transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      >
                        {num <= pinFormRating ? '💖' : '🤍'}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {RATING_DESCRIPTIONS[pinFormRating]?.title}
                  </span>
                </div>
              </div>

              {/* Emotional Impact Category */}
              <div>
                <label className="text-[11px] font-semibold text-stone-600">Emotional Impact Category</label>
                <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {EMOTIONAL_IMPACTS.map(imp => {
                    const isSelected = pinFormEmotionalImpact === imp.id;
                    return (
                      <button
                        key={imp.id}
                        type="button"
                        onClick={() => {
                          sound.playSoftChime();
                          setPinFormEmotionalImpact(imp.id);
                        }}
                        className={`flex flex-col items-start rounded-xl border p-2 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-400 font-bold shadow-2xs'
                            : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-600'
                        }`}
                      >
                        <span className="text-sm">{imp.icon} {imp.shortLabel}</span>
                        <span className="text-[9px] text-stone-400 leading-tight mt-0.5 line-clamp-1">
                          {imp.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Highlight / Favorite Moment (Optional)</label>
                <input
                  type="text"
                  value={pinFormHighlight}
                  onChange={e => setPinFormHighlight(e.target.value)}
                  placeholder="e.g. When we stayed talking until they turned off the lights..."
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Sweet Memory Note (Optional)</label>
                <textarea
                  value={pinFormNote}
                  onChange={e => setPinFormNote(e.target.value)}
                  placeholder="What made this date unforgettable?..."
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-handwriting text-base focus:border-rose-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600">Pinned By</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {partners.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPinFormPartner(p.name)}
                      className={`flex items-center justify-center space-x-1.5 rounded-xl border py-2 text-xs transition-all cursor-pointer ${
                        pinFormPartner === p.name
                          ? 'border-rose-400 bg-rose-50 font-bold text-rose-800'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span>{p.avatarEmoji}</span>
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 rounded-xl border border-stone-200 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!pinFormName.trim()}
                  className="flex-1 rounded-xl bg-amber-700 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-amber-800 disabled:opacity-40 cursor-pointer"
                >
                  Pin Date Spot 📍
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
