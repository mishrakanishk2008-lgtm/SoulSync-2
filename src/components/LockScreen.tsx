import { useState } from 'react';
import { Lock, Heart, Delete, Sparkles, AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface LockScreenProps {
  storedPin: string;
  onUnlock: (stayLoggedIn: boolean) => void;
  onResetPin?: () => void;
}

export function LockScreen({ storedPin, onUnlock }: LockScreenProps) {
  const [enteredPin, setEnteredPin] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHintModal, setShowHintModal] = useState(false);

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    sound.playSoftChime();
    const next = enteredPin + digit;
    setEnteredPin(next);
    setErrorMsg('');

    if (next.length === 4) {
      if (next === storedPin) {
        sound.playHeartReaction();
        onUnlock(stayLoggedIn);
      } else {
        setShake(true);
        setErrorMsg('Incorrect passcode. Try again or check hint.');
        setTimeout(() => {
          setShake(false);
          setEnteredPin('');
        }, 500);
      }
    }
  };

  const handleDelete = () => {
    sound.playSoftChime();
    setEnteredPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-rose-100/90 via-amber-50/95 to-pink-100/95 p-4 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border border-rose-200/70 bg-white/85 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 shadow-inner">
            <Lock className="h-8 w-8" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] text-white">
              <Heart className="h-3 w-3 fill-current" />
            </span>
          </div>
          <h1 className="font-serif-title text-2xl font-bold tracking-tight text-stone-800">
            SoulSync
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Our private sanctuary. Enter our 4-digit secret passcode.
          </p>
        </div>

        {/* PIN Dots */}
        <div
          className={`my-6 flex justify-center space-x-4 transition-transform ${
            shake ? 'translate-x-1 animate-pulse text-rose-600' : ''
          }`}
        >
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200 ${
                idx < enteredPin.length
                  ? 'border-rose-400 bg-rose-500 text-white shadow-md shadow-rose-200 scale-105'
                  : 'border-stone-200 bg-stone-50 text-stone-300'
              }`}
            >
              {idx < enteredPin.length ? (
                <Heart className="h-5 w-5 fill-current animate-pulse" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-stone-300" />
              )}
            </div>
          ))}
        </div>

        {errorMsg && (
          <p className="mb-4 text-center text-xs font-medium text-rose-500 flex items-center justify-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMsg}
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="flex h-13 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/80 text-xl font-semibold text-stone-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setShowHintModal(true)}
            className="flex h-13 items-center justify-center rounded-2xl text-xs font-medium text-stone-400 transition-colors hover:text-rose-500"
          >
            Hint?
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="flex h-13 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/80 text-xl font-semibold text-stone-700 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete"
            className="flex h-13 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50/80 text-stone-500 shadow-sm transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>

        {/* Stay Logged In Toggle */}
        <div className="mt-5 flex items-center justify-center">
          <label className="flex cursor-pointer items-center space-x-2 text-xs text-stone-600 hover:text-stone-800">
            <input
              type="checkbox"
              checked={stayLoggedIn}
              onChange={e => setStayLoggedIn(e.target.checked)}
              className="h-4 w-4 rounded border-rose-300 text-rose-500 focus:ring-rose-400"
            />
            <span>Stay logged in on this device</span>
          </label>
        </div>

        {/* Default Passcode Note */}
        <p className="mt-4 text-center text-[11px] text-stone-400">
          Default passcode is <span className="font-semibold text-stone-600">1234</span> (configurable in Settings)
        </p>

        {/* Hint Modal */}
        {showHintModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-xl">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-stone-800">Passcode Reminder</h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                Your current passcode is set to:{' '}
                <span className="font-bold text-rose-600 text-sm tracking-widest">{storedPin}</span>
              </p>
              <button
                onClick={() => setShowHintModal(false)}
                className="mt-4 w-full rounded-xl bg-rose-500 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-600"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
