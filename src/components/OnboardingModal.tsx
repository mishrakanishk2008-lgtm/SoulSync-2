import React, { useState } from 'react';
import { Sparkles, Heart, Copy, Check, Key, Plus, AlertCircle } from 'lucide-react';
import { PartnerProfile, CoupleSettings } from '../types';
import { storage } from '../utils/storage';
import { db, auth, signInAnonymously } from '../utils/firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
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
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [generatedCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [coupleCodeInput, setCoupleCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  const [myName, setMyName] = useState('');
  const [myEmoji, setMyEmoji] = useState('🌸');
  const [myColor, setMyColor] = useState('#f43f5e');

  const [anniversaryDate, setAnniversaryDate] = useState(initialSettings.anniversaryDate || new Date().toISOString().split('T')[0]);
  const [pin, setPin] = useState(initialSettings.pin || '1234');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyCode = () => {
    sound.playSoftChime();
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!myName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }

    const codeToUse = mode === 'create' ? generatedCode : coupleCodeInput.trim().toUpperCase();
    if (!codeToUse || codeToUse.length !== 6) {
      setErrorMessage('Please enter a valid 6-character couple code.');
      return;
    }

    setIsLoading(true);
    sound.playHeartReaction();

    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const coupleRef = doc(db, 'couples', codeToUse);
      const coupleSnap = await getDoc(coupleRef);

      const profilesRef = collection(db, 'couples', codeToUse, 'profiles');
      const profilesSnap = await getDocs(profilesRef);
      const existingProfiles: any[] = [];
      profilesSnap.forEach(d => existingProfiles.push(d.data()));

      let assignedSlot: 'p1' | 'p2' = 'p1';

      if (mode === 'join') {
        if (!coupleSnap.exists() && existingProfiles.length === 0) {
          setErrorMessage('Couple space not found! Please check the code or create a new space.');
          setIsLoading(false);
          return;
        }
        if (existingProfiles.length >= 2) {
          setErrorMessage('This space already has 2 members!');
          setIsLoading(false);
          return;
        }
        const hasP1 = existingProfiles.some(p => p.id === 'p1');
        assignedSlot = hasP1 ? 'p2' : 'p1';
      } else {
        if (coupleSnap.exists() && existingProfiles.length >= 2) {
          setErrorMessage('This space code is already taken. Try joining or generating another code!');
          setIsLoading(false);
          return;
        }
        const hasP1 = existingProfiles.some(p => p.id === 'p1');
        assignedSlot = hasP1 ? 'p2' : 'p1';
      }

      const userId = crypto.randomUUID();
      const myProfileData = {
        userId,
        slotId: assignedSlot,
        name: myName.trim(),
        avatarEmoji: myEmoji,
        avatarColor: myColor,
      };
      storage.saveCurrentUser(myProfileData);
      storage.saveCoupleCode(codeToUse);

      await setDoc(coupleRef, {
        code: codeToUse,
        createdAt: coupleSnap.exists() ? (coupleSnap.data()?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      }, { merge: true });

      await setDoc(doc(db, 'couples', codeToUse, 'profiles', assignedSlot), {
        id: assignedSlot,
        userId,
        uid: auth.currentUser?.uid || '',
        name: myName.trim(),
        avatarEmoji: myEmoji,
        avatarColor: myColor,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      const p1Data = existingProfiles.find(p => p.id === 'p1') || (assignedSlot === 'p1' ? myProfileData : { id: 'p1', name: 'Partner 1', avatarEmoji: '🌸', avatarColor: '#f43f5e' });
      const p2Data = existingProfiles.find(p => p.id === 'p2') || (assignedSlot === 'p2' ? myProfileData : { id: 'p2', name: 'Partner 2', avatarEmoji: '☕', avatarColor: '#d97706' });

      const updatedPartners: PartnerProfile[] = [
        { id: 'p1', name: p1Data.name, avatarEmoji: p1Data.avatarEmoji, avatarColor: p1Data.avatarColor },
        { id: 'p2', name: p2Data.name, avatarEmoji: p2Data.avatarEmoji, avatarColor: p2Data.avatarColor },
      ];

      const updatedSettings: CoupleSettings = {
        ...initialSettings,
        anniversaryDate,
        pin: pin.length === 4 ? pin : '1234',
        hasOnboarded: true,
      };

      onComplete(updatedPartners, updatedSettings);
    } catch (err: any) {
      console.error('Error during couple setup:', err);
      setErrorMessage(err.message || 'Failed to connect to couple space. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="my-8 w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-200 to-pink-100 text-rose-500 shadow-inner">
            <Heart className="h-7 w-7 fill-current animate-pulse" />
          </div>
          <h2 className="font-serif-title text-2xl font-bold text-stone-800">
            Welcome to SoulSync
          </h2>
          <p className="mt-1 text-xs text-stone-500">
            Set up your identity and connect your shared couple space! 💖
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Couple Code Setup Mode */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
            <label className="text-xs font-bold text-rose-800 block mb-2">
              Couple Sanctuary Space
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`rounded-xl p-2.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'create'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                ✨ Create Our Space
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`rounded-xl p-2.5 text-xs font-bold transition-all cursor-pointer ${
                  mode === 'join'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                🔗 Join With Code
              </button>
            </div>

            {mode === 'create' ? (
              <div className="rounded-xl border border-rose-200 bg-white p-3 text-center">
                <p className="text-[11px] text-stone-500 mb-1">Your 6-Character Couple Code (share with partner):</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-xl font-extrabold tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-200">
                    {generatedCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-600 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-[11px] font-medium text-stone-600 mb-1 block">Enter Partner's 6-Character Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={coupleCodeInput}
                  onChange={e => setCoupleCodeInput(e.target.value.toUpperCase())}
                  className="w-full rounded-xl border border-rose-200 bg-white px-3 py-2 font-mono text-center text-sm font-bold tracking-widest text-stone-800 focus:border-rose-400 focus:outline-none uppercase"
                  placeholder="e.g. AB12CD"
                />
              </div>
            )}
          </div>

          {/* My Profile Card */}
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                My Profile
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-base shadow-sm"
                style={{ backgroundColor: myColor + '20', border: `2px solid ${myColor}` }}
              >
                {myEmoji}
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-medium text-stone-600">Your Name / Nickname</label>
              <input
                type="text"
                required
                value={myName}
                onChange={e => setMyName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm focus:border-rose-400 focus:outline-none"
                placeholder="Enter your name..."
              />
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-medium text-stone-600">Choose Avatar</label>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {EMOJI_OPTIONS.map(em => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setMyEmoji(em)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all cursor-pointer ${
                      myEmoji === em
                        ? 'border-rose-400 bg-rose-100 scale-110 shadow-sm'
                        : 'border-stone-100 bg-white hover:bg-stone-50'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-medium text-stone-600">Signature Color</label>
              <div className="mt-1 flex gap-2">
                {COLOR_OPTIONS.map(col => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setMyColor(col.hex)}
                    style={{ backgroundColor: col.hex }}
                    className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
                      myColor === col.hex ? 'ring-2 ring-stone-800 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Anniversary & Passcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium text-stone-600">Our Anniversary / Start Date</label>
              <input
                type="date"
                value={anniversaryDate}
                onChange={e => setAnniversaryDate(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-800 focus:border-rose-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-stone-600">Secret 4-Digit Passcode</label>
              <input
                type="text"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs tracking-widest text-stone-800 focus:border-rose-400 focus:outline-none font-mono"
                placeholder="1234"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isLoading ? 'Connecting to Space...' : 'Enter Our Sanctuary'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
