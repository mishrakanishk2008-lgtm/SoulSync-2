import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  storage,
  DEFAULT_PARTNERS,
  DEFAULT_SETTINGS,
  DEFAULT_NOTES,
  DEFAULT_MESSAGES,
  DEFAULT_SNAPS,
  DEFAULT_MILESTONES,
  DEFAULT_CHECKLIST,
  DEFAULT_MOODS,
  DEFAULT_SOMEDAY,
  DEFAULT_LOVE_MAP_SPOTS,
} from './utils/storage';
import {
  LoveNote,
  ChatMessage,
  SnapPhoto,
  Milestone,
  DailyChecklistItem,
  MoodCheckin,
  DailyMoodRecord,
  MoodHistoryMap,
  SomedayItem,
  PartnerProfile,
  CoupleSettings,
  StreakData,
  NoteColor,
  ChatMediaAttachment,
  LoveMapSpot,
} from './types';
import { Header } from './components/Header';
import { BottomNav, TabId } from './components/BottomNav';
import { LockScreen } from './components/LockScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { SettingsModal } from './components/SettingsModal';
import { DailyInspirationModal } from './components/DailyInspirationModal';
import { getThemeConfig } from './utils/themes';
import { findMoodInfo } from './utils/moods';
import { Toast } from './components/Toast';
import { ChatNotesTab } from './tabs/ChatNotesTab';
import { SnapsTab } from './tabs/SnapsTab';
import { TogetherTab } from './tabs/TogetherTab';
import { DateAITab } from './tabs/DateAITab';
import { VibesTab } from './tabs/VibesTab';
import { compressDataUrlIfNeeded } from './utils/image';

// Firebase Imports
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db, auth, useOnlineStatus, signInAnonymously } from './utils/firebase';

