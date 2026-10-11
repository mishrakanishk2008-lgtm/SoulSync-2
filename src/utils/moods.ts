export interface MoodItem {
  emoji: string;
  label: string;
  category: string;
}

export interface MoodCategoryGroup {
  id: string;
  name: string;
  icon: string;
  badgeClass: string;
  pillActiveClass: string;
  moods: { emoji: string; label: string }[];
}

export const MOOD_CATEGORIES: MoodCategoryGroup[] = [
  {
    id: 'happy',
    name: 'Happy/Positive',
    icon: '😊',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    pillActiveClass: 'bg-amber-500 text-white shadow-xs',
    moods: [
      { emoji: '😊', label: 'Happy & Glowing' },
      { emoji: '😄', label: 'Joyful & Bright' },
      { emoji: '🥰', label: 'In Love & Cherished' },
      { emoji: '🤩', label: 'Starry & Amazed' },
      { emoji: '😌', label: 'Peaceful & Relieved' },
      { emoji: '🙂', label: 'Good & Content' },
      { emoji: '😇', label: 'Sweet & Pure' },
    ],
  },
  {
    id: 'love',
    name: 'Love/Affection',
    icon: '🫶',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    pillActiveClass: 'bg-rose-500 text-white shadow-xs',
    moods: [
      { emoji: '🥹', label: 'Touched & Soft' },
      { emoji: '😍', label: 'Head Over Heels' },
      { emoji: '🫶', label: 'Adoring & Warm' },
      { emoji: '💕', label: 'Sweet & Smitten' },
      { emoji: '😘', label: 'Affectionate & Flirty' },
    ],
  },
  {
    id: 'calm',
    name: 'Calm/Content',
    icon: '🧘',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200',
    pillActiveClass: 'bg-teal-600 text-white shadow-xs',
    moods: [
      { emoji: '😴', label: 'Cozy & Resting' },
      { emoji: '😪', label: 'Drowsy & Drifting' },
      { emoji: '🧘', label: 'Centered & Mindful' },
      { emoji: '☺️', label: 'Quiet & Comforted' },
      { emoji: '🥱', label: 'Slow & Unwinding' },
    ],
  },
  {
    id: 'excited',
    name: 'Excited/Energetic',
    icon: '🔥',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200',
    pillActiveClass: 'bg-orange-500 text-white shadow-xs',
    moods: [
      { emoji: '🤗', label: 'Warm & Huggy' },
      { emoji: '🥳', label: 'Hyped & Celebrating' },
      { emoji: '😆', label: 'Playful & Giddy' },
      { emoji: '🔥', label: 'Fired Up & Passionate' },
    ],
  },
  {
    id: 'neutral',
    name: 'Neutral/Meh',
    icon: '😐',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-200',
    pillActiveClass: 'bg-stone-600 text-white shadow-xs',
    moods: [
      { emoji: '😐', label: 'Just Neutral' },
      { emoji: '😶', label: 'Quiet & Thinking' },
      { emoji: '🤔', label: 'Contemplative' },
      { emoji: '😑', label: 'Unbothered / Meh' },
    ],
  },
  {
    id: 'tired',
    name: 'Tired/Low energy',
    icon: '🫠',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    pillActiveClass: 'bg-blue-600 text-white shadow-xs',
    moods: [
      { emoji: '😩', label: 'Low Battery / Drained' },
      { emoji: '🥴', label: 'Woozy & Overworked' },
      { emoji: '😮‍💨', label: 'Need a Deep Breath' },
      { emoji: '🫠', label: 'Melting with Fatigue' },
    ],
  },
  {
    id: 'sad',
    name: 'Sad/Down',
    icon: '🥺',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    pillActiveClass: 'bg-indigo-600 text-white shadow-xs',
    moods: [
      { emoji: '😢', label: 'Tearful & Blue' },
      { emoji: '😔', label: 'Heavyhearted' },
      { emoji: '🥺', label: 'Need a Warm Hug' },
      { emoji: '😞', label: 'Down & Disappointed' },
    ],
  },
  {
    id: 'stressed',
    name: 'Stressed/Anxious',
    icon: '😰',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    pillActiveClass: 'bg-purple-600 text-white shadow-xs',
    moods: [
      { emoji: '😰', label: 'Overwhelmed & Anxious' },
      { emoji: '😫', label: 'Under Pressure' },
      { emoji: '😬', label: 'Tense & Jittery' },
      { emoji: '😖', label: 'Stressed Out' },
    ],
  },
  {
    id: 'angry',
    name: 'Angry/Frustrated',
    icon: '😤',
    badgeClass: 'bg-red-100 text-red-800 border-red-200',
    pillActiveClass: 'bg-red-600 text-white shadow-xs',
    moods: [
      { emoji: '😤', label: 'Annoyed & Grumpy' },
      { emoji: '😠', label: 'Frustrated' },
      { emoji: '😡', label: 'Fuming / Need Space' },
    ],
  },
  {
    id: 'sick',
    name: 'Sick/Unwell',
    icon: '🤒',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    pillActiveClass: 'bg-emerald-700 text-white shadow-xs',
    moods: [
      { emoji: '🤒', label: 'Under the Weather' },
      { emoji: '🤧', label: 'Sniffling / Cold' },
      { emoji: '🤢', label: 'Nauseous & Achy' },
    ],
  },
];

