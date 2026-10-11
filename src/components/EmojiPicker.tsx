import React, { useState, useMemo } from 'react';
import { Search, X, Clock, Heart } from 'lucide-react';
import {
  EMOJI_CATEGORIES,
  PINNED_LOVE_SHORTCUTS,
  getRecentEmojis,
  saveRecentEmoji,
} from '../utils/emojis';
import { sound } from '../utils/audio';

interface EmojiPickerProps {
  partnerId: string;
  onSelectEmoji: (emoji: string) => void;
  onClose?: () => void;
  title?: string;
  className?: string;
}

export function EmojiPicker({
  partnerId,
  onSelectEmoji,
  onClose,
  title = 'Pick an Emoji',
  className = '',
}: EmojiPickerProps) {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(() => getRecentEmojis(partnerId));

  const handlePick = (emoji: string) => {
    sound.playSoftChime();
    const updated = saveRecentEmoji(partnerId, emoji);
    setRecentEmojis(updated);
    onSelectEmoji(emoji);
  };

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      if (selectedCat === 'all') {
        return EMOJI_CATEGORIES;
      }
      return EMOJI_CATEGORIES.filter(c => c.id === selectedCat);
    }

    const q = searchQuery.toLowerCase();
    return EMOJI_CATEGORIES.map(cat => ({
      ...cat,
      emojis: cat.emojis.filter(() => cat.name.toLowerCase().includes(q) || cat.id.includes(q)),
    })).filter(cat => cat.emojis.length > 0);
  }, [searchQuery, selectedCat]);

  return (
    <div
      className={`flex flex-col rounded-3xl border border-rose-100 bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
        <div className="flex items-center space-x-1.5">
          <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          <span className="font-serif-title text-xs font-bold text-stone-800">{title}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Pinned Love Shortcuts */}
      <div className="pt-2 pb-1.5">
        <div className="flex items-center justify-between text-[10px] font-semibold text-rose-600 mb-1">
          <span className="flex items-center gap-1">
            <span>Couples Favorites</span>
            <span className="text-[10px]">✨</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl bg-rose-50/70 p-1.5">
          {PINNED_LOVE_SHORTCUTS.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => handlePick(emoji)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-lg transition-transform hover:scale-125 active:scale-95 hover:bg-white/80"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Used Row */}
      {recentEmojis.length > 0 && !searchQuery && (
        <div className="py-1">
          <div className="flex items-center gap-1 text-[10px] font-medium text-stone-400 mb-1">
            <Clock className="h-3 w-3" />
            <span>Recently Used</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {recentEmojis.slice(0, 10).map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => handlePick(emoji)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base transition-transform hover:scale-120 active:scale-95 hover:bg-stone-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative my-1.5">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search emoji or category..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-7 pr-3 py-1 text-xs text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:bg-white focus:outline-none"
        />
      </div>

      {/* Category Pills */}
      {!searchQuery && (
        <div className="flex items-center gap-1 overflow-x-auto py-1 text-[11px] border-b border-stone-100 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className={`shrink-0 rounded-lg px-2 py-0.5 font-medium transition-colors ${
              selectedCat === 'all'
                ? 'bg-stone-800 text-white font-semibold'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {EMOJI_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCat(cat.id)}
              className={`flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 font-medium transition-colors ${
                selectedCat === cat.id
                  ? 'bg-rose-500 text-white font-semibold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Emojis Grid Area */}
      <div className="max-h-48 flex-1 overflow-y-auto pt-2 space-y-2 pr-0.5">
        {filteredCategories.length === 0 ? (
          <p className="py-6 text-center text-xs text-stone-400">No matching emojis found.</p>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.id}>
              {selectedCat === 'all' && !searchQuery && (
                <div className="mb-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                  {cat.icon} {cat.name}
                </div>
              )}
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                {cat.emojis.map((emoji, i) => (
                  <button
                    key={`${cat.id}-${emoji}-${i}`}
                    type="button"
                    onClick={() => handlePick(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-lg transition-transform hover:scale-130 hover:bg-rose-50 active:scale-95"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
