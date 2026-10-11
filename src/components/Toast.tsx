import React, { useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, onClose, duration = 3200 }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-16 left-1/2 z-50 -translate-x-1/2 px-4 transition-all">
      <div className="flex items-center space-x-2.5 rounded-full border border-rose-200/80 bg-white/95 px-4 py-2.5 text-xs font-semibold text-stone-800 shadow-xl shadow-rose-950/5 backdrop-blur-md animate-develop">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <Heart className="h-3 w-3 fill-current" />
        </span>
        <span>{message}</span>
      </div>
    </div>
  );
}
