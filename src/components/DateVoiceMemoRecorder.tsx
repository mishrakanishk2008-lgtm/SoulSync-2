import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Check, X, AlertCircle, Sparkles } from 'lucide-react';
import { DateVoiceMemo, PartnerProfile } from '../types';
import { sound } from '../utils/audio';

interface DateVoiceMemoRecorderProps {
  dateTitle: string;
  activePartner: PartnerProfile;
  onSaveMemo: (memo: DateVoiceMemo) => void;
  onCancel: () => void;
  onShowToast: (msg: string) => void;
}

const MAX_RECORD_SECONDS = 30;

export function DateVoiceMemoRecorder({
  dateTitle,
  activePartner,
  onSaveMemo,
  onCancel,
  onShowToast,
}: DateVoiceMemoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedAudioDataUrl, setRecordedAudioDataUrl] = useState<string | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [caption, setCaption] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up recording and streams on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, []);

  // Handle preview audio playback
  useEffect(() => {
    if (!recordedAudioDataUrl) return;

    const audio = new Audio(recordedAudioDataUrl);
    previewAudioRef.current = audio;

    const handleEnded = () => setIsPlayingPreview(false);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
    };
  }, [recordedAudioDataUrl]);

  // Start recording using MediaRecorder API
  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Microphone recording is not supported in this browser.');
      onShowToast('Microphone not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick supported mime type
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setRecordedAudioDataUrl(base64Audio);
          setRecordedDuration(elapsedSeconds);
        };
        reader.readAsDataURL(audioBlob);

        // Stop stream tracks to turn off mic indicator
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start(200); // 200ms slices
      setIsRecording(true);
      setElapsedSeconds(0);
      sound.playSoftChime();

      // Start 30-second countdown interval
      let currentSec = 0;
      timerRef.current = window.setInterval(() => {
        currentSec += 1;
        setElapsedSeconds(currentSec);

        // Auto-stop at exactly 30 seconds
        if (currentSec >= MAX_RECORD_SECONDS) {
          stopRecording();
          onShowToast('Reached maximum 30-second voice memo limit! ⏱️');
        }
      }, 1000);
    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please allow microphone access to record voice notes.');
      } else {
        setPermissionError('Could not start microphone recording.');
      }
      onShowToast('Could not access microphone.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    sound.playHeartReaction();
  };

  // Toggle preview playback
  const togglePreviewPlayback = () => {
    if (!previewAudioRef.current) return;
    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current.play().catch(e => console.error(e));
      setIsPlayingPreview(true);
    }
  };

  // Save Memo
  const handleSave = () => {
    if (!recordedAudioDataUrl) return;

    sound.playPinWindchime();
    const memo: DateVoiceMemo = {
      id: `memo-${Date.now()}`,
      audioDataUrl: recordedAudioDataUrl,
      durationSeconds: recordedDuration || elapsedSeconds || 1,
      recordedAt: new Date().toISOString(),
      recordedBy: activePartner.name,
      partnerId: activePartner.id,
      caption: caption.trim() || undefined,
    };

    onSaveMemo(memo);
    onShowToast(`Voice note saved for "${dateTitle}"! 🎙️💕`);
  };

  // Retake
  const handleRetake = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setRecordedAudioDataUrl(null);
    setRecordedDuration(0);
    setElapsedSeconds(0);
    setIsPlayingPreview(false);
  };

  const remainingSeconds = MAX_RECORD_SECONDS - elapsedSeconds;
  const progressPercent = (elapsedSeconds / MAX_RECORD_SECONDS) * 100;

  return (
    <div className="rounded-2xl border-2 border-dashed border-rose-300 bg-rose-50/70 p-4 shadow-sm backdrop-blur-xs animate-develop">
      <div className="flex items-center justify-between border-b border-rose-200/70 pb-2.5 mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs">
            <Mic className="h-4 w-4" />
          </div>
          <div>
            <h5 className="font-serif-title text-xs font-bold text-stone-900">
              Record 30s Date Voice Memo
            </h5>
            <p className="text-[10px] text-stone-500 truncate max-w-[200px] sm:max-w-xs">
              For: “{dateTitle}”
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 text-stone-400 hover:bg-rose-100 hover:text-stone-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {permissionError ? (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200 flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Microphone Access Needed</p>
            <p className="text-[11px] mt-0.5 text-amber-700">{permissionError}</p>
            <button
              type="button"
              onClick={startRecording}
              className="mt-2 rounded-lg bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
            >
              Retry Mic Access
            </button>
          </div>
        </div>
      ) : !recordedAudioDataUrl ? (
        <div className="flex flex-col items-center justify-center py-3 text-center">
          {/* Circular Progress & Mic Action Button */}
          <div className="relative flex items-center justify-center my-2">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
            )}

            <button
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md transition-all cursor-pointer ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 scale-105'
                  : 'bg-gradient-to-tr from-rose-500 to-pink-500 hover:scale-105 active:scale-95'
              }`}
            >
              {isRecording ? (
                <Square className="h-6 w-6 fill-current" />
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
          </div>

          {/* Time & Instructions */}
          <div className="mt-2">
            <p className="font-mono text-sm font-bold text-stone-800">
              {isRecording ? `00:${elapsedSeconds < 10 ? '0' : ''}${elapsedSeconds}` : '00:00'}{' '}
              <span className="text-stone-400 font-normal">/ 00:30</span>
            </p>
            <p className="text-xs font-medium text-stone-600 mt-0.5">
              {isRecording
                ? `${remainingSeconds}s remaining... (Tap square to stop)`
                : `Tap mic to record ${activePartner.name}'s thoughts & excitement!`}
            </p>
          </div>

          {/* Progress Bar */}
          {isRecording && (
            <div className="w-full max-w-xs mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className={`h-full transition-all duration-300 ${
                    remainingSeconds <= 5 ? 'bg-red-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Recorded Audio */
        <div className="space-y-3 py-1">
          <div className="rounded-xl border border-rose-200 bg-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={togglePreviewPlayback}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs hover:bg-rose-600 transition-colors"
              >
                {isPlayingPreview ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </button>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  {activePartner.name}'s Voice Memo
                </p>
                <p className="text-[10px] text-stone-500">
                  Duration: {recordedDuration || elapsedSeconds} seconds
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRetake}
              className="text-xs text-stone-500 hover:text-rose-600 font-medium px-2 py-1 rounded-lg hover:bg-stone-50"
            >
              Retake
            </button>
          </div>

          {/* Optional Caption Input */}
          <div>
            <label className="text-[10px] font-semibold text-stone-600">
              Add a sweet note / caption (optional):
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="e.g., We HAVE to do this next weekend! 🍓"
              className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-800 focus:border-rose-400 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Attach Voice Note 🎙️</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
