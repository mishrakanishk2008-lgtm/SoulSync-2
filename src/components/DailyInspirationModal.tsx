import React, { useState } from 'react';
import { X, Sparkles, Check, Flame, Music } from 'lucide-react';
import { InspirationBlockInfo } from '../types';
import { sound } from '../utils/audio';

interface DailyInspirationModalProps {
  blockInfo: InspirationBlockInfo;
  currentBackgroundGradient: string | null | undefined;
  onSetBackground: (gradient: string, id: string) => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function DailyInspirationModal({
  blockInfo,
  currentBackgroundGradient,
  onSetBackground,
  onClose,
  onShowToast,
}: DailyInspirationModalProps) {
  const [selectedTrack, setSelectedTrack] = useState<'taylor' | 'ronaldo'>('taylor');
  const track = selectedTrack === 'taylor' ? blockInfo.taylor : blockInfo.ronaldo;
  const isApplied = currentBackgroundGradient === track.gradient;

  const handleApply = () => {
    sound.playHeartReaction();
    onSetBackground(track.gradient, track.id);
    onShowToast(`Applied ${track.themeName} as app wallpaper! ✨`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col rounded-3xl border border-rose-200/50 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif-title text-lg font-bold text-stone-800">
                Daily Inspiration
              </h2>
              <p className="text-[11px] text-stone-500">Curated couple reflections & aesthetic wallpapers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Track Toggle */}
        <div className="p-4 pb-2">
          <div className="flex rounded-2xl bg-stone-100/80 p-1 text-xs">
            <button
              onClick={() => {
                sound.playSoftChime();
                setSelectedTrack('taylor');
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-medium transition-all ${
                selectedTrack === 'taylor'
                  ? 'bg-white text-rose-600 shadow-sm font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Music className="h-3.5 w-3.5" />
              <span>Taylor Swift Track</span>
            </button>
            <button
              onClick={() => {
                sound.playSoftChime();
                setSelectedTrack('ronaldo');
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-medium transition-all ${
                selectedTrack === 'ronaldo'
                  ? 'bg-white text-amber-700 shadow-sm font-semibold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Cristiano Ronaldo Track</span>
            </button>
          </div>
        </div>

        {/* Inspiration Card & Wallpaper Preview */}
        <div className="flex-1 overflow-y-auto p-5 pt-2">
          <div
            className="relative flex min-h-[300px] flex-col justify-between rounded-3xl p-6 shadow-lg transition-all duration-300"
            style={{
              background: track.gradient,
              color: track.textColor,
            }}
          >
            {/* Aesthetic graphic overlay accent */}
            <div className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top pill badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                {track.accentBadge}
              </span>
              <span className="text-[11px] font-medium opacity-80">
                {selectedTrack === 'taylor' ? 'Poetic Romance' : 'Relentless Drive'}
              </span>
            </div>

            {/* Quote Body */}
            <div className="relative z-10 my-6">
              <span className="font-serif-title text-4xl leading-none opacity-40">“</span>
              <p className="font-serif-title text-xl font-medium leading-relaxed tracking-wide sm:text-2xl">
                {track.quote}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider opacity-90">
                — {track.attribution}
              </p>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 rounded-2xl bg-black/15 p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Theme: {track.themeName}</span>
                <span className="text-[10px] opacity-75">Curated Wallpaper</span>
              </div>
              <p className="mt-1 text-[11px] opacity-85 leading-snug">
                {track.description}
              </p>
            </div>
          </div>

          {/* Action Button: Set as App Background */}
          <div className="mt-5 space-y-2">
            <button
              onClick={handleApply}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-semibold shadow-md transition-all active:scale-98 ${
                isApplied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-white hover:bg-stone-900'
              }`}
            >
              {isApplied ? (
                <>
                  <Check className="h-4 w-4" />
                  Currently Applied as App Background
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Set as App Background
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-stone-400">
              Apply this themed gradient as your SoulSync backdrop. You can reset anytime in Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
