import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Check,
  Flame,
  Music,
  RefreshCw,
  Search,
  Plus,
  Heart,
  Trash2,
  ChevronDown,
  ChevronUp,
  LogOut,
  Disc,
  X,
  Radio,
  ExternalLink,
  BookOpen,
  Copy,
  Filter,
} from 'lucide-react';
import {
  ALL_QUOTES,
  TAYLOR_SWIFT_QUOTES,
  CRISTIANO_RONALDO_QUOTES,
  QUOTE_THEMES,
  QUOTE_SOURCES,
  QuoteTheme,
  QuoteSource,
  QuoteItem,
  filterQuotes,
} from '../data/quotes';
import {
  VibesPair,
  InspirationTrack,
  PartnerProfile,
  SpotifyTrackItem,
  PartnerWeeklyVibes,
  ArchivedWeekVibes,
} from '../types';
import { storage } from '../utils/storage';
import { sound } from '../utils/audio';
import { db } from '../utils/firebase';
import * as firestore from 'firebase/firestore';
import {
  initiateSpotifyLogin,
  exchangeCodeForToken,
  getValidAccessToken,
  searchSpotifyTracks,
  clearSpotifyAuth,
  SpotifySearchResultTrack,
} from '../utils/spotify';


interface VibesTabProps {
  partners: PartnerProfile[];
  activePartnerId: 'p1' | 'p2';
  currentBackgroundGradient: string | null | undefined;
  onSetBackground: (gradient: string, id: string) => void;
  onShowToast: (msg: string) => void;
}

