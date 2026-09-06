import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  User,
  Shield,
  Check,
  Tag,
  Sparkles,
} from 'lucide-react';
import { SupportTicket, SupportTicketReply } from '../../types';

interface SupportTabProps {
  tickets: SupportTicket[];
  onReplyTicket: (
    ticketId: string,
    message: string,
    newStatus?: SupportTicket['status']
  ) => Promise<void>;
  onUpdateStatus: (ticketId: string, status: SupportTicket['status']) => Promise<void>;
}

export const SupportTab: React.FC<SupportTabProps> = ({
  tickets,
  onReplyTicket,
  onUpdateStatus,
}) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    tickets[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | SupportTicket['category']>('all');
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Selected ticket
  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Metrics
  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;
  const urgentCount = tickets.filter(
    (t) => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'resolved'
  ).length;

  const handleSendReply = async (resolveTicket: boolean = false) => {
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsSubmittingReply(true);
    try {
      await onReplyTicket(
        selectedTicket.id,
        replyMessage.trim(),
        resolveTicket ? 'resolved' : 'in_progress'
      );
      setReplyMessage('');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium text-[11px] border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            Open
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium text-[11px] border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3 h-3" />
            In Progress
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Resolved
          </span>
        );
      case 'closed':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium text-[11px]">
            Closed
          </span>
        );
    }
  };

  const getPriorityBadge = (p: SupportTicket['priority']) => {
    switch (p) {
      case 'urgent':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
            Urgent
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
            Medium
          </span>
        );
      case 'low':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
            Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Open Tickets
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{openCount}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Awaiting first response</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              In Investigation
            </span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {inProgressCount}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Active dialogue</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              High / Urgent Attention
            </span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">{urgentCount}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Needs prompt follow-up</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Resolved Cases
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {resolvedCount}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Customer satisfied</span>
        </div>
      </div>

      {/* Ticket Management Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Ticket List */}
        <div className="lg:col-span-5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inquiries or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as any)}
                className="flex-1 px-2 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-700 dark:text-stone-300"
              >
                <option value="all">All Categories</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="billing">Billing</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[580px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                No support tickets found matching criteria.
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer block ${
                      isSelected
                        ? 'bg-stone-100/90 dark:bg-stone-800/80 border-l-2 border-stone-900 dark:border-stone-100'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate flex-1">
                        {t.subject}
                      </span>
                      {getPriorityBadge(t.priority)}
                    </div>

                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1 mb-2">
                      {t.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400">
                      <span className="truncate max-w-[140px] font-medium text-stone-600 dark:text-stone-300">
                        {t.userName || t.userEmail}
                      </span>
                      <div className="flex items-center space-x-1.5">
                        {getStatusBadge(t.status)}
                        {t.replies && t.replies.length > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-stone-500">
                            <MessageSquare className="w-2.5 h-2.5" />
                            {t.replies.length}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation & Actions */}
        <div className="lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          {selectedTicket ? (
            <div className="space-y-4">
              {/* Ticket Header & Status Control */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-stone-400">
                      #{selectedTicket.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                      {selectedTicket.category}
                    </span>
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="mt-1 text-base font-bold text-stone-900 dark:text-stone-100">
                    {selectedTicket.subject}
                  </h3>
                  <p className="text-xs text-stone-500">
                    From: {selectedTicket.userName} ({selectedTicket.userEmail}) &bull;{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-stone-500 font-medium">Status:</span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => onUpdateStatus(selectedTicket.id, e.target.value as any)}
                    className="px-2.5 py-1 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 font-medium"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Original Inquiry Message */}
              <div className="bg-stone-50 dark:bg-stone-800/40 rounded-xl p-4 border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-200">
                      {selectedTicket.userEmail[0].toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      {selectedTicket.userName || selectedTicket.userEmail}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {new Date(selectedTicket.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Existing Replies Thread */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Response History
                  </h4>
                  {selectedTicket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`p-3.5 rounded-xl text-xs border ${
                        reply.isAdmin
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-800/50 ml-4'
                          : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-1.5">
                          {reply.isAdmin ? (
                            <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-stone-500" />
                          )}
                          <span className="font-semibold text-stone-900 dark:text-stone-100">
                            {reply.authorName} {reply.isAdmin && '(Fiat Admin)'}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {new Date(reply.timestamp).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
                        {reply.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Composer */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Send Admin Response
                </label>
                <textarea
                  rows={3}
                  placeholder="Type your official support response to the user..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                />

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    disabled={!replyMessage.trim() || isSubmittingReply}
                    onClick={() => handleSendReply(true)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium text-xs hover:bg-emerald-100 cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Send & Mark Resolved</span>
                  </button>

                  <button
                    type="button"
                    disabled={!replyMessage.trim() || isSubmittingReply}
                    onClick={() => handleSendReply(false)}
                    className="px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-stone-400 text-xs">
              Select a support inquiry to view details and respond.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
