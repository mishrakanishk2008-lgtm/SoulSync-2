import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Heart,
  Upload,
  Play,
  Pause,
  X,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Pin,
  RefreshCw,
  Volume2,
  VolumeX,
  Archive,
  Search,
} from 'lucide-react';
import { SnapPhoto, SnapFilter, SnapSticker, PartnerProfile } from '../types';
import { DAILY_PHOTO_PROMPTS } from '../utils/storage';
import { storage } from '../utils/storage';
import { sound } from '../utils/audio';
import { compressImageToDataUrl } from '../utils/image';

interface SnapsTabProps {
  snaps: SnapPhoto[];
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  onAddSnap: (snap: Omit<SnapPhoto, 'id' | 'timestamp' | 'loves'>) => void;
  onLikeSnap: (snapId: string) => void;
  onDeleteSnap: (snapId: string) => void;
  onTogglePinSnap?: (snapId: string) => void;
  onShowToast: (msg: string) => void;
}

// Preset aesthetic romance photos if user wants quick mock uploads
const SAMPLE_PRESET_IMAGES = [
  { label: 'Golden Hour Stroll', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Sunday Latte Art', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80' },
  { label: 'Holding Hands', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80' },
  { label: 'Stargazing Camp', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fairy Lights Bedroom', url: 'https://images.unsplash.com/photo-1513297887119-d46091b24bfa?auto=format&fit=crop&w=800&q=80' },
  { label: 'Picnic in the Meadow', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
];

export function SnapsTab({
  snaps,
  partners,
  activePartnerId,
  onAddSnap,
  onLikeSnap,
  onDeleteSnap,
  onTogglePinSnap,
  onShowToast,
}: SnapsTabProps) {
  const activePartner = partners.find(p => p.id === activePartnerId) || partners[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [filter, setFilter] = useState<SnapFilter>('normal');
  const [sticker, setSticker] = useState<SnapSticker>('none');
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [isPinningSequence, setIsPinningSequence] = useState(false);

  // Memory Lane state
  const [isMemoryLane, setIsMemoryLane] = useState(false);
  const [memoryIndex, setMemoryIndex] = useState(0);
  const [isMusicOn, setIsMusicOn] = useState(false);

  // Unpinned Archive state
  const [showUnpinnedArchive, setShowUnpinnedArchive] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');

  // Daily prompt
  const todayPrompt = DAILY_PHOTO_PROMPTS[new Date().getDay() % DAILY_PHOTO_PROMPTS.length];

  // Pinned vs Unpinned snaps
  const pinnedSnaps = snaps.filter(s => s.pinned !== false);
  const unpinnedSnaps = snaps.filter(s => s.pinned === false);
  const filteredArchive = unpinnedSnaps.filter(s =>
    s.caption.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    s.senderName.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  const handleUnpinSnap = (snapId: string) => {
    sound.playUnpinWindchime();
    if (onTogglePinSnap) {
      onTogglePinSnap(snapId);
    }
    onShowToast('Moment unpinned from scrapbook! Moved to Archive 📦');
  };

  const handleRepinSnap = (snapId: string) => {
    sound.playPinWindchime();
    if (onTogglePinSnap) {
      onTogglePinSnap(snapId);
    }
    onShowToast('Moment repinned to corkboard! 📌');
  };

  // Helper to downscale base64 to avoid LocalStorage quota issues
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.7);
      setPreviewImage(dataUrl);
      triggerDevelopingAnimation();
    } catch (err: any) {
      onShowToast(err.message || 'Image compression failed. Try a smaller photo 💕');
    }
  };

  const triggerDevelopingAnimation = () => {
    setIsDeveloping(true);
    sound.playSoftChime();
    setTimeout(() => {
      setIsDeveloping(false);
    }, 700);
  };

  const handleSelectPreset = (url: string) => {
    setPreviewImage(url);
    triggerDevelopingAnimation();
  };

  const handleSaveSnap = () => {
    if (!previewImage) return;

    // Trigger Polaroid Flying & Pin Sequence
    setIsPinningSequence(true);
    sound.playPinWindchime();

    setTimeout(() => {
      // Randomized rotation and coordinates generated ONCE so both devices render identically
      const currentUser = storage.getCurrentUser();
      const randomRot = Math.round((Math.random() * 14 - 7) * 10) / 10;
      const pinX = Math.round(10 + Math.random() * 75);
      const pinY = Math.round(10 + Math.random() * 75);


      onAddSnap({
        imageUrl: previewImage,
        imageData: previewImage,
        caption: caption.trim() || 'A sweet moment together ✨',
        senderId: currentUser ? currentUser.userId : activePartner.id,
        senderName: currentUser ? currentUser.name : activePartner.name,
        rotation: randomRot,
        pinX,
        pinY,
        filter,
        sticker,
        stickers: sticker,
        isNew: true,
        pinned: true,
      });

      setIsPinningSequence(false);
      setShowUploadModal(false);
      setPreviewImage(null);
      setCaption('');
      setFilter('normal');
      setSticker('none');
      onShowToast('Snap pinned to our corkboard scrapbook! 📸');
    }, 800);
  };


  // Memory Lane Slideshow
  useEffect(() => {
    let timer: number | null = null;
    if (isMemoryLane && snaps.length > 0) {
      timer = window.setInterval(() => {
        setMemoryIndex(prev => (prev + 1) % snaps.length);
      }, 4500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMemoryLane, snaps.length]);

  const toggleMusic = () => {
    if (isMusicOn) {
      sound.stopMemoryLaneMelody();
      setIsMusicOn(false);
    } else {
      sound.startMemoryLaneMelody();
      setIsMusicOn(true);
    }
  };

  const getFilterStyle = (f: SnapFilter): string => {
    switch (f) {
      case 'vintage':
        return 'sepia(45%) contrast(110%) brightness(95%)';
      case 'warm':
        return 'sepia(20%) saturate(140%) hue-rotate(-10deg) brightness(105%)';
      case 'bw':
        return 'grayscale(100%) contrast(115%) brightness(95%)';
      case 'pastel':
        return 'contrast(92%) saturate(120%) brightness(108%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Daily Rotating Photo Prompt Card */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50 via-amber-50 to-pink-50 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
              {todayPrompt.icon}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Daily Snap Prompt
              </span>
              <p className="font-serif-title text-sm font-semibold text-stone-800 sm:text-base">
                {todayPrompt.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playSoftChime();
              setCaption(todayPrompt.title);
              setShowUploadModal(true);
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-200 transition-all hover:bg-rose-600 active:scale-95"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Snap It</span>
          </button>
        </div>
      </div>

      {/* CORKBOARD SCRAPBOOK AREA */}
      <section className="rounded-3xl border border-stone-300/60 p-4 shadow-inner sm:p-6 bg-corkboard relative min-h-[460px]">
        {/* Corkboard Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-3 backdrop-blur-md shadow-xs">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-base font-bold text-stone-800">
                Our Disposable Scrapbook
              </h2>
              <p className="text-[11px] text-stone-500">
                {pinnedSnaps.length} moments pinned on our board
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Unpinned Moments Archive Button */}
            <button
              onClick={() => {
                sound.playSoftChime();
                setShowUnpinnedArchive(true);
              }}
              title="View Unpinned Moments Archive"
              className="flex items-center space-x-1.5 rounded-xl border border-stone-200 bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-white hover:text-stone-900 transition-all"
            >
              <Archive className="h-3.5 w-3.5 text-amber-700" />
              <span className="hidden sm:inline">Archive</span>
              {unpinnedSnaps.length > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                  {unpinnedSnaps.length}
                </span>
              )}
            </button>

            {/* Memory Lane Mode Button */}
            {snaps.length > 0 && (
              <button
                onClick={() => {
                  sound.playSoftChime();
                  setMemoryIndex(0);
                  setIsMemoryLane(true);
                  sound.startMemoryLaneMelody();
                  setIsMusicOn(true);
                }}
                className="flex items-center space-x-1.5 rounded-xl border border-purple-200 bg-purple-50/80 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-100"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Memory Lane</span>
              </button>
            )}

            {/* Add Snap Button */}
            <button
              onClick={() => {
                sound.playSoftChime();
                setShowUploadModal(true);
              }}
              className="flex items-center space-x-1.5 rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-stone-900 active:scale-95"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Add Snap</span>
            </button>
          </div>
        </div>

        {/* 2-Column Polaroid Grid */}
        {pinnedSnaps.length === 0 ? (
          <div className="my-16 rounded-2xl border-2 border-dashed border-stone-300 bg-white/60 p-8 text-center backdrop-blur-xs">
            <Camera className="mx-auto h-10 w-10 text-stone-400" />
            <p className="mt-2 font-handwriting text-2xl text-stone-700">
              {unpinnedSnaps.length > 0
                ? 'All moments are currently unpinned from the board.'
                : 'Our corkboard has room for all our smiles.'}
            </p>
            <p className="mt-1 text-xs text-stone-500">
              {unpinnedSnaps.length > 0
                ? 'Your unpinned memories are safely kept in your Scrapbook Archive. Click below to view and repin them anytime!'
                : 'Upload a real photo from your device or pick a preset to pin our first polaroid!'}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {unpinnedSnaps.length > 0 && (
                <button
                  onClick={() => {
                    sound.playSoftChime();
                    setShowUnpinnedArchive(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-600 active:scale-95"
                >
                  <Archive className="h-3.5 w-3.5" /> View Unpinned Archive ({unpinnedSnaps.length})
                </button>
              )}
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-600 active:scale-95"
              >
                <Upload className="h-3.5 w-3.5" /> Upload New Photo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {pinnedSnaps.map((snap, idx) => {
              return (
                <div
                  key={snap.id}
                  style={{
                    transform: `rotate(${snap.rotation}deg)`,
                    '--target-rot': `${snap.rotation}deg`,
                  } as React.CSSProperties}
                  className={`group relative rounded-xl bg-white p-3.5 pb-5 shadow-lg transition-all duration-300 hover:z-20 hover:scale-105 hover:shadow-2xl ${
                    snap.isNew ? 'animate-fly-pin' : ''
                  }`}
                >
                  {/* Pushpin at top center with shadow — Click to unpin moment */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnpinSnap(snap.id);
                    }}
                    title="Click pin to unpin moment from scrapbook"
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center group/pin cursor-pointer transition-transform hover:scale-125 active:scale-90"
                  >
                    <div className="h-6 w-6 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white transition-all group-hover/pin:bg-rose-600 group-hover/pin:shadow-lg animate-pin-pop">
                      <Pin className="h-3.5 w-3.5 fill-current rotate-45 transition-transform group-hover/pin:-rotate-12" />
                    </div>
                    <span className="pointer-events-none absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900/90 px-1.5 py-0.5 text-[9px] font-semibold text-white opacity-0 transition-opacity group-hover/pin:opacity-100 shadow-sm z-30">
                      Unpin
                    </span>
                  </button>

                  {/* Tape / Sticker overlay */}
                  {snap.sticker === 'tape' && (
                    <div className="absolute -top-2 left-6 z-10 h-5 w-16 -rotate-6 bg-amber-100/90 border-t border-b border-amber-200/50 shadow-xs backdrop-blur-xs" />
                  )}
                  {snap.sticker === 'heart' && (
                    <span className="absolute top-2 right-2 z-10 text-2xl filter drop-shadow">
                      💖
                    </span>
                  )}
                  {snap.sticker === 'sparkle' && (
                    <span className="absolute top-2 right-2 z-10 text-2xl filter drop-shadow">
                      ✨
                    </span>
                  )}
                  {snap.sticker === 'cupid' && (
                    <span className="absolute top-2 right-2 z-10 text-2xl filter drop-shadow">
                      🏹
                    </span>
                  )}
                  {snap.sticker === 'person' && (
                    <span className="absolute top-2 right-2 z-10 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-rose-600 shadow-xs">
                      MY PERSON
                    </span>
                  )}

                  {/* Photo Canvas */}
                  <div
                    onDoubleClick={() => {
                      sound.playHeartReaction();
                      onLikeSnap(snap.id);
                    }}
                    className="relative aspect-square w-full overflow-hidden rounded-md bg-stone-100 cursor-pointer"
                  >
                    <img
                      src={snap.imageData || snap.imageUrl}
                      alt={snap.caption}
                      style={{ filter: getFilterStyle(snap.filter) }}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Double-tap hint or heart overlay */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        sound.playHeartReaction();
                        onLikeSnap(snap.id);
                      }}
                      className="absolute bottom-2 right-2 flex items-center space-x-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          (snap.loves || 0) > 0 ? 'fill-rose-500 text-rose-500' : 'text-white'
                        }`}
                      />
                      <span className="font-semibold text-[11px]">{snap.loves || 0}</span>
                    </button>
                  </div>

                  {/* Polaroid Bottom Caption & Timestamp */}
                  <div className="mt-3.5 px-1">
                    <p className="font-handwriting text-xl text-stone-800 leading-snug">
                      {snap.caption}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-stone-400">
                      <span>by {snap.senderName}</span>
                      <div className="flex items-center space-x-2">
                        <span>
                          {new Date(snap.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {/* Only the uploader can delete their own snap */}
                        {(() => {
                          const currentUser = storage.getCurrentUser();
                          const isUploader = currentUser
                            ? snap.senderId === currentUser.userId ||
                              snap.senderId === currentUser.slotId ||
                              (currentUser.name && snap.senderName?.toLowerCase() === currentUser.name.toLowerCase())
                            : true;
                          if (!isUploader) return null;
                          return (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                sound.playSoftChime();
                                onDeleteSnap(snap.id);
                                onShowToast('Polaroid memory removed 🗑️');
                              }}
                              className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete my photo"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* UPLOAD & POLAROID DEVELOP MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-6 w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-rose-500" />
                <h3 className="font-serif-title text-lg font-bold text-stone-800">
                  Develop a New Polaroid
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewImage(null);
                }}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Photo Upload or Preset Picker */}
              {!previewImage ? (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/50 py-8 text-center transition-all hover:bg-rose-50 hover:border-rose-400"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                      <Upload className="h-6 w-6" />
                    </div>
                    <span className="mt-2 text-xs font-semibold text-stone-800">
                      Choose Photo From Your Device
                    </span>
                    <span className="text-[11px] text-stone-500">
                      Supports JPG, PNG, WEBP with auto-scaling
                    </span>
                  </button>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600 mb-2">
                      <span>Or pick from romantic presets:</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {SAMPLE_PRESET_IMAGES.map((preset, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className="group relative aspect-square overflow-hidden rounded-xl border border-stone-200 hover:border-rose-400 transition-all"
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-end p-1">
                            <span className="text-[9px] font-medium text-white truncate">
                              {preset.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* DEVELOPING POLAROID PREVIEW */
                <div className="space-y-4">
                  {/* Polaroid Frame Preview */}
                  <div
                    className={`relative mx-auto max-w-[280px] rounded-xl bg-white p-3.5 pb-6 shadow-xl border border-stone-200 transition-all ${
                      isDeveloping ? 'animate-develop' : ''
                    }`}
                  >
                    {/* Sticker preview */}
                    {sticker === 'tape' && (
                      <div className="absolute -top-2 left-6 z-10 h-4 w-14 -rotate-6 bg-amber-100/90 border-t border-b border-amber-200 shadow-xs" />
                    )}
                    {sticker === 'heart' && (
                      <span className="absolute top-2 right-2 z-10 text-xl">💖</span>
                    )}
                    {sticker === 'sparkle' && (
                      <span className="absolute top-2 right-2 z-10 text-xl">✨</span>
                    )}
                    {sticker === 'cupid' && (
                      <span className="absolute top-2 right-2 z-10 text-xl">🏹</span>
                    )}
                    {sticker === 'person' && (
                      <span className="absolute top-2 right-2 z-10 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-bold text-rose-600 shadow-xs">
                        MY PERSON
                      </span>
                    )}

                    <div className="aspect-square w-full overflow-hidden rounded-md bg-stone-100">
                      <img
                        src={previewImage}
                        alt="Preview"
                        style={{ filter: getFilterStyle(filter) }}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="mt-3">
                      <p className="font-handwriting text-lg text-stone-800">
                        {caption.trim() || 'Caption will appear here...'}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        Today • by {activePartner.name}
                      </p>
                    </div>
                  </div>

                  {/* Change photo button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline"
                    >
                      Choose a different photo
                    </button>
                  </div>

                  {/* Caption Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Polaroid Caption</label>
                    <input
                      type="text"
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      placeholder="Write a sweet memory caption..."
                      className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-rose-400 focus:outline-none"
                    />
                  </div>

                  {/* Filters Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">CSS Vintage Filter</label>
                    <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1">
                      {[
                        { id: 'normal' as SnapFilter, label: 'Normal' },
                        { id: 'vintage' as SnapFilter, label: 'Vintage 35mm' },
                        { id: 'warm' as SnapFilter, label: 'Warm Sun' },
                        { id: 'bw' as SnapFilter, label: 'B&W Noir' },
                        { id: 'pastel' as SnapFilter, label: 'Pastel Glow' },
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            sound.playSoftChime();
                            setFilter(f.id);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            filter === f.id
                              ? 'bg-rose-500 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stickers Selector */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600">Overlay Sticker</label>
                    <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1">
                      {[
                        { id: 'none' as SnapSticker, label: 'None' },
                        { id: 'tape' as SnapSticker, label: 'Washi Tape' },
                        { id: 'heart' as SnapSticker, label: 'Love Heart 💖' },
                        { id: 'sparkle' as SnapSticker, label: 'Sparkles ✨' },
                        { id: 'cupid' as SnapSticker, label: 'Cupid 🏹' },
                        { id: 'person' as SnapSticker, label: 'My Person' },
                      ].map(s => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            sound.playSoftChime();
                            setSticker(s.id);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                            sticker === s.id
                              ? 'bg-stone-800 text-white shadow-xs'
                              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Save & Pin Action */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isPinningSequence}
                      onClick={handleSaveSnap}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 text-xs font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
                    >
                      <Pin className="h-4 w-4" />
                      {isPinningSequence ? 'Pinning to Corkboard...' : 'Develop & Pin to Corkboard 📌'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MEMORY LANE SLIDESHOW MODAL */}
      {isMemoryLane && snaps.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/95 p-4 sm:p-8 backdrop-blur-xl">
          {/* Top Bar */}
          <div className="flex w-full max-w-xl items-center justify-between text-white/80">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <div>
                <span className="font-serif-title text-sm font-semibold tracking-wide">
                  Memory Lane
                </span>
                <span className="ml-2 text-xs text-white/50">
                  {memoryIndex + 1} of {snaps.length}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMusic}
                title="Toggle peaceful chime music"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  isMusicOn ? 'bg-rose-500 text-white' : 'bg-white/20 text-white/60'
                }`}
              >
                {isMusicOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              <button
                onClick={() => {
                  sound.stopMemoryLaneMelody();
                  setIsMusicOn(false);
                  setIsMemoryLane(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Current Polaroid in Memory Lane */}
          <div className="my-auto flex flex-col items-center justify-center">
            {snaps[memoryIndex] && (
              <div className="relative max-w-sm rounded-2xl bg-white p-4 pb-6 shadow-2xl transition-all duration-700 animate-develop">
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-stone-100">
                  <img
                    src={snaps[memoryIndex].imageUrl}
                    alt={snaps[memoryIndex].caption}
                    style={{ filter: getFilterStyle(snaps[memoryIndex].filter) }}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-4 text-center">
                  <p className="font-handwriting text-2xl text-stone-800">
                    {snaps[memoryIndex].caption}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    Snapped by {snaps[memoryIndex].senderName} •{' '}
                    {new Date(snaps[memoryIndex].timestamp).toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Slideshow Nav Controls */}
          <div className="flex items-center space-x-4 pb-4">
            <button
              onClick={() => setMemoryIndex((memoryIndex - 1 + snaps.length) % snaps.length)}
              className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30"
            >
              Previous
            </button>
            <div className="flex space-x-1.5">
              {snaps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMemoryIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === memoryIndex ? 'w-6 bg-rose-400' : 'w-2 bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setMemoryIndex((memoryIndex + 1) % snaps.length)}
              className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* UNPINNED MOMENTS ARCHIVE MODAL */}
      {showUnpinnedArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-amber-700" />
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-stone-800">
                    Unpinned Moments Archive
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {unpinnedSnaps.length} moments safely preserved off the board
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUnpinnedArchive(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Keyword Search Bar */}
            <div className="my-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <input
                type="text"
                value={archiveSearch}
                onChange={e => setArchiveSearch(e.target.value)}
                placeholder="Search unpinned snaps by caption or sender..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {filteredArchive.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  {archiveSearch
                    ? 'No unpinned moments match your search.'
                    : 'No unpinned moments in archive. You can click the pin icon on any polaroid on your corkboard to unpin it! 📌'}
                </div>
              ) : (
                filteredArchive.map(snap => (
                  <div
                    key={snap.id}
                    className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/70 p-3 shadow-xs hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white shadow-sm bg-stone-200">
                        <img
                          src={snap.imageUrl}
                          alt={snap.caption}
                          style={{ filter: getFilterStyle(snap.filter) }}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-handwriting text-lg text-stone-800 leading-snug line-clamp-1">
                          {snap.caption}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          by {snap.senderName} •{' '}
                          {new Date(snap.timestamp).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleRepinSnap(snap.id)}
                        className="flex items-center space-x-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-600 active:scale-95 transition-all"
                      >
                        <Pin className="h-3 w-3 fill-current rotate-45" />
                        <span>Repin</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSoftChime();
                          onDeleteSnap(snap.id);
                          onShowToast('Photo deleted from archive 🗑️');
                        }}
                        className="p-1 text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete permanently"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
