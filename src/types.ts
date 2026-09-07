export type ReflectionMode = 'reflection' | 'brainstorm' | 'summary';

export interface ReflectionTurn {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
}

export interface Collaborator {
  email: string;
  role: 'viewer' | 'editor';
  addedAt: number;
}

export interface ReflectionSession {
  id: string;
  userId: string;
  authorEmail?: string;
  title: string;
  content: string; // Rich Markdown note content
  folder?: string; // e.g. 'Inbox', 'Notes', 'Projects', 'Archive'
  tags?: string[];
  isFavorite?: boolean;
  isPinned?: boolean;
  isShared?: boolean;
  sharedWith?: string[]; // list of collaborator emails
  collaborators?: Collaborator[];
  isPublic?: boolean; // anyone with link can view
  lastSyncedAt?: number;
  mode: ReflectionMode;
  turns: ReflectionTurn[];
  summary?: string;
  keyInsights?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'user' | 'admin';
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}

export type UserRole = 'user' | 'admin';
export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';
export type UserStatus = 'active' | 'suspended';

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionStatus: SubscriptionStatus;
  status: UserStatus;
  notesCount: number;
  createdAt: number;
  lastActiveAt: number;
}

export interface SubscriptionPlan {
  id: string;
  tierKey: 'free' | 'pro' | 'enterprise';
  name: string;
  price: number;
  monthlyPrice: number;
  annualPrice: number;
  billingPeriod: 'month' | 'year';
  badge?: string;
  description: string;
  subscriberCount: number;
  features: string[];
  geminiQuota: string;
  storageLimit: string;
  isPublished?: boolean;
}

export interface SubscriptionTransaction {
  id: string;
  userEmail: string;
  planName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'refunded';
  date: number;
  invoiceId: string;
}

export interface InAppAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'feature' | 'info' | 'maintenance' | 'alert';
  targetAudience: 'all' | 'pro' | 'free';
  priority: 'normal' | 'high' | 'urgent';
  isPublished: boolean;
  authorEmail?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface SupportTicketReply {
  id: string;
  authorEmail: string;
  authorName?: string;
  message: string;
  timestamp: number;
  isAdmin: boolean;
}

export interface SupportTicket {
  id: string;
  userId?: string;
  userEmail: string;
  userName?: string;
  subject: string;
  description: string;
  category: 'bug' | 'feature' | 'billing' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: number;
  updatedAt: number;
  replies?: SupportTicketReply[];
}

export type PublicPageType = 'pricing' | 'terms' | 'about' | 'contact';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: 'general' | 'partnership' | 'support' | 'enterprise' | 'press' | 'security';
  priority: 'low' | 'normal' | 'urgent';
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: number;
  repliedAt?: number;
  replyMessage?: string;
  repliedBy?: string;
}

export interface SitePageContent {
  id: string;
  page: PublicPageType;
  title: string;
  content: string;
  metadata?: Record<string, any>;
  updatedAt: number;
  updatedBy?: string;
}
