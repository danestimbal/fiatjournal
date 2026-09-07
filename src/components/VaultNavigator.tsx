import React, { useState, useMemo } from 'react';
import {
  Inbox,
  FileText,
  Archive,
  ChevronDown,
  ChevronRight,
  Plus,
  SlidersHorizontal,
  Folder,
  FolderOpen,
  SidebarClose,
  ChevronLeft,
  ChevronRight as ChevronForward,
  FolderGit2,
  Tag,
  BookMarked,
  Sparkles,
  Pencil,
  Trash2,
  Check,
  X,
  Pin,
  Share2,
  Shield,
  Zap,
  ArrowUpRight,
  ExternalLink,
  HardDrive,
} from 'lucide-react';
import { ReflectionSession, UserProfile, PublicPageType } from '../types';
import { exportVaultAsZip } from '../lib/exportUtils';
import { canAccessRichExports } from '../lib/tierLimits';

interface VaultNavigatorProps {
  notes: ReflectionSession[];
  activeView: string;
  onSelectView: (view: string) => void;
  onCollapse: () => void;
  onNewNote: () => void;
  customFolders?: string[];
  deletedFolders?: string[];
  onRenameFolder?: (oldName: string, newName: string) => void;
  onDeleteFolder?: (folderName: string) => void;
  onCreateFolder?: (folderName: string) => void;
  currentUser?: UserProfile | null;
  onOpenUpgradeModal?: () => void;
  onNavigatePage?: (page: PublicPageType) => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenStorageSettings?: () => void;
}