// Flat lookup table for fast access
export const ALL_MOODS: MoodItem[] = MOOD_CATEGORIES.flatMap(cat =>
  cat.moods.map(m => ({
    emoji: m.emoji,
    label: m.label,
    category: cat.name,
  }))
);

export function findMoodInfo(emoji: string): { label: string; category: string } {
  const match = ALL_MOODS.find(m => m.emoji === emoji);
  if (match) {
    return { label: match.label, category: match.category };
  }
  // Fallback heuristics
  if (['🥰', '😍', '🫶', '💕', '😘', '🥹'].includes(emoji)) {
    return { label: 'In love & cherished', category: 'Love/Affection' };
  }
  if (['☕', '😴', '🧘'].includes(emoji)) {
    return { label: 'Cozy & relaxed', category: 'Calm/Content' };
  }
  return { label: 'Feeling this vibe', category: 'General' };
}

export function moodToScore(emoji?: string, category?: string): number {
  if (!emoji) return 5;
  const match = ALL_MOODS.find(m => m.emoji === emoji);
  const cat = category || (match ? match.category : '');

  // Category based baseline score (1 to 10 scale for trending)
  switch (cat) {
    case 'Love/Affection':
      return 10;
    case 'Happy/Positive':
      return 9;
    case 'Excited/Energetic':
      return 8.5;
    case 'Calm/Content':
      return 7.5;
    case 'Neutral/Meh':
      return 5.5;
    case 'Tired/Low energy':
      return 4;
    case 'Stressed/Anxious':
      return 3;
    case 'Sad/Down':
      return 2.5;
    case 'Angry/Frustrated':
      return 2;
    case 'Sick/Unwell':
      return 2;
    default:
      if (['🥰', '😍', '🫶', '💕', '😘', '🥹'].includes(emoji)) return 10;
      if (['😊', '😄', '🤩', '😌', '🙂', '😇'].includes(emoji)) return 9;
      if (['🤗', '🥳', '😆', '🔥'].includes(emoji)) return 8.5;
      if (['😴', '😪', '🧘', '☺️', '🥱', '☕'].includes(emoji)) return 7.5;
      if (['😐', '😶', '🤔', '😑'].includes(emoji)) return 5.5;
      if (['😩', '🥴', '😮‍💨', '🫠'].includes(emoji)) return 4;
      if (['😰', '😫', '😬', '😖'].includes(emoji)) return 3;
      if (['😢', '😔', '🥺', '😞', '🌧️'].includes(emoji)) return 2.5;
      if (['😤', '😠', '😡'].includes(emoji)) return 2;
      if (['🤒', '🤧', '🤢'].includes(emoji)) return 2;
      return 5;
  }
}
