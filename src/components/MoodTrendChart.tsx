import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Sparkles, Heart, Activity, Calendar } from 'lucide-react';
import { MoodCheckin, MoodHistoryMap, PartnerProfile } from '../types';
import { moodToScore, findMoodInfo } from '../utils/moods';

interface MoodTrendChartProps {
  moods: MoodCheckin;
  moodHistory?: MoodHistoryMap;
  partners: PartnerProfile[];
}

type TimeRangeOption = 7 | 14 | 30;

export function MoodTrendChart({ moods, moodHistory, partners }: MoodTrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>(30);
  const [showP1Line, setShowP1Line] = useState(true);
  const [showP2Line, setShowP2Line] = useState(true);

  const p1 = partners[0] || { name: 'Partner 1', avatarEmoji: '🌸', avatarColor: '#f43f5e' };
  const p2 = partners[1] || { name: 'Partner 2', avatarEmoji: '☕', avatarColor: '#d97706' };

  // Generate chart data series based on time range
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    const history = moodHistory || {};

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate =
        timeRange === 30
          ? `${d.getDate()} ${d.toLocaleDateString(undefined, { month: 'short' })}`
          : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' });

      const record = history[dateKey];

      // P1 Mood resolution
      let p1Emoji = record?.p1Mood;
      let p1Label = record?.p1Label;
      let p1Category = record?.p1Category;

      if (!p1Emoji && i === 0) {
        p1Emoji = moods.partner1Mood || '🥰';
        p1Label = moods.partner1Label || 'In Love & Cherished';
        p1Category = moods.partner1Category || 'Love/Affection';
      }

      // P2 Mood resolution
      let p2Emoji = record?.p2Mood;
      let p2Label = record?.p2Label;
      let p2Category = record?.p2Category;

      if (!p2Emoji && i === 0) {
        p2Emoji = moods.partner2Mood || '😊';
        p2Label = moods.partner2Label || 'Happy & Glowing';
        p2Category = moods.partner2Category || 'Happy/Positive';
      }

      const p1Score = p1Emoji ? moodToScore(p1Emoji, p1Category) : 5;
      const p2Score = p2Emoji ? moodToScore(p2Emoji, p2Category) : 5;

      data.push({
        dateKey,
        displayDate,
        dayOfWeek: d.toLocaleDateString(undefined, { weekday: 'long' }),
        fullDate: d.toLocaleDateString(undefined, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        isToday: i === 0,
        p1Score,
        p1Emoji: p1Emoji || '🌸',
        p1Label: p1Label || 'Feeling good',
        p1Category: p1Category || 'Love/Affection',
        p2Score,
        p2Emoji: p2Emoji || '☕',
        p2Label: p2Label || 'Feeling good',
        p2Category: p2Category || 'Happy/Positive',
      });
    }

    return data;
  }, [moodHistory, moods, timeRange]);

  // Statistics calculation for the current window
  const stats = useMemo(() => {
    if (chartData.length === 0) return { p1Avg: 8.5, p2Avg: 8.2, resonance: 90 };

    const p1Sum = chartData.reduce((acc, cur) => acc + cur.p1Score, 0);
    const p2Sum = chartData.reduce((acc, cur) => acc + cur.p2Score, 0);
    const p1Avg = (p1Sum / chartData.length).toFixed(1);
    const p2Avg = (p2Sum / chartData.length).toFixed(1);

    // High sync days (both >= 7 or within 2 points of each other)
    const inSyncDays = chartData.filter(
      d => Math.abs(d.p1Score - d.p2Score) <= 2 || (d.p1Score >= 7.5 && d.p2Score >= 7.5)
    ).length;
    const resonance = Math.round((inSyncDays / chartData.length) * 100);

    return { p1Avg, p2Avg, resonance };
  }, [chartData]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isHighResonance = Math.abs(dataPoint.p1Score - dataPoint.p2Score) <= 1.5;

      return (
        <div className="rounded-2xl border border-rose-200/80 bg-white/95 p-3.5 shadow-lg backdrop-blur-md text-left z-50 min-w-[210px] animate-pin-pop">
          <div className="border-b border-stone-100 pb-1.5 mb-2 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-stone-800">
                {dataPoint.displayDate} {dataPoint.isToday && '✨ (Today)'}
              </p>
              <p className="text-[10px] text-stone-400">{dataPoint.dayOfWeek}</p>
            </div>
            <span className="text-xs">{isHighResonance ? '💖' : '🤝'}</span>
          </div>

          {/* Partner 1 Data */}
          <div className="flex items-center space-x-2 py-1">
            <span className="text-lg">{dataPoint.p1Emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-rose-700 leading-tight truncate">
                {p1.name}: {dataPoint.p1Label}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[9px] text-stone-500">{dataPoint.p1Category}</span>
                <span className="text-[9px] font-bold text-rose-600">
                  ({dataPoint.p1Score}/10)
                </span>
              </div>
            </div>
          </div>

          {/* Partner 2 Data */}
          <div className="flex items-center space-x-2 py-1 border-t border-stone-100/70 mt-1">
            <span className="text-lg">{dataPoint.p2Emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-amber-700 leading-tight truncate">
                {p2.name}: {dataPoint.p2Label}
              </p>
              <div className="flex items-center space-x-1 mt-0.5">
                <span className="text-[9px] text-stone-500">{dataPoint.p2Category}</span>
                <span className="text-[9px] font-bold text-amber-600">
                  ({dataPoint.p2Score}/10)
                </span>
              </div>
            </div>
          </div>

          {/* Synchrony badge */}
          <div className="mt-2 rounded-lg bg-rose-50/80 px-2 py-1 text-[10px] font-medium text-rose-800 text-center">
            {isHighResonance
              ? '💞 Sweet Synchrony & Connection'
              : dataPoint.p1Score < 5 || dataPoint.p2Score < 5
              ? '🫂 Support & Care Day'
              : '🌱 Emotional Balance'}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-rose-200/80 bg-white/95 p-4 shadow-sm sm:p-6 backdrop-blur-xs">
      {/* Header with Title and Time Window Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-xs">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif-title text-base sm:text-lg font-bold text-stone-800">
                30-Day Mood Trends
              </h2>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                Interactive Line Chart
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Emotional flow, mutual harmony, and rhythm over time
            </p>
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex items-center space-x-1 self-start sm:self-auto rounded-xl bg-stone-100/80 p-1 border border-stone-200/60">
          {([7, 14, 30] as TimeRangeOption[]).map(days => (
            <button
              key={days}
              type="button"
              onClick={() => setTimeRange(days)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                timeRange === days
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      {/* Metric summary badges */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
        {/* P1 average */}
        <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-2 sm:p-2.5">
          <p className="text-[10px] font-medium text-stone-500 truncate">
            {p1.name} {p1.avatarEmoji} Avg
          </p>
          <p className="font-serif-title text-base sm:text-lg font-bold text-rose-600">
            {stats.p1Avg} <span className="text-xs font-normal text-stone-400">/10</span>
          </p>
        </div>

        {/* P2 average */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-2 sm:p-2.5">
          <p className="text-[10px] font-medium text-stone-500 truncate">
            {p2.name} {p2.avatarEmoji} Avg
          </p>
          <p className="font-serif-title text-base sm:text-lg font-bold text-amber-600">
            {stats.p2Avg} <span className="text-xs font-normal text-stone-400">/10</span>
          </p>
        </div>

        {/* Resonance */}
        <div className="rounded-2xl border border-pink-100 bg-pink-50/50 p-2 sm:p-2.5">
          <p className="text-[10px] font-medium text-stone-500 truncate">
            Resonance Sync
          </p>
          <p className="font-serif-title text-base sm:text-lg font-bold text-pink-600">
            {stats.resonance}% <span className="text-xs">💞</span>
          </p>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="mt-4 h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />

            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 10, fill: '#78716c' }}
              interval={timeRange === 30 ? 4 : timeRange === 14 ? 1 : 0}
            />

            <YAxis
              domain={[1, 10]}
              ticks={[2, 4, 6, 8, 10]}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              tickFormatter={(val: number) => {
                if (val === 10) return '💕 10';
                if (val === 8) return '😊 8';
                if (val === 6) return '🧘 6';
                if (val === 4) return '🫠 4';
                return '🥺 2';
              }}
            />

            {/* Reference baseline line for neutral contentment */}
            <ReferenceLine
              y={6}
              stroke="#e2e8f0"
              strokeDasharray="2 2"
              label={{
                value: 'Calm Baseline',
                position: 'insideBottomRight',
                fill: '#a8a29e',
                fontSize: 9,
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Partner 1 Line */}
            {showP1Line && (
              <Line
                type="monotone"
                dataKey="p1Score"
                name={`${p1.name} ${p1.avatarEmoji}`}
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: timeRange === 30 ? 2.5 : 3.5, fill: '#f43f5e', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            )}

            {/* Partner 2 Line */}
            {showP2Line && (
              <Line
                type="monotone"
                dataKey="p2Score"
                name={`${p2.name} ${p2.avatarEmoji}`}
                stroke="#d97706"
                strokeWidth={2.5}
                dot={{ r: timeRange === 30 ? 2.5 : 3.5, fill: '#d97706', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#d97706', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend and Toggles */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 text-xs text-stone-500">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setShowP1Line(prev => !prev)}
            className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 transition-all cursor-pointer ${
              showP1Line
                ? 'bg-rose-100 text-rose-800 font-semibold'
                : 'bg-stone-100 text-stone-400 line-through'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>{p1.name} {p1.avatarEmoji}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowP2Line(prev => !prev)}
            className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 transition-all cursor-pointer ${
              showP2Line
                ? 'bg-amber-100 text-amber-800 font-semibold'
                : 'bg-stone-100 text-stone-400 line-through'
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{p2.name} {p2.avatarEmoji}</span>
          </button>
        </div>

        <span className="text-[10px] text-stone-400">
          Hover points to reveal mutual emotions
        </span>
      </div>
    </div>
  );
}
