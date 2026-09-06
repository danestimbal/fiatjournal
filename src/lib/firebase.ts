import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  ReflectionSession,
  UserProfile,
  AdminUser,
  InAppAnnouncement,
  SupportTicket,
  SupportTicketReply,
  ContactSubmission,
} from '../types';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUPPORT_TICKETS,
} from '../data/adminSeedData';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore with custom Database ID
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Eliminates all undefined values before passing payloads to Firestore SDK
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => (value === undefined ? null : value))
  );
}

// Authentication Actions
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  }
}

export async function registerWithEmail(
  email: string,
  pass: string,
  displayName?: string
): Promise<User> {
  try {
    const cleanEmail = email.trim();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (displayName?.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    return result.user;
  } catch (error: any) {
    console.error('Registration error:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cleanEmail = email.trim();
    const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    return result.user;
  } catch (error: any) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    const cleanEmail = email.trim();
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (error: any) {
    console.error('Password reset error:', error);
    throw error;
  }
}

export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export function formatUserProfile(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

// Firestore Database Operations (Strict User Isolation)

/**
 * Persists a reflection session in /users/{userId}/reflections/{sessionId}
 */
export async function saveReflectionSession(session: ReflectionSession): Promise<void> {
  if (!session.userId || !session.id) {
    throw new Error('Invalid session: userId and id are required.');
  }

  const sessionRef = doc(db, 'users', session.userId, 'reflections', session.id);
  const now = Date.now();
  const cleanPayload = sanitizeForFirestore({
    ...session,
    updatedAt: session.updatedAt || now,
    lastSyncedAt: now,
  });

  await setDoc(sessionRef, cleanPayload, { merge: true });

  // If the note is marked as shared or public, mirror to top-level shared_notes collection; otherwise remove
  if (session.isShared || (session.sharedWith && session.sharedWith.length > 0) || session.isPublic) {
    try {
      const sharedDocRef = doc(db, 'shared_notes', session.id);
      await setDoc(sharedDocRef, cleanPayload, { merge: true });
    } catch (err) {
      console.warn('Non-fatal error syncing to shared_notes:', err);
    }
  } else {
    try {
      const sharedDocRef = doc(db, 'shared_notes', session.id);
      await deleteDoc(sharedDocRef);
    } catch {
      // Non-fatal if not present
    }
  }
}

/**
 * Deletes a reflection session permanently from Firestore
 */
export async function deleteReflectionSession(
  userId: string,
  sessionId: string
): Promise<void> {
  if (!userId || !sessionId) return;
  const sessionRef = doc(db, 'users', userId, 'reflections', sessionId);
  await deleteDoc(sessionRef);

  try {
    const sharedDocRef = doc(db, 'shared_notes', sessionId);
    await deleteDoc(sharedDocRef);
  } catch {
    // Non-fatal if not in shared_notes
  }
}

/**
 * Fetches a shared note by its unique ID
 */
export async function getSharedNoteById(noteId: string): Promise<ReflectionSession | null> {
  if (!noteId) return null;
  try {
    const sharedDocRef = doc(db, 'shared_notes', noteId);
    const snap = await getDoc(sharedDocRef);
    if (snap.exists()) {
      return snap.data() as ReflectionSession;
    }
  } catch (err) {
    console.warn(`Could not load shared note ${noteId}:`, err);
  }
  return null;
}

/**
 * Subscribes to notes shared with a user's email address
 */
export function subscribeToSharedNotes(
  userEmail: string,
  onUpdate: (sessions: ReflectionSession[]) => void,
  onError?: (err: Error) => void
) {
  if (!userEmail) {
    onUpdate([]);
    return () => {};
  }

  const sharedCol = collection(db, 'shared_notes');
  const normalizedEmail = userEmail.toLowerCase().trim();
  const q = query(sharedCol, where('sharedWith', 'array-contains', normalizedEmail));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReflectionSession[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ReflectionSession);
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Shared notes subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Realtime subscription to the user's reflection sessions
 */
export function subscribeToUserReflections(
  userId: string,
  onUpdate: (sessions: ReflectionSession[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  const reflectionsCollection = collection(db, 'users', userId, 'reflections');
  // Simple order by updatedAt desc
  const q = query(reflectionsCollection, orderBy('updatedAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReflectionSession[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ReflectionSession);
      });
      onUpdate(items);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Saves user custom and deleted folder configurations to Firestore
 */
export async function saveUserFolderConfig(
  userId: string,
  customFolders: string[],
  deletedFolders: string[]
): Promise<void> {
  if (!userId || userId === 'guest') return;
  const userDocRef = doc(db, 'users', userId);
  await setDoc(
    userDocRef,
    sanitizeForFirestore({
      customFolders,
      deletedFolders,
      updatedAt: Date.now(),
    }),
    { merge: true }
  );
}

/**
 * Retrieves user folder configuration from Firestore
 */
export async function getUserFolderConfig(
  userId: string
): Promise<{ customFolders: string[]; deletedFolders: string[] } | null> {
  if (!userId || userId === 'guest') return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        customFolders: data.customFolders || [],
        deletedFolders: data.deletedFolders || [],
      };
    }
  } catch (err) {
    console.warn('Could not fetch user folder config:', err);
  }
  return null;
}

/**
 * Persists user preference flags (such as onboarding completion)
 */
export async function saveUserPreferences(
  userId: string,
  preferences: { onboardingCompleted?: boolean }
): Promise<void> {
  if (!userId || userId === 'guest') return;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      sanitizeForFirestore({
        ...preferences,
        updatedAt: Date.now(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not save user preferences:', err);
  }
}

/**
 * Retrieves user preferences from Firestore
 */
export async function getUserPreferences(
  userId: string
): Promise<{ onboardingCompleted?: boolean } | null> {
  if (!userId || userId === 'guest') return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        onboardingCompleted: data.onboardingCompleted ?? false,
      };
    }
  } catch (err) {
    console.warn('Could not load user preferences:', err);
  }
  return null;
}

/**
 * Check if the user is an Administrator
 */
export function isUserAdmin(user: UserProfile | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === 'danesensei@gmail.com' || user.role === 'admin';
}

/**
 * Sync user profile to Firestore upon login and establish role & subscription
 */
export async function syncUserProfileOnLogin(user: UserProfile): Promise<UserProfile> {
  if (!user.uid || user.uid === 'guest') return user;
  const isAdmin = isUserAdmin(user);
  const userRef = doc(db, 'users', user.uid);
  try {
    const snap = await getDoc(userRef);
    const existing = snap.exists() ? snap.data() : null;
    const role = isAdmin ? 'admin' : (existing?.role || 'user');
    const subscriptionTier = existing?.subscriptionTier || (isAdmin ? 'enterprise' : 'free');

    const updatedProfile = {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Journaler',
      photoURL: user.photoURL || undefined,
      role,
      subscriptionTier,
      subscriptionStatus: existing?.subscriptionStatus || 'active',
      status: existing?.status || 'active',
      notesCount: existing?.notesCount || 0,
      lastActiveAt: Date.now(),
      createdAt: existing?.createdAt || Date.now(),
    };

    await setDoc(userRef, sanitizeForFirestore(updatedProfile), { merge: true });
    return {
      ...user,
      role,
      subscriptionTier,
    };
  } catch (err) {
    console.warn('Could not sync user profile to Firestore:', err);
    return {
      ...user,
      role: isAdmin ? 'admin' : 'user',
      subscriptionTier: isAdmin ? 'enterprise' : 'free',
    };
  }
}

/**
 * Fetch users for Admin User Management tab
 */
export async function fetchAdminUsers(): Promise<AdminUser[]> {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const firestoreUsers: AdminUser[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (data.email) {
        firestoreUsers.push({
          id: d.id,
          email: data.email,
          displayName: data.displayName || data.email.split('@')[0],
          photoURL: data.photoURL || undefined,
          role: data.role || (data.email === 'danesensei@gmail.com' ? 'admin' : 'user'),
          subscriptionTier: data.subscriptionTier || 'free',
          subscriptionStatus: data.subscriptionStatus || 'active',
          status: data.status || 'active',
          notesCount: data.notesCount || 0,
          createdAt: data.createdAt || Date.now(),
          lastActiveAt: data.lastActiveAt || Date.now(),
        });
      }
    });

    // Merge with seed accounts to provide full demonstrable user table
    const existingEmails = new Set(firestoreUsers.map((u) => u.email.toLowerCase()));
    const merged = [...firestoreUsers];
    for (const seed of INITIAL_ADMIN_USERS) {
      if (!existingEmails.has(seed.email.toLowerCase())) {
        merged.push(seed);
      }
    }
    return merged.sort((a, b) => b.lastActiveAt - a.lastActiveAt);
  } catch (err) {
    console.warn('Falling back to local admin seed users:', err);
    return INITIAL_ADMIN_USERS;
  }
}

/**
 * Update user role, subscription tier, or account status
 */
export async function updateAdminUserRecord(
  userId: string,
  updates: Partial<AdminUser>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      sanitizeForFirestore({
        ...updates,
        updatedAt: Date.now(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not update user record in Firestore:', err);
  }
}

/**
 * In-App Announcements: Fetch all announcements
 */
export async function fetchInAppAnnouncements(): Promise<InAppAnnouncement[]> {
  try {
    const snapshot = await getDocs(collection(db, 'announcements'));
    const announcements: InAppAnnouncement[] = [];
    snapshot.forEach((d) => {
      announcements.push({ ...(d.data() as InAppAnnouncement), id: d.id });
    });
    if (announcements.length > 0) {
      return announcements.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (err) {
    console.warn('Falling back to seed announcements:', err);
  }
  return INITIAL_ANNOUNCEMENTS;
}

/**
 * Save or create an announcement
 */
export async function saveInAppAnnouncement(announcement: InAppAnnouncement): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', announcement.id);
    await setDoc(docRef, sanitizeForFirestore(announcement), { merge: true });
  } catch (err) {
    console.warn('Could not save announcement to Firestore:', err);
  }
}

/**
 * Delete an announcement
 */
export async function deleteInAppAnnouncement(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete announcement in Firestore:', err);
  }
}

/**
 * Support Tickets: Fetch all support tickets
 */
export async function fetchSupportTickets(): Promise<SupportTicket[]> {
  try {
    const snapshot = await getDocs(collection(db, 'support_tickets'));
    const tickets: SupportTicket[] = [];
    snapshot.forEach((d) => {
      tickets.push({ ...(d.data() as SupportTicket), id: d.id });
    });
    if (tickets.length > 0) {
      return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
    }
  } catch (err) {
    console.warn('Falling back to seed support tickets:', err);
  }
  return INITIAL_SUPPORT_TICKETS;
}

/**
 * Save or update a support ticket
 */
export async function saveSupportTicket(ticket: SupportTicket): Promise<void> {
  try {
    const docRef = doc(db, 'support_tickets', ticket.id);
    await setDoc(docRef, sanitizeForFirestore(ticket), { merge: true });
  } catch (err) {
    console.warn('Could not save support ticket to Firestore:', err);
  }
}

/**
 * Add an admin or user reply to a support ticket
 */
export async function replyToSupportTicket(
  ticketId: string,
  reply: SupportTicketReply,
  existingReplies: SupportTicketReply[] = [],
  newStatus?: SupportTicket['status']
): Promise<void> {
  try {
    const docRef = doc(db, 'support_tickets', ticketId);
    const updatedReplies = [...existingReplies, reply];
    const updates: Partial<SupportTicket> = {
      replies: updatedReplies,
      updatedAt: Date.now(),
      ...(newStatus ? { status: newStatus } : {}),
    };
    await setDoc(docRef, sanitizeForFirestore(updates), { merge: true });
  } catch (err) {
    console.warn('Could not reply to support ticket in Firestore:', err);
  }
}

/**
 * Submit a message via the public or user Contact page
 */
export async function submitContactForm(
  submission: Omit<ContactSubmission, 'id' | 'status' | 'createdAt'>
): Promise<ContactSubmission> {
  const id = `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: ContactSubmission = {
    ...submission,
    id,
    status: 'new',
    createdAt: Date.now(),
  };

  try {
    const docRef = doc(db, 'contact_submissions', id);
    await setDoc(docRef, sanitizeForFirestore(record));
  } catch (err) {
    console.warn('Could not save contact submission to Firestore, saving to local fallback:', err);
    try {
      const stored = localStorage.getItem('fiat_contact_submissions');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(record);
      localStorage.setItem('fiat_contact_submissions', JSON.stringify(list));
    } catch {
      // local storage fallback
    }
  }

  return record;
}

/**
 * Fetch all contact submissions for the Admin Panel
 */
export async function fetchContactSubmissions(): Promise<ContactSubmission[]> {
  try {
    const snapshot = await getDocs(collection(db, 'contact_submissions'));
    const submissions: ContactSubmission[] = [];
    snapshot.forEach((d) => {
      submissions.push({ ...(d.data() as ContactSubmission), id: d.id });
    });
    if (submissions.length > 0) {
      return submissions.sort((a, b) => b.createdAt - a.createdAt);
    }
  } catch (err) {
    console.warn('Falling back to local contact submissions:', err);
  }

  // Fallback to local storage or seed data
  try {
    const stored = localStorage.getItem('fiat_contact_submissions');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }

  return INITIAL_CONTACT_SUBMISSIONS;
}

/**
 * Update contact submission (status, reply, notes)
 */
export async function updateContactSubmissionStatus(
  id: string,
  updates: Partial<ContactSubmission>
): Promise<void> {
  try {
    const docRef = doc(db, 'contact_submissions', id);
    await setDoc(docRef, sanitizeForFirestore(updates), { merge: true });
  } catch (err) {
    console.warn('Could not update contact submission in Firestore:', err);
    try {
      const stored = localStorage.getItem('fiat_contact_submissions');
      if (stored) {
        const list: ContactSubmission[] = JSON.parse(stored);
        const idx = list.findIndex((s) => s.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updates };
          localStorage.setItem('fiat_contact_submissions', JSON.stringify(list));
        }
      }
    } catch {
      // local fallback
    }
  }
}

/**
 * Updates the user subscription tier in Firestore and returns updated status
 */
export async function updateUserSubscriptionTier(
  userId: string,
  tier: 'free' | 'pro' | 'enterprise'
): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(
      userRef,
      sanitizeForFirestore({
        subscriptionTier: tier,
        subscriptionStatus: 'active',
        updatedAt: Date.now(),
      }),
      { merge: true }
    );
  } catch (err) {
    console.warn('Could not update subscription tier in Firestore:', err);
  }
}

export const INITIAL_CONTACT_SUBMISSIONS: ContactSubmission[] = [
  {
    id: 'cnt_seed_1',
    name: 'Dr. Evelyn Vasquez',
    email: 'evelyn.vasquez@mindfulneuro.org',
    subject: 'Institutional Partnership & Clinical Reflection Pilot',
    category: 'partnership',
    priority: 'urgent',
    message: 'We are conducting clinical research on cognitive reframing through journaling. The Socratic Gemini AI companion in Fiat Journal aligns directly with our research methodology. We would love to discuss a pilot study for 120 participants with private data isolation.',
    status: 'new',
    createdAt: Date.now() - 3600 * 1000 * 4,
  },
  {
    id: 'cnt_seed_2',
    name: 'Marcus Sterling',
    email: 'marcus@sterlingventures.co',
    subject: 'Enterprise Plan for Executive Coaching Team',
    category: 'enterprise',
    priority: 'normal',
    message: 'Our boutique leadership coaching practice is looking for a distraction-free markdown sanctuary for our 35 executive clients. Could we arrange a demonstration of team workspaces and audit logging?',
    status: 'replied',
    createdAt: Date.now() - 3600 * 1000 * 28,
    repliedAt: Date.now() - 3600 * 1000 * 12,
    replyMessage: 'Thank you Marcus! We have scheduled a personalized walkthrough for your coaching practice and activated 35 Enterprise trial seats.',
    repliedBy: 'danesensei@gmail.com',
  },
  {
    id: 'cnt_seed_3',
    name: 'Aria Chen',
    email: 'aria.chen@zenith.design',
    subject: 'Obsidian Vault Migration and Local Markdown Syntax',
    category: 'general',
    priority: 'low',
    message: 'I love the clean typography and lack of algorithmic noise in Fiat Journal. Is there an automated importer for Obsidian frontmatter and nested wikilinks in the pipeline?',
    status: 'read',
    createdAt: Date.now() - 3600 * 1000 * 52,
  },
];