export default function App() {
  // Primary state loaded from LocalStorage
  const [coupleCode, setCoupleCode] = useState<string | null>(() => storage.getCoupleCode());
  const [partners, setPartners] = useState<PartnerProfile[]>(() => storage.getPartners());
  const [settings, setSettings] = useState<CoupleSettings>(() => storage.getSettings());
  const [notes, setNotes] = useState<LoveNote[]>(() => storage.getNotes());
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.getMessages());
  const [snaps, setSnaps] = useState<SnapPhoto[]>(() => storage.getSnaps());
  const [milestones, setMilestones] = useState<Milestone[]>(() => storage.getMilestones());
  const [checklist, setChecklist] = useState<DailyChecklistItem[]>(() => storage.getChecklist());
  const [moods, setMoods] = useState<MoodCheckin>(() => storage.getMoods());
  const [moodHistory, setMoodHistory] = useState<MoodHistoryMap>(() => storage.getMoodHistory());
  const [someday, setSomeday] = useState<SomedayItem[]>(() => storage.getSomeday());
  const [streak, setStreak] = useState<StreakData>(() => storage.getStreak());
  const [loveMapSpots, setLoveMapSpots] = useState<LoveMapSpot[]>(() => storage.getLoveMapSpots());
  const [activePartnerId, setActivePartnerId] = useState<'p1' | 'p2'>(() => storage.getActivePartnerId());

  // Connection Online status dot
  const isOnline = useOnlineStatus();

  // Track initial snaps for receiving pin animation (new snaps only)
  const initialKnownSnapsRef = useRef<Set<string> | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('chat-notes');
  const [isLocked, setIsLocked] = useState<boolean>(() => !settings.stayLoggedIn);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInspirationModal, setShowInspirationModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSelectTab = (tab: TabId) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  // 1. Firebase Anonymous Auth Setup
  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch((err) => {
        console.warn('Anonymous auth notice:', err);
      });
    }
  }, []);

  // 2. Real-time Firestore sync for all shared collections under couples/{coupleCode}/...
  useEffect(() => {
    if (!coupleCode) return;

    // A. Sync partner profiles from couples/{coupleCode}/profiles
    const profilesRef = collection(db, 'couples', coupleCode, 'profiles');
    const unsubscribeProfiles = onSnapshot(
      profilesRef,
      (snapshot) => {
        if (!snapshot.empty) {
          setPartners((prevPartners) => {
            const updated = [...prevPartners];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data();
              const slotId = data.id as 'p1' | 'p2';
              const index = updated.findIndex((p) => p.id === slotId);
              if (index !== -1) {
                updated[index] = {
                  ...updated[index],
                  name: data.name || updated[index].name,
                  avatarEmoji: data.avatarEmoji || updated[index].avatarEmoji,
                  avatarColor: data.avatarColor || updated[index].avatarColor,
                };
              } else if (slotId === 'p1' || slotId === 'p2') {
                updated.push({
                  id: slotId,
                  name: data.name || 'Partner',
                  avatarEmoji: data.avatarEmoji || '🌸',
                  avatarColor: data.avatarColor || '#f43f5e',
                });
              }
            });
            storage.savePartners(updated);
            return updated;
          });
        }
      },
      (error) => {
        console.warn('Profiles sync notice:', error);
      }
    );

    // B. Sync messages from couples/{coupleCode}/messages
    const msgsQuery = query(
      collection(db, 'couples', coupleCode, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribeMsgs = onSnapshot(
      msgsQuery,
      (snapshot) => {
        const list: ChatMessage[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as ChatMessage);
        });
        setMessages(list);
        storage.saveMessages(list);
      },
      (error) => {
        console.warn('Messages sync notice:', error);
      }
    );

    // C. Sync notes from couples/{coupleCode}/notes
    const notesQuery = query(
      collection(db, 'couples', coupleCode, 'notes'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribeNotes = onSnapshot(
      notesQuery,
      (snapshot) => {
        const list: LoveNote[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as LoveNote);
        });
        setNotes(list);
        storage.saveNotes(list);
      },
      (error) => {
        console.warn('Notes sync notice:', error);
      }
    );

    // D. Sync snaps from couples/{coupleCode}/snaps
    const snapsQuery = query(
      collection(db, 'couples', coupleCode, 'snaps'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribeSnaps = onSnapshot(
      snapsQuery,
      (snapshot) => {
        const list: SnapPhoto[] = [];
        const isInitialLoad = initialKnownSnapsRef.current === null;
        if (isInitialLoad) {
          initialKnownSnapsRef.current = new Set();
        }

        snapshot.forEach((d) => {
          const snapData = d.data() as SnapPhoto;
          const isNewIncoming = !isInitialLoad && !initialKnownSnapsRef.current!.has(snapData.id);
          list.push({
            ...snapData,
            isNew: isNewIncoming,
          });
          initialKnownSnapsRef.current!.add(snapData.id);
        });

        setSnaps(list);
        storage.saveSnaps(list);
      },
      (error) => {
        console.warn('Snaps sync notice:', error);
      }
    );

    // E. Sync events from couples/{coupleCode}/events
    const eventsQuery = query(
      collection(db, 'couples', coupleCode, 'events'),
      orderBy('date', 'asc')
    );
    const unsubscribeEvents = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const list: Milestone[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Milestone);
        });
        setMilestones(list);
        storage.saveMilestones(list);
      },
      (error) => {
        console.warn('Events sync notice:', error);
      }
    );

    // F. Sync daily checklist & compute streak from couples/{coupleCode}/checklist
    const todayStr = new Date().toISOString().split('T')[0];
    const checklistRef = collection(db, 'couples', coupleCode, 'checklist');
    const unsubscribeChecklist = onSnapshot(
      checklistRef,
      (snapshot) => {
        const checkMap: Record<string, DailyChecklistItem[]> = {};
        snapshot.forEach((d) => {
          const data = d.data();
          if (Array.isArray(data.items)) {
            checkMap[d.id] = data.items;
          }
        });

        if (checkMap[todayStr]) {
          setChecklist(checkMap[todayStr]);
          storage.saveChecklist(checkMap[todayStr]);
        }

        // Streak calculation: count consecutive days where both partners completed every item
        let count = 0;
        let checkDate = new Date();
        const curItems = checkMap[todayStr] || [];
        const todayDone = curItems.length > 0 && curItems.every((i) => i.p1Completed && i.p2Completed);

        if (todayDone) {
          count++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const dKey = checkDate.toISOString().split('T')[0];
          const pastItems = checkMap[dKey];
          if (pastItems && pastItems.length > 0 && pastItems.every((i) => i.p1Completed && i.p2Completed)) {
            count++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        const newStreak: StreakData = {
          count,
          lastCompletedDate: todayDone ? todayStr : streak.lastCompletedDate,
        };
        setStreak(newStreak);
        storage.saveStreak(newStreak);
      },
      (error) => {
        console.warn('Checklist sync notice:', error);
      }
    );

    // G. Sync mood check-in from couples/{coupleCode}/moods
    const moodsRef = collection(db, 'couples', coupleCode, 'moods');
    const unsubscribeMoods = onSnapshot(
      moodsRef,
      (snapshot) => {
        const historyMap: MoodHistoryMap = {};
        let tP1Mood = '❓';
        let tP1Label = 'Not Checked In';
        let tP1Cat = 'Neutral';
        let tP2Mood = '❓';
        let tP2Label = 'Not Checked In';
        let tP2Cat = 'Neutral';

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const dKey = data.date;
          if (dKey) {
            if (!historyMap[dKey]) {
              historyMap[dKey] = { date: dKey };
            }
            if (data.partnerSlot === 'p1') {
              historyMap[dKey].p1Mood = data.emoji;
              historyMap[dKey].p1Label = data.label;
              historyMap[dKey].p1Category = data.category;
              if (dKey === todayStr) {
                tP1Mood = data.emoji;
                tP1Label = data.label;
                tP1Cat = data.category;
              }
            } else if (data.partnerSlot === 'p2') {
              historyMap[dKey].p2Mood = data.emoji;
              historyMap[dKey].p2Label = data.label;
              historyMap[dKey].p2Category = data.category;
              if (dKey === todayStr) {
                tP2Mood = data.emoji;
                tP2Label = data.label;
                tP2Cat = data.category;
              }
            }
          }
        });

        const updatedMoods: MoodCheckin = {
          partner1Mood: tP1Mood,
          partner1Label: tP1Label,
          partner1Category: tP1Cat,
          partner2Mood: tP2Mood,
          partner2Label: tP2Label,
          partner2Category: tP2Cat,
          lastUpdated: new Date().toISOString(),
        };

        setMoods(updatedMoods);
        setMoodHistory(historyMap);
        storage.saveMoods(updatedMoods);
      },
      (error) => {
        console.warn('Moods sync notice:', error);
      }
    );

    // H. Sync someday list from couples/{coupleCode}/somedayList
    const somedayQuery = query(
      collection(db, 'couples', coupleCode, 'somedayList'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeSomeday = onSnapshot(
      somedayQuery,
      (snapshot) => {
        const list: SomedayItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as SomedayItem);
        });
        setSomeday(list);
        storage.saveSomeday(list);
      },
      (error) => {
        console.warn('Someday sync notice:', error);
      }
    );

    return () => {
      unsubscribeProfiles();
      unsubscribeMsgs();
      unsubscribeNotes();
      unsubscribeSnaps();
      unsubscribeEvents();
      unsubscribeChecklist();
      unsubscribeMoods();
      unsubscribeSomeday();
    };
  }, [coupleCode]);

  // 3. One-time Migration of Legacy Local Data & Top-Level Firestore Messages
  useEffect(() => {
    if (!coupleCode || !settings.hasOnboarded) return;
    const migrationKey = `soulsync_migrated_${coupleCode}`;
    if (localStorage.getItem(migrationKey)) return;

    const runOneTimeMigration = async () => {
      try {
        // A. Copy legacy top-level messages collection once
        const oldMsgsSnap = await getDocs(collection(db, 'messages'));
        if (!oldMsgsSnap.empty) {
          for (const docSnap of oldMsgsSnap.docs) {
            const data = docSnap.data() as ChatMessage;
            await setDoc(
              doc(db, 'couples', coupleCode, 'messages', data.id || docSnap.id),
              data,
              { merge: true }
            );
          }
        }

        // B. Upload old LocalStorage snaps once (compressed under 800KB)
        const localSnaps = storage.getSnaps();
        if (localSnaps.length > 0) {
          for (const s of localSnaps) {
            const compressed = s.imageUrl ? await compressDataUrlIfNeeded(s.imageUrl) : '';
            await setDoc(
              doc(db, 'couples', coupleCode, 'snaps', s.id),
              {
                ...s,
                imageData: compressed || s.imageData || s.imageUrl,
                imageUrl: compressed || s.imageUrl,
                createdAt: s.timestamp || new Date().toISOString(),
              },
              { merge: true }
            );
          }
          localStorage.removeItem('soulsync_snaps');
        }

        // C. Upload old milestones
        const localMilestones = storage.getMilestones();
        if (localMilestones.length > 0) {
          for (const m of localMilestones) {
            await setDoc(
              doc(db, 'couples', coupleCode, 'events', m.id),
              {
                ...m,
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
          localStorage.removeItem('soulsync_milestones');
        }

        // D. Upload old someday items
        const localSomeday = storage.getSomeday();
        if (localSomeday.length > 0) {
          for (const item of localSomeday) {
            await setDoc(
              doc(db, 'couples', coupleCode, 'somedayList', item.id),
              {
                ...item,
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
          localStorage.removeItem('soulsync_someday');
        }

        localStorage.setItem(migrationKey, 'true');
      } catch (err) {
        console.warn('Automatic migration notice:', err);
      }
    };

    runOneTimeMigration();
  }, [coupleCode, settings.hasOnboarded]);

  // Daily Inspirations (Taylor & Ronaldo - 150 Speech/Interview Quotes, No Lyrics)
  const dailyInspirations = useMemo(() => storage.getDailyInspirations(), []);

  // Save changes to storage
  useEffect(() => {
    storage.savePartners(partners);
  }, [partners]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storage.saveLoveMapSpots(loveMapSpots);
  }, [loveMapSpots]);

  useEffect(() => {
    storage.setActivePartnerId(activePartnerId);
  }, [activePartnerId]);

  // Check 24-hour milestone alerts (shows toast ONCE per device per event)
  useEffect(() => {
    milestones.forEach((m) => {
      if (m.reminderEnabled) {
        const diffMs = new Date(m.date).getTime() - Date.now();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours > 0 && diffHours <= 24) {
          const alertedKey = `soulsync_toast_24h_${m.id}`;
          if (!localStorage.getItem(alertedKey)) {
            localStorage.setItem(alertedKey, 'true');
            showToast(`Reminder: "${m.title}" countdown is under 24 hours! 🎉`);
          }
        }
      }
    });
  }, [milestones]);

  const upcomingEventHours = useMemo(() => {
    const now = Date.now();
    let minHours: number | null = null;
    for (const m of milestones) {
      if (m.reminderEnabled) {
        const diffHours = (new Date(m.date).getTime() - now) / (1000 * 60 * 60);
        if (diffHours > 0 && (minHours === null || diffHours < minHours)) {
          minHours = diffHours;
        }
      }
    }
    return minHours;
  }, [milestones]);

  // NOTE ACTIONS (Shared under couples/{coupleCode}/notes)
  const handleAddNote = async (noteData: Omit<LoveNote, 'id' | 'timestamp' | 'reactions'>) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const noteId = `note-${Date.now()}`;
    const newNote: LoveNote = {
      ...noteData,
      id: noteId,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      reactions: {},
    };
    try {
      await setDoc(doc(db, 'couples', code, 'notes', noteId), newNote);
    } catch (error: any) {
      console.error('Note add error:', error);
      showToast('Could not save note to cloud. Check internet connection 💕');
    }
  };

  const handleTogglePin = async (noteId: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;
    try {
      await updateDoc(doc(db, 'couples', code, 'notes', noteId), { pinned: !note.pinned });
    } catch (error: any) {
      console.error('Note pin toggle error:', error);
      showToast('Could not update note pin status.');
    }
  };

  const handleReactNote = async (noteId: string, emoji: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const currentUser = storage.getCurrentUser();
    const myUserId = currentUser?.userId || activePartnerId;
    const currentReactions: Record<string, any> = note.reactions || {};
    const existingVal = currentReactions[myUserId];

    const updatedReactions = { ...currentReactions };
    if (existingVal === emoji) {
      delete updatedReactions[myUserId];
    } else {
      updatedReactions[myUserId] = emoji;
    }

    try {
      await updateDoc(doc(db, 'couples', code, 'notes', noteId), {
        reactions: updatedReactions,
      });
    } catch (error: any) {
      console.error('Note react error:', error);
      showToast('Could not save reaction to cloud.');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    try {
      await deleteDoc(doc(db, 'couples', code, 'notes', noteId));
    } catch (error: any) {
      console.error('Note delete error:', error);
      showToast('Could not delete note.');
    }
  };

  const handlePinTextToNotes = (text: string, color: NoteColor = 'pink') => {
    const currentUser = storage.getCurrentUser();
    const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
    handleAddNote({
      text,
      color,
      pinned: true,
      senderId: currentUser ? currentUser.userId : activePartner.id,
      senderName: currentUser ? currentUser.name : activePartner.name,
    });
  };

  // CHAT ACTIONS (Shared under couples/{coupleCode}/messages)
  const handleSendMessage = async (
    text: string,
    sticker?: string,
    media?: ChatMediaAttachment
  ) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const currentUser = storage.getCurrentUser();
    const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
    const msgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: msgId,
      text,
      senderId: currentUser ? currentUser.userId : activePartner.id,
      senderName: currentUser ? currentUser.name : activePartner.name,
      senderAvatar: currentUser ? currentUser.avatarEmoji : activePartner.avatarEmoji,
      type: media ? media.type : sticker ? 'sticker' : 'text',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      reactions: {},
    };
    if (sticker) newMsg.sticker = sticker;
    if (media) newMsg.media = media;

    try {
      await setDoc(doc(db, 'couples', code, 'messages', msgId), newMsg);
    } catch (error: any) {
      console.error('Send message error:', error);
      showToast('Could not deliver message. Check internet connection 💕');
    }
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) return;

    const currentUser = storage.getCurrentUser();
    const myUserId = currentUser?.userId || activePartnerId;
    const currentReactions: Record<string, any> = msg.reactions || {};
    const existingVal = currentReactions[myUserId];

    const updatedReactions = { ...currentReactions };
    if (existingVal === emoji) {
      delete updatedReactions[myUserId];
    } else {
      updatedReactions[myUserId] = emoji;
    }

    try {
      await updateDoc(doc(db, 'couples', code, 'messages', messageId), {
        reactions: updatedReactions,
      });
    } catch (error: any) {
      console.error('React message error:', error);
      showToast('Could not update reaction.');
    }
  };

  const handleSaveChatImageToSnaps = async (imageUrl: string, caption?: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const currentUser = storage.getCurrentUser();
    const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
    const randomRot = Math.round((Math.random() * 14 - 7) * 10) / 10;
    const pinX = Math.round(10 + Math.random() * 75);
    const pinY = Math.round(10 + Math.random() * 75);
    const snapId = `snap-${Date.now()}`;

    try {
      const compressed = await compressDataUrlIfNeeded(imageUrl);
      const newSnap: SnapPhoto = {
        id: snapId,
        imageUrl: compressed,
        imageData: compressed,
        caption: caption || 'Saved from our chat 💕',
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        senderId: currentUser ? currentUser.userId : activePartner.id,
        senderName: currentUser ? currentUser.name : activePartner.name,
        rotation: randomRot,
        pinX,
        pinY,
        filter: 'normal',
        sticker: 'heart',
        stickers: 'heart',
        loves: 1,
        pinned: true,
      };

      await setDoc(doc(db, 'couples', code, 'snaps', snapId), newSnap);
      showToast('Saved to Snaps corkboard scrapbook! 📸✨');
    } catch (err: any) {
      console.error('Save chat image to snaps error:', err);
      showToast('Could not save photo to scrapbook.');
    }
  };

  // SNAP ACTIONS (Shared under couples/{coupleCode}/snaps)
  const handleAddSnap = async (
    snapData: Omit<SnapPhoto, 'id' | 'timestamp' | 'loves'>
  ) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const snapId = `snap-${Date.now()}`;
    const newSnap: SnapPhoto = {
      ...snapData,
      id: snapId,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      loves: 1,
      reactions: {},
      pinned: snapData.pinned !== false,
    };

    try {
      await setDoc(doc(db, 'couples', code, 'snaps', snapId), newSnap);
    } catch (error: any) {
      console.error('Snap add error:', error);
      showToast('Could not save snap to cloud. Check internet connection 💕');
    }
  };

  const handleLikeSnap = async (snapId: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const snap = snaps.find((s) => s.id === snapId);
    if (!snap) return;

    try {
      await updateDoc(doc(db, 'couples', code, 'snaps', snapId), {
        loves: (snap.loves || 0) + 1,
      });
    } catch (error: any) {
      console.error('Snap like error:', error);
    }
  };

  const handleDeleteSnap = async (snapId: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const snap = snaps.find((s) => s.id === snapId);
    if (!snap) return;

    // Only the uploader can delete their own snap
    const currentUser = storage.getCurrentUser();
    const isUploader = currentUser
      ? snap.senderId === currentUser.userId ||
        snap.senderId === currentUser.slotId ||
        (currentUser.name && snap.senderName?.toLowerCase() === currentUser.name.toLowerCase())
      : true;

    if (!isUploader) {
      showToast('Only the partner who uploaded this snap can delete it! 📷');
      return;
    }

    try {
      await deleteDoc(doc(db, 'couples', code, 'snaps', snapId));
      showToast('Polaroid memory removed 🗑️');
    } catch (error: any) {
      console.error('Snap delete error:', error);
      showToast('Could not delete snap.');
    }
  };

  const handleTogglePinSnap = async (snapId: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const snap = snaps.find((s) => s.id === snapId);
    if (!snap) return;

    const nextPinned = !(snap.pinned !== false);
    try {
      await updateDoc(doc(db, 'couples', code, 'snaps', snapId), {
        pinned: nextPinned,
      });
    } catch (error: any) {
      console.error('Snap pin toggle error:', error);
    }
  };

  // MILESTONE ACTIONS (Shared under couples/{coupleCode}/events)
  const handleAddMilestone = async (mData: Omit<Milestone, 'id'>) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const eventId = `event-${Date.now()}`;
    const currentUser = storage.getCurrentUser();
    const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
    const newM: Milestone = {
      ...mData,
      id: eventId,
      creator: currentUser ? currentUser.name : activePartner.name,
      createdAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'couples', code, 'events', eventId), newM);
      showToast('Event countdown created! 🗓️✨');
    } catch (error: any) {
      console.error('Add milestone error:', error);
      showToast('Could not save countdown to cloud.');
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    try {
      await deleteDoc(doc(db, 'couples', code, 'events', id));
      showToast('Countdown removed 🗑️');
    } catch (error: any) {
      console.error('Delete milestone error:', error);
    }
  };

  const handleToggleMilestoneReminder = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const m = milestones.find((item) => item.id === id);
    if (!m) return;

    try {
      await updateDoc(doc(db, 'couples', code, 'events', id), {
        reminderEnabled: !m.reminderEnabled,
      });
    } catch (error: any) {
      console.error('Toggle reminder error:', error);
    }
  };

  // CHECKLIST ACTIONS (Shared under couples/{coupleCode}/checklist)
  const handleToggleChecklist = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const currentUser = storage.getCurrentUser();
    const mySlot = currentUser?.slotId || activePartnerId;

    const updatedItems = checklist.map((item) => {
      if (item.id === id) {
        const nextP1 = mySlot === 'p1' ? !item.p1Completed : Boolean(item.p1Completed);
        const nextP2 = mySlot === 'p2' ? !item.p2Completed : Boolean(item.p2Completed);
        const bothDone = nextP1 && nextP2;
        return {
          ...item,
          p1Completed: nextP1,
          p2Completed: nextP2,
          completed: bothDone,
          completedBy: bothDone
            ? 'Both of you 💕'
            : nextP1
            ? partners[0]?.name || 'Partner 1'
            : partners[1]?.name || 'Partner 2',
        };
      }
      return item;
    });

    try {
      await setDoc(
        doc(db, 'couples', code, 'checklist', todayStr),
        {
          date: todayStr,
          items: updatedItems,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error: any) {
      console.error('Checklist toggle error:', error);
      showToast('Could not sync habit checklist to cloud.');
    }
  };

  const handleAddChecklist = async (text: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newItem: DailyChecklistItem = {
      id: `chk-${Date.now()}`,
      text,
      completed: false,
      p1Completed: false,
      p2Completed: false,
    };
    const updated = [...checklist, newItem];

    try {
      await setDoc(
        doc(db, 'couples', code, 'checklist', todayStr),
        {
          date: todayStr,
          items: updated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      showToast('New daily habit added! ✨');
    } catch (error: any) {
      console.error('Checklist add error:', error);
      showToast('Could not save habit to cloud.');
    }
  };

  const handleDeleteChecklist = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const updated = checklist.filter((item) => item.id !== id);

    try {
      await setDoc(
        doc(db, 'couples', code, 'checklist', todayStr),
        {
          date: todayStr,
          items: updated,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      showToast('Habit removed 🗑️');
    } catch (error: any) {
      console.error('Checklist delete error:', error);
    }
  };

  // MOOD ACTIONS (Shared under couples/{coupleCode}/moods)
  const handleUpdateMood = async (
    partnerSlot: 'p1' | 'p2',
    emoji: string,
    label: string,
    category?: string
  ) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const moodInfo = findMoodInfo(emoji);
    const resolvedCategory = category || moodInfo.category;
    const resolvedLabel = label || moodInfo.label;
    const todayStr = new Date().toISOString().split('T')[0];
    const moodDocId = `${todayStr}_${partnerSlot}`;
    const pData = partnerSlot === 'p1' ? partners[0] : partners[1];
    const currentUser = storage.getCurrentUser();

    try {
      await setDoc(doc(db, 'couples', code, 'moods', moodDocId), {
        date: todayStr,
        partnerSlot,
        partnerId: currentUser?.userId || partnerSlot,
        partnerName: pData?.name || partnerSlot,
        emoji,
        label: resolvedLabel,
        category: resolvedCategory,
        updatedAt: new Date().toISOString(),
      });

      const partnerName = pData?.name || (partnerSlot === 'p1' ? 'Partner 1' : 'Partner 2');
      showToast(`${partnerName} checked in: ${emoji} ${resolvedCategory}! ✨`);
    } catch (error: any) {
      console.error('Mood update error:', error);
      showToast('Could not save mood check-in to cloud.');
    }
  };

  // SOMEDAY LIST ACTIONS (Shared under couples/{coupleCode}/somedayList)
  const handleToggleSomeday = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const item = someday.find((i) => i.id === id);
    if (!item) return;

    try {
      await updateDoc(doc(db, 'couples', code, 'somedayList', id), {
        completed: !item.completed,
        completedDate: !item.completed ? new Date().toISOString() : null,
      });
    } catch (error: any) {
      console.error('Someday toggle error:', error);
    }
  };

  const handleAddSomeday = async (text: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    const itemId = `some-${Date.now()}`;
    const currentUser = storage.getCurrentUser();
    const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
    const newItem: SomedayItem = {
      id: itemId,
      text,
      completed: false,
      addedBy: currentUser ? currentUser.name : activePartner.name,
      completedDate: undefined,
    };

    try {
      await setDoc(doc(db, 'couples', code, 'somedayList', itemId), {
        ...newItem,
        createdAt: new Date().toISOString(),
      });
      showToast('Added to Someday bucket list! 🧭');
    } catch (error: any) {
      console.error('Someday add error:', error);
      showToast('Could not save bucket list item to cloud.');
    }
  };

  const handleDeleteSomeday = async (id: string) => {
    const code = coupleCode || storage.getCoupleCode();
    if (!code) return;
    try {
      await deleteDoc(doc(db, 'couples', code, 'somedayList', id));
    } catch (error: any) {
      console.error('Someday delete error:', error);
    }
  };

  // LOVE MAP ACTIONS (Local memory pinning)
  const handleAddLoveMapSpot = (spotData: Omit<LoveMapSpot, 'id'> & { id?: string }) => {
    const newSpot: LoveMapSpot = {
      ...spotData,
      id: spotData.id || `spot-${Date.now()}`,
      isNew: true,
      rating: spotData.rating || 5,
      emotionalImpact: spotData.emotionalImpact || 'magical',
    };
    setLoveMapSpots((prev) => [...prev, newSpot]);
    showToast('Special date pinned to Love Map! 🗺️📍');
  };

  const handleUpdateLoveMapSpot = (updatedSpot: LoveMapSpot) => {
    setLoveMapSpots((prev) =>
      prev.map((s) => (s.id === updatedSpot.id ? { ...updatedSpot, isNew: false } : s))
    );
    showToast(`Updated "${updatedSpot.name}" rating & memories! 💖`);
  };

  const handleDeleteLoveMapSpot = (id: string) => {
    setLoveMapSpots((prev) => prev.filter((s) => s.id !== id));
    showToast('Date location removed from Love Map.');
  };

  // BACKUP / RESTORE
  const handleExportBackup = () => {
    const jsonStr = storage.exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soulsync-memories-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (jsonStr: string) => {
    const res = storage.importBackupJSON(jsonStr);
    if (res.success) {
      setPartners(storage.getPartners());
      setSettings(storage.getSettings());
      setNotes(storage.getNotes());
      setMessages(storage.getMessages());
      setSnaps(storage.getSnaps());
      setMilestones(storage.getMilestones());
      setChecklist(storage.getChecklist());
      setMoods(storage.getMoods());
      setSomeday(storage.getSomeday());
      setStreak(storage.getStreak());
      setLoveMapSpots(storage.getLoveMapSpots());
    }
    return res;
  };

  // Reset all app data: Clears local data on THIS DEVICE ONLY, leaving shared space intact
  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  // Determine App Background Gradient based on Theme or Custom Wallpaper (stays local to device)
  const backgroundStyle = useMemo(() => {
    if (settings.customBackgroundGradient) {
      return { background: settings.customBackgroundGradient };
    }
    const themeConfig = getThemeConfig(settings.activeTheme);
    return { background: themeConfig.backgroundGradient };
  }, [settings.activeTheme, settings.customBackgroundGradient]);

  // ONBOARDING MODAL
  if (!settings.hasOnboarded || !coupleCode) {
    return (
      <OnboardingModal
        initialPartners={partners}
        initialSettings={settings}
        onComplete={(newPartners, newSettings) => {
          setPartners(newPartners);
          setSettings(newSettings);
          setCoupleCode(storage.getCoupleCode());
          showToast('Welcome to SoulSync! 💕');
        }}
      />
    );
  }

  // LOCK SCREEN
  if (isLocked) {
    return (
      <LockScreen
        storedPin={settings.pin}
        onUnlock={(stay) => {
          setIsLocked(false);
          if (stay !== settings.stayLoggedIn) {
            setSettings((prev) => ({ ...prev, stayLoggedIn: stay }));
          }
          showToast('Welcome back, loves! ✨');
        }}
      />
    );
  }

  return (
    <div
      style={backgroundStyle}
      className="min-h-screen text-stone-800 transition-all duration-500 ease-in-out selection:bg-rose-200"
    >
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Top Header */}
      <Header
        partners={partners}
        activePartnerId={activePartnerId}
        onSwitchPartner={(id) => setActivePartnerId(id)}
        settings={settings}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenInspiration={() => handleSelectTab('vibes')}
        onLockApp={() => {
          setIsLocked(true);
          showToast('SoulSync locked with passcode 🔐');
        }}
        isOnline={isOnline}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-2xl px-4 pt-5 pb-24 sm:px-6">
        {activeTab === 'chat-notes' && (
          <ChatNotesTab
            notes={notes}
            messages={messages}
            partners={partners}
            activePartnerId={activePartnerId}
            milestones={milestones}
            anniversaryDate={settings.anniversaryDate}
            onAddNote={handleAddNote}
            onTogglePin={handleTogglePin}
            onReactNote={handleReactNote}
            onDeleteNote={handleDeleteNote}
            onSendMessage={handleSendMessage}
            onReactMessage={handleReactMessage}
            onSaveChatImageToSnaps={handleSaveChatImageToSnaps}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'snaps' && (
          <SnapsTab
            snaps={snaps}
            partners={partners}
            activePartnerId={activePartnerId}
            onAddSnap={handleAddSnap}
            onLikeSnap={handleLikeSnap}
            onDeleteSnap={handleDeleteSnap}
            onTogglePinSnap={handleTogglePinSnap}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'together' && (
          <TogetherTab
            milestones={milestones}
            checklist={checklist}
            moods={moods}
            moodHistory={moodHistory}
            someday={someday}
            streak={streak}
            partners={partners}
            activePartnerId={activePartnerId}
            inspirationBlock={dailyInspirations}
            onAddMilestone={handleAddMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onToggleMilestoneReminder={handleToggleMilestoneReminder}
            onToggleChecklist={handleToggleChecklist}
            onAddChecklist={handleAddChecklist}
            onDeleteChecklist={handleDeleteChecklist}
            onUpdateMood={handleUpdateMood}
            onToggleSomeday={handleToggleSomeday}
            onAddSomeday={handleAddSomeday}
            onDeleteSomeday={handleDeleteSomeday}
            onOpenInspiration={() => handleSelectTab('vibes')}
            onSetBackground={(grad, id) => {
              setSettings((prev) => ({
                ...prev,
                customBackgroundGradient: grad,
                customBackgroundId: id,
              }));
              showToast('12h block wallpaper applied! ✨');
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'date-ai' && (
          <DateAITab
            partners={partners}
            activePartnerId={activePartnerId}
            loveMapSpots={loveMapSpots}
            onAddLoveMapSpot={handleAddLoveMapSpot}
            onUpdateLoveMapSpot={handleUpdateLoveMapSpot}
            onDeleteLoveMapSpot={handleDeleteLoveMapSpot}
            onPinToNotes={handlePinTextToNotes}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'vibes' && (
          <VibesTab
            partners={partners}
            activePartnerId={activePartnerId}
            currentBackgroundGradient={settings.customBackgroundGradient}
            onSetBackground={(grad, id) => {
              setSettings((prev) => ({
                ...prev,
                customBackgroundGradient: grad,
                customBackgroundId: id,
              }));
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        pinnedCount={notes.filter((n) => n.pinned).length}
        snapsCount={snaps.filter((s) => s.pinned !== false).length}
        upcomingEventHours={upcomingEventHours}
      />

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          partners={partners}
          onSaveSettings={setSettings}
          onSavePartners={setPartners}
          onExportBackup={handleExportBackup}
          onImportBackup={handleImportBackup}
          onResetData={handleResetData}
          onClose={() => setShowSettingsModal(false)}
          onShowToast={showToast}
        />
      )}

      {/* Daily Inspiration Modal */}
      {showInspirationModal && (
        <DailyInspirationModal
          blockInfo={dailyInspirations}
          currentBackgroundGradient={settings.customBackgroundGradient}
          onSetBackground={(grad, id) => {
            setSettings((prev) => ({
              ...prev,
              customBackgroundGradient: grad,
              customBackgroundId: id,
            }));
          }}
          onClose={() => setShowInspirationModal(false)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
}
