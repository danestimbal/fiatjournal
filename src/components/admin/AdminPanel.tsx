import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Megaphone,
  LifeBuoy,
  Shield,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Database,
  CheckCircle2,
  Globe,
} from 'lucide-react';
import {
  AdminUser,
  InAppAnnouncement,
  SupportTicket,
  SupportTicketReply,
  UserProfile,
  PublicPageType,
} from '../../types';
import {
  fetchAdminUsers,
  updateAdminUserRecord,
  fetchInAppAnnouncements,
  saveInAppAnnouncement,
  deleteInAppAnnouncement,
  fetchSupportTickets,
  saveSupportTicket,
  replyToSupportTicket,
} from '../../lib/firebase';
import { UserManagementTab } from './UserManagementTab';
import { SubscriptionsTab } from './SubscriptionsTab';
import { AnnouncementsTab } from './AnnouncementsTab';
import { SupportTab } from './SupportTab';
import { PublicPagesAdminTab } from './PublicPagesAdminTab';
import {
  INITIAL_ADMIN_USERS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SUPPORT_TICKETS,
} from '../../data/adminSeedData';

interface AdminPanelProps {
  currentUser: UserProfile;
  onExitAdmin: () => void;
  initialTab?: AdminTab;
  onOpenPublicPage?: (page: PublicPageType) => void;
}

