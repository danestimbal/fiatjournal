import React, { useState } from 'react';
import { ReflectionMode, ReflectionSession } from '../types';
import {
  Plus,
  Search,
  BookOpen,
  Sparkles,
  Brain,
  Trash2,
  Calendar,
  MessageSquare,
  X,
  FileText,
} from 'lucide-react';

interface HistorySidebarProps {
  sessions: ReflectionSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ReflectionSession) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpenMobile,
  onCloseMobile,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.summary && session.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      session.turns.some((t) => t.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMode = filterMode === 'all' || session.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getModeIcon = (mode: ReflectionMode) => {
    switch (mode) {
      case 'brainstorm':
        return <Brain className="w-3.5 h-3.5 text-indigo-600" />;
      case 'summary':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="history-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-80 bg-stone-50 border-r border-stone-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } shrink-0`}
      >
        {/* Header and New Entry CTA */}
        <div className="p-4 border-b border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Journal Vault ({sessions.length})
            </h2>
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-md text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            id="new-journal-entry-btn"
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold tracking-wide transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Reflection Session</span>
          </button>
        </div>

        {/* Search & Mode Filters */}
        <div className="p-3 border-b border-stone-200 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
            <input
              id="search-reflections-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reflections..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-stone-200 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
            {['all', 'reflection', 'brainstorm', 'summary'].map((mode) => (
              <button
                key={mode}
                id={`filter-mode-${mode}`}
                onClick={() => setFilterMode(mode)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors shrink-0 ${
                  filterMode === mode
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-stone-200/70 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Session List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-12 px-4">
              <BookOpen className="w-8 h-8 mx-auto text-stone-300 mb-2" />
              <p className="text-xs font-medium text-stone-500">
                {searchTerm ? 'No matching reflections found' : 'No journal sessions yet'}
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                {searchTerm ? 'Try a different search term' : 'Start your first session above!'}
              </p>
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.id === currentSessionId;
              const isConfirmingDelete = deleteConfirmId === session.id;

              return (
                <div
                  key={session.id}
                  id={`session-item-${session.id}`}
                  className={`group relative rounded-xl p-3 text-left transition-all border ${
                    isSelected
                      ? 'bg-white border-stone-400/80 shadow-xs ring-1 ring-stone-400/30'
                      : 'bg-stone-100/50 hover:bg-white border-transparent hover:border-stone-200'
                  }`}
                >
                  <div
                    onClick={() => {
                      onSelectSession(session);
                      onCloseMobile();
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        {getModeIcon(session.mode)}
                        <span className="text-[10px] uppercase font-bold text-stone-500">
                          {session.mode}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {formatDate(session.updatedAt || session.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-stone-900 truncate mb-1">
                      {session.title || 'Untitled Session'}
                    </h3>

                    {session.summary ? (
                      <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                        {session.summary}
                      </p>
                    ) : session.turns.length > 0 ? (
                      <p className="text-[11px] text-stone-400 line-clamp-1 italic">
                        {session.turns[0].content}
                      </p>
                    ) : (
                      <p className="text-[11px] text-stone-400 italic">Empty session</p>
                    )}

                    <div className="mt-2 flex items-center space-x-2 text-[10px] text-stone-400">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.turns.length} {session.turns.length === 1 ? 'turn' : 'turns'}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button / Confirmation */}
                  <div className="absolute top-2.5 right-2.5">
                    {isConfirmingDelete ? (
                      <div className="flex items-center space-x-1 bg-white p-1 rounded-lg border border-rose-200 shadow-md">
                        <button
                          id={`confirm-delete-${session.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-600 text-white hover:bg-rose-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-1 py-0.5 rounded text-[10px] text-stone-500 hover:bg-stone-100"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-session-${session.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
