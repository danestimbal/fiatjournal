import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  ArrowDownWideNarrow,
  Search,
  SlidersHorizontal,
  X,
  Trash2,
} from 'lucide-react';
import { ReflectionSession } from '../types';
import { SwipeableNoteItem } from './SwipeableNoteItem';

interface NoteListPaneProps {
  notes: ReflectionSession[];
  activeView: string;
  currentNoteId: string | null;
  onSelectNote: (note: ReflectionSession) => void;
  onNewNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onToggleFavorite?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
}

type SortOption = 'modified' | 'created' | 'title';

export const NoteListPane: React.FC<NoteListPaneProps> = ({
  notes,
  activeView,
  currentNoteId,
  onSelectNote,
  onNewNote,
  onDeleteNote,
  onToggleFavorite,
  onTogglePin,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('modified');
  const [noteToDelete, setNoteToDelete] = useState<ReflectionSession | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when pressing '/' shortcut on desktop
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && noteToDelete) {
        setNoteToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noteToDelete]);

  // Filter notes by active view
  const filteredByView = useMemo(() => {
    let list = [...notes];
    if (activeView === 'Inbox') {
      list = list.filter((n) => !n.folder || n.folder === 'Inbox');
    } else if (activeView === 'Archive') {
      list = list.filter((n) => n.folder === 'Archive');
    } else if (activeView === 'Starred') {
      list = list.filter((n) => n.isFavorite || n.isPinned);
    } else if (activeView === 'Pinned') {
      list = list.filter((n) => n.isPinned);
    } else if (activeView === 'Shared' || activeView === 'Shared with Me') {
      list = list.filter((n) => n.isShared || (n.sharedWith && n.sharedWith.length > 0) || n.isPublic);
    } else if (activeView === 'Projects') {
      list = list.filter((n) => n.folder === 'Projects' || n.tags?.includes('Projects'));
    } else if (activeView === 'Notes') {
      list = list.filter((n) => n.tags?.includes('Notes') || !n.tags?.length);
    } else if (activeView === 'Codes') {
      list = list.filter((n) => n.tags?.includes('Codes') || n.content.includes('```'));
    } else if (activeView === 'PrimeEd LMSs') {
      list = list.filter((n) => n.tags?.includes('LMS') || n.title.toLowerCase().includes('lms') || n.tags?.includes('PrimeEd LMSs'));
    } else if (activeView === 'The Borderless Classrooms') {
      list = list.filter((n) => n.tags?.includes('Classroom') || n.content.toLowerCase().includes('classroom') || n.tags?.includes('The Borderless Classrooms'));
    } else {
      // Dynamic folder or tag
      list = list.filter(
        (n) =>
          n.folder === activeView ||
          n.tags?.includes(activeView) ||
          n.title.toLowerCase().includes(activeView.toLowerCase()) ||
          n.content.toLowerCase().includes(activeView.toLowerCase())
      );
    }
    return list;
  }, [notes, activeView]);

  // Apply search query across title, content, and tags
  const searchedNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return filteredByView;

    const keywords = query.split(/\s+/).filter(Boolean);
    return filteredByView.filter((n) => {
      const titleLower = (n.title || '').toLowerCase();
      const contentLower = (n.content || '').toLowerCase();
      const tagsLower = (n.tags || []).join(' ').toLowerCase();

      // All keywords must match either title, content, or tags
      return keywords.every(
        (kw) =>
          titleLower.includes(kw) ||
          contentLower.includes(kw) ||
          tagsLower.includes(kw)
      );
    });
  }, [filteredByView, searchQuery]);

  // Apply sorting with pinned notes anchored to top
  const sortedNotes = useMemo(() => {
    const list = [...searchedNotes];
    return list.sort((a, b) => {
      // Pinned notes always surface first
      const aPinned = Boolean(a.isPinned);
      const bPinned = Boolean(b.isPinned);
      if (aPinned !== bPinned) {
        return aPinned ? -1 : 1;
      }
      if (sortBy === 'modified') {
        return b.updatedAt - a.updatedAt;
      } else if (sortBy === 'created') {
        return b.createdAt - a.createdAt;
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [searchedNotes, sortBy]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getExcerpt = (content: string) => {
    // Strip markdown headings and symbols for clean preview
    const clean = content
      .replace(/^#+\s+/gm, '')
      .replace(/==|[*_`~[\]]/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    return clean.slice(0, 100) || 'Empty note...';
  };

  return (
    <div
      id="note-list-pane"
      className="w-full md:w-72 shrink-0 h-full flex flex-col bg-white dark:bg-[#161615] border-r border-[#E8E8E6] dark:border-[#2e2e2a] font-sans transition-colors"
    >
      {/* Pane Header */}
      <div className="h-10 px-3.5 flex items-center justify-between border-b border-[#F0F0EE] dark:border-[#2e2e2a] bg-white dark:bg-[#161615] shrink-0 transition-colors">
        <div className="flex items-center space-x-2 min-w-0">
          <span className="font-semibold text-stone-900 dark:text-stone-100 text-[14px] tracking-tight truncate">
            {activeView}
          </span>
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded-full shrink-0">
            {filteredByView.length}
          </span>
        </div>

        <div className="flex items-center space-x-1 text-stone-500 dark:text-stone-400 shrink-0">
          {/* Sort selector */}
          <button
            id="btn-sort-notes"
            onClick={() => {
              setSortBy((prev) =>
                prev === 'modified' ? 'created' : prev === 'created' ? 'title' : 'modified'
              );
            }}
            title={`Sorted by ${sortBy}. Click to toggle.`}
            className="flex items-center space-x-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ArrowDownWideNarrow className="w-3 h-3 text-stone-400" />
            <span className="capitalize">{sortBy}</span>
          </button>

          {/* Quick search focus button */}
          <button
            id="btn-search-notes"
            onClick={() => {
              searchInputRef.current?.focus();
            }}
            title="Focus search (/)"
            className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Filter options dummy button */}
          <button
            id="btn-filter-notes"
            title="Filter options"
            className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* New Note button */}
          <button
            id="btn-new-note-list"
            onClick={onNewNote}
            title="New Journal (Choose Template)"
            className="p-1 rounded text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Prominent Search Bar at the Top */}
      <div id="note-list-search-container" className="px-3 py-2 border-b border-[#E8E8E6] dark:border-[#2e2e2a] bg-[#FAFAFA] dark:bg-[#1a1a18] shrink-0 transition-colors">
        <div className="relative flex items-center bg-white dark:bg-[#161615] border border-[#E0E0DC] dark:border-[#2e2e2a] focus-within:border-stone-400 dark:focus-within:border-stone-600 focus-within:ring-2 focus-within:ring-stone-200/60 dark:focus-within:ring-stone-700/60 rounded-lg px-2.5 py-1.5 transition-all shadow-2xs">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0 mr-2" />
          <input
            ref={searchInputRef}
            id="note-search-input"
            type="text"
            placeholder="Search notes or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-xs text-stone-800 dark:text-stone-100 outline-hidden placeholder:text-stone-400 dark:placeholder:text-stone-500 min-w-0"
            aria-label="Filter notes by title or content keywords"
          />
          {searchQuery ? (
            <button
              id="btn-clear-search"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              title="Clear search"
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-0.5 ml-1 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block text-[10px] text-stone-400 font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-1 py-0.2 rounded-xs select-none">
              /
            </kbd>
          )}
        </div>

        {searchQuery.trim() && (
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-0.5 animate-in fade-in duration-150">
            <span>
              {sortedNotes.length} {sortedNotes.length === 1 ? 'result' : 'results'} found
            </span>
            <button
              id="btn-reset-search-link"
              onClick={() => {
                setSearchQuery('');
                searchInputRef.current?.focus();
              }}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline text-[10px] cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#F5F5F3] dark:divide-[#242422] scrollbar-thin">
        {sortedNotes.length === 0 ? (
          searchQuery.trim() ? (
            <div id="search-no-results" className="p-8 text-center text-xs animate-in fade-in duration-150">
              <Search className="w-7 h-7 mx-auto mb-2 text-stone-300 dark:text-stone-600 stroke-[1.5]" />
              <p className="font-semibold text-stone-700 dark:text-stone-200">No notes found</p>
              <p className="mt-1 text-stone-400 dark:text-stone-500 leading-relaxed max-w-[200px] mx-auto">
                No notes match &ldquo;{searchQuery}&rdquo; in {activeView}.
              </p>
              <button
                id="btn-clear-search-empty-state"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="mt-3.5 inline-flex items-center px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium cursor-pointer transition-colors shadow-2xs"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-medium text-stone-600 dark:text-stone-300">No notes in {activeView}</p>
              <p className="mt-1 text-stone-400 dark:text-stone-500">Click + above to create one.</p>
            </div>
          )
        ) : (
          sortedNotes.map((note) => (
            <SwipeableNoteItem
              key={note.id}
              note={note}
              isSelected={note.id === currentNoteId}
              onSelect={() => onSelectNote(note)}
              onRequestDelete={(targetNote) => setNoteToDelete(targetNote)}
              onToggleFavorite={onToggleFavorite}
              onTogglePin={onTogglePin}
              formatDate={formatDate}
              getExcerpt={getExcerpt}
            />
          ))
        )}
      </div>

      {/* Delete Note Confirmation Dialog */}
      {noteToDelete && (
        <div
          id="modal-delete-note-backdrop"
          className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setNoteToDelete(null)}
        >
          <div
            id="modal-delete-note-card"
            className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-5 max-w-sm w-full animate-in zoom-in-95 duration-150 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/60 shadow-2xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                  Delete &ldquo;{noteToDelete.title || 'Untitled Note'}&rdquo;?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
                  Are you sure you want to delete this reflection note? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                id="btn-cancel-delete-note"
                onClick={() => setNoteToDelete(null)}
                className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-note"
                onClick={() => {
                  onDeleteNote(noteToDelete.id);
                  setNoteToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                autoFocus
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