type AdminTab = 'users' | 'subscriptions' | 'announcements' | 'support' | 'pages';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  onExitAdmin,
  initialTab,
  onOpenPublicPage,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab || 'users');
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [announcements, setAnnouncements] = useState<InAppAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setFeedbackToast(message);
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  // Load latest data from Firestore
  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [loadedUsers, loadedAnnouncements, loadedTickets] = await Promise.all([
        fetchAdminUsers(),
        fetchInAppAnnouncements(),
        fetchSupportTickets(),
      ]);

      // Ensure currentUser is reflected in users table
      if (currentUser.email) {
        const found = loadedUsers.some(
          (u) => u.email.toLowerCase() === currentUser.email?.toLowerCase()
        );
        if (!found) {
          loadedUsers.unshift({
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || 'Current Administrator',
            role: 'admin',
            subscriptionTier: 'enterprise',
            subscriptionStatus: 'active',
            status: 'active',
            notesCount: 1,
            createdAt: Date.now(),
            lastActiveAt: Date.now(),
          });
        }
      }

      setUsers(loadedUsers);
      setAnnouncements(loadedAnnouncements);
      setSupportTickets(loadedTickets);
    } catch (err) {
      console.warn('Admin load error, using default seed sets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Handlers for User Management
  const handleUpdateUser = async (userId: string, updates: Partial<AdminUser>) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
    );
    await updateAdminUserRecord(userId, updates);
    showToast('User record updated successfully');
  };

  const handleCreateUser = async (
    newUserData: Omit<AdminUser, 'id' | 'createdAt' | 'lastActiveAt'>
  ) => {
    const newId = `usr_${Date.now()}`;
    const newUser: AdminUser = {
      ...newUserData,
      id: newId,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };
    setUsers((prev) => [newUser, ...prev]);
    await updateAdminUserRecord(newId, newUser);
    showToast(`Account created for ${newUser.email}`);
  };

  const handleUpgradeUserPlan = async (userId: string, tier: 'pro' | 'enterprise') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, subscriptionTier: tier } : u))
    );
    await updateAdminUserRecord(userId, { subscriptionTier: tier });
    showToast(`Granted ${tier.toUpperCase()} access to user`);
  };

  // Handlers for Announcements
  const handleCreateAnnouncement = async (
    announcementData: Omit<InAppAnnouncement, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const id = `anc_${Date.now()}`;
    const newAnnouncement: InAppAnnouncement = {
      ...announcementData,
      id,
      authorEmail: currentUser.email || 'admin@fiat.app',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    await saveInAppAnnouncement(newAnnouncement);
    showToast('Announcement published to active users');
  };

  const handleUpdateAnnouncement = async (id: string, updates: Partial<InAppAnnouncement>) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: Date.now() } : a))
    );
    const existing = announcements.find((a) => a.id === id);
    if (existing) {
      await saveInAppAnnouncement({ ...existing, ...updates, updatedAt: Date.now() });
      showToast('Announcement updated');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await deleteInAppAnnouncement(id);
    showToast('Announcement removed');
  };

  // Handlers for Support Tickets
  const handleReplyTicket = async (
    ticketId: string,
    message: string,
    newStatus?: SupportTicket['status']
  ) => {
    const newReply: SupportTicketReply = {
      id: `rep_${Date.now()}`,
      authorEmail: currentUser.email || 'danesensei@gmail.com',
      authorName: currentUser.displayName || 'Fiat Administrator',
      message,
      timestamp: Date.now(),
      isAdmin: true,
    };

    setSupportTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: newStatus || t.status,
            updatedAt: Date.now(),
            replies: [...(t.replies || []), newReply],
          };
        }
        return t;
      })
    );

    const ticket = supportTickets.find((t) => t.id === ticketId);
    await replyToSupportTicket(ticketId, newReply, ticket?.replies || [], newStatus);
    showToast(newStatus === 'resolved' ? 'Response sent & ticket resolved' : 'Support response delivered');
  };

  const handleUpdateTicketStatus = async (
    ticketId: string,
    status: SupportTicket['status']
  ) => {
    setSupportTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: Date.now() } : t))
    );
    const ticket = supportTickets.find((t) => t.id === ticketId);
    if (ticket) {
      await saveSupportTicket({ ...ticket, status, updatedAt: Date.now() });
      showToast(`Ticket #${ticketId} marked as ${status}`);
    }
  };

  // Badges
  const openTicketsCount = supportTickets.filter((t) => t.status === 'open').length;
  const publishedAnnouncementsCount = announcements.filter((a) => a.isPublished).length;

  return (
    <div className="min-h-screen bg-stone-100/70 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast notification */}
      {feedbackToast && (
        <div className="fixed top-5 right-5 z-50 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center space-x-2 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Admin Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand & Return */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              id="admin-exit-btn"
              onClick={onExitAdmin}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 hover:bg-stone-100 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Journal</span>
            </button>

            <div className="h-5 w-px bg-stone-200 dark:bg-stone-800 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-none">
                    Fiat Admin Console
                  </h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    Master
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 leading-none">
                  Logged in as {currentUser.email}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Refresh & System Status */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-600 dark:text-stone-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 3.6 Flash Active</span>
            </div>

            <button
              id="admin-refresh-data-btn"
              onClick={loadAdminData}
              disabled={isLoading}
              title="Refresh console records"
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Ribbon */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
            {/* Tab: Users */}
            <button
              id="admin-tab-users"
              onClick={() => setActiveTab('users')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Management</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'users'
                    ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                }`}
              >
                {users.length}
              </span>
            </button>

            {/* Tab: Subscriptions */}
            <button
              id="admin-tab-subscriptions"
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'subscriptions'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Subscriptions & Revenue</span>
            </button>

            {/* Tab: Announcements */}
            <button
              id="admin-tab-announcements"
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>In-App Announcements</span>
              {publishedAnnouncementsCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'announcements'
                      ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {publishedAnnouncementsCount} live
                </span>
              )}
            </button>

            {/* Tab: Support */}
            <button
              id="admin-tab-support"
              onClick={() => setActiveTab('support')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Support Desk</span>
              {openTicketsCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === 'support'
                      ? 'bg-white/20 text-white dark:bg-stone-900/20 dark:text-stone-900'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {openTicketsCount} open
                </span>
              )}
            </button>

            {/* Tab: Public Pages (Pricing, Terms, About, Contact) */}
            <button
              id="admin-tab-pages"
              onClick={() => setActiveTab('pages')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'pages'
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Public Pages &amp; Inquiries</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Admin Tab Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'users' && (
          <UserManagementTab
            users={users}
            onUpdateUser={handleUpdateUser}
            onCreateUser={handleCreateUser}
          />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionsTab users={users} onUpgradeUserPlan={handleUpgradeUserPlan} />
        )}

        {activeTab === 'announcements' && (
          <AnnouncementsTab
            announcements={announcements}
            onCreateAnnouncement={handleCreateAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}

        {activeTab === 'support' && (
          <SupportTab
            tickets={supportTickets}
            onReplyTicket={handleReplyTicket}
            onUpdateStatus={handleUpdateTicketStatus}
          />
        )}

        {activeTab === 'pages' && (
          <PublicPagesAdminTab
            users={users}
            onOpenPublicPage={onOpenPublicPage || (() => {})}
            onBroadcastAnnouncement={async (title, content) => {
              await handleCreateAnnouncement({
                title,
                content,
                type: 'feature',
                priority: 'high',
                isPublished: true,
                targetAudience: 'all',
              });
            }}
            onUpgradeUserPlan={handleUpgradeUserPlan}
          />
        )}
      </main>
    </div>
  );
};