export function VibesTab({
  partners,
  activePartnerId,
  currentBackgroundGradient,
  onSetBackground,
  onShowToast,
}: VibesTabProps) {
  const activePartner = partners.find(p => p.id === activePartnerId) || partners[0];
  const p1 = partners[0] || { id: 'p1', name: 'Partner 1', avatarEmoji: '🌸', avatarColor: '#f43f5e' };
  const p2 = partners[1] || { id: 'p2', name: 'Partner 2', avatarEmoji: '☕', avatarColor: '#d97706' };

  // Sub section view tab: 'songs' | 'daily_quotes'
  const [vibeSubTab, setVibeSubTab] = useState<'songs' | 'daily_quotes'>('songs');



  // DAILY QUOTES STATE
  const [dailyData, setDailyData] = useState<{
    pairs: VibesPair[];
    currentBlockIndex: number;
  }>(() => storage.getVibesDailyPairs());

  const [selectedPairIndex, setSelectedPairIndex] = useState<number>(
    dailyData.currentBlockIndex
  );

  // Background Theme Cache
  const [themesCache, setThemesCache] = useState<Record<string, any>>({});
  const [loadingThemes, setLoadingThemes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const coupleCode = storage.getCoupleCode();
    if (!coupleCode) return;

    // Listen for theme updates
    const unsubscribe = firestore.onSnapshot(firestore.collection(db, 'couples', coupleCode, 'quoteThemes'), (snap) => {
      const cache: Record<string, any> = {};
      snap.forEach(d => cache[d.id] = d.data());
      setThemesCache(cache);
    });
    return () => unsubscribe();
  }, []);

  const getThemeForQuote = async (quote: InspirationTrack) => {
    const quoteId = `${quote.id}-${quote.quote.substring(0, 10)}`;
    if (themesCache[quoteId]) return themesCache[quoteId];
    
    setLoadingThemes(prev => ({ ...prev, [quoteId]: true }));
    try {
      const res = await fetch('/api/gemini/background-theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quote: quote.quote, theme: quote.category, person: quote.id }),
      });
      const data = await res.json();
      
      const coupleCode = storage.getCoupleCode();
      if (coupleCode) {
        await firestore.setDoc(firestore.doc(db, 'couples', coupleCode, 'quoteThemes', quoteId), data);
      }
      return data;
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setLoadingThemes(prev => ({ ...prev, [quoteId]: false }));
    }
  };


  // WEEKLY SONG VIBES STATE
  const [weeklyVibes, setWeeklyVibes] = useState<PartnerWeeklyVibes>(() =>
    storage.getWeeklyVibes()
  );
  const [archivedVibes, setArchivedVibes] = useState<ArchivedWeekVibes[]>(() =>
    storage.getArchivedVibes()
  );

  // View mode for partner lists: 'side_by_side' | 'mine' | 'theirs'
  const [musicViewMode, setMusicViewMode] = useState<'side_by_side' | 'mine' | 'theirs'>('side_by_side');

  const myPartner = activePartner;
  const theirPartner = partners.find(p => p.id !== activePartnerId) || partners[1] || partners[0];

  const myTracks = myPartner.id === 'p1' ? weeklyVibes.p1Tracks : weeklyVibes.p2Tracks;
  const theirTracks = theirPartner.id === 'p1' ? weeklyVibes.p1Tracks : weeklyVibes.p2Tracks;

  // SIMILARITY SCORE CALCULATION
  const similarityScore = useMemo(() => {
    const normalizeArtists = (tracks: SpotifyTrackItem[]) => {
      const set = new Set<string>();
      tracks.forEach(t => {
        if (!t.artist) return;
        const parts = t.artist.split(/[,&]|\bfeat\b|\bft\b/i);
        parts.forEach(p => {
          const cleaned = p.trim().toLowerCase();
          if (cleaned) set.add(cleaned);
        });
      });
      return Array.from(set);
    };

    const p1Artists = normalizeArtists(weeklyVibes.p1Tracks);
    const p2Artists = normalizeArtists(weeklyVibes.p2Tracks);

    if (p1Artists.length === 0 || p2Artists.length === 0) {
      return { percentage: 0, sharedArtists: [], totalTracks: weeklyVibes.p1Tracks.length + weeklyVibes.p2Tracks.length };
    }

    const p2Set = new Set(p2Artists);
    const shared = p1Artists.filter(a => p2Set.has(a));

    const formattedShared = shared.map(a =>
      a.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    );

    // Sørensen–Dice coefficient calculation for natural percentage scaling
    const diceScore = (2 * shared.length) / (p1Artists.length + p2Artists.length);
    const percentage = Math.round(diceScore * 100);

    return {
      percentage,
      sharedArtists: formattedShared,
      totalTracks: weeklyVibes.p1Tracks.length + weeklyVibes.p2Tracks.length,
    };
  }, [weeklyVibes.p1Tracks, weeklyVibes.p2Tracks]);

  // Spotify Auth state
  const [isSpotifyConnected, setIsSpotifyConnected] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Spotify Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifySearchResultTrack[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // History section toggle
  const [showHistory, setShowHistory] = useState(false);

  // Check Spotify Auth on mount & handle incoming OAuth message/code
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const token = await getValidAccessToken();
        if (isMounted) {
          setIsSpotifyConnected(Boolean(token));
        }
      } catch {
        if (isMounted) setIsSpotifyConnected(false);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    }

    checkAuth();

    // Listen for postMessage from Spotify popup
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_OAUTH_CODE' && event.data.code) {
        try {
          sound.playHeartReaction();
          await exchangeCodeForToken(event.data.code);
          if (isMounted) {
            setIsSpotifyConnected(true);
            onShowToast('Connected to Spotify! 🎶');
          }
        } catch (err) {
          console.error(err);
          onShowToast('Spotify connection failed.');
        }
      }
    };

    window.addEventListener('message', handleMessage);

    // Check URL query code if popup redirected back directly
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('spotify_code');
    if (code) {
      exchangeCodeForToken(code)
        .then(() => {
          if (isMounted) {
            setIsSpotifyConnected(true);
            onShowToast('Connected to Spotify! 🎶');
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Real-time Firestore sync for Weekly Song Vibes under couples/{coupleCode}/vibes
  useEffect(() => {
    const coupleCode = storage.getCoupleCode();
    if (!coupleCode || !weeklyVibes.weekKey) return;

    const docRef = firestore.doc(db, 'couples', coupleCode, 'vibes', 'weekly_' + weeklyVibes.weekKey);
    const unsubscribe = firestore.onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PartnerWeeklyVibes;
        if (data && data.weekKey === weeklyVibes.weekKey) {
          setWeeklyVibes(data);
          storage.saveWeeklyVibes(data);
        }
      }
    }, (err) => {
      console.warn('Real-time vibes listener:', err);
    });

    return () => unsubscribe();
  }, [weeklyVibes.weekKey]);

  // Save weekly vibes updates to LocalStorage and shared Firestore space
  const updateAndSaveWeeklyVibes = async (newVibes: PartnerWeeklyVibes) => {
    setWeeklyVibes(newVibes);
    storage.saveWeeklyVibes(newVibes);
    const coupleCode = storage.getCoupleCode();
    if (coupleCode && newVibes.weekKey) {
      try {
        await firestore.setDoc(
          firestore.doc(db, 'couples', coupleCode, 'vibes', 'weekly_' + newVibes.weekKey),
          newVibes,
          { merge: true }
        );
      } catch (err) {
        console.error('Failed to sync weekly vibes to cloud:', err);
        onShowToast('Could not sync song change to cloud. Check internet connection 💕');
      }
    }
  };


  // SPOTIFY SEARCH HANDLER
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchModal(true);

    try {
      const results = await searchSpotifyTracks(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      if (err?.message === 'NOT_CONNECTED') {
        setIsSpotifyConnected(false);
        onShowToast('Please connect Spotify to search songs 🎶');
      } else {
        onShowToast('Search error. Check your connection or try again.');
      }
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ADD TRACK TO ACTIVE PARTNER'S LIST
  const handleAddTrack = (track: SpotifySearchResultTrack) => {
    sound.playHeartReaction();

    const newTrackItem: SpotifyTrackItem = {
      id: track.id,
      title: track.title,
      artist: track.artist,
      albumArt: track.albumArt,
      spotifyUrl: track.spotifyUrl,
      addedBy: activePartner.id,
      addedByName: activePartner.name,
      addedAt: new Date().toISOString(),
      hearts: {},
    };

    const isP1 = activePartner.id === 'p1';
    const targetList = isP1 ? weeklyVibes.p1Tracks : weeklyVibes.p2Tracks;

    // Check if song already exists in current week's list
    if (targetList.some(t => t.id === track.id)) {
      onShowToast(`"${track.title}" is already in ${activePartner.name}'s list!`);
      return;
    }

    const updatedVibes: PartnerWeeklyVibes = {
      ...weeklyVibes,
      p1Tracks: isP1 ? [newTrackItem, ...weeklyVibes.p1Tracks] : weeklyVibes.p1Tracks,
      p2Tracks: !isP1 ? [newTrackItem, ...weeklyVibes.p2Tracks] : weeklyVibes.p2Tracks,
    };

    updateAndSaveWeeklyVibes(updatedVibes);
    onShowToast(`Added "${track.title}" to ${activePartner.name}'s vibes! 🎶`);
    setShowSearchModal(false);
  };

  // TOGGLE HEART REACTION ON TRACK
  const handleToggleHeartTrack = (targetPartnerId: 'p1' | 'p2', trackId: string) => {
    sound.playHeartReaction();

    const isTargetP1 = targetPartnerId === 'p1';
    const list = isTargetP1 ? weeklyVibes.p1Tracks : weeklyVibes.p2Tracks;

    const updatedList = list.map(t => {
      if (t.id === trackId) {
        const currentHearts = t.hearts || {};
        const isHearted = Boolean(currentHearts[activePartner.id]);
        const newHearts = { ...currentHearts, [activePartner.id]: !isHearted };
        return { ...t, hearts: newHearts };
      }
      return t;
    });

    const updatedVibes: PartnerWeeklyVibes = {
      ...weeklyVibes,
      p1Tracks: isTargetP1 ? updatedList : weeklyVibes.p1Tracks,
      p2Tracks: !isTargetP1 ? updatedList : weeklyVibes.p2Tracks,
    };

    updateAndSaveWeeklyVibes(updatedVibes);
    onShowToast(`${activePartner.name} ❤️'d this song!`);
  };

  // DELETE TRACK FROM LIST
  const handleDeleteTrack = (targetPartnerId: 'p1' | 'p2', trackId: string) => {
    sound.playSoftChime();

    const isTargetP1 = targetPartnerId === 'p1';
    const list = isTargetP1 ? weeklyVibes.p1Tracks : weeklyVibes.p2Tracks;
    const updatedList = list.filter(t => t.id !== trackId);

    const updatedVibes: PartnerWeeklyVibes = {
      ...weeklyVibes,
      p1Tracks: isTargetP1 ? updatedList : weeklyVibes.p1Tracks,
      p2Tracks: !isTargetP1 ? updatedList : weeklyVibes.p2Tracks,
    };

    updateAndSaveWeeklyVibes(updatedVibes);
    onShowToast('Track removed 🗑️');
  };

  // CONNECT & DISCONNECT SPOTIFY
  const handleSpotifyConnect = async () => {
    sound.playSoftChime();
    try {
      const popup = await initiateSpotifyLogin();
      if (!popup) return;

      const pollTimer = setInterval(async () => {
        try {
          if (popup.closed) {
            clearInterval(pollTimer);
            return;
          }
          if (popup.location.origin === window.location.origin) {
            const params = new URLSearchParams(popup.location.search);
            const code = params.get('code') || params.get('spotify_code');
            if (code) {
              clearInterval(pollTimer);
              popup.close();
              
              sound.playHeartReaction();
              onShowToast('Exchanging code for Spotify session... ⚡');
              await exchangeCodeForToken(code);
              setIsSpotifyConnected(true);
              onShowToast('Connected to Spotify! 🎶');
            }
          }
        } catch (e) {
          // Suppress cross-origin security errors while popup is on Spotify's domain
        }
      }, 300);
    } catch (err) {
      console.error('Spotify popup initialization failed:', err);
      onShowToast('Popup blocked or failed to launch. Please check your browser settings! ⚠️');
    }
  };

  const handleDisconnectSpotify = () => {
    sound.playSoftChime();
    clearSpotifyAuth();
    setIsSpotifyConnected(false);
    onShowToast('Disconnected Spotify.');
  };

  // DAILY QUOTES & BACKGROUND HANDLERS
  const activePair = dailyData.pairs[selectedPairIndex] || dailyData.pairs[0];
  const isCurrentBlockSelected = selectedPairIndex === dailyData.currentBlockIndex;
  const taylorTrack = activePair.taylor;
  const ronaldoTrack = activePair.ronaldo;
  const isTaylorApplied = currentBackgroundGradient === taylorTrack.gradient;
  const isRonaldoApplied = currentBackgroundGradient === ronaldoTrack.gradient;

  const handleApplyBackground = (track: InspirationTrack) => {
    sound.playHeartReaction();
    onSetBackground(track.gradient, track.id);
    onShowToast(`Applied ${track.themeName} as app wallpaper! ✨`);
  };

  const handleResetBackground = () => {
    sound.playSoftChime();
    onSetBackground('', '');
    onShowToast('App background reset to theme preset 🌸');
  };

  return (
    <div className="space-y-6 pb-24">
      {/* HEADER SECTION WITH SUB-TAB TOGGLES */}
      <section className="rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-purple-50/50 to-amber-50/80 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-100/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-400 to-purple-500 text-white shadow-md shadow-rose-200">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif-title text-xl sm:text-2xl font-bold text-stone-800">
                  Couple Vibes
                </h1>
                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                  Weekly Songs & Reflections
                </span>

                {/* Heart-themed Music Similarity Percentage Badge */}
                <div
                  className="group relative flex items-center space-x-1 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white px-2.5 py-0.5 text-[11px] font-extrabold shadow-xs hover:scale-105 transition-all cursor-pointer"
                  title={
                    similarityScore.sharedArtists.length > 0
                      ? `Music Vibe Sync: ${similarityScore.percentage}%! Shared Artists: ${similarityScore.sharedArtists.join(', ')}`
                      : `Music Vibe Sync: ${similarityScore.percentage}%. Add songs with matching artists!`
                  }
                >
                  <Heart className="h-3 w-3 fill-current text-white animate-pulse" />
                  <span>{similarityScore.percentage}% Sync</span>

                  {/* Hover/Touch Tooltip showing shared artists */}
                  <div className="absolute left-0 top-full mt-1.5 hidden group-hover:flex flex-col z-30 w-52 rounded-2xl border border-rose-200 bg-white p-3 text-stone-800 shadow-xl animate-pin-pop pointer-events-none">
                    <div className="flex items-center justify-between border-b border-rose-100 pb-1 mb-1.5">
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                        Music Vibe Match
                      </span>
                      <span className="text-xs font-extrabold text-rose-600">
                        {similarityScore.percentage}% ❤️
                      </span>
                    </div>
                    {similarityScore.sharedArtists.length > 0 ? (
                      <div>
                        <p className="text-[10px] text-stone-500 font-medium">Shared Artist Vibes:</p>
                        <p className="text-xs font-bold text-stone-800 mt-0.5">
                          {similarityScore.sharedArtists.join(', ')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-500 leading-snug">
                        Add tracks by the same artists in 'My Vibes' and 'Their Vibes' to increase your music sync score!
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Spotify song vibes & side-by-side daily quotes
              </p>
            </div>
          </div>

          {/* Spotify Connection Status Button */}
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {isSpotifyConnected ? (
              <div className="flex items-center space-x-2 rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs text-emerald-800 font-semibold shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Spotify Connected</span>
                <button
                  type="button"
                  onClick={handleDisconnectSpotify}
                  className="ml-1 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                  title="Disconnect Spotify account"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSpotifyConnect}
                className="flex items-center space-x-1.5 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-white px-3.5 py-2 text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <Disc className="h-4 w-4 animate-spin-slow" />
                <span>Connect Spotify 🎶</span>
              </button>
            )}
          </div>
        </div>

        {/* SUB TAB PILLS: SONGS VS DAILY PAIRS VS QUOTE INVENTORY */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setVibeSubTab('songs');
            }}
            className={`flex items-center justify-center space-x-1.5 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
              vibeSubTab === 'songs'
                ? 'bg-rose-600 text-white shadow-md font-extrabold scale-102'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <Music className="h-4 w-4" />
            <span>Weekly Songs 🎧</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playSoftChime();
              setVibeSubTab('daily_quotes');
            }}
            className={`flex items-center justify-center space-x-1.5 rounded-2xl py-2.5 px-3 text-xs font-bold transition-all cursor-pointer ${
              vibeSubTab === 'daily_quotes'
                ? 'bg-purple-600 text-white shadow-md font-extrabold scale-102'
                : 'bg-white/80 text-stone-600 hover:bg-white hover:text-stone-900 border border-stone-200/60'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>Daily Pairs ✨</span>
          </button>


        </div>
      </section>

      {/* SUB-SECTION 1: WEEKLY PARTNER SONG VIBES */}
      {vibeSubTab === 'songs' && (
        <section className="space-y-6">
          {/* SEARCH BAR & SPOTIFY CONNECT BANNER */}
          <div className="rounded-3xl border border-rose-200/80 bg-white p-5 shadow-sm">
            {!isSpotifyConnected && (
              <div className="mb-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1DB954] text-white shadow-xs">
                    <Disc className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-800">
                      Connect your Spotify to add songs 🎶
                    </h4>
                    <p className="text-[11px] text-stone-500 leading-tight">
                      Search Spotify's official catalog and add tracks to {activePartner.name}'s list!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playSoftChime();
                    initiateSpotifyLogin();
                  }}
                  className="shrink-0 rounded-xl bg-[#1DB954] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#1ed760] transition-all cursor-pointer"
                >
                  Connect Spotify
                </button>
              </div>
            )}

            {/* Song Search Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search track or artist name on Spotify (e.g. Taylor Swift, Coldplay)..."
                  className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 pl-10 pr-4 py-2.5 text-xs font-medium text-stone-800 placeholder-stone-400 focus:border-rose-400 focus:bg-white focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="flex items-center space-x-1.5 rounded-2xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </button>
            </form>

            {/* View Mode Controls & Similarity Badge */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-stone-100 pt-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <span>{myPartner.avatarEmoji}</span>
                  <span>Logged as: <strong className="text-rose-600">{myPartner.name}</strong></span>
                </span>

                {/* Similarity Score Mini Badge */}
                <div
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/80 px-2.5 py-1 text-xs text-rose-800 font-bold shadow-2xs"
                  title={
                    similarityScore.sharedArtists.length > 0
                      ? `Shared Artists: ${similarityScore.sharedArtists.join(', ')}`
                      : 'Add matching artists in both lists to increase your sync score!'
                  }
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                  <span>{similarityScore.percentage}% Vibe Match</span>
                </div>
              </div>

              <div className="flex items-center space-x-1 bg-stone-100 rounded-xl p-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setMusicViewMode('side_by_side')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                    musicViewMode === 'side_by_side'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Side-by-Side 🪟
                </button>
                <button
                  type="button"
                  onClick={() => setMusicViewMode('mine')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                    musicViewMode === 'mine'
                      ? 'bg-white text-rose-600 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {myPartner.avatarEmoji} My Vibes ({myPartner.name})
                </button>
                <button
                  type="button"
                  onClick={() => setMusicViewMode('theirs')}
                  className={`rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                    musicViewMode === 'theirs'
                      ? 'bg-white text-amber-800 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {theirPartner.avatarEmoji} Their Vibes ({theirPartner.name})
                </button>
              </div>
            </div>
          </div>

          {/* SEARCH RESULTS MODAL / DROPDOWN */}
          {showSearchModal && (
            <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-lg animate-pin-pop">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
                <div className="flex items-center space-x-2">
                  <Disc className="h-5 w-5 text-rose-600" />
                  <h3 className="font-serif-title text-base font-bold text-stone-800">
                    Spotify Search Results for "{searchQuery}"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="rounded-full p-1 text-stone-400 hover:bg-stone-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isSearching ? (
                <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-rose-500" />
                  <span>Searching Spotify catalog...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-500">
                  <p className="font-semibold">No tracks found matching "{searchQuery}"</p>
                  <p className="text-[11px] text-stone-400 mt-1">Try searching another artist or song title.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                  {searchResults.map(track => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between rounded-2xl border border-stone-100 bg-stone-50/70 p-2.5 hover:bg-rose-50/50 hover:border-rose-200 transition-all"
                    >
                      <div className="flex items-center space-x-3 truncate mr-2">
                        <img
                          src={track.albumArt}
                          alt={track.title}
                          className="h-11 w-11 rounded-xl object-cover shadow-xs border border-stone-200 shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-serif-title text-xs font-bold text-stone-800 truncate leading-tight">
                            {track.title}
                          </p>
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {track.artist}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddTrack(track)}
                        className="flex shrink-0 items-center space-x-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add to {activePartner.name}'s Vibe</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PARTNERS' VIBES LISTS ('MY VIBES' AND 'THEIR VIBES') */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* MY VIBES CARD */}
            {(musicViewMode === 'side_by_side' || musicViewMode === 'mine') && (
              <div className="rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/60 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-rose-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{myPartner.avatarEmoji}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-700 uppercase tracking-wider">
                          My Vibes
                        </span>
                      </div>
                      <h2 className="font-serif-title text-base font-bold text-stone-800 mt-0.5">
                        My Vibe This Week ({myPartner.name})
                      </h2>
                      <p className="text-[11px] font-medium text-stone-500">
                        {myTracks.length} song{myTracks.length === 1 ? '' : 's'} added
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                    Current Week
                  </span>
                </div>

                {myTracks.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl border border-dashed border-rose-200 bg-white/60 p-4">
                    <Music className="mx-auto h-8 w-8 text-rose-300 mb-2" />
                    <p className="text-xs font-bold text-stone-700">
                      You haven't added any songs to your vibe list yet!
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Use the search bar above to add songs you're currently listening to.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {myTracks.map(track => {
                      const hearts = track.hearts || {};
                      const p1Hearted = hearts['p1'];
                      const p2Hearted = hearts['p2'];
                      const isHeartedByMe = Boolean(hearts[myPartner.id]);

                      return (
                        <div
                          key={track.id}
                          className="rounded-2xl border border-rose-100 bg-white p-3.5 shadow-xs hover:border-rose-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 truncate">
                              <img
                                src={track.albumArt}
                                alt={track.title}
                                className="h-12 w-12 rounded-xl object-cover shadow-xs border border-stone-200 shrink-0"
                              />
                              <div className="truncate">
                                <p className="font-serif-title text-sm font-bold text-stone-900 truncate leading-tight">
                                  {track.title}
                                </p>
                                <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                                  {track.artist}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                              {/* Heart reaction button */}
                              <button
                                type="button"
                                onClick={() => handleToggleHeartTrack(myPartner.id, track.id)}
                                className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  isHeartedByMe
                                    ? 'bg-rose-500 text-white shadow-xs scale-105'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80'
                                }`}
                                title={`Heart this track`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isHeartedByMe ? 'fill-current' : ''}`} />
                                <span>{p1Hearted || p2Hearted ? '❤️' : 'Heart'}</span>
                              </button>

                              {/* Delete track button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(myPartner.id, track.id)}
                                className="p-1 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remove song"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Heart status label */}
                          {(p1Hearted || p2Hearted) && (
                            <div className="text-[10px] font-bold text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                              <span>❤️</span>
                              <span>
                                {p1Hearted && p2Hearted
                                  ? `Both ${p1.name} & ${p2.name} love this song!`
                                  : p1Hearted
                                  ? `${p1.name} ❤️'d this song`
                                  : `${p2.name} ❤️'d this song`}
                              </span>
                            </div>
                          )}

                          {/* Embedded Official Spotify Player */}
                          <div className="w-full overflow-hidden rounded-xl border border-stone-100">
                            <iframe
                              src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                              width="100%"
                              height="80"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              className="rounded-xl border-0 shadow-2xs"
                              title={`${track.title} Spotify Player`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* THEIR VIBES CARD */}
            {(musicViewMode === 'side_by_side' || musicViewMode === 'theirs') && (
              <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-b from-amber-50/60 to-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl">{theirPartner.avatarEmoji}</span>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800 uppercase tracking-wider">
                          Their Vibes
                        </span>
                      </div>
                      <h2 className="font-serif-title text-base font-bold text-stone-800 mt-0.5">
                        {theirPartner.name}'s Vibe This Week
                      </h2>
                      <p className="text-[11px] font-medium text-stone-500">
                        {theirTracks.length} song{theirTracks.length === 1 ? '' : 's'} added
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                    Current Week
                  </span>
                </div>

                {theirTracks.length === 0 ? (
                  <div className="py-10 text-center rounded-2xl border border-dashed border-amber-200 bg-white/60 p-4">
                    <Music className="mx-auto h-8 w-8 text-amber-400 mb-2" />
                    <p className="text-xs font-bold text-stone-700">
                      No songs added yet for {theirPartner.name}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Switch to {theirPartner.name}'s profile in the top right to add songs to their list!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {theirTracks.map(track => {
                      const hearts = track.hearts || {};
                      const p1Hearted = hearts['p1'];
                      const p2Hearted = hearts['p2'];
                      const isHeartedByMe = Boolean(hearts[myPartner.id]);

                      return (
                        <div
                          key={track.id}
                          className="rounded-2xl border border-amber-100 bg-white p-3.5 shadow-xs hover:border-amber-300 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 truncate">
                              <img
                                src={track.albumArt}
                                alt={track.title}
                                className="h-12 w-12 rounded-xl object-cover shadow-xs border border-stone-200 shrink-0"
                              />
                              <div className="truncate">
                                <p className="font-serif-title text-sm font-bold text-stone-900 truncate leading-tight">
                                  {track.title}
                                </p>
                                <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                                  {track.artist}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                              {/* Heart reaction button */}
                              <button
                                type="button"
                                onClick={() => handleToggleHeartTrack(theirPartner.id, track.id)}
                                className={`flex items-center space-x-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                  isHeartedByMe
                                    ? 'bg-amber-600 text-white shadow-xs scale-105'
                                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                                }`}
                                title={`Heart this track as ${myPartner.name}`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isHeartedByMe ? 'fill-current' : ''}`} />
                                <span>{p1Hearted || p2Hearted ? '❤️' : 'Heart'}</span>
                              </button>

                              {/* Delete track button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(theirPartner.id, track.id)}
                                className="p-1 text-stone-300 hover:text-amber-700 transition-colors cursor-pointer"
                                title="Remove song"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Heart status label */}
                          {(p1Hearted || p2Hearted) && (
                            <div className="text-[10px] font-bold text-amber-800 bg-amber-50 rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                              <span>❤️</span>
                              <span>
                                {p1Hearted && p2Hearted
                                  ? `Both ${p1.name} & ${p2.name} love this song!`
                                  : p1Hearted
                                  ? `${p1.name} ❤️'d this song`
                                  : `${p2.name} ❤️'d this song`}
                              </span>
                            </div>
                          )}

                          {/* Embedded Official Spotify Player */}
                          <div className="w-full overflow-hidden rounded-xl border border-stone-100">
                            <iframe
                              src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                              width="100%"
                              height="80"
                              frameBorder="0"
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                              loading="lazy"
                              className="rounded-xl border-0 shadow-2xs"
                              title={`${track.title} Spotify Player`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* COLLAPSIBLE PAST WEEKS HISTORY */}
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-xs">
            <button
              type="button"
              onClick={() => {
                sound.playSoftChime();
                setShowHistory(prev => !prev);
              }}
              className="flex w-full items-center justify-between font-serif-title text-base font-bold text-stone-800 hover:text-rose-600 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Disc className="h-5 w-5 text-rose-500" />
                <span>Past Weeks Vibe Archive ({archivedVibes.length})</span>
              </div>
              {showHistory ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
            </button>

            {showHistory && (
              <div className="mt-4 pt-4 border-t border-stone-100 space-y-5 animate-pin-pop">
                {archivedVibes.length === 0 ? (
                  <p className="text-center py-6 text-xs text-stone-400">
                    No past weeks archived yet. Lists auto-reset every Monday!
                  </p>
                ) : (
                  archivedVibes.map((arch, aIdx) => (
                    <div
                      key={arch.weekKey || aIdx}
                      className="rounded-2xl border border-stone-200/80 bg-stone-50/60 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                        <span className="font-serif-title text-xs font-bold text-stone-800">
                          {arch.weekLabel || `Week of ${arch.weekKey}`}
                        </span>
                        <span className="text-[10px] text-stone-400 font-medium">
                          {(arch.p1Tracks?.length || 0) + (arch.p2Tracks?.length || 0)} total tracks
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* P1 Archived List */}
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                            <span>{p1.avatarEmoji}</span>
                            <span>{p1.name}'s List</span>
                          </h5>
                          {arch.p1Tracks?.length === 0 ? (
                            <p className="text-[10px] text-stone-400 italic">No songs logged</p>
                          ) : (
                            arch.p1Tracks?.map(t => (
                              <div key={t.id} className="rounded-xl bg-white p-2 text-xs border border-stone-200/60 flex items-center space-x-2">
                                <img src={t.albumArt} alt={t.title} className="h-8 w-8 rounded-lg object-cover" />
                                <div className="truncate">
                                  <p className="font-bold text-stone-800 truncate">{t.title}</p>
                                  <p className="text-[10px] text-stone-400 truncate">{t.artist}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* P2 Archived List */}
                        <div className="space-y-2">
                          <h5 className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                            <span>{p2.avatarEmoji}</span>
                            <span>{p2.name}'s List</span>
                          </h5>
                          {arch.p2Tracks?.length === 0 ? (
                            <p className="text-[10px] text-stone-400 italic">No songs logged</p>
                          ) : (
                            arch.p2Tracks?.map(t => (
                              <div key={t.id} className="rounded-xl bg-white p-2 text-xs border border-stone-200/60 flex items-center space-x-2">
                                <img src={t.albumArt} alt={t.title} className="h-8 w-8 rounded-lg object-cover" />
                                <div className="truncate">
                                  <p className="font-bold text-stone-800 truncate">{t.title}</p>
                                  <p className="text-[10px] text-stone-400 truncate">{t.artist}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* SUB-SECTION 2: DAILY QUOTES & WALLPAPERS */}
      {vibeSubTab === 'daily_quotes' && (
        <section className="space-y-6">
          {/* TODAY'S PAIRS STRIP (STORY DOTS THUMBNAILS) */}
          <div className="rounded-3xl border border-rose-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Today's Vibe Pairs
              </span>
              <span className="text-[11px] text-rose-600 font-medium">
                Tap any pair to view
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {dailyData.pairs.map((pair, idx) => {
                const isSelected = selectedPairIndex === idx;
                const isLiveCurrent = dailyData.currentBlockIndex === idx;

                return (
                  <button
                    key={pair.pairIndex}
                    type="button"
                    onClick={() => {
                      sound.playSoftChime();
                      setSelectedPairIndex(idx);
                    }}
                    className={`relative flex flex-col items-center rounded-2xl p-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-50/80 shadow-md ring-2 ring-rose-400 scale-102'
                        : 'bg-stone-50 hover:bg-stone-100 border border-stone-200/60'
                    }`}
                  >
                    {/* Active Live Indicator */}
                    {isLiveCurrent && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white" />
                      </span>
                    )}

                    {/* Split Preview Swatch */}
                    <div className="relative h-10 w-full overflow-hidden rounded-xl shadow-xs flex">
                      <div
                        className="w-1/2 h-full"
                        style={{ background: pair.taylor.gradient }}
                      />
                      <div
                        className="w-1/2 h-full"
                        style={{ background: pair.ronaldo.gradient }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/30 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white">
                          ⚡♡
                        </div>
                      </div>
                    </div>

                    <span
                      className={`mt-1.5 text-[11px] font-bold ${
                        isSelected ? 'text-rose-700' : 'text-stone-600'
                      }`}
                    >
                      Pair #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PAIR DISPLAY: SIDE-BY-SIDE (OR STACKED ON MOBILE) */}
          <div className="relative rounded-3xl border border-stone-200/80 bg-white shadow-lg overflow-hidden">
            {/* Top Header Bar for Active Pair */}
            <div className="flex items-center justify-between border-b border-stone-100 bg-stone-50/80 px-5 py-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-stone-800">
                  Vibe Pair #{selectedPairIndex + 1}
                </span>
                {isCurrentBlockSelected && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Now
                  </span>
                )}
              </div>
              <span className="text-[11px] text-stone-400 font-medium">
                Poetic Devotion x High Energy Drive
              </span>
            </div>

            {/* Dual Split Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 relative">
              {/* TAYLOR SWIFT SIDE */}
              <div
                className="relative flex flex-col justify-between p-6 sm:p-7 min-h-[380px] transition-all duration-300"
                style={{
                  background: taylorTrack.gradient,
                  color: taylorTrack.textColor,
                }}
              >
                {/* Whimsical Sparkle Pattern Overlay */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 rounded-full bg-black/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                    <Music className="h-3.5 w-3.5" />
                    <span>{taylorTrack.accentBadge}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Taylor Swift
                  </span>
                </div>

                {/* Main Quote */}
                <div className="relative z-10 my-6">
                  <span className="font-serif-title text-4xl leading-none opacity-40">“</span>
                  <p className="font-serif-title text-xl sm:text-2xl font-medium leading-relaxed tracking-wide drop-shadow-xs">
                    {taylorTrack.quote}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-90">
                    — {taylorTrack.attribution}
                  </p>
                </div>

                {/* Bottom Theme Details & Wallpaper Action */}
                <div className="relative z-10 space-y-3">
                  <div className="rounded-2xl bg-black/15 p-3 backdrop-blur-md">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">Theme: {taylorTrack.themeName}</span>
                      <span className="text-[10px] opacity-80">Soft Eras Aesthetic</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-85 leading-snug">
                      {taylorTrack.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyBackground(taylorTrack)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer ${
                      isTaylorApplied
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-white/90 text-stone-800 hover:bg-white backdrop-blur-sm'
                    }`}
                  >
                    {isTaylorApplied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Applied as App Background</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <span>Set as App Background</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* VISUAL CENTER DIVIDER */}
              <div className="hidden md:flex absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 items-center justify-center pointer-events-none">
                <div className="h-full w-0.5 bg-gradient-to-b from-transparent via-white/80 to-transparent shadow-lg" />
                <div className="absolute rounded-full border border-white/40 bg-stone-900/80 px-2.5 py-1 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                  ⚡♡
                </div>
              </div>

              {/* Horizontal Divider for Mobile screens */}
              <div className="flex md:hidden relative w-full h-8 z-20 items-center justify-center bg-stone-900 text-white font-bold text-xs tracking-wider">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-amber-500 to-purple-600 opacity-30" />
                <span className="relative z-10 flex items-center gap-1 text-[11px]">
                  <Sparkles className="h-3 w-3 text-amber-300" /> SYNERGY VIBE <Sparkles className="h-3 w-3 text-amber-300" />
                </span>
              </div>

              {/* CRISTIANO RONALDO SIDE */}
              <div
                className="relative flex flex-col justify-between p-6 sm:p-7 min-h-[380px] transition-all duration-300"
                style={{
                  background: ronaldoTrack.gradient,
                  color: ronaldoTrack.textColor,
                }}
              >
                {/* Bold High Energy Graphic Patterns Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] [background-size:24px_24px]" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    <span>{ronaldoTrack.accentBadge}</span>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    Cristiano Ronaldo
                  </span>
                </div>

                {/* Main Quote */}
                <div className="relative z-10 my-6">
                  <span className="font-serif-title text-4xl leading-none opacity-40">“</span>
                  <p className="font-serif-title text-xl sm:text-2xl font-medium leading-relaxed tracking-wide drop-shadow-xs">
                    {ronaldoTrack.quote}
                  </p>
                  <p className="mt-4 text-xs font-bold uppercase tracking-widest opacity-90">
                    — {ronaldoTrack.attribution}
                  </p>
                </div>

                {/* Bottom Theme Details & Wallpaper Action */}
                <div className="relative z-10 space-y-3">
                  <div className="rounded-2xl bg-black/30 p-3 backdrop-blur-md border border-white/10">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">Theme: {ronaldoTrack.themeName}</span>
                      <span className="text-[10px] opacity-80">High Energy Drive</span>
                    </div>
                    <p className="mt-1 text-[11px] opacity-85 leading-snug">
                      {ronaldoTrack.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyBackground(ronaldoTrack)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 px-4 text-xs font-bold shadow-md transition-all active:scale-98 cursor-pointer ${
                      isRonaldoApplied
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                        : 'bg-stone-900/90 text-white hover:bg-stone-900 backdrop-blur-sm border border-white/10'
                    }`}
                  >
                    {isRonaldoApplied ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Applied as App Background</span>
                      </>
                    ) : (
                      <>
                        <Flame className="h-4 w-4 text-amber-400" />
                        <span>Set as App Background</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RESET APP WALLPAPER FOOTER */}
          {Boolean(currentBackgroundGradient) && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleResetBackground}
                className="flex items-center space-x-1.5 rounded-2xl border border-stone-200 bg-white/80 px-4 py-2 text-xs font-semibold text-stone-600 shadow-xs hover:bg-white hover:text-stone-900 transition-all cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset App Background to Theme Preset</span>
              </button>
            </div>
          )}
        </section>
      )}



    </div>
  );
}

