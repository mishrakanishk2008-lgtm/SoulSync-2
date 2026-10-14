import React, { useState } from 'react';
import { Heart, AlertCircle, Check } from 'lucide-react';
import { PartnerProfile, CoupleSettings } from '../types';
import { storage } from '../utils/storage';
import { db, auth, signInAnonymously } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { sound } from '../utils/audio';

interface OnboardingModalProps {
  initialPartners: PartnerProfile[];
  initialSettings: CoupleSettings;
  onComplete: (partners: PartnerProfile[], settings: CoupleSettings) => void;
}

const EMOJI_OPTIONS = ['🌸', '☕', '🐱', '🐰', '🦊', '🐻', '🥑', '✨', '🍓', '🌙', '🌻', '🧸'];
const COLOR_OPTIONS = [
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Sky', hex: '#0284c7' },
  { name: 'Violet', hex: '#7c3aed' },
  { name: 'Pink', hex: '#db2777' },
];

export function OnboardingModal({ initialPartners, initialSettings, onComplete }: OnboardingModalProps) {
  const [myName, setMyName] = useState('');
  const [myEmoji, setMyEmoji] = useState('🌸');
  const [myColor, setMyColor] = useState('#f43f5e');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!myName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    setIsLoading(true);
    sound.playHeartReaction();

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const userId = crypto.randomUUID();
      const currentUserData = {
        userId,
        name: myName.trim(),
        avatarEmoji: myEmoji,
        avatarColor: myColor,
      };
      storage.saveCurrentUser(currentUserData);

      // Save profile under couples/main/profiles/{userId}
      await setDoc(doc(db, 'couples', 'main', 'profiles', userId), {
        id: userId,
        userId,
        name: myName.trim(),
        avatarEmoji: myEmoji,
        avatarColor: myColor,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const updatedSettings: CoupleSettings = {
        ...initialSettings,
        hasOnboarded: true,
      };

      onComplete(initialPartners, updatedSettings);
    } catch (err: any) {
      console.error('Error during onboarding:', err);
      setErrorMessage(err.message || 'Failed to connect. Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-200 to-pink-100 text-rose-500 shadow-inner">
            <Heart className="h-7 w-7 fill-current animate-pulse" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-stone-800">
            Welcome to SoulSync 💕
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Enter your name and pick an avatar to join the shared couple dashboard.
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-stone-700">Your Name</label>
            <input
              type="text"
              value={myName}
              onChange={e => setMyName(e.target.value)}
              placeholder="e.g. Alex"
              className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Choose Avatar Emoji</label>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {EMOJI_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    sound.playSoftChime();
                    setMyEmoji(emoji);
                  }}
                  className={`flex h-11 items-center justify-center rounded-2xl border text-xl transition-all ${
                    myEmoji === emoji
                      ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200 scale-105'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-stone-700">Avatar Color Theme</label>
            <div className="mt-2 flex items-center gap-2.5">
              {COLOR_OPTIONS.map(col => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => setMyColor(col.hex)}
                  style={{ backgroundColor: col.hex }}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-transform ${
                    myColor === col.hex ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'hover:scale-105'
                  }`}
                  title={col.name}
                >
                  {myColor === col.hex && <Check className="h-4 w-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !myName.trim()}
            className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? 'Joining Space... ✨' : 'Enter Shared Space 💖'}
          </button>
        </form>
      </div>
    </div>
  );
}
