import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Trash2, Volume2, Clock } from 'lucide-react';
import { DateVoiceMemo, PartnerProfile } from '../types';
import { sound } from '../utils/audio';

interface DateVoiceMemoPlayerProps {
  memo: DateVoiceMemo;
  partners: PartnerProfile[];
  onDelete?: (id: string) => void;
  canDelete?: boolean;
}

export function DateVoiceMemoPlayer({
  memo,
  partners,
  onDelete,
  canDelete = true,
}: DateVoiceMemoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(memo.durationSeconds || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const partner = partners.find(p => p.id === memo.partnerId) || {
    name: memo.recordedBy || 'Partner',
    avatarEmoji: memo.partnerId === 'p1' ? '🌸' : '☕',
  };

  useEffect(() => {
    const audio = new Audio(memo.audioDataUrl);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [memo.audioDataUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      sound.playSoftChime();
      audioRef.current.play().catch(err => {
        console.error('Audio playback error:', err);
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec || 0);
    const m = Math.floor(s / 60);
    const remainder = s % 60;
    return `${m}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="rounded-2xl border border-rose-200/90 bg-white/95 p-3 shadow-2xs transition-all hover:border-rose-300">
      {/* Header: Partner + Timestamp */}
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center space-x-1.5">
          <span className="text-base">{partner.avatarEmoji}</span>
          <span className="font-bold text-stone-800">{partner.name}’s Voice Note</span>
          <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-700">
            🎙️ {formatSeconds(duration)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-stone-400">
            {new Date(memo.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(memo.id)}
              className="text-stone-300 hover:text-rose-500 transition-colors p-0.5 rounded-md"
              title="Delete voice memo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Caption if provided */}
      {memo.caption && (
        <p className="mb-2 text-xs italic text-stone-600 bg-rose-50/60 px-2.5 py-1 rounded-xl border border-rose-100/60">
          “{memo.caption}”
        </p>
      )}

      {/* Player Bar with Play button and Waveform Bars */}
      <div className="flex items-center space-x-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
        </button>

        {/* Dynamic Waveform Visualizer + Scrubber */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 h-5 mb-1 px-1">
            {[40, 70, 30, 85, 60, 95, 45, 80, 65, 90, 50, 75, 35, 85, 60, 100, 45, 70, 55, 90].map((h, idx) => {
              const barProgress = (idx / 20) * 100;
              const isPassed = barProgress <= progressPercent;
              return (
                <div
                  key={idx}
                  style={{ height: `${h}%` }}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPassed ? 'bg-rose-500' : 'bg-rose-100'
                  } ${isPlaying && isPassed ? 'animate-pulse' : ''}`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>{formatSeconds(currentTime)}</span>
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
