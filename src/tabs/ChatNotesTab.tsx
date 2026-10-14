import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Pin,
  Plus,
  Search,
  Archive,
  Send,
  Heart,
  Smile,
  X,
  Sparkles,
  Calendar,
  Check,
  ChevronDown,
  Paperclip,
  Camera,
  Film,
  AlertCircle,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import {
  LoveNote,
  ChatMessage,
  PartnerProfile,
  NoteColor,
  Milestone,
  ChatMediaAttachment,
} from '../types';
import { sound } from '../utils/audio';
import { EmojiPicker } from '../components/EmojiPicker';
import { storage } from '../utils/storage';
import { compressImageToDataUrl } from '../utils/image';
import { QUICK_REACTION_EMOJIS, saveRecentEmoji } from '../utils/emojis';

interface ChatNotesTabProps {
  notes: LoveNote[];
  messages: ChatMessage[];
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  milestones: Milestone[];
  anniversaryDate: string;
  onAddNote: (note: Omit<LoveNote, 'id' | 'timestamp' | 'reactions'>) => void;
  onTogglePin: (noteId: string) => void;
  onReactNote: (noteId: string, emoji: string) => void;
  onDeleteNote: (noteId: string) => void;
  onSendMessage: (text: string, sticker?: string, media?: ChatMediaAttachment) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  onSaveChatImageToSnaps?: (imageUrl: string, caption?: string) => void;
  onShowToast: (msg: string) => void;
}

const NOTE_COLORS: { id: NoteColor; label: string; bg: string; border: string; text: string; pinCol: string }[] = [
  { id: 'yellow', label: 'Buttercup', bg: 'bg-[#fef9c3]', border: 'border-[#fde047]', text: 'text-amber-950', pinCol: '#eab308' },
  { id: 'pink', label: 'Blush Pink', bg: 'bg-[#fce7f3]', border: 'border-[#fbcfe8]', text: 'text-pink-950', pinCol: '#f43f5e' },
  { id: 'mint', label: 'Sage Mint', bg: 'bg-[#dcfce7]', border: 'border-[#bbf7d0]', text: 'text-emerald-950', pinCol: '#10b981' },
  { id: 'lavender', label: 'Soft Lavender', bg: 'bg-[#f3e8ff]', border: 'border-[#e9d5ff]', text: 'text-purple-950', pinCol: '#a855f7' },
];

