import React from 'react';
import { MessageSquareHeart, Camera, CalendarHeart, Compass, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

export type TabId = 'chat-notes' | 'snaps' | 'together' | 'date-ai' | 'vibes';

interface BottomNavProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  pinnedCount?: number;
  snapsCount?: number;
  upcomingEventHours?: number | null;
}

export function BottomNav({
  activeTab,
  onSelectTab,
  pinnedCount = 0,
  snapsCount = 0,
  upcomingEventHours,
}: BottomNavProps) {
  const tabs = [
    {
      id: 'chat-notes' as TabId,
      label: 'Chat & Notes',
      icon: MessageSquareHeart,
      badge: pinnedCount > 0 ? `${pinnedCount}` : undefined,
    },
    {
      id: 'snaps' as TabId,
      label: 'Snaps',
      icon: Camera,
      badge: snapsCount > 0 ? `${snapsCount}` : undefined,
    },
    {
      id: 'together' as TabId,
      label: 'Together',
      icon: CalendarHeart,
      alert: typeof upcomingEventHours === 'number' && upcomingEventHours <= 24,
    },
    {
      id: 'date-ai' as TabId,
      label: 'Our Dates',
      icon: Compass,
      sparkle: true,
    },
    {
      id: 'vibes' as TabId,
      label: 'Vibes',
      icon: Sparkles,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose-200/50 bg-white/90 px-3 py-2 backdrop-blur-lg sm:px-6 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playSoftChime();
                onSelectTab(tab.id);
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-rose-600 font-semibold scale-105'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {/* Active Glow Pill */}
              {isActive && (
                <div className="absolute -top-1 h-1 w-8 rounded-full bg-rose-500 shadow-sm shadow-rose-300" />
              )}

              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Counter Badge */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                    {tab.badge}
                  </span>
                )}

                {/* 24h milestone alert pulse dot */}
                {tab.alert && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                )}

                {/* AI Sparkle Indicator */}
                {tab.sparkle && !isActive && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-400" />
                )}
              </div>

              <span className="mt-1 text-[11px] tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
