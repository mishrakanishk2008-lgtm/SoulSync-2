import { DateEmotionalImpact, LoveMapSpot } from '../types';

export interface EmotionalImpactInfo {
  id: DateEmotionalImpact;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  badgeBg: string;
  description: string;
}

export const EMOTIONAL_IMPACTS: EmotionalImpactInfo[] = [
  {
    id: 'magical',
    label: 'Magical & Unforgettable',
    shortLabel: 'Magical ✨',
    icon: '✨',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Enchanting moments full of butterflies & romance',
  },
  {
    id: 'deep-connection',
    label: 'Deep Connection & Talks',
    shortLabel: 'Deep Talks 💬',
    icon: '💬',
    color: 'text-rose-700',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Heart-to-hearts, vulnerable bonding & intimacy',
  },
  {
    id: 'joyful-fun',
    label: 'Joyful, Playful & Fun',
    shortLabel: 'Playful Fun 😂',
    icon: '😂',
    color: 'text-orange-700',
    badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Uncontrollable laughs, playful teasing & high energy',
  },
  {
    id: 'peaceful-cozy',
    label: 'Peaceful, Cozy & Relaxing',
    shortLabel: 'Cozy & Chill 🌿',
    icon: '🌿',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Slowing down, quiet comfort & gentle relaxation',
  },
  {
    id: 'spontaneous',
    label: 'Spontaneous & Thrilling',
    shortLabel: 'Spontaneous 🚀',
    icon: '🚀',
    color: 'text-purple-700',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Unplanned adventures, surprises & exciting discoveries',
  },
  {
    id: 'comforting',
    label: 'Comforting & Safe Haven',
    shortLabel: 'Comforting 🫂',
    icon: '🫂',
    color: 'text-indigo-700',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Warm security, soothing presence & emotional shelter',
  },
];

export function getEmotionalImpactInfo(id?: string): EmotionalImpactInfo {
  const match = EMOTIONAL_IMPACTS.find(e => e.id === id);
  if (match) return match;
  return {
    id: 'magical',
    label: 'Magical & Unforgettable',
    shortLabel: 'Magical ✨',
    icon: '✨',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Enchanting moments full of romance',
  };
}

export const RATING_DESCRIPTIONS: Record<number, { title: string; emoji: string }> = {
  5: { title: 'Pure Magic! 💖', emoji: '💖💖💖💖💖' },
  4: { title: 'Super Romantic ✨', emoji: '💖💖💖💖🤍' },
  3: { title: 'Sweet & Fun 😊', emoji: '💖💖💖🤍🤍' },
  2: { title: 'Cozy / Okay ☕', emoji: '💖💖🤍🤍🤍' },
  1: { title: 'Needs a Redo 💫', emoji: '💖🤍🤍🤍🤍' },
};

export interface DateTrendsAnalysis {
  totalSpots: number;
  ratedSpotsCount: number;
  averageRating: number;
  impactBreakdown: {
    impact: EmotionalImpactInfo;
    count: number;
    percentage: number;
    averageRating: number;
  }[];
  categoryBreakdown: {
    category: string;
    label: string;
    icon: string;
    count: number;
    averageRating: number;
  }[];
  topImpactCategory: EmotionalImpactInfo | null;
  topDateCategory: { label: string; icon: string; avgRating: number } | null;
  keyInsight: string;
  actionableTip: string;
}

