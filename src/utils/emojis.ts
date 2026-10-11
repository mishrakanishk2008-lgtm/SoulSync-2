export interface EmojiCategory {
  id: string;
  name: string;
  icon: string;
  emojis: string[];
}

export const PINNED_LOVE_SHORTCUTS = ['❤️', '🥰', '💕', '😘', '🫶', '💌'];

export const QUICK_REACTION_EMOJIS = ['❤️', '🥰', '💕', '😘', '🫶', '😂'];

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'love',
    name: 'Love & Hearts',
    icon: '💖',
    emojis: [
      '❤️', '💖', '💝', '💕', '💞', '💓', '💗', '💘', '💌', '🫶',
      '💋', '😍', '🥰', '😘', '😻', '🌹', '💐', '💍', '🕊️', '🥂',
      '✨', '🌙', '🧸', '🥹', '🤍', '🧡', '💛', '💚', '💙', '💜',
    ],
  },
  {
    id: 'faces',
    name: 'Faces',
    icon: '😊',
    emojis: [
      '😊', '🥹', '🥺', '😂', '🤣', '😉', '😌', '🤤', '😜', '😎',
      '🤗', '🤭', '🥳', '😴', '😭', '😳', '😇', '🤩', '😋', '🫠',
      '🫣', '🤫', 'Thinking', '😏', '🤓', '🙃', '🤠', '😻', '🙈', '🙉',
    ].filter(e => e !== 'Thinking').concat(['🤔']),
  },
  {
    id: 'gestures',
    name: 'Gestures',
    icon: '🫶',
    emojis: [
      '🫶', '🫂', '👋', '✌️', '🤞', '🫰', '✨', '🔥', '👏', '🙌',
      '🤝', '🙏', '💪', '👀', '💅', '🤏', '🤌', '🤙', '💃', '🕺',
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    icon: '🐱',
    emojis: [
      '🐱', '🐶', '🐰', '🐻', '🐼', '🐨', '🦊', '🐧', '🐥', '🦋',
      '🐝', '🦄', '🐢', '🦦', '🦔', '🌸', '🌼', '🌻', '🌿', '🍂',
      '🍁', '🍄', '🐾', '🌊', '🌈', '⭐', '🌟', '⛅', '❄️', '🔥',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    icon: '☕',
    emojis: [
      '☕', '🍵', '🥐', '🍞', '🥖', '🥞', '🍕', '🍜', '🍣', '🍦',
      '🍰', '🍫', '🍓', '🍒', '🥑', '🍷', '🥂', '🍿', '🧇', '🍩',
      '🍪', '🧁', '🍎', '🍇', '🍉', '🍔', '🍟', '🥪', '🍱', '🧋',
    ],
  },
  {
    id: 'celebration',
    name: 'Celebration & Fun',
    icon: '🎉',
    emojis: [
      '🎉', '🎊', '🎈', '🎆', '🎇', '🎁', '⭐', '💫', '🎵', '🎶',
      '🏖️', '🌅', '🏕️', '🕯️', '🚲', '✈️', '🎬', '📸', '🎨', '🧩',
      '🎡', '🎢', '🎯', '🎳', '🏆', '🥇', '🔮', '🧸', '🎮', '🚗',
    ],
  },
];

const DEFAULT_RECENT = ['❤️', '🥰', '💕', '🥺', '✨', '🍜', '☕', '🫂'];

export function getRecentEmojis(partnerId: string): string[] {
  try {
    const raw = localStorage.getItem(`soulsync_recent_emojis_${partnerId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore error
  }
  return DEFAULT_RECENT;
}

export function saveRecentEmoji(partnerId: string, emoji: string): string[] {
  try {
    const recents = getRecentEmojis(partnerId);
    const updated = [emoji, ...recents.filter(e => e !== emoji)].slice(0, 14);
    localStorage.setItem(`soulsync_recent_emojis_${partnerId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_RECENT;
  }
}
