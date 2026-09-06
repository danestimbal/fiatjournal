import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Star,
  CheckCircle2,
  MoreHorizontal,
  Columns,
  Eye,
  Edit3,
  Bold,
  Italic,
  Highlighter,
  ListTodo,
  List,
  Heading1,
  Heading2,
  Code,
  Quote,
  Table,
  CloudCheck,
  Folder,
  Tag,
  Copy,
  Check,
  Plus,
  ChevronLeft,
  Mic,
  MicOff,
  AlertCircle,
  X,
  Pin,
  Share2,
  Globe,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Download,
  FileCode,
  Printer,
  Archive,
  ChevronDown,
} from 'lucide-react';
import { ReflectionSession, UserProfile, Collaborator } from '../types';
import { ShareNoteModal } from './ShareNoteModal';
import { LiveMarkdownEditor } from './LiveMarkdownEditor';
import {
  exportNoteAsMarkdown,
  exportNoteAsHtml,
  exportNoteAsPdf,
  exportVaultAsZip,
} from '../lib/exportUtils';
import { canAccessRichExports } from '../lib/tierLimits';

interface NoteEditorPaneProps {
  note: ReflectionSession;
  allNotes?: ReflectionSession[];
  currentUser?: UserProfile | null;
  isSaving: boolean;
  onUpdateNote: (updated: Partial<ReflectionSession>) => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onOpenUpgrade?: () => void;
  onBackToList?: () => void;
}

// Helper to strip redundant leading title heading from markdown body
function cleanLeadingDuplicateHeading(text: string, currentTitle: string): string {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.toLowerCase() === '# untitled note' || trimmed.toLowerCase() === '## untitled note') {
    return '';
  }
  if (currentTitle && (trimmed.toLowerCase() === `# ${currentTitle.trim().toLowerCase()}` || trimmed.toLowerCase() === `## ${currentTitle.trim().toLowerCase()}`)) {
    return '';
  }
  // Strip redundant "# Untitled Note" (case-insensitive)
  const untitledRegex = /^#+\s+untitled\s+note\s*(\r?\n)+/i;
  if (untitledRegex.test(text)) {
    return text.replace(untitledRegex, '');
  }
  // Strip leading "# <currentTitle>" if it duplicates the note title
  if (currentTitle && currentTitle.trim() && currentTitle.trim().toLowerCase() !== 'untitled note') {
    const escaped = currentTitle.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const titleRegex = new RegExp(`^#+\\s+${escaped}\\s*(\\r?\\n)+`, 'i');
    if (titleRegex.test(text)) {
      return text.replace(titleRegex, '');
    }
  }
  return text;
}

