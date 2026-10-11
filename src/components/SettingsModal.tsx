import React, { useState } from 'react';
import { X, Palette, Download, Upload, Shield, Users, RefreshCcw, Check, Sparkles } from 'lucide-react';
import { CoupleSettings, PartnerProfile, AppThemePreset } from '../types';
import { THEME_PRESETS, normalizeThemeKey, getThemeConfig } from '../utils/themes';
import { sound } from '../utils/audio';
import { db } from '../utils/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { storage } from '../utils/storage';

interface SettingsModalProps {
  settings: CoupleSettings;
  partners: PartnerProfile[];
  onSaveSettings: (settings: CoupleSettings) => void;
  onSavePartners: (partners: PartnerProfile[]) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => { success: boolean; message: string };
  onResetData: () => void;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export function SettingsModal({
  settings,
  partners,
  onSaveSettings,
  onSavePartners,
  onExportBackup,
  onImportBackup,
  onResetData,
  onClose,
  onShowToast,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'partners' | 'security' | 'backup'>('themes');
  
  // Theme state
  const [theme, setTheme] = useState<AppThemePreset>(normalizeThemeKey(settings.activeTheme));
  
  // Partner state
  const [p1Name, setP1Name] = useState(partners[0]?.name || 'Partner 1');
  const [p1Emoji, setP1Emoji] = useState(partners[0]?.avatarEmoji || '🌸');
  const [p2Name, setP2Name] = useState(partners[1]?.name || 'Partner 2');
  const [p2Emoji, setP2Emoji] = useState(partners[1]?.avatarEmoji || '☕');

  // Security state
  const [newPin, setNewPin] = useState(settings.pin);
  const [stayLoggedIn, setStayLoggedIn] = useState(settings.stayLoggedIn);

  const handleApplyTheme = (newTheme: AppThemePreset) => {
    sound.playSoftChime();
    const normalized = normalizeThemeKey(newTheme);
    setTheme(normalized);
    const themeConfig = getThemeConfig(normalized);
    const updated = {
      ...settings,
      activeTheme: normalized,
      customBackgroundGradient: null, // Clear daily inspiration background to show theme
      customBackgroundId: null,
    };
    onSaveSettings(updated);
    onShowToast(`Applied ${themeConfig.name} theme! 🎨`);
  };

  const handleSavePartners = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playHeartReaction();
    const updated: PartnerProfile[] = [
      { ...partners[0], name: p1Name.trim() || 'Partner 1', avatarEmoji: p1Emoji },
      { ...partners[1], name: p2Name.trim() || 'Partner 2', avatarEmoji: p2Emoji },
    ];
    onSavePartners(updated);

    const currentUser = storage.getCurrentUser();
    const coupleCode = storage.getCoupleCode();
    try {
      if (currentUser) {
        const mySlot = currentUser.slotId;
        const myUpdated = updated.find(p => p.id === mySlot);
        if (myUpdated) {
          storage.saveCurrentUser({
            ...currentUser,
            name: myUpdated.name,
            avatarEmoji: myUpdated.avatarEmoji,
            avatarColor: myUpdated.avatarColor || currentUser.avatarColor,
          });
          if (coupleCode) {
            await setDoc(doc(db, 'couples', coupleCode, 'profiles', mySlot), {
              id: mySlot,
              userId: currentUser.userId,
              name: myUpdated.name,
              avatarEmoji: myUpdated.avatarEmoji,
              avatarColor: myUpdated.avatarColor || currentUser.avatarColor,
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          }
        }
      } else if (coupleCode) {
        for (const p of updated) {
          await setDoc(doc(db, 'couples', coupleCode, 'profiles', p.id), {
            id: p.id,
            name: p.name,
            avatarEmoji: p.avatarEmoji,
            avatarColor: p.avatarColor,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
    } catch (err) {
      console.error('Error syncing partner profile to Firestore:', err);
      onShowToast('Could not sync profile change to cloud. Check internet connection 💕');
    }

    onShowToast('Partner profiles updated! 💖');

  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4) {
      onShowToast('Passcode must be 4 digits!');
      return;
    }
    sound.playSoftChime();
    const updated = {
      ...settings,
      pin: newPin,
      stayLoggedIn,
    };
    onSaveSettings(updated);
    onShowToast('Security preferences updated! 🔐');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const res = onImportBackup(content);
        if (res.success) {
          sound.playHeartReaction();
          onShowToast(res.message);
          onClose();
        } else {
          onShowToast(res.message);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-rose-100 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="font-serif-title text-lg font-bold text-stone-800">
              SoulSync Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-100 bg-stone-50/60 px-4 py-2 gap-1 text-xs">
          {[
            { id: 'themes', label: 'Themes', icon: Palette },
            { id: 'partners', label: 'Partners', icon: Users },
            { id: 'security', label: 'Passcode', icon: Shield },
            { id: 'backup', label: 'Backup', icon: Download },
          ].map(tab => {
            const Icon = tab.icon;
            const isCur = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sound.playSoftChime();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-medium transition-all ${
                  isCur
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {/* THEMES TAB */}
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-stone-800">Pastel Color Palettes</h3>
                  <p className="text-xs text-stone-500">
                    Choose from 8 cozy themes. Preview color dots and tap to apply.
                  </p>
                </div>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  8 Presets
                </span>
              </div>

              {/* 8-Theme Swatch Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEME_PRESETS.map((preset) => {
                  const isCurrent = theme === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyTheme(preset.id)}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-rose-400 bg-rose-50/80 ring-2 ring-rose-300 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-amber-300 hover:bg-stone-50/70 shadow-2xs'
                      }`}
                    >
                      {/* Top row: Emoji, Name, and Selected Check */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{preset.emoji}</span>
                          <div>
                            <p className="font-serif-title text-xs font-bold text-stone-900 leading-tight">
                              {preset.name}
                            </p>
                            <p className="text-[10px] text-stone-500 line-clamp-1">
                              {preset.subtitle}
                            </p>
                          </div>
                        </div>
                        {isCurrent && (
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Swatch Color-Dot Previews */}
                      <div className="mt-2.5 flex items-center justify-between border-t border-stone-100 pt-2">
                        <span className="text-[9px] font-medium text-stone-400 uppercase tracking-wider">
                          Palette
                        </span>
                        <div className="flex items-center space-x-1.5">
                          {preset.swatchDots.map((dotColor, idx) => (
                            <span
                              key={idx}
                              style={{ backgroundColor: dotColor }}
                              className="h-3.5 w-3.5 rounded-full ring-1 ring-stone-900/10 shadow-2xs transition-transform group-hover:scale-110"
                              title={dotColor}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {settings.customBackgroundGradient && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
                  <p className="font-medium">Active Inspiration Wallpaper Applied</p>
                  <p className="mt-0.5 text-amber-700">
                    You currently have a Daily Inspiration background active.
                  </p>
                  <button
                    onClick={() => {
                      onSaveSettings({
                        ...settings,
                        customBackgroundGradient: null,
                        customBackgroundId: null,
                      });
                      onShowToast('Reverted to pastel theme background!');
                    }}
                    className="mt-2 rounded-xl bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700"
                  >
                    Reset to Default Theme
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PARTNERS TAB */}
          {activeTab === 'partners' && (
            <form onSubmit={handleSavePartners} className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800">Couple Profiles</h3>
                <p className="text-xs text-stone-500">
                  Update your display names and emoji avatars.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-700">
                    <span>Partner 1</span>
                    <span>{p1Emoji}</span>
                  </div>
                  <input
                    type="text"
                    value={p1Name}
                    onChange={e => setP1Name(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs"
                    placeholder="Partner 1 Name"
                  />
                  <div className="mt-2 flex gap-1 overflow-x-auto py-1">
                    {['🌸', '🐱', '🐰', '🍓', '✨', '🥑'].map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setP1Emoji(em)}
                        className={`h-7 w-7 rounded-lg border text-xs ${
                          p1Emoji === em ? 'border-rose-400 bg-rose-100' : 'border-stone-100 bg-white'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-700">
                    <span>Partner 2</span>
                    <span>{p2Emoji}</span>
                  </div>
                  <input
                    type="text"
                    value={p2Name}
                    onChange={e => setP2Name(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs"
                    placeholder="Partner 2 Name"
                  />
                  <div className="mt-2 flex gap-1 overflow-x-auto py-1">
                    {['☕', '🦊', '🐻', '🌙', '🧸', '🌻'].map(em => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setP2Emoji(em)}
                        className={`h-7 w-7 rounded-lg border text-xs ${
                          p2Emoji === em ? 'border-amber-400 bg-amber-100' : 'border-stone-100 bg-white'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-rose-500 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-600"
              >
                Save Couple Names
              </button>
            </form>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <form onSubmit={handleSaveSecurity} className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800">Passcode Protection</h3>
                <p className="text-xs text-stone-500">
                  Update your 4-digit secret PIN or stay logged in toggle.
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-600">4-Digit Secret Passcode</label>
                <input
                  type="text"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-center font-mono text-base tracking-widest text-stone-800 focus:border-rose-400 focus:bg-white focus:outline-none"
                  placeholder="1234"
                />
              </div>

              <label className="flex cursor-pointer items-center space-x-2 text-xs text-stone-700">
                <input
                  type="checkbox"
                  checked={stayLoggedIn}
                  onChange={e => setStayLoggedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
                />
                <span>Stay logged in on this browser</span>
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-rose-500 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-600"
              >
                Update Passcode
              </button>
            </form>
          )}

          {/* BACKUP & RESTORE TAB */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-stone-800">Backup Our Memories</h3>
                <p className="text-xs text-stone-500">
                  Safeguard all notes, polaroid snaps, milestone dates, and streaks as a downloadable JSON file.
                </p>
              </div>

              {/* Couple Space Code Box */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 space-y-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Our Couple Sanctuary Code</span>
                <p className="text-[11px] text-stone-600">Share this 6-character code with your partner so they can join your space:</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-rose-600 bg-white px-3 py-1 rounded-xl border border-rose-200">
                    {storage.getCoupleCode() || 'None'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const code = storage.getCoupleCode();
                      if (code) {
                        navigator.clipboard.writeText(code);
                        onShowToast('Couple code copied to clipboard! 📋');
                      }
                    }}
                    className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600 cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSoftChime();
                    onExportBackup();
                    onShowToast('Memories exported! Keep it safe. 📦');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-800 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-stone-900"
                >
                  <Download className="h-4 w-4" />
                  Backup Our Memories (.json)
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    id="restore-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="restore-upload"
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white py-2.5 text-xs font-semibold text-stone-700 shadow-sm hover:bg-stone-50"
                  >
                    <Upload className="h-4 w-4 text-stone-500" />
                    Restore From Backup File
                  </label>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('⚠️ WARNING: This will permanently delete all your custom profiles, messages, love notes, milestones, custom wallpaper, and checklist. This cannot be undone!\n\nAre you sure you want to reset all app data?')) {
                      onResetData();
                    }
                  }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 border border-red-200 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer animate-pulse-glow"
                >
                  <RefreshCcw className="h-3.5 w-3.5 text-red-500" />
                  Reset All App Data (Wipe)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
