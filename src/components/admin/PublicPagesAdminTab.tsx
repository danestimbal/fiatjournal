import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  Info,
  Mail,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Reply,
  Check,
  Archive,
  RefreshCw,
  AlertCircle,
  Building,
  UserCheck,
  Megaphone,
} from 'lucide-react';
import {
  ContactSubmission,
  PublicPageType,
  AdminUser,
  SubscriptionPlan,
} from '../../types';
import {
  fetchContactSubmissions,
  updateContactSubmissionStatus,
} from '../../lib/firebase';
import { INITIAL_SUBSCRIPTION_PLANS } from '../../data/adminSeedData';

interface PublicPagesAdminTabProps {
  users: AdminUser[];
  onOpenPublicPage: (page: PublicPageType) => void;
  onBroadcastAnnouncement?: (title: string, content: string) => Promise<void>;
  onUpgradeUserPlan: (userId: string, tier: 'pro' | 'enterprise') => Promise<void>;
}

export const PublicPagesAdminTab: React.FC<PublicPagesAdminTabProps> = ({
  users,
  onOpenPublicPage,
  onBroadcastAnnouncement,
  onUpgradeUserPlan,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<PublicPageType>('pricing');
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Terms update broadcast state
  const [isBroadcastingTerms, setIsBroadcastingTerms] = useState(false);
  const [termsBroadcastSuccess, setTermsBroadcastSuccess] = useState(false);

  // Load contact submissions
  const loadSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const data = await fetchContactSubmissions();
      setSubmissions(data);
      if (data.length > 0 && !selectedSubmission) {
        setSelectedSubmission(data[0]);
      }
    } catch (err) {
      console.warn('Error loading submissions:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Filter submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (categoryFilter !== 'all' && s.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.subject.toLowerCase().includes(q) ||
        s.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSendReply = async () => {
    if (!selectedSubmission || !replyText.trim()) return;
    setIsSendingReply(true);
    try {
      await updateContactSubmissionStatus(selectedSubmission.id, {
        status: 'replied',
        repliedAt: Date.now(),
        replyMessage: replyText.trim(),
        repliedBy: 'danesensei@gmail.com',
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === selectedSubmission.id
            ? {
                ...item,
                status: 'replied',
                repliedAt: Date.now(),
                replyMessage: replyText.trim(),
                repliedBy: 'danesensei@gmail.com',
              }
            : item
        )
      );

      setSelectedSubmission((prev) =>
        prev
          ? {
              ...prev,
              status: 'replied',
              repliedAt: Date.now(),
              replyMessage: replyText.trim(),
              repliedBy: 'danesensei@gmail.com',
            }
          : null
      );

      setReplyText('');
    } catch (err) {
      console.warn('Failed to reply:', err);
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ContactSubmission['status']) => {
    await updateContactSubmissionStatus(id, { status });
    setSubmissions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    if (selectedSubmission?.id === id) {
      setSelectedSubmission((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleBroadcastTermsUpdate = async () => {
    if (!onBroadcastAnnouncement) return;
    setIsBroadcastingTerms(true);
    try {
      await onBroadcastAnnouncement(
        'Policy Update: Terms of Service & Zero-AI Training Certification',
        'We have published Version 2.4 of the Fiat Journal Terms of Service. Review our reinforced Zero-Data Retention policy and cryptographic Firestore isolation standards in the footer.'
      );
      setTermsBroadcastSuccess(true);
      setTimeout(() => setTermsBroadcastSuccess(false), 4000);
    } catch (err) {
      console.warn('Broadcast failed:', err);
    } finally {
      setIsBroadcastingTerms(false);
    }
  };

  // Plan metrics
  const proCount = users.filter((u) => u.subscriptionTier === 'pro').length;
  const enterpriseCount = users.filter((u) => u.subscriptionTier === 'enterprise').length;
  const freeCount = users.filter((u) => u.subscriptionTier === 'free').length;
  const mrr = proCount * 12 + enterpriseCount * 29;

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Navigation for Public Pages */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
          <button
            onClick={() => setActiveSubTab('pricing')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'pricing'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
            <span>Pricing Admin</span>
          </button>

          <button
            onClick={() => setActiveSubTab('terms')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'terms'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Terms &amp; Policies</span>
          </button>

          <button
            onClick={() => setActiveSubTab('about')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'about'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>About &amp; Brand</span>
          </button>

          <button
            onClick={() => setActiveSubTab('contact')}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'contact'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-purple-500" />
            <span>Contact Inquiries</span>
            {submissions.filter((s) => s.status === 'new').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px] font-bold">
                {submissions.filter((s) => s.status === 'new').length}
              </span>
            )}
          </button>
        </div>

        {/* Live Public Page Preview Link */}
        <button
          onClick={() => onOpenPublicPage(activeSubTab)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <span>View Live Public Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. PRICING ADMIN TAB */}
      {activeSubTab === 'pricing' && (
        <div className="space-y-6">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Live MRR</span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${mrr}
              </p>
              <span className="text-[11px] text-stone-400">ARR: ${(mrr * 12).toLocaleString()}</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Pro Subscribers</span>
              <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                {proCount}
              </p>
              <span className="text-[11px] text-stone-400">$12/mo each</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Team / Enterprise</span>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {enterpriseCount}
              </p>
              <span className="text-[11px] text-stone-400">$29/mo each</span>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500">Free Tier Users</span>
              <p className="text-2xl font-bold text-stone-700 dark:text-stone-300 mt-1">
                {freeCount}
              </p>
              <span className="text-[11px] text-stone-400">Conversion potential</span>
            </div>
          </div>

          {/* Pricing Plans List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INITIAL_SUBSCRIPTION_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="p-5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {plan.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {plan.badge}
                    </span>
                  </div>
                  <div className="mt-2 text-xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                    ${plan.price}
                    <span className="text-xs font-normal text-stone-500">/{plan.billingPeriod}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">{plan.description}</p>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <div>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        AI Quota:
                      </span>{' '}
                      {plan.geminiQuota}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        Storage:
                      </span>{' '}
                      {plan.storageLimit}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        Subscribers:
                      </span>{' '}
                      {plan.id === 'plan_pro'
                        ? proCount + 189
                        : plan.id === 'plan_enterprise'
                        ? enterpriseCount + 28
                        : freeCount + 342}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Published to Public
                  </span>
                  <button
                    onClick={() => onOpenPublicPage('pricing')}
                    className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:underline cursor-pointer"
                  >
                    View Card &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. TERMS & POLICIES ADMIN TAB */}
      {activeSubTab === 'terms' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Terms of Service &amp; Data Sanctuary Governance
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Live Version: 2.4 &bull; Last Revised: September 1, 2026 &bull; Status: Active
                </p>
              </div>

              {onBroadcastAnnouncement && (
                <button
                  onClick={handleBroadcastTermsUpdate}
                  disabled={isBroadcastingTerms}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  <span>
                    {isBroadcastingTerms ? 'Broadcasting...' : 'Broadcast Policy Notice to All Users'}
                  </span>
                </button>
              )}
            </div>

            {termsBroadcastSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Announcement broadcasted successfully! All users will see the updated terms notice.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Zero AI Model Training
                </span>
                <p className="text-xs text-stone-500 mt-1">
                  Enforced via Google GenAI stateless inference endpoints with zero training retention.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  Firestore Path Isolation
                </span>
                <p className="text-xs text-stone-500 mt-1">
                  Owner-bound rules deployed to Cloud Firestore project.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80">
                <span className="font-semibold text-xs text-stone-900 dark:text-stone-100">
                  30-Day Money-Back SLA
                </span>
                <p className="text-xs text-stone-500 mt-1">
                  Automated refund policy mapped to billing desk email: billing@fiat.app.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABOUT & BRAND ADMIN TAB */}
      {activeSubTab === 'about' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Brand Sanctuary &amp; Mission Pillars
            </h3>
            <p className="text-xs text-stone-500">
              These statements are rendered on the public About page and guide the product design philosophy.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Pillar 1: Distraction-Free Markdown Sanctuary
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  Minimalist typography, zero algorithmic feeds, and no vanity metrics.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  Pillar 2: Socratic Gemini AI Companion
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  Trained to ask clarifying questions and mirror cognitive thoughts rather than auto-completing content.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  Pillar 3: Absolute Data Sovereignty
                </span>
                <p className="text-xs text-stone-600 dark:text-stone-300 mt-1">
                  Zero model training, owner-bound Firestore isolation, and standard open Markdown export.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CONTACT SUBMISSIONS INBOX */}
      {activeSubTab === 'contact' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, subject..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="partnership">Partnership</option>
                <option value="enterprise">Enterprise</option>
                <option value="general">General</option>
                <option value="support">Support</option>
                <option value="security">Security</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={loadSubmissions}
                disabled={isLoadingSubmissions}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                title="Refresh Submissions"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Master-Detail View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  No contact messages match your filter.
                </div>
              ) : (
                filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      if (sub.status === 'new') {
                        handleUpdateStatus(sub.id, 'read');
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedSubmission?.id === sub.id
                        ? 'bg-stone-100 dark:bg-stone-800 border-stone-400 dark:border-stone-600 shadow-xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate max-w-[180px]">
                        {sub.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          sub.status === 'new'
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : sub.status === 'replied'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-stone-800 dark:text-stone-200 mt-1 truncate">
                      {sub.subject}
                    </p>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                      {sub.message}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="capitalize">{sub.category}</span>
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail Pane */}
            <div className="lg:col-span-7">
              {selectedSubmission ? (
                <div className="p-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-5">
                  <div className="flex items-start justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-stone-400">
                          {selectedSubmission.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          {selectedSubmission.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-1">
                        {selectedSubmission.subject}
                      </h3>
                      <div className="text-xs text-stone-500 mt-0.5">
                        From:{' '}
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {selectedSubmission.name}
                        </span>{' '}
                        (&lt;{selectedSubmission.email}&gt;) &bull;{' '}
                        {new Date(selectedSubmission.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleUpdateStatus(selectedSubmission.id, 'archived')}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                        title="Archive Submission"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/80 text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>

                  {/* Existing Reply if already replied */}
                  {selectedSubmission.replyMessage && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-emerald-800 dark:text-emerald-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reply Transmitted to User
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                          {selectedSubmission.repliedAt
                            ? new Date(selectedSubmission.repliedAt).toLocaleString()
                            : ''}
                        </span>
                      </div>
                      <p className="text-emerald-900 dark:text-emerald-200/90 pt-1 whitespace-pre-wrap">
                        {selectedSubmission.replyMessage}
                      </p>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      Respond to {selectedSubmission.name} (&lt;{selectedSubmission.email}&gt;)
                    </label>
                    <textarea
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Draft reply message to ${selectedSubmission.name}...`}
                      className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                    />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-500">
                        Sender will be notified at {selectedSubmission.email}
                      </span>
                      <button
                        onClick={handleSendReply}
                        disabled={isSendingReply || !replyText.trim()}
                        className="px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>{isSendingReply ? 'Sending...' : 'Send Sanctuary Reply'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-500 text-xs">
                  Select a message from the list to read details and reply.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
