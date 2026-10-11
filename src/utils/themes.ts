import { AppThemePreset } from '../types';

export interface ThemeConfig {
  id: AppThemePreset;
  name: string;
  subtitle: string;
  emoji: string;
  swatchDots: string[]; // 4 color dots for the preview
  backgroundGradient: string;
  accentColor: string;
  accentSoft: string;
  accentText: string;
  borderActive: string;
  badgeBg: string;
}

export const THEME_PRESETS: ThemeConfig[] = [
  {
    id: 'blush',
    name: 'Blush',
    subtitle: 'Soft pink & cream',
    emoji: '🌸',
    swatchDots: ['#f43f5e', '#fb7185', '#fce7f3', '#fffaf5'],
    backgroundGradient: 'linear-gradient(135deg, #fffaf5 0%, #fff1f2 50%, #fdf2f8 100%)',
    accentColor: '#f43f5e',
    accentSoft: '#ffe4e6',
    accentText: 'text-rose-600',
    borderActive: 'border-rose-400 ring-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'mint-whisper',
    name: 'Mint Whisper',
    subtitle: 'Mint green & warm white',
    emoji: '🍃',
    swatchDots: ['#10b981', '#34d399', '#dcfce7', '#f7fee7'],
    backgroundGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 45%, #f7fee7 100%)',
    accentColor: '#10b981',
    accentSoft: '#dcfce7',
    accentText: 'text-emerald-700',
    borderActive: 'border-emerald-400 ring-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    subtitle: 'Lavender & dusty rose',
    emoji: '💜',
    swatchDots: ['#a855f7', '#c084fc', '#f3e8ff', '#fce7f3'],
    backgroundGradient: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 50%, #fdf2f8 100%)',
    accentColor: '#a855f7',
    accentSoft: '#f3e8ff',
    accentText: 'text-purple-700',
    borderActive: 'border-purple-400 ring-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    subtitle: 'Warm peach & honey gold',
    emoji: '🌅',
    swatchDots: ['#f59e0b', '#fb923c', '#fed7aa', '#fef3c7'],
    backgroundGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 45%, #fff7ed 100%)',
    accentColor: '#f59e0b',
    accentSoft: '#fef3c7',
    accentText: 'text-amber-800',
    borderActive: 'border-amber-400 ring-amber-200',
    badgeBg: 'bg-amber-100 text-amber-900',
  },
  {
    id: 'sky-cotton',
    name: 'Sky Cotton',
    subtitle: 'Baby blue & lilac',
    emoji: '☁️',
    swatchDots: ['#0284c7', '#38bdf8', '#bae6fd', '#ede9fe'],
    backgroundGradient: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f5f3ff 100%)',
    accentColor: '#0284c7',
    accentSoft: '#e0f2fe',
    accentText: 'text-sky-700',
    borderActive: 'border-sky-400 ring-sky-200',
    badgeBg: 'bg-sky-100 text-sky-800',
  },
  {
    id: 'cocoa-cream',
    name: 'Cocoa Cream',
    subtitle: 'Soft brown & vanilla',
    emoji: '☕',
    swatchDots: ['#8d6e63', '#a1887f', '#d7ccc8', '#fdfbf7'],
    backgroundGradient: 'linear-gradient(135deg, #fdfbf7 0%, #f7f3ed 50%, #fdf6ec 100%)',
    accentColor: '#8d6e63',
    accentSoft: '#efebe9',
    accentText: 'text-amber-950',
    borderActive: 'border-stone-400 ring-stone-200',
    badgeBg: 'bg-stone-200 text-stone-800',
  },
  {
    id: 'berry-soft',
    name: 'Berry Soft',
    subtitle: 'Muted raspberry & blush pink',
    emoji: '🍓',
    swatchDots: ['#e11d48', '#f43f5e', '#fbcfe8', '#fff1f2'],
    backgroundGradient: 'linear-gradient(135deg, #fff1f2 0%, #fce7f3 50%, #fff5f7 100%)',
    accentColor: '#e11d48',
    accentSoft: '#ffe4e6',
    accentText: 'text-rose-700',
    borderActive: 'border-rose-400 ring-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'sage-garden',
    name: 'Sage Garden',
    subtitle: 'Sage green & cream',
    emoji: '🌿',
    swatchDots: ['#059669', '#34d399', '#cbd5e1', '#f8faf7'],
    backgroundGradient: 'linear-gradient(135deg, #f4f7f4 0%, #e8f0e9 50%, #f9fbf9 100%)',
    accentColor: '#059669',
    accentSoft: '#e6f4ea',
    accentText: 'text-emerald-800',
    borderActive: 'border-emerald-400 ring-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
];

// Normalize legacy theme keys if encountered in LocalStorage
export function normalizeThemeKey(themeId: string | undefined | null): AppThemePreset {
  if (!themeId) return 'blush';
  if (themeId === 'mint') return 'mint-whisper';
  if (themeId === 'lavender') return 'lavender-dream';
  const found = THEME_PRESETS.find(t => t.id === themeId);
  return found ? found.id : 'blush';
}

export function getThemeConfig(themeId: string | undefined | null): ThemeConfig {
  const normalized = normalizeThemeKey(themeId);
  return THEME_PRESETS.find(t => t.id === normalized) || THEME_PRESETS[0];
}

export const THEME_STORAGE_KEY = 'soulsync_theme';

export function applyThemeToDOM(themeId: AppThemePreset) {
  const config = getThemeConfig(themeId);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, config.id);
    document.documentElement.setAttribute('data-theme', config.id);
    document.documentElement.style.setProperty('--theme-bg-gradient', config.backgroundGradient);
    document.documentElement.style.setProperty('--theme-accent', config.accentColor);
    document.documentElement.style.setProperty('--theme-accent-soft', config.accentSoft);
  } catch {
    // Ignore error
  }
}