export function analyzeDateQualityTrends(spots: LoveMapSpot[]): DateTrendsAnalysis {
  const totalSpots = spots.length;
  if (totalSpots === 0) {
    return {
      totalSpots: 0,
      ratedSpotsCount: 0,
      averageRating: 5.0,
      impactBreakdown: [],
      categoryBreakdown: [],
      topImpactCategory: EMOTIONAL_IMPACTS[0],
      topDateCategory: null,
      keyInsight: 'Pin your first date to start discovering your couple chemistry patterns!',
      actionableTip: 'Try exploring a scenic viewpoint or candlelit dinner spot together.',
    };
  }

  // Assign fallback rating of 5 if spot was created before rating system
  const enrichedSpots = spots.map(s => ({
    ...s,
    rating: s.rating || 5,
    emotionalImpact: s.emotionalImpact || 'magical',
  }));

  const ratedCount = enrichedSpots.length;
  const ratingSum = enrichedSpots.reduce((acc, s) => acc + (s.rating || 5), 0);
  const averageRating = Number((ratingSum / ratedCount).toFixed(1));

  // Impact Breakdown
  const impactMap: Record<DateEmotionalImpact, { count: number; ratingSum: number }> = {
    magical: { count: 0, ratingSum: 0 },
    'deep-connection': { count: 0, ratingSum: 0 },
    'joyful-fun': { count: 0, ratingSum: 0 },
    'peaceful-cozy': { count: 0, ratingSum: 0 },
    spontaneous: { count: 0, ratingSum: 0 },
    comforting: { count: 0, ratingSum: 0 },
  };

  enrichedSpots.forEach(s => {
    const imp = s.emotionalImpact as DateEmotionalImpact;
    if (impactMap[imp]) {
      impactMap[imp].count += 1;
      impactMap[imp].ratingSum += s.rating || 5;
    } else {
      impactMap.magical.count += 1;
      impactMap.magical.ratingSum += s.rating || 5;
    }
  });

  const impactBreakdown = EMOTIONAL_IMPACTS.map(info => {
    const data = impactMap[info.id];
    const avg = data.count > 0 ? Number((data.ratingSum / data.count).toFixed(1)) : 0;
    const percentage = totalSpots > 0 ? Math.round((data.count / totalSpots) * 100) : 0;
    return {
      impact: info,
      count: data.count,
      percentage,
      averageRating: avg,
    };
  }).sort((a, b) => b.count - a.count || b.averageRating - a.averageRating);

  const topImpactCategory = impactBreakdown.find(i => i.count > 0)?.impact || EMOTIONAL_IMPACTS[0];

  // Category Breakdown
  const categoryLabels: Record<string, { label: string; icon: string }> = {
    dinner: { label: 'Dinner & Drinks', icon: '🍷' },
    cafe: { label: 'Cafe & Sweets', icon: '☕' },
    view: { label: 'Scenic View', icon: '🌅' },
    dessert: { label: 'Dessert & Gelato', icon: '🍦' },
    movies: { label: 'Movie & Arts', icon: '🎬' },
    nature: { label: 'Nature & Park', icon: '🌲' },
    special: { label: 'Special Date', icon: '✨' },
    adventure: { label: 'Adventure', icon: '🚀' },
  };

  const catMap: Record<string, { count: number; ratingSum: number }> = {};
  enrichedSpots.forEach(s => {
    const cat = s.category || 'special';
    if (!catMap[cat]) {
      catMap[cat] = { count: 0, ratingSum: 0 };
    }
    catMap[cat].count += 1;
    catMap[cat].ratingSum += s.rating || 5;
  });

  const categoryBreakdown = Object.keys(catMap).map(catKey => {
    const meta = categoryLabels[catKey] || { label: catKey, icon: '📍' };
    const data = catMap[catKey];
    const avg = Number((data.ratingSum / data.count).toFixed(1));
    return {
      category: catKey,
      label: meta.label,
      icon: meta.icon,
      count: data.count,
      averageRating: avg,
    };
  }).sort((a, b) => b.averageRating - a.averageRating || b.count - a.count);

  const topCat = categoryBreakdown[0];
  const topDateCategory = topCat ? { label: topCat.label, icon: topCat.icon, avgRating: topCat.averageRating } : null;

  // Generate Personalized Insight
  let keyInsight = '';
  let actionableTip = '';

  if (topImpactCategory.id === 'deep-connection') {
    keyInsight = `Your highest emotional resonance comes from **Deep Connection & Heart-to-Heart Talks** (${impactMap['deep-connection'].count} dates). Intimate, quiet environments make your relationship glow brightest.`;
    actionableTip = 'Keep booking low-distraction spots like cozy wine cellars, secluded viewpoints, or late-night dessert corners.';
  } else if (topImpactCategory.id === 'magical') {
    keyInsight = `**Magical & Unforgettable** dates lead your love map (${impactMap.magical.count} dates) with an outstanding ${averageRating}★ average rating!`;
    actionableTip = 'Atmospheric lighting, sunset timing, and celebrating milestones amplify your mutual romantic spark.';
  } else if (topImpactCategory.id === 'joyful-fun') {
    keyInsight = `**Joyful & Playful** dates create the highest laughter frequency for you two (${impactMap['joyful-fun'].count} dates)! Playfulness is your superpower.`;
    actionableTip = 'Try spontaneous mini-golf, baking challenges, or exploring vintage markets together.';
  } else if (topImpactCategory.id === 'peaceful-cozy') {
    keyInsight = `**Peaceful & Cozy** dates provide the deepest rejuvenation (${impactMap['peaceful-cozy'].count} dates), helping both of you destress and connect.`;
    actionableTip = 'Plan a low-pressure weekend picnic or quiet bookstore stroll whenever either partner has had a stressful week.';
  } else {
    keyInsight = `You both enjoy a healthy variety of dates with a high overall satisfaction rating of **${averageRating} / 5.0 ⭐**!`;
    actionableTip = 'Continue rating and sharing highlights after each date to track your emotional milestones.';
  }

  return {
    totalSpots,
    ratedSpotsCount: ratedCount,
    averageRating,
    impactBreakdown,
    categoryBreakdown,
    topImpactCategory,
    topDateCategory,
    keyInsight,
    actionableTip,
  };
}