export function ChatNotesTab({
  notes,
  messages,
  partners,
  activePartnerId,
  milestones,
  anniversaryDate,
  onAddNote,
  onTogglePin,
  onReactNote,
  onDeleteNote,
  onSendMessage,
  onReactMessage,
  onSaveChatImageToSnaps,
  onShowToast,
}: ChatNotesTabProps) {
  const activePartner = partners.find(p => p.id === activePartnerId) || partners[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveSearch, setArchiveSearch] = useState('');

  // New Note state
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<NoteColor>('yellow');
  const [isPinnedByDefault, setIsPinnedByDefault] = useState(true);

  // Chat message & media state
  const [messageText, setMessageText] = useState('');
  const [attachedMedia, setAttachedMedia] = useState<ChatMediaAttachment | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeReactMessageId, setActiveReactMessageId] = useState<string | null>(null);
  const [fullPickerReactMessageId, setFullPickerReactMessageId] = useState<string | null>(null);
  const [expandedMediaUrl, setExpandedMediaUrl] = useState<string | null>(null);

  // GIF Picker state (KLIPY)
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState('');
  const [gifResults, setGifResults] = useState<{ id: string | number; url: string; previewUrl: string; title: string }[]>([]);
  const [isSearchingGifs, setIsSearchingGifs] = useState(false);
  const [gifError, setGifError] = useState<string | null>(null);

  const KLIPY_API_KEY = 'S2UrE7XDqeTlWzkJicJju1aGNw9WBwAl7jp4pqo11kzKUbHMU2Axj0PtgcI0o807';

  // FETCH GIFS FROM KLIPY (Trending by default, or keyword search)
  useEffect(() => {
    if (!showGifPicker) return;

    let active = true;
    const delayDebounce = setTimeout(async () => {
      setIsSearchingGifs(true);
      setGifError(null);
      try {
        const queryTerm = gifSearchQuery.trim();
        const endpoint = queryTerm
          ? `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/search?q=${encodeURIComponent(queryTerm)}&limit=24`
          : `https://api.klipy.com/api/v1/${KLIPY_API_KEY}/gifs/trending?limit=24`;

        const res = await fetch(endpoint);
        if (!res.ok) {
          throw new Error(`KLIPY API returned status ${res.status}`);
        }
        const json = await res.json();
        if (!active) return;

        const items: any[] = Array.isArray(json?.data?.data)
          ? json.data.data
          : Array.isArray(json?.data)
          ? json.data
          : [];

        const parsedGifs = items
          .map((item: any) => {
            const fullUrl =
              item.file?.md?.gif?.url ||
              item.file?.hd?.gif?.url ||
              item.file?.sm?.gif?.url ||
              item.file?.xs?.gif?.url ||
              '';
            const previewUrl =
              item.file?.sm?.gif?.url ||
              item.file?.xs?.gif?.url ||
              item.file?.md?.gif?.url ||
              fullUrl;
            return {
              id: item.id || fullUrl,
              url: fullUrl,
              previewUrl,
              title: item.title || 'GIF',
            };
          })
          .filter((g) => Boolean(g.url));

        setGifResults(parsedGifs);
        setGifError(null);
      } catch (err) {
        console.warn('KLIPY GIF fetch notice:', err);
        if (active) {
          setGifError('GIFs are unavailable right now, try the 📎 button instead');
          setGifResults([]);
        }
      } finally {
        if (active) setIsSearchingGifs(false);
      }
    }, gifSearchQuery ? 350 : 50);

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [showGifPicker, gifSearchQuery]);

  // Check if today matches anniversary or milestone
  const anniversaryBanner = useMemo(() => {
    const today = new Date();
    const todayMonthDay = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (anniversaryDate && anniversaryDate.slice(5) === todayMonthDay) {
      return '🎉 Happy Anniversary today! Cherishing every single second with you!';
    }

    for (const m of milestones) {
      if (m.date.startsWith(today.toISOString().split('T')[0])) {
        return `✨ Today's Special Milestone: ${m.title}! Celebrating us!`;
      }
    }
    return null;
  }, [milestones, anniversaryDate]);

  const pinnedNotes = notes.filter(n => n.pinned);
  const unpinnedNotes = notes.filter(n => !n.pinned);

  const filteredArchive = unpinnedNotes.filter(n =>
    n.text.toLowerCase().includes(archiveSearch.toLowerCase()) ||
    n.senderName.toLowerCase().includes(archiveSearch.toLowerCase())
  );

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    sound.playPinWindchime();
    onAddNote({
      text: newNoteText.trim(),
      color: newNoteColor,
      pinned: isPinnedByDefault,
      senderId: activePartner.id,
      senderName: activePartner.name,
    });

    setNewNoteText('');
    setShowAddNoteModal(false);
    onShowToast('Love note posted to board! 📌');
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const isVideo = file.type.startsWith('video/');
    const isGifOrWebp =
      file.type === 'image/gif' ||
      file.type === 'image/webp' ||
      fileNameLower.endsWith('.gif') ||
      fileNameLower.endsWith('.webp');
    const isImage = file.type.startsWith('image/') || isGifOrWebp;

    if (!isImage && !isVideo) {
      onShowToast('Please select a photo, GIF, or video 💕');
      if (e.target) e.target.value = '';
      return;
    }

    // Video handling
    if (isVideo) {
      if (file.size > 700 * 1024) {
        onShowToast("Videos this large can't be sent. Try a shorter clip 💕");
        if (e.target) e.target.value = '';
        return;
      }
      setIsUploadingMedia(true);
      onShowToast('Processing video clip... 🎥');
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        setIsUploadingMedia(false);
        if (base64 && base64.length * 0.75 <= 800 * 1024) {
          setAttachedMedia({
            type: 'video',
            url: base64,
            fileName: file.name,
            fileSize: file.size,
          });
          sound.playSoftChime();
          onShowToast('Video ready to send! 🎥✨');
        } else {
          onShowToast("Videos this large can't be sent. Try a shorter clip 💕");
        }
        if (e.target) e.target.value = '';
      };
      reader.onerror = () => {
        setIsUploadingMedia(false);
        onShowToast('Failed to load video file ❌');
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(file);
      return;
    }

    // GIF files uploaded with 📎:
    // Don't resize or convert to JPEG (preserves animation). Accept .gif and .webp.
    // Accept up to 700 KB and store as Base64 in message document.
    if (isGifOrWebp) {
      if (file.size > 700 * 1024) {
        onShowToast('This GIF is too big (max ~700 KB). Try a smaller one 💕');
        if (e.target) e.target.value = '';
        return;
      }

      setIsUploadingMedia(true);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = evt.target?.result as string;
        setIsUploadingMedia(false);
        if (base64) {
          setAttachedMedia({
            type: 'gif',
            url: base64,
            fileName: file.name,
            fileSize: file.size,
          });
          sound.playSoftChime();
          onShowToast('GIF ready to send! 🎬✨');
        } else {
          onShowToast('Could not read GIF file. Try again 💕');
        }
        if (e.target) e.target.value = '';
      };
      reader.onerror = () => {
        setIsUploadingMedia(false);
        onShowToast('Could not read GIF file. Try again 💕');
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(file);
      return;
    }

    // Ordinary photos (jpg, png) -> compress to JPEG as before
    setIsUploadingMedia(true);
    onShowToast('Compressing image & optimizing for doc size... 📸');

    try {
      const dataUrl = await compressImageToDataUrl(file);
      setAttachedMedia({
        type: 'image',
        url: dataUrl,
        fileName: file.name,
        fileSize: file.size,
      });

      sound.playSoftChime();
      onShowToast('Photo compressed & ready! 📸✨');
    } catch (err: any) {
      console.error('Image compression failed:', err);
      onShowToast(err.message || 'Image compression failed. Try a smaller image 💕');
    } finally {
      setIsUploadingMedia(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedMedia) return;

    sound.playSoftChime();
    onSendMessage(messageText.trim(), undefined, attachedMedia || undefined);
    setMessageText('');
    setAttachedMedia(null);
    setMediaWarning(null);
    setShowEmojiPicker(false);
  };

  const handleMessageReaction = (msgId: string, emoji: string) => {
    sound.playHeartReaction();
    saveRecentEmoji(activePartner.id, emoji);
    if (onReactMessage) {
      onReactMessage(msgId, emoji);
    }
    setActiveReactMessageId(null);
    setFullPickerReactMessageId(null);
  };

  const handleSaveToSnaps = (url: string, captionText?: string) => {
    sound.playPinWindchime();
    if (onSaveChatImageToSnaps) {
      onSaveChatImageToSnaps(url, captionText);
    }
  };

  const getNoteStyle = (col: NoteColor) => {
    return NOTE_COLORS.find(c => c.id === col) || NOTE_COLORS[0];
  };

  const REACTION_LIST = ['❤️', '😍', '🥹', '🥰'];

  return (
    <div className="space-y-6 pb-24">
      {/* Special Anniversary Banner Note */}
      {anniversaryBanner && (
        <div className="relative overflow-hidden rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-100 via-rose-100 to-pink-100 p-4 shadow-md">
          <div className="flex items-center space-x-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-400/80 text-xl text-white shadow-sm">
              🥂
            </span>
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Today's Special Day
              </span>
              <p className="font-serif-title text-sm font-semibold text-stone-900 sm:text-base">
                {anniversaryBanner}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PINBOARD SECTION */}
      <section className="rounded-3xl border border-amber-200/60 bg-[#fbf7ed] p-4 shadow-sm sm:p-6 bg-softboard relative">
        {/* Pinboard Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/40">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-200/60 text-amber-800">
              <Pin className="h-4 w-4 fill-current rotate-45" />
            </div>
            <div>
              <h2 className="font-serif-title text-base font-bold text-stone-800 sm:text-lg">
                Pinned Love Board
              </h2>
              <p className="text-[11px] text-stone-500">
                Sticky thoughts, sweet notes & promises
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Archive button */}
            <button
              onClick={() => {
                sound.playSoftChime();
                setShowArchiveModal(true);
              }}
              title="View Unpinned Notes Archive"
              className="flex items-center space-x-1 rounded-xl border border-amber-300/80 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-white hover:text-stone-900"
            >
              <Archive className="h-3.5 w-3.5 text-amber-700" />
              <span className="hidden sm:inline">Archive</span>
              {unpinnedNotes.length > 0 && (
                <span className="rounded-full bg-amber-200/80 px-1.5 py-0.2 text-[10px] font-bold text-amber-800">
                  {unpinnedNotes.length}
                </span>
              )}
            </button>

            {/* Add note button */}
            <button
              onClick={() => {
                sound.playSoftChime();
                setShowAddNoteModal(true);
              }}
              className="flex items-center space-x-1 rounded-xl bg-stone-800 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-stone-900 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Post Note</span>
            </button>
          </div>
        </div>

        {/* Sticky Notes Grid */}
        {pinnedNotes.length === 0 ? (
          <div className="my-10 rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center">
            <Heart className="mx-auto h-8 w-8 text-amber-300" />
            <p className="mt-1 font-handwriting text-xl text-stone-600">
              No sticky notes on the board right now.
            </p>
            <p className="text-xs text-stone-400">
              Leave a sweet message or secret promise for your partner!
            </p>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="mt-3 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700"
            >
              Write First Note
            </button>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {pinnedNotes.map(note => {
              const style = getNoteStyle(note.color);
              const isSender = note.senderId === activePartner.id;

              return (
                <div
                  key={note.id}
                  className={`group relative rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${style.bg} ${style.border}`}
                >
                  {/* Decorative Pushpin Icon */}
                  <div className="absolute -top-2 left-6 z-10">
                    <Pin
                      className="h-4 w-4 filter drop-shadow-xs rotate-45"
                      style={{ color: style.pinCol, fill: style.pinCol }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500/80 mb-2">
                    <span className="font-semibold">{note.senderName}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playUnpinWindchime();
                          onTogglePin(note.id);
                          onShowToast('Note unpinned and sent to Archive 📦');
                        }}
                        className="rounded px-1.5 py-0.5 text-[10px] text-stone-500 hover:bg-black/5 cursor-pointer"
                        title="Unpin to Archive"
                      >
                        Unpin
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSoftChime();
                          onDeleteNote(note.id);
                          onShowToast('Love note deleted 🗑️');
                        }}
                        className="rounded p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className={`font-handwriting text-xl leading-relaxed whitespace-pre-wrap ${style.text}`}>
                    {note.text}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2">
                    {/* Active Reactions Pills */}
                    <div className="flex flex-wrap items-center gap-1">
                      {REACTION_LIST.map(em => {
                        const count = Number(note.reactions?.[em] || 0);
                        return (
                          <button
                            key={em}
                            onClick={() => {
                              sound.playHeartReaction();
                              onReactNote(note.id, em);
                            }}
                            className={`flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs transition-all ${
                              count > 0
                                ? 'bg-white/90 shadow-xs border border-black/10 scale-105 font-medium'
                                : 'bg-white/40 hover:bg-white/80 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <span>{em}</span>
                            {count > 0 && <span className="text-[10px]">{count}</span>}
                          </button>
                        );
                      })}
                    </div>

                    <span className="text-[10px] text-stone-400">
                      {new Date(note.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* PRIVATE STREAM / CHAT SECTION */}
      <section className="rounded-3xl border border-rose-100 bg-white/95 p-4 shadow-sm sm:p-6 backdrop-blur-sm">
        {/* Stream Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="font-serif-title text-base font-bold text-stone-800">
              Our Private Stream
            </h3>
            <p className="text-[11px] text-stone-500">
              Whispers, shared photos, cute clips & reactions between just the two of you
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs text-stone-500">
            <span>Writing as:</span>
            <span className="font-semibold text-stone-800">
              {activePartner.name} {activePartner.avatarEmoji}
            </span>
          </div>
        </div>

        {/* Message Feed */}
        <div className="my-4 max-h-[420px] space-y-3.5 overflow-y-auto px-1 py-2">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-xs text-stone-400">
              No messages yet today. Send a cute whisper, photo, or clip below! 💌
            </p>
          ) : (
            messages.map(msg => {
              const currentUser = storage.getCurrentUser();
              const matchedPartner = partners.find(
                p => p.id === msg.senderId || (msg.senderName && p.name.toLowerCase() === msg.senderName.toLowerCase())
              );
              const isMe = currentUser
                ? (msg.senderId === currentUser.userId || 
                   (currentUser.slotId && msg.senderId === currentUser.slotId) || 
                   (!msg.senderId && currentUser.name && msg.senderName && currentUser.name.toLowerCase() === msg.senderName.toLowerCase()))
                : (msg.senderId === activePartner.id || msg.senderName === activePartner.name);

              const senderName = msg.senderName || matchedPartner?.name || (isMe ? (currentUser?.name || activePartner.name) : 'Partner');
              const senderAvatar = msg.senderAvatar || matchedPartner?.avatarEmoji || (isMe ? (currentUser?.avatarEmoji || '🌸') : '🤍');
              const isReactingToMe = activeReactMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`group relative flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Floating Quick React Bar */}
                  {isReactingToMe && (
                    <div
                      className={`absolute -top-9 z-30 flex items-center gap-0.5 rounded-full border border-stone-200/90 bg-white px-2 py-1 shadow-lg backdrop-blur-md animate-pin-pop ${
                        isMe ? 'right-0' : 'left-0'
                      }`}
                    >
                      {QUICK_REACTION_EMOJIS.map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => handleMessageReaction(msg.id, em)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-base transition-transform hover:scale-130 active:scale-95 hover:bg-rose-50"
                          title={em}
                        >
                          {em}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReactMessageId(null);
                          setFullPickerReactMessageId(msg.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        title="More emojis"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReactMessageId(null)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-stone-300 hover:text-stone-600 ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    {!isMe && (
                      <span className="text-base mb-1 shrink-0" title={senderName}>
                        {senderAvatar}
                      </span>
                    )}

                    <div className="relative group/bubble flex flex-col">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isMe
                            ? 'rounded-br-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                            : 'rounded-bl-xs bg-purple-50 text-stone-900 border border-purple-200/80 shadow-xs'
                        }`}
                      >
                        {/* Sticker */}
                        {msg.sticker && (
                          <div className="text-3xl my-1">{msg.sticker}</div>
                        )}

                        {/* Inline Media Attachment */}
                        {msg.media && (
                          <div className="mb-2 space-y-1">
                            {msg.media.type === 'video' ? (
                              <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-black/95 shadow-sm max-w-xs sm:max-w-sm">
                                <video
                                  controls
                                  playsInline
                                  preload="metadata"
                                  className="max-h-60 w-full rounded-2xl object-contain"
                                  src={msg.media.url}
                                />
                              </div>
                            ) : (
                              <div className="relative group/media overflow-hidden rounded-2xl border border-black/5 bg-stone-100/90 shadow-xs max-w-xs sm:max-w-sm">
                                <img
                                  src={msg.media.url}
                                  alt={msg.text || 'Shared media'}
                                  onClick={() => setExpandedMediaUrl(msg.media?.url || null)}
                                  className="max-h-60 w-full cursor-pointer object-cover transition-transform duration-300 hover:scale-102"
                                  loading="lazy"
                                />

                                {msg.media.type === 'gif' && (
                                  <span className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white backdrop-blur-xs">
                                    GIF
                                  </span>
                                )}

                                {/* Save to Snaps button on image */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveToSnaps(msg.media!.url, msg.text);
                                  }}
                                  title="Save this photo directly to our corkboard scrapbook"
                                  className="absolute bottom-2 right-2 flex items-center gap-1 rounded-xl bg-white/90 px-2 py-1 text-[10px] font-semibold text-stone-800 shadow-md backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                                >
                                  <Camera className="h-3 w-3" />
                                  <span>Save to Snaps</span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Text / Caption */}
                        {msg.text && (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>

                      {/* Quick React Button On Bubble Hover */}
                      <button
                        type="button"
                        onClick={() => setActiveReactMessageId(isReactingToMe ? null : msg.id)}
                        className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-stone-400 shadow-sm border border-stone-200/60 opacity-0 group-hover/bubble:opacity-100 hover:bg-white hover:text-rose-500 transition-all ${
                          isMe ? '-left-7' : '-right-7'
                        }`}
                        title="React to message"
                      >
                        <Smile className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isMe && (
                      <span className="text-base mb-1 shrink-0" title={senderName}>
                        {senderAvatar}
                      </span>
                    )}
                  </div>

                  {/* Message Reactions Display */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className={`mt-1 flex flex-wrap gap-1 ${isMe ? 'justify-end pr-5' : 'justify-start pl-5'}`}>
                      {Object.entries(msg.reactions).map(([emoji, userIds]) => {
                        const ids = Array.isArray(userIds) ? userIds : userIds ? [userIds] : [];
                        if (ids.length === 0) return null;
                        const hasMyReaction = ids.includes(activePartner.id);
                        return (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleMessageReaction(msg.id, emoji)}
                            className={`flex items-center space-x-1 rounded-full border px-2 py-0.5 text-xs transition-all active:scale-95 ${
                              hasMyReaction
                                ? 'border-rose-300 bg-rose-50 text-rose-700 font-semibold shadow-xs'
                                : 'border-stone-200 bg-white text-stone-700 shadow-xs hover:border-stone-300'
                            }`}
                            title={`Reacted by: ${ids
                              .map((uid: string) => partners.find(p => p.id === uid)?.name || uid)
                              .join(', ')}`}
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px]">{ids.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Timestamp */}
                  <span className={`mt-1 px-1 text-[10px] text-stone-400 ${isMe ? 'pr-5' : 'pl-5'}`}>
                    {msg.senderName} •{' '}
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendChat} className="mt-3">
          {/* Uploading Media Indicator */}
          {isUploadingMedia && (
            <div className="mb-2 relative rounded-2xl border border-rose-100 bg-rose-50/50 p-2.5 shadow-2xs animate-pulse">
              <div className="flex items-center space-x-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-800">Uploading to secure cloud storage...</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Optimizing and securing your media file 💕</p>
                </div>
              </div>
            </div>
          )}

          {/* Attached Media Preview Bar */}
          {attachedMedia && (
            <div className="mb-2 relative rounded-2xl border border-rose-200 bg-rose-50/80 p-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  {attachedMedia.type === 'video' ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <Film className="h-6 w-6" />
                    </div>
                  ) : (
                    <img
                      src={attachedMedia.url}
                      alt="Attachment preview"
                      className="h-12 w-12 rounded-xl object-cover border border-white shadow-xs"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-rose-200/80 px-1.5 py-0.2 text-[9px] font-bold uppercase text-rose-800">
                        {attachedMedia.type}
                      </span>
                      <span className="text-xs font-medium text-stone-800 line-clamp-1 max-w-[180px]">
                        {attachedMedia.fileName || 'Attached media'}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      Add an optional caption below and press Send 💕
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAttachedMedia(null);
                    setMediaWarning(null);
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-stone-400 hover:bg-stone-200/80 hover:text-stone-700"
                  title="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {mediaWarning && (
                <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-100/90 px-2.5 py-1 text-[11px] text-amber-900 border border-amber-200">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                  <span>{mediaWarning}</span>
                </div>
              )}
            </div>
          )}

          {/* Full Emoji Picker Popover in Input */}
          {showEmojiPicker && (
            <div className="mb-2">
              <EmojiPicker
                partnerId={activePartner.id}
                onSelectEmoji={(em) => {
                  setMessageText(prev => prev + em);
                }}
                onClose={() => setShowEmojiPicker(false)}
                title="Expanded Emoji Picker"
              />
            </div>
          )}

          {/* GIF Picker Bottom Sheet Modal */}
          {showGifPicker && (
            <div
              className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/60 backdrop-blur-xs"
              onClick={() => setShowGifPicker(false)}
            >
              <div
                className="w-full max-w-lg mx-auto max-h-[70dvh] h-[70dvh] rounded-t-3xl bg-white shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 shrink-0 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎬</span>
                    <h3 className="font-serif-title text-sm font-bold text-stone-800">
                      {gifSearchQuery.trim() ? 'Search GIFs' : 'Trending GIFs 🔥'}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGifPicker(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Search & Suggestions */}
                <div className="p-3 border-b border-stone-100 bg-stone-50 shrink-0 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      value={gifSearchQuery}
                      onChange={e => setGifSearchQuery(e.target.value)}
                      placeholder="Search GIFs (e.g. hug, kiss, cute)..."
                      className="w-full rounded-xl border border-stone-200 bg-white pl-9 pr-8 py-2 text-xs text-stone-800 focus:border-rose-400 focus:outline-none"
                      autoFocus
                    />
                    {gifSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setGifSearchQuery('')}
                        className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    {['🔥 Trending', 'Hug', 'Kiss', 'Love', 'Cute', 'Miss you', 'Heart'].map(tag => {
                      const isTrendingTag = tag === '🔥 Trending';
                      const activeTag = isTrendingTag ? !gifSearchQuery.trim() : gifSearchQuery.trim().toLowerCase() === tag.toLowerCase();
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isTrendingTag) setGifSearchQuery('');
                            else setGifSearchQuery(tag);
                          }}
                          className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer shrink-0 border ${
                            activeTag
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white border-stone-200 text-stone-600 hover:bg-rose-50'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results Grid */}
                <div className="flex-1 overflow-y-auto p-3">
                  {isSearchingGifs ? (
                    <div className="flex h-40 flex-col items-center justify-center space-y-2 text-stone-400">
                      <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
                      <p className="text-xs font-bold">Finding sweet GIFs...</p>
                    </div>
                  ) : gifError ? (
                    <div className="flex h-40 flex-col items-center justify-center p-4 text-center space-y-2">
                      <AlertCircle className="h-6 w-6 text-amber-500" />
                      <p className="text-xs font-medium text-stone-700">{gifError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowGifPicker(false);
                          fileInputRef.current?.click();
                        }}
                        className="mt-2 rounded-xl bg-rose-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-600 cursor-pointer"
                      >
                        Use 📎 button instead
                      </button>
                    </div>
                  ) : gifResults.length === 0 ? (
                    <div className="flex h-40 flex-col items-center justify-center text-stone-400">
                      <p className="text-xs">No GIFs found. Try another sweet search! 💌</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {gifResults.map(gif => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => {
                            sound.playHeartReaction();
                            const caption = messageText.trim();
                            onSendMessage(caption, undefined, {
                              type: 'gif',
                              url: gif.url,
                              fileName: 'klipy.gif',
                              fileSize: 0,
                            });
                            setMessageText('');
                            setShowGifPicker(false);
                            onShowToast('Sent sweet GIF! 🎬💕');
                          }}
                          className="relative overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 hover:border-rose-400 hover:scale-[1.02] transition-all active:scale-95 group cursor-pointer aspect-video sm:aspect-4/3"
                          title={gif.title || 'Send GIF'}
                        >
                          <img
                            src={gif.previewUrl}
                            alt={gif.title || 'GIF'}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Emoji Picker Bottom Sheet Modal */}
          {showEmojiPicker && (
            <div
              className="fixed inset-0 z-50 flex flex-col justify-end bg-stone-950/60 backdrop-blur-xs"
              onClick={() => setShowEmojiPicker(false)}
            >
              <div
                className="w-full max-w-lg mx-auto max-h-[70dvh] h-[70dvh] rounded-t-3xl bg-white shadow-2xl flex flex-col pb-[env(safe-area-inset-bottom)] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3 shrink-0 bg-white">
                  <div className="flex items-center gap-2">
                    <span className="text-base">😊</span>
                    <h3 className="font-serif-title text-sm font-bold text-stone-800">
                      Pick an Emoji
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <EmojiPicker
                    partnerId={storage.getCurrentUser()?.userId || 'device'}
                    onSelectEmoji={(em) => {
                      setMessageText(prev => prev + em);
                    }}
                    title=""
                    className="h-full border-0 shadow-none rounded-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-stone-200 bg-stone-50/80 p-1.5 focus-within:border-rose-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-rose-200/50 transition-all">
            {/* Media attachment button (📎) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.gif,.webp,video/mp4,video/quicktime,video/webm"
              onChange={handleMediaSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-colors"
              title="Attach photo, gif, or video (📎)"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Emoji picker button (😊) */}
            <button
              type="button"
              onClick={() => {
                sound.playSoftChime();
                setShowEmojiPicker(!showEmojiPicker);
                setShowGifPicker(false);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                showEmojiPicker
                  ? 'bg-rose-100 text-rose-600 font-bold'
                  : 'text-stone-400 hover:bg-stone-200/60 hover:text-stone-700'
              }`}
              title="Open full emoji picker (😊)"
            >
              <Smile className="h-4 w-4" />
            </button>

            {/* GIF Selector Button */}
            <button
              type="button"
              onClick={() => {
                sound.playSoftChime();
                setShowGifPicker(!showGifPicker);
                setShowEmojiPicker(false);
              }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-black transition-colors cursor-pointer ${
                showGifPicker
                  ? 'bg-rose-100 text-rose-600 font-black'
                  : 'text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 font-black'
              }`}
              title="Search and send GIFs"
            >
              GIF
            </button>

            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder={attachedMedia ? 'Add an optional caption...' : 'Send a sweet thought...'}
              className="flex-1 bg-transparent px-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!messageText.trim() && !attachedMedia}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 text-white shadow-sm transition-all hover:bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-500 active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      {/* FULL EMOJI PICKER MODAL FOR MESSAGE REACTION */}
      {fullPickerReactMessageId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <EmojiPicker
              partnerId={activePartner.id}
              onSelectEmoji={(em) => {
                handleMessageReaction(fullPickerReactMessageId, em);
              }}
              onClose={() => setFullPickerReactMessageId(null)}
              title="React to Message"
            />
          </div>
        </div>
      )}

      {/* EXPANDED FULL-SIZE MEDIA MODAL */}
      {expandedMediaUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 p-4 backdrop-blur-md"
          onClick={() => setExpandedMediaUrl(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl bg-black/40 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveToSnaps(expandedMediaUrl)}
                className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-lg hover:bg-rose-500 hover:text-white transition-all backdrop-blur-md"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Save to Snaps</span>
              </button>
              <button
                type="button"
                onClick={() => setExpandedMediaUrl(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-stone-800 hover:bg-white shadow-lg transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={expandedMediaUrl}
              alt="Expanded media"
              className="max-h-[85vh] w-auto max-w-full rounded-3xl object-contain"
            />
          </div>
        </div>
      )}

      {/* ADD NOTE MODAL */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif-title text-lg font-bold text-stone-800">
                Write a Sticky Love Note 💌
              </h3>
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-600">
                  Pick Paper Color
                </label>
                <div className="mt-1.5 grid grid-cols-4 gap-2">
                  {NOTE_COLORS.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewNoteColor(c.id)}
                      className={`flex h-10 items-center justify-center rounded-xl border font-medium text-xs transition-all ${
                        c.bg
                      } ${c.border} ${c.text} ${
                        newNoteColor === c.id ? 'ring-2 ring-stone-800 scale-102 font-bold' : 'opacity-80'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600">
                  Your Note
                </label>
                <textarea
                  value={newNoteText}
                  onChange={e => setNewNoteText(e.target.value)}
                  placeholder="Leave a sweet reminder, romantic appreciation, or future promise..."
                  rows={4}
                  className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 p-3 font-handwriting text-xl text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPinnedByDefault}
                    onChange={e => setIsPinnedByDefault(e.target.checked)}
                    className="rounded border-stone-300 text-rose-500 focus:ring-rose-400"
                  />
                  <span>Pin to active Love Board immediately</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-stone-500 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="rounded-xl bg-stone-800 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-stone-900 disabled:opacity-40"
                >
                  Post Note 📌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ARCHIVE MODAL */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <Archive className="h-5 w-5 text-amber-700" />
                <h3 className="font-serif-title text-lg font-bold text-stone-800">
                  Notes Archive
                </h3>
              </div>
              <button
                onClick={() => setShowArchiveModal(false)}
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
                placeholder="Search past notes by keyword or sender..."
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 pl-9 pr-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
              />
            </div>

            {/* List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {filteredArchive.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  {archiveSearch ? 'No notes match your search.' : 'No archived notes yet.'}
                </div>
              ) : (
                filteredArchive.map(note => {
                  const style = getNoteStyle(note.color);
                  return (
                    <div
                      key={note.id}
                      className={`rounded-2xl border p-3 shadow-xs ${style.bg} ${style.border}`}
                    >
                      <div className="flex items-center justify-between text-[11px] text-stone-500">
                        <span className="font-semibold">{note.senderName}</span>
                        <div className="flex items-center space-x-2">
                          <span>
                            {new Date(note.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <button
                            onClick={() => {
                              sound.playPinWindchime();
                              onTogglePin(note.id);
                              onShowToast('Pinned back to board! 📌');
                            }}
                            className="rounded bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-stone-700 shadow-2xs hover:bg-white"
                          >
                            Repin
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              sound.playSoftChime();
                              onDeleteNote(note.id);
                              onShowToast('Archived note deleted 🗑️');
                            }}
                            className="p-1 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className={`mt-2 font-handwriting text-lg ${style.text}`}>
                        {note.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