export const NoteEditorPane: React.FC<NoteEditorPaneProps> = ({
  note,
  allNotes = [],
  currentUser,
  isSaving,
  onUpdateNote,
  onToggleCopilot,
  isCopilotOpen,
  onOpenUpgrade,
  onBackToList,
}) => {
  // Editor view modes: 'interactive' (Live Visual Markdown with inline editing), 'raw' (raw markdown textarea), 'preview' (read-only render)
  const [editorMode, setEditorMode] = useState<'interactive' | 'raw' | 'preview'>('interactive');
  const isEditing = editorMode === 'raw';
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Format subtle timestamp for last saved sync
  const formatLastSaved = (timestamp?: number) => {
    if (!timestamp) return 'just now';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  };

  // Sync state if note changes
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const [isEditingFolder, setIsEditingFolder] = useState(false);
  const [folderInput, setFolderInput] = useState(note.folder || 'Inbox');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Web Speech API Dictation State
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Insert Image Modal State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageAltInput, setImageAltInput] = useState('');
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [viewingFullImage, setViewingFullImage] = useState<{ url: string; alt: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle toggling task checkboxes when rendered in Preview mode
  const handleTogglePreviewTask = (taskIndex: number) => {
    let count = 0;
    const updated = content.replace(/([-*]\s*\[)([ xX])(\])/g, (match, prefix, check, suffix) => {
      if (count === taskIndex) {
        count++;
        const nextMark = check.trim() ? ' ' : 'x';
        return `${prefix}${nextMark}${suffix}`;
      }
      count++;
      return match;
    });
    if (updated !== content) {
      setContent(updated);
      onUpdateNote({ content: updated, updatedAt: Date.now() });
    }
  };

  // Insert dictated speech into editor at cursor or at the end
  const insertDictatedText = useCallback((text: string) => {
    if (!text || !text.trim()) return;
    setContent((prev) => {
      let next = prev;
      const textarea = textareaRef.current;
      if (textarea && document.activeElement === textarea) {
        const start = textarea.selectionStart ?? next.length;
        const end = textarea.selectionEnd ?? next.length;
        const before = next.slice(0, start);
        const after = next.slice(end);
        const needsSpace = before.length > 0 && !/\s$/.test(before);
        const formatted = (needsSpace ? ' ' : '') + text.trim();
        next = before + formatted + after;
        const newPos = start + formatted.length;
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newPos, newPos);
          }
        }, 10);
      } else {
        const needsSpace = next.length > 0 && !/\s$/.test(next);
        next = next + (needsSpace ? ' ' : '') + text.trim();
      }
      onUpdateNote({ content: next, updatedAt: Date.now() });
      return next;
    });
  }, [onUpdateNote]);

  const stopDictation = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const startDictation = useCallback(() => {
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.'
      );
      return;
    }

    setSpeechError(null);
    // Ensure raw editing mode is on so dictated words appear immediately in the textarea
    setEditorMode('raw');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);
        if (finalChunk) {
          insertDictatedText(finalChunk);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError(
            'Microphone access was denied. Please allow microphone permissions in your browser.'
          );
          stopDictation();
        } else if (event.error === 'no-speech') {
          setInterimTranscript('');
        } else if (event.error !== 'aborted') {
          setSpeechError(`Speech recognition: ${event.error}`);
          stopDictation();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setSpeechError(err?.message || 'Failed to start speech recognition.');
      setIsListening(false);
    }
  }, [insertDictatedText, stopDictation]);

  const toggleDictation = useCallback(() => {
    if (isListening) {
      stopDictation();
    } else {
      startDictation();
    }
  }, [isListening, startDictation, stopDictation]);

  // Clean up speech recognition on note change or unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [note.id]);

  // Track current note ID to guard auto-save across note switches
  const currentNoteIdRef = useRef(note.id);

  useEffect(() => {
    currentNoteIdRef.current = note.id;
    setTitle(note.title);
    const cleaned = cleanLeadingDuplicateHeading(note.content, note.title);
    setContent(cleaned);
    setFolderInput(note.folder || 'Inbox');
  }, [note.id, note.folder]);

  // Debounced auto-save when user edits title or content
  useEffect(() => {
    // Only auto-save if we are still editing the same note
    if (currentNoteIdRef.current !== note.id) return;

    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onUpdateNote({ title, content, updatedAt: Date.now() });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [title, content, note.id, note.title, note.content, onUpdateNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    // If markdown content still has an outdated leading "# Untitled Note" heading, clean it
    const cleaned = cleanLeadingDuplicateHeading(content, newTitle);
    if (cleaned !== content) {
      setContent(cleaned);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // Memoized content for preview to guarantee no duplicate heading renders
  const displayContent = useMemo(() => {
    return cleanLeadingDuplicateHeading(content, title);
  }, [content, title]);

  // Insert markdown helper at cursor
  const insertFormatting = (prefix: string, suffix: string = '', defaultPlaceholder: string = '') => {
    if (!textareaRef.current || editorMode !== 'raw') {
      const addition = `\n\n${prefix}${defaultPlaceholder}${suffix}`;
      const updated = `${content.trim()}${addition}`;
      setContent(updated);
      onUpdateNote({ content: updated, updatedAt: Date.now() });
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || defaultPlaceholder;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent = content.slice(0, start) + replacement + content.slice(end);
    setContent(newContent);
    onUpdateNote({ content: newContent, updatedAt: Date.now() });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  const handleCopyMarkdown = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Insert image markdown tag into document
  const handleInsertImage = (url: string, altText: string = '') => {
    if (!url || !url.trim()) return;
    const cleanUrl = url.trim();
    const cleanAlt = altText.trim() || 'Image';
    const markdownImage = `\n![${cleanAlt}](${cleanUrl})\n`;

    setContent((prev) => {
      let next = prev;
      const textarea = textareaRef.current;
      if (textarea && editorMode === 'raw') {
        const start = textarea.selectionStart ?? next.length;
        const end = textarea.selectionEnd ?? next.length;
        next = next.slice(0, start) + markdownImage + next.slice(end);
      } else {
        next = `${next.trim()}\n${markdownImage}`;
      }
      onUpdateNote({ content: next, updatedAt: Date.now() });
      return next;
    });

    setIsImageModalOpen(false);
    setImageUrlInput('');
    setImageAltInput('');
    setImageUploadError(null);
  };

  // Handle local file upload and convert to base64 DataURL (with compression)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setImageUploadError('Please select a valid image file (PNG, JPG, WebP, GIF, SVG).');
      return;
    }

    // Limit to 4MB
    if (file.size > 4 * 1024 * 1024) {
      setImageUploadError('Image size should be under 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const altFromFileName = file.name.replace(/\.[^/.]+$/, '');
        handleInsertImage(result, altFromFileName);
      }
    };
    reader.onerror = () => {
      setImageUploadError('Failed to read selected image.');
    };
    reader.readAsDataURL(file);
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  // Toggle checkbox directly in markdown text
  const handleToggleTask = (taskText: string) => {
    const lines = content.split('\n');
    const newLines = lines.map((line) => {
      if (line.includes(taskText)) {
        if (line.includes('- [ ]')) {
          return line.replace('- [ ]', '- [x]');
        } else if (line.includes('- [x]')) {
          return line.replace('- [x]', '- [ ]');
        }
      }
      return line;
    });
    const updated = newLines.join('\n');
    setContent(updated);
    onUpdateNote({ content: updated, updatedAt: Date.now() });
  };

  // Transform highlight syntax `==text==` for rendering
  const preprocessMarkdown = (raw: string) => {
    // Replace ==highlight== with a custom marker token that we can render cleanly
    return raw.replace(/==([^=\n]+)==/g, '<mark class="journal-highlight">$1</mark>');
  };

  // Generate clean slug for breadcrumb
  const noteSlug = note.title
    ? note.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    : 'untitled';

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <main
      id="note-editor-pane"
      className="flex-1 h-full flex flex-col bg-white dark:bg-[#181816] min-w-0 font-sans overflow-hidden transition-colors"
    >
      {/* Top Header Bar with Breadcrumb and Actions */}
      <div className="h-10 px-3 sm:px-4 flex items-center justify-between border-b border-[#E8E8E6] dark:border-[#2e2e2a] select-none shrink-0 bg-white dark:bg-[#181816] transition-colors">
        {/* Breadcrumbs & Mobile Back */}
        <div className="flex items-center space-x-1 text-xs text-stone-500 dark:text-stone-400 truncate max-w-[55%]">
          {onBackToList && (
            <button
              id="btn-mobile-back-to-notes"
              onClick={onBackToList}
              className="md:hidden flex items-center space-x-0.5 -ml-1 mr-1 px-1.5 py-1 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium cursor-pointer"
              title="Back to notes list"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Notes</span>
            </button>
          )}
          <span className="hidden sm:inline text-stone-400 dark:text-stone-500">Note</span>
          <span className="hidden sm:inline text-stone-300 dark:text-stone-600">&rsaquo;</span>
          <span className="font-mono text-stone-700 dark:text-stone-300 truncate max-w-[160px] sm:max-w-[200px]" title={note.title}>
            {noteSlug}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Cloud Sync Status Indicator */}
          <div
            id="sync-status-indicator"
            className="hidden md:flex items-center space-x-1.5 px-2 py-0.5 text-[11px] text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-900/70 border border-stone-200/60 dark:border-stone-800/60 rounded-md transition-all select-none"
            title={`Last synced to Firestore: ${new Date(note.lastSyncedAt || note.updatedAt).toLocaleString()}`}
          >
            {isSaving ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Synced</span>
              </span>
            )}
          </div>

          {/* Note Pinning */}
          <button
            id="btn-toggle-pin"
            onClick={() => onUpdateNote({ isPinned: !note.isPinned, updatedAt: Date.now() })}
            title={note.isPinned ? 'Unpin note from top of list' : 'Pin note to top of list'}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              note.isPinned
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-900/60 shadow-2xs'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Pin
              className={`w-4 h-4 transition-transform ${
                note.isPinned ? 'fill-blue-500 dark:fill-blue-400 -rotate-45 scale-105' : ''
              }`}
            />
          </button>

          {/* Star / Favorite */}
          <button
            id="btn-toggle-star"
            onClick={() => onUpdateNote({ isFavorite: !note.isFavorite, updatedAt: Date.now() })}
            title={note.isFavorite ? 'Unstar note' : 'Star note'}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              note.isFavorite
                ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Star className={`w-4 h-4 ${note.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Note Sharing */}
          <button
            id="btn-share-note"
            onClick={() => setIsShareModalOpen(true)}
            title={
              note.isShared || (note.sharedWith && note.sharedWith.length > 0) || note.isPublic
                ? `Shared note (${note.sharedWith?.length || 0} collaborators) - Click to manage`
                : 'Share note with other users or via public link'
            }
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              note.isShared || (note.sharedWith && note.sharedWith.length > 0) || note.isPublic
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 shadow-2xs hover:bg-blue-100 dark:hover:bg-blue-900/60'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="hidden sm:inline">Share</span>
            {Boolean(note.sharedWith && note.sharedWith.length > 0) && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold ml-0.5">
                {note.sharedWith!.length}
              </span>
            )}
          </button>

          {/* Dictate Button (Web Speech API) */}
          <button
            id="btn-dictate-note"
            onClick={toggleDictation}
            title={
              isListening
                ? 'Stop voice dictation'
                : 'Dictate note using voice (Web Speech API)'
            }
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 ring-2 ring-rose-300/60 shadow-2xs'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 animate-pulse shrink-0" />
                <span className="font-semibold text-rose-700 dark:text-rose-300">Listening...</span>
                <span className="relative flex h-1.5 w-1.5 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
                </span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-stone-600 dark:text-stone-400 shrink-0" />
                <span className="hidden sm:inline">Dictate</span>
              </>
            )}
          </button>

          {/* Three-Way Mode Selector: Interactive Live Markdown | Raw Markdown | Read Preview */}
          <div
            id="editor-mode-selector"
            className="flex items-center bg-stone-100 dark:bg-stone-850 p-0.5 rounded-lg text-xs font-medium border border-stone-200/80 dark:border-stone-800"
          >
            <button
              id="btn-mode-interactive"
              onClick={() => setEditorMode('interactive')}
              title="Interactive Live Markdown (visual inline editing & image cards)"
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                editorMode === 'interactive'
                  ? 'bg-white dark:bg-[#181816] text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Live Visual</span>
            </button>
            <button
              id="btn-mode-raw"
              onClick={() => setEditorMode('raw')}
              title="Raw Markdown Editor (full source textarea)"
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                editorMode === 'raw'
                  ? 'bg-white dark:bg-[#181816] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Raw</span>
            </button>
            <button
              id="btn-mode-preview"
              onClick={() => setEditorMode('preview')}
              title="Clean Read Preview"
              className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                editorMode === 'preview'
                  ? 'bg-white dark:bg-[#181816] text-stone-900 dark:text-stone-100 shadow-2xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Copy Markdown */}
          <button
            id="btn-copy-note-markdown"
            onClick={handleCopyMarkdown}
            title="Copy Raw Markdown"
            className="p-1.5 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export Formats Dropdown */}
          <div className="relative">
            <button
              id="btn-export-dropdown"
              onClick={() => {
                setExportMenuOpen(!exportMenuOpen);
                setMenuOpen(false);
              }}
              title="Export note in Markdown, HTML, or PDF"
              className="flex items-center space-x-1 px-2 py-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-medium">Export</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {exportMenuOpen && (
              <div className="absolute right-0 mt-1 w-60 bg-white dark:bg-[#1c1c1a] rounded-xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 text-xs text-stone-700 dark:text-stone-200 z-30 transition-colors animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1 text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                  Export Formats
                </div>

                {/* Raw Markdown */}
                <button
                  id="btn-export-markdown"
                  onClick={() => {
                    exportNoteAsMarkdown(note);
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-850 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <FileCode className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">Raw Markdown (.md)</div>
                      <div className="text-[10px] text-stone-400">Open portable markdown</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">Free</span>
                </button>

                {/* Formatted HTML */}
                <button
                  id="btn-export-html"
                  onClick={() => {
                    if (canAccessRichExports(currentUser?.subscriptionTier)) {
                      exportNoteAsHtml(note);
                    } else {
                      onOpenUpgrade?.();
                    }
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-850 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">Styled HTML (.html)</div>
                      <div className="text-[10px] text-stone-400">Self-contained reader page</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Pro</span>
                </button>

                {/* Printable PDF */}
                <button
                  id="btn-export-pdf"
                  onClick={() => {
                    if (canAccessRichExports(currentUser?.subscriptionTier)) {
                      exportNoteAsPdf(note);
                    } else {
                      onOpenUpgrade?.();
                    }
                    setExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-850 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Printer className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <div className="font-medium text-stone-800 dark:text-stone-200">Printable PDF (.pdf)</div>
                      <div className="text-[10px] text-stone-400">Clean paginated document</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">Pro</span>
                </button>

                {/* Complete Vault .ZIP */}
                {allNotes && allNotes.length > 0 && (
                  <button
                    id="btn-export-vault-zip"
                    disabled={isExportingZip}
                    onClick={async () => {
                      if (canAccessRichExports(currentUser?.subscriptionTier)) {
                        setIsExportingZip(true);
                        try {
                          await exportVaultAsZip(allNotes);
                        } finally {
                          setIsExportingZip(false);
                        }
                      } else {
                        onOpenUpgrade?.();
                      }
                      setExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-stone-850 cursor-pointer flex items-center justify-between border-t border-stone-100 dark:border-stone-800 transition-colors"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Archive className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <div className="font-medium text-stone-800 dark:text-stone-200">
                          {isExportingZip ? 'Compressing...' : 'Complete Vault (.zip)'}
                        </div>
                        <div className="text-[10px] text-stone-400">{allNotes.length} notes in folders</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">Team</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="More options"
              className="p-1.5 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-stone-900 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 py-1 text-xs text-stone-700 dark:text-stone-200 z-30 transition-colors">
                <button
                  onClick={() => {
                    insertFormatting('# ', '', 'New Section');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Insert Heading
                </button>
                <button
                  onClick={() => {
                    insertFormatting('- [ ] ', '', 'New Task');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Insert Task Checklist
                </button>
                <button
                  onClick={() => {
                    insertFormatting('| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |', '');
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                >
                  Insert Table
                </button>
                <button
                  onClick={() => {
                    setImageUploadError(null);
                    setIsImageModalOpen(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer flex items-center justify-between"
                >
                  <span>Insert Image</span>
                  <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                </button>
              </div>
            )}
          </div>

          {/* Toggle Co-pilot Right Pane */}
          <button
            id="btn-toggle-copilot-pane"
            onClick={onToggleCopilot}
            title={isCopilotOpen ? 'Collapse AI Co-pilot Pane' : 'Open AI Co-pilot Pane'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isCopilotOpen
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60'
                : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Columns className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting Toolbar (shown in Interactive and Raw modes) */}
      {editorMode !== 'preview' && (
        <div className="px-4 py-1.5 border-b border-stone-100 dark:border-[#2e2e2a] bg-[#FAFAFA] dark:bg-[#1c1c1a] flex items-center space-x-1 text-stone-600 dark:text-stone-300 overflow-x-auto select-none transition-colors">
          <button
            onClick={() => insertFormatting('# ', '')}
            title="Heading 1"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('## ', '')}
            title="Heading 2"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />
          <button
            onClick={() => insertFormatting('**', '**', 'bold text')}
            title="Bold"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('*', '*', 'italic text')}
            title="Italic"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('==', '==', 'highlighted text')}
            title="Highlight (==text==)"
            className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-950/60 text-amber-700 dark:text-amber-400 transition-colors cursor-pointer"
          >
            <Highlighter className="w-4 h-4" />
          </button>
          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />
          <button
            onClick={() => insertFormatting('- [ ] ', '', 'Task item')}
            title="Checklist task"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <ListTodo className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('- ', '', 'Bullet item')}
            title="Bullet list"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('> ', '', 'Quoted thought')}
            title="Quote"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => insertFormatting('```\n', '\n```', 'code block')}
            title="Code Block"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              insertFormatting(
                '\n| Column 1 | Column 2 |\n| :--- | :--- |\n| Item 1 | Detail 1 |\n'
              )
            }
            title="Table"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <Table className="w-4 h-4" />
          </button>
          <button
            id="btn-format-insert-image"
            onClick={() => {
              setImageUploadError(null);
              setIsImageModalOpen(true);
            }}
            title="Insert Image (URL or Upload)"
            className="p-1 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer flex items-center space-x-1"
          >
            <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
          <span className="w-px h-4 bg-stone-300 dark:bg-stone-700 mx-1" />
          <button
            id="btn-format-dictate"
            onClick={toggleDictation}
            title={isListening ? 'Stop voice dictation' : 'Voice Dictate (Web Speech API)'}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
              isListening
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 animate-pulse ring-1 ring-rose-300 dark:ring-rose-800 font-medium'
                : 'hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-[11px]">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                <span className="text-[11px]">Dictate</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Main Document Content Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-8 md:px-12 py-3 sm:py-6 md:py-8 scrollbar-thin">
        <div className="max-w-3xl mx-auto">
          {/* Speech Dictation Error Alert */}
          {speechError && (
            <div
              id="banner-speech-error"
              className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 shadow-2xs animate-in fade-in"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                onClick={() => setSpeechError(null)}
                className="text-amber-600 hover:text-amber-800 p-0.5 cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Voice Dictation Banner */}
          {isListening && (
            <div
              id="banner-speech-listening"
              className="mb-4 p-3 bg-rose-50/90 border border-rose-200 rounded-xl flex items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs animate-in fade-in slide-in-from-top-1"
            >
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
                <span className="font-semibold text-rose-800 shrink-0">Voice Dictating:</span>
                <p className="italic text-stone-600 truncate text-[12px]">
                  {interimTranscript ? `“${interimTranscript}”` : 'Speak into your microphone to dictate markdown...'}
                </p>
              </div>
              <button
                id="btn-stop-dictation-banner"
                onClick={stopDictation}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-medium shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center space-x-1"
              >
                <MicOff className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          )}
          {/* Note Title Input */}
          <div className="mb-3 sm:mb-5">
            <input
              id="note-title-input"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Untitled Note..."
              className="w-full text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight outline-hidden placeholder:text-stone-300 dark:placeholder:text-stone-600 bg-transparent border-b border-transparent focus:border-stone-200 dark:focus:border-stone-700 pb-1 font-sans transition-colors"
            />

            {/* Folder / Tags metadata */}
            <div className="mt-2 flex items-center flex-wrap gap-2 text-xs text-stone-500 dark:text-stone-400">
              {/* Folder Selector */}
              {isEditingFolder ? (
                <div className="inline-flex items-center space-x-1 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-1.5 py-0.5 shadow-2xs">
                  <Folder className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <input
                    type="text"
                    value={folderInput}
                    onChange={(e) => setFolderInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const trimmed = folderInput.trim() || 'Inbox';
                        onUpdateNote({ folder: trimmed, updatedAt: Date.now() });
                        setIsEditingFolder(false);
                      } else if (e.key === 'Escape') {
                        setFolderInput(note.folder || 'Inbox');
                        setIsEditingFolder(false);
                      }
                    }}
                    onBlur={() => {
                      const trimmed = folderInput.trim() || 'Inbox';
                      onUpdateNote({ folder: trimmed, updatedAt: Date.now() });
                      setIsEditingFolder(false);
                    }}
                    autoFocus
                    className="text-xs text-stone-800 dark:text-stone-200 bg-transparent outline-hidden w-24"
                    placeholder="Folder..."
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingFolder(true)}
                  title="Click to edit Folder (synced with Firestore)"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200/70 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                  <span>{note.folder || 'Inbox'}</span>
                </button>
              )}

              {/* Tags */}
              <div className="flex items-center flex-wrap gap-1">
                {note.tags &&
                  note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => {
                          const updatedTags = (note.tags || []).filter((t) => t !== tag);
                          onUpdateNote({ tags: updatedTags, updatedAt: Date.now() });
                        }}
                        title={`Remove #${tag}`}
                        className="hover:text-red-500 transition-colors ml-0.5 cursor-pointer"
                      >
                        &times;
                      </button>
                    </span>
                  ))}

                {isAddingTag ? (
                  <div className="inline-flex items-center bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded px-1.5 py-0.5 shadow-2xs">
                    <span className="text-stone-400 dark:text-stone-500 text-[11px]">#</span>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const trimmed = tagInput.trim().replace(/^#/, '');
                          if (trimmed && !(note.tags || []).includes(trimmed)) {
                            onUpdateNote({
                              tags: [...(note.tags || []), trimmed],
                              updatedAt: Date.now(),
                            });
                          }
                          setTagInput('');
                          setIsAddingTag(false);
                        } else if (e.key === 'Escape') {
                          setTagInput('');
                          setIsAddingTag(false);
                        }
                      }}
                      onBlur={() => {
                        const trimmed = tagInput.trim().replace(/^#/, '');
                        if (trimmed && !(note.tags || []).includes(trimmed)) {
                          onUpdateNote({
                            tags: [...(note.tags || []), trimmed],
                            updatedAt: Date.now(),
                          });
                        }
                        setTagInput('');
                        setIsAddingTag(false);
                      }}
                      autoFocus
                      placeholder="new-tag"
                      className="text-[11px] text-stone-800 dark:text-stone-200 bg-transparent outline-hidden w-16"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    title="Add tag (synced with Firestore)"
                    className="inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded border border-dashed border-stone-300 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-400 dark:hover:border-stone-500 text-[11px] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tag</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Editor Body: Interactive Live Visual Markdown vs Raw Textarea vs Clean Read Preview */}
          {editorMode === 'interactive' ? (
            <div id="note-interactive-mode-container" className="pt-0.5">
              <LiveMarkdownEditor
                content={content}
                onChange={(newContent) => {
                  setContent(newContent);
                  onUpdateNote({ content: newContent, updatedAt: Date.now() });
                }}
                onOpenImageModal={() => {
                  setImageUploadError(null);
                  setIsImageModalOpen(true);
                }}
              />
            </div>
          ) : editorMode === 'raw' ? (
            <textarea
              id="note-markdown-textarea"
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing in Markdown (headings with #, tasks with - [ ], highlights with ==text==)..."
              className="w-full h-[65vh] font-mono text-sm leading-relaxed text-stone-800 dark:text-stone-200 bg-transparent resize-none outline-hidden p-0 placeholder:text-stone-300 dark:placeholder:text-stone-600"
              autoFocus
            />
          ) : (
            <div
              id="note-markdown-preview"
              onDoubleClick={() => setEditorMode('interactive')}
              title="Double-click to edit directly"
              className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 leading-relaxed font-sans cursor-text pt-0.5"
            >
              {(() => {
                let previewTaskCounter = 0;
                return (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 tracking-tight mt-6 mb-4">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-6 mb-3 border-b border-stone-100 dark:border-stone-800 pb-1">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-stone-900 dark:text-stone-200 mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => {
                        return <p className="mb-4 text-[15px] leading-relaxed">{children}</p>;
                      },
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 mb-4 space-y-1 text-[14px]">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 mb-4 space-y-1 text-[14px]">{children}</ol>
                      ),
                      li: ({ children }) => {
                        return <li className="leading-relaxed">{children}</li>;
                      },
                      input: ({ checked, disabled, ...props }) => {
                        const taskIdx = previewTaskCounter++;
                        return (
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={false}
                            onChange={() => handleTogglePreviewTask(taskIdx)}
                            className="mr-2 rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 align-middle"
                            {...props}
                          />
                        );
                      },
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-stone-300 dark:border-stone-700 pl-4 italic text-stone-600 dark:text-stone-400 my-4">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6 border border-stone-200 dark:border-stone-800 rounded-lg shadow-2xs">
                          <table className="w-full text-left text-xs border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-[#F8F8F7] dark:bg-[#20201e] border-b border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold uppercase tracking-wider text-[11px]">
                          {children}
                        </thead>
                      ),
                      tbody: ({ children }) => (
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">{children}</tbody>
                      ),
                      th: ({ children }) => <th className="p-2.5 font-semibold">{children}</th>,
                      td: ({ children }) => <td className="p-2.5 text-stone-700 dark:text-stone-300">{children}</td>,
                      code: ({ children }) => (
                        <code className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-stone-900 dark:bg-stone-950 text-stone-100 p-4 rounded-lg overflow-x-auto text-xs font-mono my-4 border border-stone-800">
                          {children}
                        </pre>
                      ),
                      img: ({ src, alt, ...props }) => (
                        <span className="block my-4">
                          <img
                            src={src}
                            alt={alt || 'Journal image'}
                            className="max-w-full h-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs object-contain cursor-pointer hover:opacity-95 transition-opacity"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            onClick={() =>
                              src &&
                              setViewingFullImage({
                                url: src,
                                alt: alt || 'Journal image',
                              })
                            }
                            {...props}
                          />
                          {alt && (
                            <span className="block text-center text-xs text-stone-400 dark:text-stone-500 mt-1.5 italic">
                              {alt}
                            </span>
                          )}
                        </span>
                      ),
                    }}
                  >
                    {/* Apply highlight formatting support before markdown rendering */}
                    {displayContent.replace(
                      /==([^=\n]+)==/g,
                      '**$1**' // renders with strong emphasis in markdown preview
                    )}
                  </ReactMarkdown>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      <div className="h-7 px-4 border-t border-[#E8E8E6] dark:border-[#2e2e2a] bg-[#FAFAFA] dark:bg-[#181816] flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 select-none shrink-0 transition-colors">
        <div className="flex items-center space-x-3">
          <span>{wordCount} words</span>
          <span>&bull;</span>
          <span>{charCount} characters</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="hidden sm:inline text-stone-500 dark:text-stone-400">
            Last saved at {formatLastSaved(note.lastSyncedAt || note.updatedAt)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {note.isPinned && (
            <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
              <Pin className="w-3 h-3 fill-blue-500" />
              Pinned
            </span>
          )}
          {note.isPinned && <span>&bull;</span>}
          <span>Markdown UTF-8</span>
          <span>&bull;</span>
          <span>Journal Engine</span>
        </div>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Insert Image Modal */}
      {isImageModalOpen && (
        <div
          id="modal-insert-image-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            id="modal-insert-image"
            className="bg-white dark:bg-[#1C1C1A] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xl max-w-md w-full p-5 space-y-4 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Insert Image
                  </h3>
                  <p className="text-[11px] text-stone-400 dark:text-stone-500">
                    Upload from your device or paste a web URL
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {imageUploadError && (
              <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{imageUploadError}</span>
              </div>
            )}

            {/* Option 1: Upload from device */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Option 1: Upload from Device
              </label>
              <button
                type="button"
                id="btn-trigger-image-file-upload"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center py-5 px-4 border-2 border-dashed border-stone-200 dark:border-stone-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl bg-stone-50/50 dark:bg-stone-900/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-stone-600 dark:text-stone-300 text-xs transition-colors cursor-pointer group"
              >
                <Upload className="w-6 h-6 text-stone-400 group-hover:text-blue-500 mb-1 transition-colors" />
                <span className="font-medium text-stone-700 dark:text-stone-200">
                  Click to select an image
                </span>
                <span className="text-[11px] text-stone-400 mt-0.5">
                  PNG, JPG, WebP, GIF, SVG up to 4MB
                </span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-800" />
              </div>
              <span className="relative px-3 bg-white dark:bg-[#1C1C1A] text-[11px] text-stone-400 uppercase tracking-wider font-semibold">
                OR
              </span>
            </div>

            {/* Option 2: Image Web URL */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleInsertImage(imageUrlInput, imageAltInput);
              }}
              className="space-y-3"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center space-x-1">
                  <LinkIcon className="w-3 h-3 text-stone-400" />
                  <span>Option 2: Image Web Link</span>
                </label>
                <input
                  type="url"
                  id="input-image-web-url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-stone-500 dark:text-stone-400">
                  Alt text / Caption (optional)
                </label>
                <input
                  type="text"
                  id="input-image-alt-text"
                  value={imageAltInput}
                  onChange={(e) => setImageAltInput(e.target.value)}
                  placeholder="Morning sunset over the mountains"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!imageUrlInput.trim()}
                  id="btn-submit-image-url"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-2xs transition-colors cursor-pointer"
                >
                  Insert Image
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Note Modal */}
      <ShareNoteModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onOpenUpgrade={onOpenUpgrade}
        note={note}
        currentUser={currentUser || null}
        onUpdateShareSettings={async (settings) => {
          onUpdateNote({
            ...settings,
            updatedAt: Date.now(),
          });
        }}
      />

      {/* Full-Screen Image Lightbox Modal for Preview */}
      {viewingFullImage && (
        <div
          id="preview-image-lightbox-overlay"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingFullImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setViewingFullImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors cursor-pointer"
              title="Close image view"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingFullImage.url}
              alt={viewingFullImage.alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {viewingFullImage.alt && viewingFullImage.alt !== 'Journal image' && (
              <p className="text-stone-300 text-sm mt-3 font-medium text-center">
                {viewingFullImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
