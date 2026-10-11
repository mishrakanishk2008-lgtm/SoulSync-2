import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Heart,
  TrendingUp,
  Star,
  Award,
  Flame,
  Compass,
  Smile,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { LoveMapSpot, DateEmotionalImpact, PartnerProfile } from '../types';
import {
  EMOTIONAL_IMPACTS,
  getEmotionalImpactInfo,
  analyzeDateQualityTrends,
  RATING_DESCRIPTIONS,
} from '../utils/dateQuality';
import { sound } from '../utils/audio';

interface DateQualityTrendsCardProps {
  spots: LoveMapSpot[];
  partners: PartnerProfile[];
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  onSelectSpot: (spotId: string) => void;
}

export function DateQualityTrendsCard({
  spots,
  partners,
  selectedFilter,
  onSelectFilter,
  onSelectSpot,
}: DateQualityTrendsCardProps) {
  const analysis = useMemo(() => analyzeDateQualityTrends(spots), [spots]);
  const [activeTab, setActiveTab] = useState<'overview' | 'impacts' | 'top_dates'>('overview');

  const p1 = partners[0] || { name: 'Partner 1', avatarEmoji: '🌸' };
  const p2 = partners[1] || { name: 'Partner 2', avatarEmoji: '☕' };

  // Top 3 rated spots
  const topRatedSpots = useMemo(() => {
    return [...spots]
      .sort((a, b) => (b.rating || 5) - (a.rating || 5))
      .slice(0, 3);
  }, [spots]);

  return (
    <div className="rounded-3xl border border-amber-200/90 bg-gradient-to-br from-[#fffdfa] via-[#fffbf2] to-[#fff7eb] p-4 shadow-sm sm:p-6 backdrop-blur-xs">
      {/* Header with Title & Overall Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-stone-900">
                Date Quality & Emotional Impact Trends
              </h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                {analysis.totalSpots} Dates Analyzed
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Discover which date experiences create the most positive emotional resonance
            </p>
          </div>
        </div>

        {/* Big Overall Rating Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto rounded-2xl bg-white px-3 py-1.5 border border-amber-200 shadow-2xs">
          <div className="flex text-amber-500">
            {'★'.repeat(Math.round(analysis.averageRating))}
          </div>
          <div className="text-right">
            <span className="font-serif-title text-sm sm:text-base font-bold text-amber-900">
              {analysis.averageRating}
            </span>
            <span className="text-[10px] text-stone-400"> / 5.0</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mt-3.5 flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-amber-100">
        <button
          type="button"
          onClick={() => {
            sound.playSoftChime();
            setActiveTab('overview');
          }}
          className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Emotional Insights</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playSoftChime();
            setActiveTab('impacts');
          }}
          className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'impacts'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>Impact Categories ({analysis.impactBreakdown.filter(i => i.count > 0).length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playSoftChime();
            setActiveTab('top_dates');
          }}
          className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'top_dates'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Hall of Fame (5★)</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KEY TAKEAWAYS */}
      {activeTab === 'overview' && (
        <div className="mt-3.5 space-y-3 animate-develop">
          {/* Couple Insight Highlight Box */}
          <div className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 to-rose-50/50 p-3.5 sm:p-4 shadow-2xs">
            <div className="flex items-start space-x-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-lg shadow-inner">
                {analysis.topImpactCategory?.icon || '✨'}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Couple Chemistry Takeaway
                </span>
                <p className="mt-0.5 text-xs text-stone-800 leading-relaxed font-medium">
                  {analysis.keyInsight}
                </p>
                <div className="mt-2 rounded-xl bg-white/90 p-2 text-[11px] text-amber-900 border border-amber-200/70 flex items-center space-x-2">
                  <span className="font-bold text-amber-700 shrink-0">💡 Date Suggestion:</span>
                  <span className="text-stone-700">{analysis.actionableTip}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Top Impact */}
            <div className="rounded-2xl border border-rose-100 bg-white/90 p-3 text-center shadow-2xs">
              <span className="text-xl">{analysis.topImpactCategory?.icon}</span>
              <p className="mt-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                Top Emotional Vibe
              </p>
              <p className="text-xs font-bold text-stone-800 truncate">
                {analysis.topImpactCategory?.shortLabel}
              </p>
            </div>

            {/* Top Location Style */}
            <div className="rounded-2xl border border-amber-100 bg-white/90 p-3 text-center shadow-2xs">
              <span className="text-xl">{analysis.topDateCategory?.icon || '🌅'}</span>
              <p className="mt-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                Highest Rated Place
              </p>
              <p className="text-xs font-bold text-stone-800 truncate">
                {analysis.topDateCategory?.label || 'Scenic View'}
              </p>
            </div>

            {/* Total Dates Pinned */}
            <div className="rounded-2xl border border-emerald-100 bg-white/90 p-3 text-center shadow-2xs">
              <span className="text-xl">🗺️</span>
              <p className="mt-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                Love Map Memories
              </p>
              <p className="text-xs font-bold text-emerald-700">
                {analysis.totalSpots} Pinned Places
              </p>
            </div>

            {/* Average Score */}
            <div className="rounded-2xl border border-pink-100 bg-white/90 p-3 text-center shadow-2xs">
              <span className="text-xl">💖</span>
              <p className="mt-1 text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                Average Rating
              </p>
              <p className="text-xs font-bold text-rose-600">
                {analysis.averageRating} / 5.0
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPACT CATEGORIES BREAKDOWN */}
      {activeTab === 'impacts' && (
        <div className="mt-3.5 space-y-2.5 animate-develop">
          <p className="text-[11px] text-stone-500">
            See how different emotional categories correlate with satisfaction and memory strength:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analysis.impactBreakdown.map(item => {
              const isSelected = selectedFilter === item.impact.id;
              return (
                <div
                  key={item.impact.id}
                  onClick={() => {
                    sound.playSoftChime();
                    onSelectFilter(isSelected ? 'all' : item.impact.id);
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-400 bg-amber-50/90 ring-2 ring-amber-300 shadow-xs scale-[1.01]'
                      : 'border-stone-200/80 bg-white/90 hover:border-amber-300 hover:bg-amber-50/40 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{item.impact.icon}</span>
                      <div>
                        <h5 className="font-serif-title text-xs font-bold text-stone-800">
                          {item.impact.label}
                        </h5>
                        <p className="text-[10px] text-stone-500 leading-tight">
                          {item.impact.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${item.impact.badgeBg}`}
                    >
                      {item.count} Date{item.count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Progress Bar & Rating stats */}
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div className="flex-1 mr-3">
                      <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                        <div
                          style={{ width: `${Math.max(item.percentage, item.count > 0 ? 15 : 0)}%` }}
                          className="h-full bg-amber-500 rounded-full transition-all"
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 shrink-0">
                      {item.count > 0 ? `${item.averageRating} ★ avg` : 'No dates yet'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TOP 5★ DATES HIGHLIGHT */}
      {activeTab === 'top_dates' && (
        <div className="mt-3.5 space-y-2.5 animate-develop">
          <p className="text-[11px] text-stone-500">
            Your most unforgettable date memories with full emotional impact:
          </p>

          <div className="space-y-2">
            {topRatedSpots.map((spot, idx) => {
              const impact = getEmotionalImpactInfo(spot.emotionalImpact);
              return (
                <div
                  key={spot.id}
                  onClick={() => {
                    sound.playSoftChime();
                    onSelectSpot(spot.id);
                  }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-amber-200/70 bg-white p-3 shadow-2xs hover:border-amber-400 transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-xl shadow-inner">
                      {spot.icon || '📍'}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h5 className="font-serif-title text-xs font-bold text-stone-800">
                          {spot.name}
                        </h5>
                        <span className={`rounded-full border px-1.5 py-0.2 text-[9px] font-bold ${impact.badgeBg}`}>
                          {impact.shortLabel}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500">
                        {new Date(spot.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}{' '}
                        • Pinned by {spot.pinnedBy}
                      </p>
                      {spot.highlightMoment && (
                        <p className="mt-1 text-[11px] italic text-amber-900 bg-amber-50/70 px-2 py-0.5 rounded-lg border border-amber-100">
                          “{spot.highlightMoment}”
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    <span className="text-xs font-bold text-amber-600">
                      {'💖'.repeat(spot.rating || 5)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-stone-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
