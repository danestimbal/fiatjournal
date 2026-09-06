import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Plus,
} from 'lucide-react';
import { SupportTicket, UserProfile } from '../types';
import { saveSupportTicket } from '../lib/firebase';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  tickets: SupportTicket[];
  onTicketSubmitted?: (newTicket: SupportTicket) => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  tickets,
  onTicketSubmitted,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('general');
  const [priority, setPriority] = useState<SupportTicket['priority']>('medium');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter tickets for current user
  const userTickets = tickets.filter(
    (t) =>
      t.userEmail.toLowerCase() === (currentUser.email?.toLowerCase() || '') ||
      (currentUser.uid && currentUser.uid !== 'guest' && t.userEmail.includes(currentUser.uid))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    const newId = `tkt_${Date.now()}`;
    const newTicket: SupportTicket = {
      id: newId,
      userEmail: currentUser.email || 'guest@fiat.app',
      userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Fiat User',
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority,
      status: 'open',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      replies: [],
    };

    try {
      await saveSupportTicket(newTicket);
      if (onTicketSubmitted) {
        onTicketSubmitted(newTicket);
      }
      setSuccessMessage('Your support ticket has been submitted. Our team will review it shortly!');
      setSubject('');
      setDescription('');
      setTimeout(() => {
        setSuccessMessage(null);
        setActiveTab('history');
      }, 1500);
    } catch (err) {
      console.warn('Support ticket submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <LifeBuoy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Help & Support Sanctuary
              </h3>
              <p className="text-xs text-stone-500">Contact the Fiat team for assistance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex space-x-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl my-3 shrink-0">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            New Support Inquiry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <span>My Inquiries</span>
            {userTickets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {userTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question about markdown export formatting"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200"
                  >
                    <option value="general">General Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Report a Bug</option>
                    <option value="billing">Subscription & Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide details or steps to reproduce the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium cursor-pointer inline-flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending...' : 'Submit Inquiry'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {userTickets.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  <LifeBuoy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>You haven't submitted any support inquiries yet.</p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="mt-3 text-xs font-semibold text-stone-900 dark:text-stone-100 underline cursor-pointer"
                  >
                    Open your first ticket
                  </button>
                </div>
              ) : (
                userTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-stone-900 dark:text-stone-100">{t.subject}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : t.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <p className="text-stone-600 dark:text-stone-400">{t.description}</p>

                    {/* Admin Replies if any */}
                    {t.replies && t.replies.length > 0 && (
                      <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700/60 space-y-2">
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Support Responses ({t.replies.length})
                        </span>
                        {t.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className="bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 text-[11px]"
                          >
                            <div className="flex items-center justify-between text-stone-400 mb-1">
                              <span className="font-medium text-stone-800 dark:text-stone-200">
                                {rep.authorName}
                              </span>
                              <span>{new Date(rep.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                              {rep.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
