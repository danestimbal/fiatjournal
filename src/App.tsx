import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  formatUserProfile,
  saveReflectionSession,
  deleteReflectionSession,
  subscribeToUserReflections,
  saveUserFolderConfig,
  getUserFolderConfig,
  getUserPreferences,
  saveUserPreferences,
  getSharedNoteById,
  subscribeToSharedNotes,
  isUserAdmin,
  syncUserProfileOnLogin,
  fetchInAppAnnouncements,
  fetchSupportTickets,
  updateUserSubscriptionTier,
} from './lib/firebase';
import { reflectWithGemini } from './lib/geminiApi';
import {
  ReflectionMode,
  ReflectionSession,
  ReflectionTurn,
  UserProfile,
  InAppAnnouncement,
  SupportTicket,
  PublicPageType,
  SubscriptionPlan,
} from './types';
import { Navbar } from './components/Navbar';
import { VaultNavigator } from './components/VaultNavigator';
import { NoteListPane } from './components/NoteListPane';
import { NoteEditorPane } from './components/NoteEditorPane';
import { GeminiCopilotPane } from './components/GeminiCopilotPane';
import { ErrorBanner } from './components/ErrorBanner';
import { LandingPage } from './components/LandingPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PublicNoteReader } from './components/PublicNoteReader';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AdminPanel } from './components/admin/AdminPanel';
import { InAppAnnouncementBanner } from './components/InAppAnnouncementBanner';
import { SupportModal } from './components/SupportModal';
import { PricingPage } from './components/pages/PricingPage';
import { TermsPage } from './components/pages/TermsPage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { UpgradeModal } from './components/UpgradeModal';
import { StorageSettingsModal } from './components/StorageSettingsModal';
import { JournalTemplateModal } from './components/JournalTemplateModal';
import { Footer } from './components/Footer';
import { INITIAL_SEED_NOTES } from './data/seedNotes';
import {
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_SUBSCRIPTION_PLANS,
} from './data/adminSeedData';
import {
  checkNoteCreationLimit,
  getDailyGeminiLimitStatus,
  recordGeminiCall,
  StorageProviderType,
} from './lib/tierLimits';
import { FolderTree, FileText, Edit3, Sparkles } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'register'>('signin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [activeStorageProvider, setActiveStorageProvider] = useState<StorageProviderType>(() => {
    if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem('fiat_storage_provider') as StorageProviderType) || 'local';
    }
    return 'local';
  });

  const handleSelectStorageProvider = (provider: StorageProviderType) => {
    setActiveStorageProvider(provider);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('fiat_storage_provider', provider);
    }
  };

  // Active public page (pricing, terms, about, contact)
  const [activePublicPage, setActivePublicPage] = useState<PublicPageType | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const page = params.get('page');
      if (page === 'pricing' || page === 'terms' || page === 'about' || page === 'contact') {
        return page as PublicPageType;
      }
    }
    return null;
  });

  // In-App Announcements & Support tickets
  const [announcements, setAnnouncements] = useState<InAppAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Unified Subscription Plans (Sync between Admin Panel, Public Pricing, and Upgrade Modals)
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fiat_journal_subscription_plans');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved subscription plans', e);
      }
    }
    return INITIAL_SUBSCRIPTION_PLANS;
  });

  const handleUpdateSubscriptionPlan = (updatedPlan: SubscriptionPlan) => {
    setSubscriptionPlans((prev) => {
      const next = prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('fiat_journal_subscription_plans', JSON.stringify(next));
        } catch (e) {
          console.error('Failed to persist subscription plans', e);
        }
      }
      return next;
    });
  };

  // Shared note link detection (?share=<id>)
  const [sharedNoteId, setSharedNoteId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('share');
    }
    return null;
  });
  const [sharedNote, setSharedNote] = useState<ReflectionSession | null>(null);
  const [loadingSharedNote, setLoadingSharedNote] = useState(Boolean(sharedNoteId));
  const [sharedNoteError, setSharedNoteError] = useState<string | null>(null);

  // View mode: 'landing', 'vault', 'public_reader', or 'admin'
  const [viewMode, setViewMode] = useState<'landing' | 'vault' | 'public_reader' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('share')) return 'public_reader';
      if (params.get('admin') === 'true') return 'admin';
    }
    return 'landing';
  });

  // Mobile active pane tab ('folders' | 'notes' | 'editor' | 'copilot')
  const [mobileTab, setMobileTab] = useState<'folders' | 'notes' | 'editor' | 'copilot'>('notes');

  // Vault state
  const [notes, setNotes] = useState<ReflectionSession[]>([]);
  const [currentNote, setCurrentNote] = useState<ReflectionSession | null>(null);
  const [activeView, setActiveView] = useState<string>('Inbox');

  // Custom & deleted project folders state (persisted in localStorage and Firestore)
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('obsidian_custom_folders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [deletedFolders, setDeletedFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('obsidian_deleted_folders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Pane layout toggles
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [isCopilotOpen, setIsCopilotOpen] = useState(true);

  // Status indicators
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryAction, setRetryAction] = useState<(() => Promise<void>) | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Initialize demo notes if no user logged in yet (and not viewing a public shared note)
  useEffect(() => {
    if (!user && !loadingAuth && !sharedNoteId) {
      const demoNotes: ReflectionSession[] = INITIAL_SEED_NOTES.map((n) => ({
        ...n,
        userId: 'guest',
      }));
      setNotes(demoNotes);
      setCurrentNote(demoNotes[0]);
    }
  }, [user, loadingAuth, sharedNoteId]);

  // Load active announcements & support tickets on mount
  useEffect(() => {
    fetchInAppAnnouncements().then((data) => {
      if (data && data.length > 0) setAnnouncements(data);
    });
    fetchSupportTickets().then((data) => {
      if (data && data.length > 0) setSupportTickets(data);
    });
  }, []);

  // Compute administrator status
  const isAdmin = isUserAdmin(user);

  // Monitor Authentication State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        const profile = formatUserProfile(firebaseUser);
        setLoadingAuth(false);
        if (profile) {
          const isCurrentAdmin = isUserAdmin(profile);
          const baseUser: UserProfile = {
            ...profile,
            role: isCurrentAdmin ? 'admin' : 'user',
            subscriptionTier: isCurrentAdmin ? 'enterprise' : 'free',
          };
          // Immediately set user state so header, vault, and avatar reflect authentication with zero delay
          setUser(baseUser);
          if (!sharedNoteId && viewMode !== 'admin') {
            setViewMode('vault');
          }

          // Background sync with Firestore database (does not block immediate interactive use)
          syncUserProfileOnLogin(baseUser)
            .then((synced) => {
              setUser(synced);
            })
            .catch((err) => {
              console.warn('Background profile sync non-fatal:', err);
            });

          // Check if this user needs to see the onboarding tutorial
          const localKey = `fiat_onboarding_completed_${profile.uid}`;
          const localVal = typeof localStorage !== 'undefined' ? localStorage.getItem(localKey) : null;
          if (!localVal) {
            getUserPreferences(profile.uid)
              .then((prefs) => {
                if (!prefs?.onboardingCompleted) {
                  setShowOnboarding(true);
                } else {
                  localStorage.setItem(localKey, 'true');
                }
              })
              .catch(() => {
                setShowOnboarding(true);
              });
          }
        } else {
          setUser(null);
          if (!sharedNoteId) {
            setViewMode('landing');
          }
        }
      },
      (error) => {
        console.error('Auth state synchronization error:', error);
        setLoadingAuth(false);
        if (!sharedNoteId) {
          setViewMode('landing');
        }
      }
    );

    return () => unsubscribe();
  }, [sharedNoteId]);

  // Subscribe to User's Private Reflections in Firestore
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserReflections(
      user.uid,
      async (fetchedNotes) => {
        if (fetchedNotes.length === 0) {
          // First-time user setup: seed notes to Firestore automatically!
          const seeded: ReflectionSession[] = INITIAL_SEED_NOTES.map((s) => ({
            ...s,
            userId: user.uid,
          }));

          setNotes(seeded);
          setCurrentNote(seeded[0]);

          // Save seed notes into user's Firestore collection in the background
          for (const s of seeded) {
            try {
              await saveReflectionSession(s);
            } catch (err) {
              console.warn('Initial seed save non-fatal note:', err);
            }
          }
        } else {
          setNotes(fetchedNotes);
          setCurrentNote((prev) => {
            if (!prev) return fetchedNotes[0];
            const found = fetchedNotes.find((n) => n.id === prev.id);
            return found || fetchedNotes[0];
          });
        }
      },
      (error) => {
        console.warn('Firestore vault sync temporary state:', error);
        // If it's a transient connection/unavailable notice, Firestore operates in offline cache automatically
        if ((error as any)?.code !== 'unavailable') {
          setErrorMessage(
            'Could not synchronize notes from Cloud Firestore. Working in local session.'
          );
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Subscribe to notes shared with this user (via email match in shared_notes)
  useEffect(() => {
    if (!user?.email) return;

    const unsubscribe = subscribeToSharedNotes(
      user.email,
      (sharedNotes) => {
        if (sharedNotes.length === 0) return;
        setNotes((prev) => {
          const map = new Map(prev.map((n) => [n.id, n]));
          let updated = false;
          for (const s of sharedNotes) {
            if (!map.has(s.id)) {
              map.set(s.id, s);
              updated = true;
            }
          }
          return updated ? Array.from(map.values()) : prev;
        });
      },
      (err) => console.warn('Shared notes listener warning:', err)
    );

    return () => unsubscribe();
  }, [user?.email]);

  // Fetch shared note when sharedNoteId is present in URL (?share=<id>)
  useEffect(() => {
    if (!sharedNoteId) return;

    setLoadingSharedNote(true);
    setSharedNoteError(null);

    getSharedNoteById(sharedNoteId)
      .then((sharedDoc) => {
        if (sharedDoc) {
          setSharedNote(sharedDoc);
        } else {
          setSharedNoteError(
            'This note could not be found or public link sharing was turned off by the author.'
          );
        }
      })
      .catch((err) => {
        console.warn('Error loading shared note from URL:', err);
        setSharedNoteError(
          'Failed to load shared note. Please verify the URL or request access from the owner.'
        );
      })
      .finally(() => {
        setLoadingSharedNote(false);
      });
  }, [sharedNoteId]);

  // Load user folder config from Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    getUserFolderConfig(user.uid)
      .then((cfg) => {
        if (cfg.customFolders && cfg.customFolders.length > 0) {
          setCustomFolders(cfg.customFolders);
          localStorage.setItem('obsidian_custom_folders', JSON.stringify(cfg.customFolders));
        }
        if (cfg.deletedFolders && cfg.deletedFolders.length > 0) {
          setDeletedFolders(cfg.deletedFolders);
          localStorage.setItem('obsidian_deleted_folders', JSON.stringify(cfg.deletedFolders));
        }
      })
      .catch((err) => console.warn('Could not load user folder config:', err));
  }, [user]);

  // Rename a project folder
  const handleRenameFolder = useCallback(
    async (oldName: string, newName: string) => {
      const trimmedNew = newName.trim();
      if (!trimmedNew || oldName === trimmedNew) return;

      // 1. Update customFolders list
      const updatedCustom = customFolders.map((f) => (f === oldName ? trimmedNew : f));
      if (!updatedCustom.includes(trimmedNew)) {
        updatedCustom.push(trimmedNew);
      }
      setCustomFolders(updatedCustom);
      localStorage.setItem('obsidian_custom_folders', JSON.stringify(updatedCustom));

      // 2. Mark oldName as deleted if it was a default template folder
      const defaultSubfolders = ['attachments', 'DICT Training', 'GuroHub', 'GuroHub IpoPhil Reg'];
      let updatedDeleted = deletedFolders;
      if (defaultSubfolders.includes(oldName) && !deletedFolders.includes(oldName)) {
        updatedDeleted = [...deletedFolders, oldName];
        setDeletedFolders(updatedDeleted);
        localStorage.setItem('obsidian_deleted_folders', JSON.stringify(updatedDeleted));
      }

      // 3. Batch update notes belonging to oldName
      const notesToUpdate = notes.filter((n) => n.folder === oldName);
      if (notesToUpdate.length > 0) {
        setNotes((prev) =>
          prev.map((n) => (n.folder === oldName ? { ...n, folder: trimmedNew, updatedAt: Date.now() } : n))
        );
        if (currentNote && currentNote.folder === oldName) {
          setCurrentNote((prev) => (prev ? { ...prev, folder: trimmedNew, updatedAt: Date.now() } : null));
        }
        if (user) {
          for (const n of notesToUpdate) {
            try {
              await saveReflectionSession({ ...n, folder: trimmedNew, updatedAt: Date.now() });
            } catch (err) {
              console.error(`Failed to reassign note ${n.id} to new folder:`, err);
            }
          }
        }
      }

      // 4. Update activeView if currently viewing oldName
      if (activeView === oldName) {
        setActiveView(trimmedNew);
      }

      // 5. Persist folder configuration in Firestore
      if (user) {
        try {
          await saveUserFolderConfig(user.uid, updatedCustom, updatedDeleted);
        } catch (err) {
          console.error('Failed to persist folder config:', err);
        }
      }
    },
    [customFolders, deletedFolders, notes, currentNote, user, activeView]
  );

  // Delete a project folder
  const handleDeleteFolder = useCallback(
    async (folderName: string) => {
      // 1. Update deletedFolders & customFolders
      const updatedDeleted = deletedFolders.includes(folderName) ? deletedFolders : [...deletedFolders, folderName];
      const updatedCustom = customFolders.filter((f) => f !== folderName);

      setDeletedFolders(updatedDeleted);
      setCustomFolders(updatedCustom);
      localStorage.setItem('obsidian_deleted_folders', JSON.stringify(updatedDeleted));
      localStorage.setItem('obsidian_custom_folders', JSON.stringify(updatedCustom));

      // 2. Reassign notes from deleted folder to 'Projects'
      const notesToReassign = notes.filter((n) => n.folder === folderName);
      if (notesToReassign.length > 0) {
        setNotes((prev) =>
          prev.map((n) => (n.folder === folderName ? { ...n, folder: 'Projects', updatedAt: Date.now() } : n))
        );
        if (currentNote && currentNote.folder === folderName) {
          setCurrentNote((prev) => (prev ? { ...prev, folder: 'Projects', updatedAt: Date.now() } : null));
        }
        if (user) {
          for (const n of notesToReassign) {
            try {
              await saveReflectionSession({ ...n, folder: 'Projects', updatedAt: Date.now() });
            } catch (err) {
              console.error(`Failed to reassign note ${n.id} to Projects:`, err);
            }
          }
        }
      }

      // 3. Update activeView if currently viewing this folder
      if (activeView === folderName) {
        setActiveView('Projects');
      }

      // 4. Persist in Firestore
      if (user) {
        try {
          await saveUserFolderConfig(user.uid, updatedCustom, updatedDeleted);
        } catch (err) {
          console.error('Failed to persist deleted folder config:', err);
        }
      }
    },
    [customFolders, deletedFolders, notes, currentNote, user, activeView]
  );

  // Create a project folder
  const handleCreateFolder = useCallback(
    async (folderName: string) => {
      const trimmed = folderName.trim();
      if (!trimmed) return;

      // Ensure not in deletedFolders anymore
      const updatedDeleted = deletedFolders.filter((f) => f.toLowerCase() !== trimmed.toLowerCase());
      const updatedCustom = customFolders.includes(trimmed) ? customFolders : [...customFolders, trimmed];

      setDeletedFolders(updatedDeleted);
      setCustomFolders(updatedCustom);
      localStorage.setItem('obsidian_deleted_folders', JSON.stringify(updatedDeleted));
      localStorage.setItem('obsidian_custom_folders', JSON.stringify(updatedCustom));

      setActiveView(trimmed);

      if (user) {
        try {
          await saveUserFolderConfig(user.uid, updatedCustom, updatedDeleted);
        } catch (err) {
          console.error('Failed to persist created folder:', err);
        }
      }
    },
    [customFolders, deletedFolders, user]
  );

  // Open template selector for creating a new journal entry
  const handleCreateNewNote = useCallback(() => {
    // Check 50-note storage cap for Free tier users before opening modal
    const limitCheck = checkNoteCreationLimit(user?.subscriptionTier, notes.length);
    if (!limitCheck.allowed) {
      setErrorMessage(
        `Storage limit reached (${limitCheck.current}/${limitCheck.max} notes). Free Sanctuary is capped at 50 notes. Upgrade to Pro for unlimited notes.`
      );
      setIsUpgradeModalOpen(true);
      return;
    }
    setIsTemplateModalOpen(true);
  }, [user?.subscriptionTier, notes.length]);

  // Create a new reflection journal from selected template
  const handleCreateJournalFromTemplate = useCallback(
    async (params: {
      title: string;
      content: string;
      folder: string;
      tags: string[];
      mode: 'reflection' | 'brainstorm' | 'summary';
    }) => {
      // Enforce 50-note cap for Free tier users
      const limitCheck = checkNoteCreationLimit(user?.subscriptionTier, notes.length);
      if (!limitCheck.allowed) {
        setErrorMessage(
          `Storage limit reached (${limitCheck.current}/${limitCheck.max} notes). Free Sanctuary is capped at 50 notes. Upgrade to Pro for unlimited notes.`
        );
        setIsUpgradeModalOpen(true);
        return;
      }

      const userId = user ? user.uid : 'guest';
      const targetFolder = params.folder || (activeView === 'Archive' || activeView === 'Trash' ? 'Inbox' : activeView);

      const newNote: ReflectionSession = {
        id: crypto.randomUUID(),
        userId,
        title: params.title.trim() || 'Untitled Journal',
        content: params.content,
        folder: targetFolder,
        tags: params.tags && params.tags.length > 0 ? params.tags : ['Journal'],
        isFavorite: false,
        mode: params.mode || 'reflection',
        turns: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      setNotes((prev) => [newNote, ...prev]);
      setCurrentNote(newNote);
      setMobileTab('editor');

      // If created in a different folder, align view to show the new note
      if (['Inbox', 'Notes', 'Projects', 'Personal', 'Work', ...customFolders].includes(targetFolder)) {
        setActiveView(targetFolder);
      }

      if (user) {
        try {
          setIsSaving(true);
          await saveReflectionSession(newNote);
        } catch (err) {
          console.error('Save new journal error:', err);
          setErrorMessage('Failed to sync new journal with cloud. Local draft preserved.');
        } finally {
          setIsSaving(false);
        }
      }
    },
    [user, activeView, notes.length, customFolders]
  );

  // Keep a ref of currentNote to enable stable update callbacks
  const currentNoteRef = useRef<ReflectionSession | null>(currentNote);
  useEffect(() => {
    currentNoteRef.current = currentNote;
  }, [currentNote]);

  // Update note title, content, or metadata
  const handleUpdateNote = useCallback(
    async (updatedProps: Partial<ReflectionSession>) => {
      const active = currentNoteRef.current;
      if (!active) return;

      const updated: ReflectionSession = {
        ...active,
        ...updatedProps,
        updatedAt: Date.now(),
        lastSyncedAt: Date.now(),
      };

      currentNoteRef.current = updated;
      setCurrentNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));

      if (user) {
        try {
          setIsSaving(true);
          await saveReflectionSession(updated);
        } catch (error: any) {
          console.error('Note auto-save error:', error);
          setErrorMessage('Failed to sync changes to Firestore. Check network.');
        } finally {
          setIsSaving(false);
        }
      }
    },
    [user]
  );

  // Toggle note pinned state
  const handleTogglePin = useCallback(
    async (noteId: string) => {
      const target = notes.find((n) => n.id === noteId);
      if (!target) return;
      const updated: ReflectionSession = {
        ...target,
        isPinned: !target.isPinned,
        updatedAt: Date.now(),
        lastSyncedAt: Date.now(),
      };
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      if (currentNote?.id === noteId) {
        setCurrentNote(updated);
      }
      if (user) {
        try {
          await saveReflectionSession(updated);
        } catch (err) {
          console.error('Pin toggle error:', err);
        }
      }
    },
    [notes, currentNote, user]
  );

  // Toggle favorite / starred
  const handleToggleFavorite = useCallback(
    async (noteId: string) => {
      const target = notes.find((n) => n.id === noteId);
      if (!target) return;
      const updated: ReflectionSession = {
        ...target,
        isFavorite: !target.isFavorite,
        updatedAt: Date.now(),
      };
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
      if (currentNote?.id === noteId) {
        setCurrentNote(updated);
      }
      if (user) {
        try {
          await saveReflectionSession(updated);
        } catch (err) {
          console.error('Favorite toggle error:', err);
        }
      }
    },
    [notes, currentNote, user]
  );

  // Delete note
  const handleDeleteNote = useCallback(
    async (noteId: string) => {
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);

      if (currentNote?.id === noteId) {
        setCurrentNote(remaining.length > 0 ? remaining[0] : null);
      }

      if (user) {
        try {
          await deleteReflectionSession(user.uid, noteId);
        } catch (error) {
          console.error('Delete note error:', error);
          setErrorMessage('Failed to delete note from Firestore.');
        }
      }
    },
    [notes, currentNote, user]
  );

  // Append text directly into active note (e.g. from Gemini Co-pilot)
  const handleAppendToNote = useCallback(
    async (markdownText: string) => {
      if (!currentNote) return;
      const updatedContent = `${currentNote.content.trim()}${markdownText}`;
      await handleUpdateNote({ content: updatedContent });
    },
    [currentNote, handleUpdateNote]
  );

  // Multi-Turn Reflection & Co-pilot Chat with Ambient Note Context
  const handleSendMessage = async (
    content: string,
    mode: ReflectionMode
  ): Promise<void> => {
    if (!currentNote) return;

    // Enforce daily Gemini reflection limit (25 calls/day on Free tier)
    const dailyLimit = getDailyGeminiLimitStatus(user?.uid || 'guest', user?.subscriptionTier);
    if (!dailyLimit.allowed) {
      setErrorMessage(
        `Daily reflection limit reached (${dailyLimit.count}/${dailyLimit.max} reflections today). Free Sanctuary is capped at 25 AI reflections per day. Upgrade to Pro for unlimited Gemini 3 reflections.`
      );
      setIsUpgradeModalOpen(true);
      return;
    }

    const userTurn: ReflectionTurn = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const sessionWithUserTurn: ReflectionSession = {
      ...currentNote,
      turns: [...currentNote.turns, userTurn],
      updatedAt: Date.now(),
    };

    setCurrentNote(sessionWithUserTurn);
    setNotes((prev) =>
      prev.map((n) => (n.id === sessionWithUserTurn.id ? sessionWithUserTurn : n))
    );
    setErrorMessage(null);

    // Persist prompt
    if (user) {
      try {
        setIsSaving(true);
        await saveReflectionSession(sessionWithUserTurn);
      } catch (saveError: any) {
        console.error('Failed to save prompt to Firestore:', saveError);
        setErrorMessage(
          'Failed to save your prompt to Firestore. Click Retry to re-save.'
        );
        setRetryAction(() => async () => {
          setIsRetrying(true);
          try {
            await saveReflectionSession(sessionWithUserTurn);
            setErrorMessage(null);
            setRetryAction(null);
          } finally {
            setIsRetrying(false);
          }
        });
      } finally {
        setIsSaving(false);
      }
    }

    // Call Gemini with Active Note Context
    try {
      setIsGenerating(true);
      const geminiResult = await reflectWithGemini({
        message: content,
        history: currentNote.turns,
        mode,
        noteContext: currentNote.content,
      });

      const modelTurn: ReflectionTurn = {
        id: crypto.randomUUID(),
        role: 'model',
        content: geminiResult.reply,
        timestamp: Date.now(),
        modelUsed: geminiResult.modelUsed,
      };

      const finalNote: ReflectionSession = {
        ...sessionWithUserTurn,
        turns: [...sessionWithUserTurn.turns, modelTurn],
        updatedAt: Date.now(),
      };

      setCurrentNote(finalNote);
      setNotes((prev) => prev.map((n) => (n.id === finalNote.id ? finalNote : n)));

      // Persist model response
      if (user) {
        try {
          setIsSaving(true);
          await saveReflectionSession(finalNote);
        } catch (saveError: any) {
          console.error('Failed to persist Gemini reply to Firestore:', saveError);
          setErrorMessage('Gemini replied, but sync to Firestore failed. Retrying...');
        } finally {
          setIsSaving(false);
        }
      }

      // Record successful AI reflection in daily quota tracker
      recordGeminiCall(user?.uid || 'guest');
    } catch (geminiError: any) {
      console.error('Gemini Co-pilot error:', geminiError);
      setErrorMessage(
        `Gemini Co-pilot error: ${
          geminiError?.message || 'Please check your connection and retry.'
        }`
      );
      setRetryAction(() => async () => {
        setIsRetrying(true);
        try {
          await handleSendMessage(content, mode);
        } finally {
          setIsRetrying(false);
        }
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAuth = (mode: 'signin' | 'register' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleGuestAccess = () => {
    const guestUser: UserProfile = {
      uid: 'guest',
      email: 'guest@fiat.app',
      displayName: 'Guest Journaler',
      photoURL: null,
      role: 'user',
      subscriptionTier: 'free',
    };
    setUser(guestUser);
    setIsAuthModalOpen(false);
    setActivePublicPage(null);
    setViewMode('vault');
  };

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    if (user?.uid) {
      const localKey = `fiat_onboarding_completed_${user.uid}`;
      localStorage.setItem(localKey, 'true');
      await saveUserPreferences(user.uid, { onboardingCompleted: true });
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setUser(null);
      setActivePublicPage(null);
      setViewMode('landing');
    } catch (error: any) {
      console.error('Sign-out failed:', error);
      setErrorMessage('Failed to sign out cleanly.');
    }
  };

  const handleNavigateToPublicPage = (page: PublicPageType) => {
    setActivePublicPage(page);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page);
      window.history.pushState({}, '', url.toString());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromPublicPage = () => {
    setActivePublicPage(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleUpgradeUserPlan = async (tier: 'pro' | 'enterprise') => {
    if (!user) {
      setIsUpgradeModalOpen(false);
      handleOpenAuth('signin');
      return;
    }
    try {
      await updateUserSubscriptionTier(user.uid, tier);
      setUser((prev) => (prev ? { ...prev, subscriptionTier: tier } : null));
    } catch (err) {
      console.error('Failed to update subscription tier:', err);
      setErrorMessage('Failed to update subscription tier. Please try again.');
    }
  };

  // Dedicated single-note public reader view for shared links (?share=<id>)
  if (viewMode === 'public_reader' && sharedNoteId) {
    return (
      <PublicNoteReader
        note={sharedNote}
        loading={loadingSharedNote}
        error={sharedNoteError}
        currentUser={user}
        onOpenVault={(noteId) => {
          // Clean URL parameter without page reload
          window.history.pushState({}, '', window.location.pathname);
          setSharedNoteId(null);
          if (noteId && sharedNote) {
            setNotes((prev) => {
              if (prev.some((n) => n.id === sharedNote.id)) return prev;
              return [sharedNote, ...prev];
            });
            setCurrentNote(sharedNote);
          }
          setViewMode('vault');
        }}
        onSignIn={() => handleOpenAuth('signin')}
        onExitSharedView={() => {
          window.history.pushState({}, '', window.location.pathname);
          setSharedNoteId(null);
          setViewMode(user ? 'vault' : 'landing');
        }}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#F9F9F8] dark:bg-[#141413] text-stone-900 dark:text-stone-100 overflow-hidden font-sans select-none transition-colors">
      {/* Top Application Header / Journal Bar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        onSignIn={() => handleOpenAuth('signin')}
        onSignOut={handleSignOut}
        onToggleNav={() => setIsNavOpen(!isNavOpen)}
        isNavOpen={isNavOpen}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        isCopilotOpen={isCopilotOpen}
        viewMode={activePublicPage ? 'landing' : viewMode}
        onSelectViewMode={(mode) => {
          setActivePublicPage(null);
          setViewMode(mode);
        }}
        isAdmin={isAdmin}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onOpenStorageSettings={() => setIsStorageModalOpen(true)}
        onNavigatePage={handleNavigateToPublicPage}
        onNewJournal={handleCreateNewNote}
        onOpenTutorial={() => {
          setActivePublicPage(null);
          if (viewMode === 'landing') {
            setViewMode('vault');
          }
          setShowOnboarding(true);
        }}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/60 shrink-0">
          <ErrorBanner
            message={errorMessage}
            onRetry={retryAction ? () => retryAction() : undefined}
            onDismiss={() => {
              setErrorMessage(null);
              setRetryAction(null);
            }}
            isRetrying={isRetrying}
          />
        </div>
      )}

      {/* Offline Connectivity Notification */}
      <OfflineIndicator />

      {/* In-App Announcement Banner (shown on main user views) */}
      {!activePublicPage && viewMode !== 'admin' && (
        <InAppAnnouncementBanner announcements={announcements} />
      )}

      {/* Conditional View: Public Pages, Admin Panel, Landing Page, or Fiat Journal Workspace */}
      {activePublicPage ? (
        <div className="flex-1 overflow-y-auto bg-[#FBFBFA] dark:bg-[#121210] flex flex-col justify-between">
          <div className="flex-1">
            {activePublicPage === 'pricing' && (
              <PricingPage
                currentUser={user}
                plans={subscriptionPlans}
                isAdmin={user?.role === 'admin' || (!user && true)}
                onOpenAdminPricing={() => {
                  handleBackFromPublicPage();
                  setViewMode('admin');
                }}
                onSelectPlan={(tier) => {
                  if (tier === 'free') {
                    handleBackFromPublicPage();
                  } else {
                    handleUpgradeUserPlan(tier);
                  }
                }}
                onBack={handleBackFromPublicPage}
                onOpenContact={() => handleNavigateToPublicPage('contact')}
              />
            )}
            {activePublicPage === 'terms' && (
              <TermsPage
                onBack={handleBackFromPublicPage}
                onOpenContact={() => handleNavigateToPublicPage('contact')}
              />
            )}
            {activePublicPage === 'about' && (
              <AboutPage
                onBack={handleBackFromPublicPage}
                onOpenContact={() => handleNavigateToPublicPage('contact')}
                onOpenPricing={() => handleNavigateToPublicPage('pricing')}
              />
            )}
            {activePublicPage === 'contact' && (
              <ContactPage
                currentUser={user}
                onBack={handleBackFromPublicPage}
              />
            )}
          </div>
          <Footer
            onNavigatePage={handleNavigateToPublicPage}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
          />
        </div>
      ) : viewMode === 'admin' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminPanel
            currentUser={
              user || {
                uid: 'usr_admin',
                email: 'danesensei@gmail.com',
                displayName: 'Dane Sensei',
                photoURL: null,
                role: 'admin',
                subscriptionTier: 'enterprise',
              }
            }
            plans={subscriptionPlans}
            onUpdatePlan={handleUpdateSubscriptionPlan}
            onExitAdmin={() => setViewMode('vault')}
            onOpenPublicPage={handleNavigateToPublicPage}
          />
        </div>
      ) : viewMode === 'landing' ? (
        <div className="flex-1 overflow-y-auto">
          <LandingPage
            onSignIn={(mode) => handleOpenAuth(mode || 'signin')}
            loading={loadingAuth}
            onExploreVault={() => setViewMode('vault')}
            user={user}
            onNavigatePage={handleNavigateToPublicPage}
            onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
            isAdmin={isAdmin}
            onOpenAdmin={() => setViewMode('admin')}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Desktop Multi-Pane Layout (md: screens and wider) */}
          <div className="hidden md:flex flex-1 overflow-hidden">
            {/* Pane 1: Leftmost Vault Navigator */}
            {isNavOpen && (
              <VaultNavigator
                notes={notes}
                activeView={activeView}
                onSelectView={(view) => setActiveView(view)}
                onCollapse={() => setIsNavOpen(false)}
                onNewNote={handleCreateNewNote}
                customFolders={customFolders}
                deletedFolders={deletedFolders}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={handleCreateFolder}
                currentUser={user}
                onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
                onNavigatePage={handleNavigateToPublicPage}
                isAdmin={isAdmin}
                onOpenAdmin={() => {
                  setActivePublicPage(null);
                  setViewMode('admin');
                }}
                onOpenStorageSettings={() => setIsStorageModalOpen(true)}
              />
            )}

            {/* Pane 2: Note List */}
            <NoteListPane
              notes={notes}
              activeView={activeView}
              currentNoteId={currentNote?.id || null}
              onSelectNote={(note) => setCurrentNote(note)}
              onNewNote={handleCreateNewNote}
              onDeleteNote={handleDeleteNote}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
            />

            {/* Pane 3: Center Note Editor & Markdown Viewer */}
            {currentNote ? (
              <NoteEditorPane
                note={currentNote}
                allNotes={notes}
                isSaving={isSaving}
                currentUser={user}
                onUpdateNote={handleUpdateNote}
                onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
                isCopilotOpen={isCopilotOpen}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#181816] text-stone-400 dark:text-stone-500 p-8 text-center transition-colors">
                <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No note selected</p>
                <p className="text-xs mt-1">Select a note from the list or create a new one.</p>
                <button
                  onClick={handleCreateNewNote}
                  className="mt-4 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-md text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  + Create Note
                </button>
              </div>
            )}

            {/* Pane 4: Rightmost Gemini Co-pilot / Assistant */}
            {isCopilotOpen && currentNote && (
              <GeminiCopilotPane
                note={currentNote}
                isGenerating={isGenerating}
                onSendMessage={handleSendMessage}
                onAppendToNote={handleAppendToNote}
                onClose={() => setIsCopilotOpen(false)}
              />
            )}
          </div>

          {/* Mobile Adaptive Single-Pane View (< md screens) */}
          <div className="flex md:hidden flex-1 flex-col overflow-hidden">
            {mobileTab === 'folders' && (
              <VaultNavigator
                notes={notes}
                activeView={activeView}
                onSelectView={(view) => {
                  setActiveView(view);
                  setMobileTab('notes');
                }}
                onCollapse={() => setMobileTab('notes')}
                onNewNote={handleCreateNewNote}
                customFolders={customFolders}
                deletedFolders={deletedFolders}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={handleCreateFolder}
                currentUser={user}
                onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
                onNavigatePage={handleNavigateToPublicPage}
                isAdmin={isAdmin}
                onOpenAdmin={() => {
                  setActivePublicPage(null);
                  setViewMode('admin');
                }}
                onOpenStorageSettings={() => setIsStorageModalOpen(true)}
              />
            )}

            {mobileTab === 'notes' && (
              <NoteListPane
                notes={notes}
                activeView={activeView}
                currentNoteId={currentNote?.id || null}
                onSelectNote={(note) => {
                  setCurrentNote(note);
                  setMobileTab('editor');
                }}
                onNewNote={handleCreateNewNote}
                onDeleteNote={handleDeleteNote}
                onToggleFavorite={handleToggleFavorite}
                onTogglePin={handleTogglePin}
              />
            )}

            {mobileTab === 'editor' && (
              currentNote ? (
                <NoteEditorPane
                  note={currentNote}
                  allNotes={notes}
                  isSaving={isSaving}
                  currentUser={user}
                  onUpdateNote={handleUpdateNote}
                  onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                  onToggleCopilot={() => {
                    setIsCopilotOpen(true);
                    setMobileTab('copilot');
                  }}
                  isCopilotOpen={isCopilotOpen}
                  onBackToList={() => setMobileTab('notes')}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#181816] text-stone-400 dark:text-stone-500 p-8 text-center transition-colors">
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">No note selected</p>
                  <p className="text-xs mt-1">Select a note from the list or create a fresh one.</p>
                  <button
                    onClick={handleCreateNewNote}
                    className="mt-4 px-3.5 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    + Create Note
                  </button>
                </div>
              )
            )}

            {mobileTab === 'copilot' && (
              currentNote ? (
                <GeminiCopilotPane
                  note={currentNote}
                  isGenerating={isGenerating}
                  onSendMessage={handleSendMessage}
                  onAppendToNote={handleAppendToNote}
                  onClose={() => setMobileTab('editor')}
                  onBackToEditor={() => setMobileTab('editor')}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#181816] text-stone-400 dark:text-stone-500 p-8 text-center transition-colors">
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">Select a note first</p>
                  <p className="text-xs mt-1">Gemini Co-pilot operates within the context of an active note.</p>
                  <button
                    onClick={() => setMobileTab('notes')}
                    className="mt-4 px-3.5 py-2 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    Go to Notes List
                  </button>
                </div>
              )
            )}
          </div>

          {/* Mobile Bottom Navigation Bar (< md screens) */}
          <nav
            id="mobile-workspace-bottom-nav"
            aria-label="Mobile workspace navigation"
            className="md:hidden h-14 bg-[#F5F5F3] dark:bg-[#181816] border-t border-[#E8E8E6] dark:border-[#2e2e2a] flex items-center justify-around px-2 shrink-0 z-30 select-none pb-[env(safe-area-inset-bottom,0px)] transition-colors"
          >
            <button
              id="mobile-nav-folders-btn"
              onClick={() => setMobileTab('folders')}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                mobileTab === 'folders'
                  ? 'text-stone-900 dark:text-stone-100 bg-stone-200/80 dark:bg-stone-800 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <FolderTree className="w-4 h-4 mb-0.5" />
              <span>Folders</span>
            </button>

            <button
              id="mobile-nav-notes-btn"
              onClick={() => setMobileTab('notes')}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                mobileTab === 'notes'
                  ? 'text-stone-900 dark:text-stone-100 bg-stone-200/80 dark:bg-stone-800 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <FileText className="w-4 h-4 mb-0.5" />
              <span>Notes</span>
              {notes.length > 0 && (
                <span className="absolute top-1 right-2 text-[9px] bg-stone-300/80 dark:bg-stone-700 text-stone-700 dark:text-stone-200 px-1 rounded-full font-mono">
                  {notes.length}
                </span>
              )}
            </button>

            <button
              id="mobile-nav-editor-btn"
              onClick={() => setMobileTab('editor')}
              disabled={!currentNote}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                mobileTab === 'editor'
                  ? 'text-stone-900 dark:text-stone-100 bg-stone-200/80 dark:bg-stone-800 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Edit3 className="w-4 h-4 mb-0.5" />
              <span>Editor</span>
            </button>

            <button
              id="mobile-nav-copilot-btn"
              onClick={() => {
                setIsCopilotOpen(true);
                setMobileTab('copilot');
              }}
              disabled={!currentNote}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-40 ${
                mobileTab === 'copilot'
                  ? 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className={`w-4 h-4 mb-0.5 ${mobileTab === 'copilot' ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              <span>Co-pilot</span>
            </button>
          </nav>
        </div>
      )}

      {/* Email Registration, Sign-In & Google SSO Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setViewMode('vault');
        }}
        onGuestAccess={handleGuestAccess}
      />

      {/* Interactive Onboarding Tutorial Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={handleCompleteOnboarding}
        userName={user?.displayName || user?.email?.split('@')[0]}
      />

      {/* Help & Support Desk Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        currentUser={
          user || {
            uid: 'guest',
            email: 'guest@fiat.app',
            displayName: 'Guest User',
            photoURL: null,
          }
        }
        tickets={supportTickets}
        onTicketSubmitted={(newTkt) => setSupportTickets((prev) => [newTkt, ...prev])}
      />

      {/* Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentUser={user}
        plans={subscriptionPlans}
        onUpgradeSuccess={handleUpgradeUserPlan}
        onNavigateToPricingPage={() => {
          setIsUpgradeModalOpen(false);
          handleNavigateToPublicPage('pricing');
        }}
      />

      {/* Journal Reflection Template Selector Modal */}
      <JournalTemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentFolder={activeView}
        customFolders={customFolders}
        onCreateJournal={handleCreateJournalFromTemplate}
      />

      {/* Storage Architecture & Google Drive BYOS Modal */}
      <StorageSettingsModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        currentUser={user}
        activeStorageProvider={activeStorageProvider}
        onSelectStorageProvider={handleSelectStorageProvider}
        notes={notes}
        onTriggerUpgrade={(reason) => {
          setIsStorageModalOpen(false);
          setErrorMessage(reason);
          setIsUpgradeModalOpen(true);
        }}
      />
    </div>
  );
}