export const VaultNavigator: React.FC<VaultNavigatorProps> = ({
  notes,
  activeView,
  onSelectView,
  onCollapse,
  onNewNote,
  customFolders = [],
  deletedFolders = [],
  onRenameFolder,
  onDeleteFolder,
  onCreateFolder,
  currentUser,
  onOpenUpgradeModal,
  onNavigatePage,
  isAdmin = false,
  onOpenAdmin,
  onOpenStorageSettings,
}) => {
  const [viewsExpanded, setViewsExpanded] = useState(true);
  const [typesExpanded, setTypesExpanded] = useState(true);
  const [foldersExpanded, setFoldersExpanded] = useState(true);
  const [projectsFolderOpen, setProjectsFolderOpen] = useState(true);

  // Folder action states
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleExportVault = async () => {
    if (!canAccessRichExports(currentUser?.subscriptionTier)) {
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }
    setIsExportingZip(true);
    try {
      await exportVaultAsZip(notes);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Compute live counts directly from Firestore synced notes
  const inboxCount = notes.filter((n) => !n.folder || n.folder === 'Inbox').length;
  const allNotesCount = notes.length;
  const archiveCount = notes.filter((n) => n.folder === 'Archive').length;
  const starredCount = notes.filter((n) => n.isFavorite || n.isPinned).length;

  // Dynamically derive Types/Tags from the actual notes in Firestore
  const dynamicTypes = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      (n.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    // Known default categories if present in notes or user workspace
    const baseNames = ['Notes', 'Projects', 'Codes', 'PrimeEd LMSs', 'The Borderless Classrooms'];
    const allNames = Array.from(new Set([...baseNames, ...Object.keys(counts)]));

    return allNames.map((name) => {
      let count = counts[name] || 0;
      if (name === 'Notes') {
        count = notes.filter((n) => n.tags?.includes('Notes') || !n.tags?.length).length;
      } else if (name === 'Projects') {
        count = notes.filter((n) => n.folder === 'Projects' || n.tags?.includes('Projects')).length;
      } else if (name === 'Codes') {
        count = notes.filter((n) => n.tags?.includes('Codes') || n.content.includes('```')).length;
      } else if (name === 'PrimeEd LMSs') {
        count = notes.filter((n) => n.tags?.includes('LMS') || n.title.toLowerCase().includes('lms')).length;
      } else if (name === 'The Borderless Classrooms') {
        count = notes.filter((n) => n.tags?.includes('Classroom') || n.content.toLowerCase().includes('classroom')).length;
      }
      return { name, count };
    }).filter((t) => t.count > 0 || ['Notes', 'Projects'].includes(t.name));
  }, [notes]);

  // Dynamically derive Folders from notes in Firestore, customFolders, and deletedFolders
  const dynamicFolders = useMemo(() => {
    const foldersMap: Record<string, number> = {};
    notes.forEach((n) => {
      if (n.folder && n.folder !== 'Inbox' && n.folder !== 'Archive' && n.folder !== 'Projects') {
        foldersMap[n.folder] = (foldersMap[n.folder] || 0) + 1;
      }
    });

    // Default template folders
    const defaultSubfolders = ['attachments', 'DICT Training', 'GuroHub', 'GuroHub IpoPhil Reg'];
    defaultSubfolders.forEach((sub) => {
      if (!deletedFolders.includes(sub) && foldersMap[sub] === undefined) {
        foldersMap[sub] = 0;
      }
    });

    // Any user custom-created folders
    customFolders.forEach((custom) => {
      if (!deletedFolders.includes(custom) && foldersMap[custom] === undefined) {
        foldersMap[custom] = 0;
      }
    });

    return Object.entries(foldersMap)
      .filter(([name]) => !deletedFolders.includes(name))
      .map(([name, count]) => ({ name, count }));
  }, [notes, customFolders, deletedFolders]);

  return (
    <aside
      id="vault-navigator-pane"
      className="w-full md:w-64 shrink-0 h-full flex flex-col bg-[#F9F9F8] dark:bg-[#181816] border-r border-[#E8E8E6] dark:border-[#2e2e2a] select-none text-[13px] text-stone-700 dark:text-stone-300 font-sans transition-colors"
    >
      {/* Top action bar: Pane collapse & Nav history arrows */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-transparent">
        <div className="flex items-center space-x-1">
          <button
            id="btn-collapse-nav"
            onClick={onCollapse}
            title="Collapse Sidebar"
            className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <SidebarClose className="w-4 h-4" />
          </button>
          <button
            title="Go Back"
            className="p-1 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            title="Go Forward"
            className="p-1 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
          >
            <ChevronForward className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            id="btn-quick-export-vault"
            onClick={handleExportVault}
            disabled={isExportingZip}
            title="Export Entire Vault (.zip)"
            className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            id="btn-quick-new-nav"
            onClick={onNewNote}
            title="New Journal (Choose Template)"
            className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tree Content */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-3 scrollbar-thin">
        {/* Primary New Journal Button */}
        <button
          id="btn-sidebar-new-journal"
          onClick={onNewNote}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-2xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Journal</span>
        </button>

        {/* Core Main Views */}
        <div className="space-y-0.5">
          <button
            id="nav-view-inbox"
            onClick={() => onSelectView('Inbox')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'Inbox'
                ? 'bg-[#3b82f6]/10 dark:bg-blue-950/50 text-[#2563eb] dark:text-blue-400 font-medium'
                : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Inbox className={`w-4 h-4 ${activeView === 'Inbox' ? 'text-[#2563eb] dark:text-blue-400' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Inbox</span>
            </div>
            {inboxCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-semibold ${
                  activeView === 'Inbox'
                    ? 'bg-[#2563eb] text-white'
                    : 'bg-stone-200/80 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                }`}
              >
                {inboxCount}
              </span>
            )}
          </button>

          <button
            id="nav-view-all"
            onClick={() => onSelectView('All Notes')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'All Notes'
                ? 'bg-[#3b82f6]/10 dark:bg-blue-950/50 text-[#2563eb] dark:text-blue-400 font-medium'
                : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className={`w-4 h-4 ${activeView === 'All Notes' ? 'text-[#2563eb] dark:text-blue-400' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>All Notes</span>
            </div>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">{allNotesCount}</span>
          </button>

          <button
            id="nav-view-archive"
            onClick={() => onSelectView('Archive')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeView === 'Archive'
                ? 'bg-[#3b82f6]/10 dark:bg-blue-950/50 text-[#2563eb] dark:text-blue-400 font-medium'
                : 'hover:bg-stone-200/60 dark:hover:bg-stone-800/60 text-stone-700 dark:text-stone-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Archive className={`w-4 h-4 ${activeView === 'Archive' ? 'text-[#2563eb] dark:text-blue-400' : 'text-stone-500 dark:text-stone-400'}`} />
              <span>Archive</span>
            </div>
            {archiveCount > 0 && <span className="text-xs text-stone-500 dark:text-stone-400">{archiveCount}</span>}
          </button>
        </div>

        {/* Section: VIEWS */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
            <button
              onClick={() => setViewsExpanded(!viewsExpanded)}
              className="flex items-center space-x-1 hover:text-stone-600 transition-colors"
            >
              {viewsExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Views</span>
            </button>
            <button
              title="Add View"
              className="p-0.5 rounded hover:bg-stone-200 hover:text-stone-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {viewsExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {/* Pinned Notes View */}
              <button
                id="nav-view-pinned"
                onClick={() => onSelectView('Pinned')}
                className={`w-full flex items-center justify-between px-2.5 py-1.2 rounded-md transition-colors cursor-pointer ${
                  activeView === 'Pinned'
                    ? 'bg-[#3b82f6]/10 text-[#2563eb] dark:text-blue-400 font-medium'
                    : 'hover:bg-stone-200/50 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20 -rotate-45" />
                  <span>Pinned Notes</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {notes.filter((n) => n.isPinned).length}
                </span>
              </button>

              {/* Starred Notes View */}
              <button
                id="nav-view-starred"
                onClick={() => onSelectView('Starred')}
                className={`w-full flex items-center justify-between px-2.5 py-1.2 rounded-md transition-colors cursor-pointer ${
                  activeView === 'Starred'
                    ? 'bg-[#3b82f6]/10 text-[#2563eb] dark:text-blue-400 font-medium'
                    : 'hover:bg-stone-200/50 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BookMarked className="w-3.5 h-3.5 text-amber-500" />
                  <span>Starred Notes</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {notes.filter((n) => n.isFavorite).length}
                </span>
              </button>

              {/* Shared Notes View */}
              <button
                id="nav-view-shared"
                onClick={() => onSelectView('Shared')}
                className={`w-full flex items-center justify-between px-2.5 py-1.2 rounded-md transition-colors cursor-pointer ${
                  activeView === 'Shared' || activeView === 'Shared with Me'
                    ? 'bg-[#3b82f6]/10 text-[#2563eb] dark:text-blue-400 font-medium'
                    : 'hover:bg-stone-200/50 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Shared with Me</span>
                </div>
                <span className="text-xs text-stone-400 font-mono">
                  {notes.filter((n) => n.isShared || (n.sharedWith && n.sharedWith.length > 0) || n.isPublic).length}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Section: TYPES */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
            <button
              onClick={() => setTypesExpanded(!typesExpanded)}
              className="flex items-center space-x-1 hover:text-stone-600 transition-colors"
            >
              {typesExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Types</span>
            </button>
            <div className="flex items-center space-x-1">
              <button
                title="Sort & Filter"
                className="p-0.5 rounded hover:bg-stone-200 hover:text-stone-700 transition-colors"
              >
                <SlidersHorizontal className="w-3 h-3" />
              </button>
              <button
                title="Add Type"
                className="p-0.5 rounded hover:bg-stone-200 hover:text-stone-700 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {typesExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {dynamicTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => onSelectView(type.name)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.2 rounded-md transition-colors ${
                    activeView === type.name
                      ? 'bg-[#3b82f6]/10 text-[#2563eb] font-medium'
                      : 'hover:bg-stone-200/50 text-stone-600'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{type.name}</span>
                  </div>
                  {type.count > 0 && (
                    <span className="text-xs text-stone-400 font-mono ml-1">{type.count}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section: FOLDERS */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-stone-400 tracking-wider uppercase">
            <button
              onClick={() => setFoldersExpanded(!foldersExpanded)}
              className="flex items-center space-x-1 hover:text-stone-600 transition-colors"
            >
              {foldersExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Folders</span>
            </button>
            <button
              id="btn-add-folder-section"
              title="Add Project Folder"
              onClick={() => {
                setIsCreatingFolder(true);
                setNewFolderName('');
                setFoldersExpanded(true);
                setProjectsFolderOpen(true);
              }}
              className="p-0.5 rounded hover:bg-stone-200 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {foldersExpanded && (
            <div className="mt-0.5 space-y-0.5">
              {/* Projects Tree Folder */}
              <div>
                <div className="flex items-center justify-between px-2.5 py-1.2 rounded-md hover:bg-stone-200/50 group/proj">
                  <button
                    onClick={() => {
                      setProjectsFolderOpen(!projectsFolderOpen);
                      onSelectView('Projects');
                    }}
                    className={`flex items-center space-x-1.5 flex-1 text-left cursor-pointer ${
                      activeView === 'Projects' ? 'text-[#2563eb] font-semibold' : 'text-stone-700 font-medium'
                    }`}
                  >
                    {projectsFolderOpen ? (
                      <FolderOpen className="w-4 h-4 text-stone-600 shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-stone-600 shrink-0" />
                    )}
                    <span>Projects</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCreatingFolder(true);
                        setNewFolderName('');
                        setProjectsFolderOpen(true);
                      }}
                      title="New Project Folder"
                      className="p-0.5 rounded hover:bg-stone-300/70 text-stone-400 hover:text-stone-700 transition-colors opacity-0 group-hover/proj:opacity-100 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-stone-400 font-mono">
                      {notes.filter((n) => n.folder === 'Projects' || n.tags?.includes('Projects')).length}
                    </span>
                  </div>
                </div>

                {projectsFolderOpen && (
                  <div className="ml-5 pl-1.5 border-l border-stone-200 space-y-0.5 mt-0.5">
                    {/* Inline Create Folder */}
                    {isCreatingFolder && (
                      <div className="flex items-center space-x-1 bg-white border border-blue-400 rounded px-1.5 py-0.5 shadow-2xs my-1">
                        <Folder className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const trimmed = newFolderName.trim();
                              if (trimmed && onCreateFolder) {
                                onCreateFolder(trimmed);
                              }
                              setIsCreatingFolder(false);
                              setNewFolderName('');
                            } else if (e.key === 'Escape') {
                              setIsCreatingFolder(false);
                              setNewFolderName('');
                            }
                          }}
                          autoFocus
                          placeholder="Folder name..."
                          className="w-full bg-transparent text-xs text-stone-900 outline-none"
                        />
                        <button
                          onClick={() => {
                            const trimmed = newFolderName.trim();
                            if (trimmed && onCreateFolder) {
                              onCreateFolder(trimmed);
                            }
                            setIsCreatingFolder(false);
                            setNewFolderName('');
                          }}
                          title="Save"
                          className="p-0.5 hover:text-emerald-600 text-stone-500 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingFolder(false);
                            setNewFolderName('');
                          }}
                          title="Cancel"
                          className="p-0.5 hover:text-red-500 text-stone-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {dynamicFolders.map((folder) => (
                      <div
                        key={folder.name}
                        className={`group relative w-full flex items-center justify-between px-2 py-1 rounded transition-colors text-xs ${
                          activeView === folder.name
                            ? 'bg-[#3b82f6]/10 text-[#2563eb] font-medium'
                            : 'text-stone-600 hover:bg-stone-200/50'
                        }`}
                      >
                        {editingFolder === folder.name ? (
                          <div className="flex items-center space-x-1 w-full bg-white border border-blue-400 rounded px-1 py-0.5 shadow-2xs">
                            <Folder className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                            <input
                              type="text"
                              value={renameInput}
                              onChange={(e) => setRenameInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const trimmed = renameInput.trim();
                                  if (trimmed && trimmed !== folder.name && onRenameFolder) {
                                    onRenameFolder(folder.name, trimmed);
                                  }
                                  setEditingFolder(null);
                                } else if (e.key === 'Escape') {
                                  setEditingFolder(null);
                                }
                              }}
                              autoFocus
                              className="w-full bg-transparent text-xs text-stone-900 outline-none font-normal"
                            />
                            <button
                              onClick={() => {
                                const trimmed = renameInput.trim();
                                if (trimmed && trimmed !== folder.name && onRenameFolder) {
                                  onRenameFolder(folder.name, trimmed);
                                }
                                setEditingFolder(null);
                              }}
                              title="Save rename"
                              className="p-0.5 hover:text-emerald-600 text-stone-500 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setEditingFolder(null)}
                              title="Cancel"
                              className="p-0.5 hover:text-red-500 text-stone-400 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => onSelectView(folder.name)}
                              className="flex items-center space-x-2 truncate flex-1 text-left cursor-pointer"
                            >
                              <Folder className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </button>

                            {/* Hover Actions: Rename & Delete */}
                            <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFolder(folder.name);
                                  setRenameInput(folder.name);
                                }}
                                title={`Rename ${folder.name}`}
                                className="p-0.5 rounded hover:bg-stone-300/70 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingFolder(folder.name);
                                }}
                                title={`Delete ${folder.name}`}
                                className="p-0.5 rounded hover:bg-red-100 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {folder.count > 0 && (
                              <span className="group-hover:hidden text-[11px] text-stone-400 font-mono ml-1">
                                {folder.count}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Folder Confirmation Dialog */}
      {deletingFolder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 p-5 max-w-sm w-full animate-in fade-in zoom-in-95">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Delete &ldquo;{deletingFolder}&rdquo;?
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Are you sure you want to delete this folder? Any notes currently inside will be moved to &ldquo;Projects&rdquo;.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeletingFolder(null)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteFolder && deletingFolder) {
                    onDeleteFolder(deletingFolder);
                  }
                  setDeletingFolder(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
              >
                Delete Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vault Footer Info */}
      <div className="p-2.5 border-t border-[#E8E8E6] dark:border-[#2e2e2a] bg-[#F5F5F3] dark:bg-[#181816] flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 px-3 transition-colors">
        <div className="flex items-center space-x-1.5">
          {onOpenStorageSettings ? (
            <button
              id="vault-footer-storage-btn"
              type="button"
              onClick={onOpenStorageSettings}
              className="flex items-center space-x-1.5 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
              title="Storage & Google Drive Settings"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Google Drive</span>
            </button>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span className="font-medium text-stone-700 dark:text-stone-300">Fiat Journal</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Admin
            </button>
          )}
          <span className="font-mono text-[10px] text-stone-400 dark:text-stone-500">{notes.length} notes</span>
        </div>
      </div>
    </aside>
  );
};
