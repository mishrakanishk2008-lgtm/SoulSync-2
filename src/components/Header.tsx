import React from 'react';
import { Heart, Lock, Settings, Sparkles, RefreshCw } from 'lucide-react';
import { PartnerProfile, CoupleSettings } from '../types';
import { sound } from '../utils/audio';

interface HeaderProps {
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  onSwitchPartner: (id: 'p1' | 'p2') => void;
  settings: CoupleSettings;
  onOpenSettings: () => void;
  onOpenInspiration: () => void;
  onLockApp: () => void;
  isOnline?: boolean;
}

export function Header({
  partners,
  activePartnerId,
  onSwitchPartner,
  settings,
  onOpenSettings,
  onOpenInspiration,
  onLockApp,
  isOnline = true,
}: HeaderProps) {
  const p1 = partners[0] || { name: 'Partner 1', avatarEmoji: '🌸', avatarColor: '#f43f5e' };
  const p2 = partners[1] || { name: 'Partner 2', avatarEmoji: '☕', avatarColor: '#d97706' };
  const activePartner = activePartnerId === 'p1' ? p1 : p2;

  const togglePartner = () => {
    sound.playSoftChime();
    const nextId = activePartnerId === 'p1' ? 'p2' : 'p1';
    onSwitchPartner(nextId);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-rose-200/50 bg-white/80 px-4 py-3 backdrop-blur-md transition-colors">
      <div className="mx-auto flex max-w-2xl items-center justify-between">
        {/* Brand & Couple Names */}
        <div className="flex items-center space-x-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white shadow-md shadow-rose-300 hover:scale-105 active:scale-95 transition-all cursor-pointer">
            <Heart className="h-5.5 w-5.5 fill-current text-white animate-heartbeat absolute" />
            <Heart className="h-3.5 w-3.5 fill-current text-rose-200 absolute -bottom-0.5 -right-0.5 drop-shadow-xs rotate-12" />
            <Sparkles className="h-3 w-3 text-amber-200 absolute -top-1.5 -left-1 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-serif-title text-base font-bold tracking-tight text-stone-800">
                SoulSync
              </span>
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                Private
                <span 
                  className={`h-2 w-2 rounded-full transition-colors ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`}
                  title={isOnline ? 'Live Real-time Sync Connected' : 'Offline Mode'}
                />
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-500">
              {p1.name} {p1.avatarEmoji} & {p2.name} {p2.avatarEmoji}
            </p>
          </div>
        </div>

        {/* Right Actions: Partner Switcher & Quick Buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Active Partner Quick Switcher */}
          <button
            onClick={togglePartner}
            title={`Switch to other partner (currently ${activePartner.name})`}
            className="flex items-center space-x-1.5 rounded-full border border-stone-200 bg-stone-50/90 px-2.5 py-1 text-xs font-medium text-stone-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50/50 active:scale-95"
          >
            <span className="text-sm">{activePartner.avatarEmoji}</span>
            <span className="hidden sm:inline font-semibold">{activePartner.name}</span>
            <RefreshCw className="h-3 w-3 text-stone-400" />
          </button>

          {/* Daily Inspiration */}
          <button
            onClick={() => {
              sound.playSoftChime();
              onOpenInspiration();
            }}
            title="Daily Taylor & Ronaldo Inspiration"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200/80 bg-amber-50 text-amber-600 shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Lock App */}
          <button
            onClick={() => {
              sound.playSoftChime();
              onLockApp();
            }}
            title="Lock SoulSync with Passcode"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 shadow-sm transition-transform hover:border-rose-300 hover:text-rose-600 active:scale-95"
          >
            <Lock className="h-4 w-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playSoftChime();
              onOpenSettings();
            }}
            title="Dashboard Settings & Backup"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-50 text-stone-600 shadow-sm transition-transform hover:border-rose-300 hover:text-rose-600 active:scale-95"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
