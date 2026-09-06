import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  Copy,
  Check,
  Download,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  FileQuestion,
  Lock,
  Tag,
  Folder,
  Share2,
} from 'lucide-react';
import { ReflectionSession, UserProfile } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface PublicNoteReaderProps {
  note: ReflectionSession | null;
  loading: boolean;
  error: string | null;
  currentUser: UserProfile | null;
  onOpenVault: (noteId?: string) => void;
  onSignIn?: () => void | Promise<void>;
  onExitSharedView: () => void;
}

export const PublicNoteReader: React.FC<PublicNoteReaderProps> = ({
  note,
  loading,
  error,
  currentUser,
  onOpenVault,
  onSignIn,
  onExitSharedView,
}) => {
  const [copied, setCopied] = useState(false);

  // Copy raw markdown to clipboard
  const handleCopyMarkdown = async () => {
    if (!note) return;
    try {
      const fullText = `# ${note.title}\n\n${note.content}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  // Download markdown file
  const handleDownload = () => {
    if (!note) return;
    const fullText = `# ${note.title}\n\n${note.content}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (note.title || 'shared_note')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.download = `${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Word count and reading time
  const wordCount = note?.content
    ? note.content.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Recent';
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOwner = currentUser && note && currentUser.uid === note.userId;

  return (
    <div
      id="public-note-reader"
      className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#141413] text-stone-900 dark:text-stone-100 transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/60"
    >
      {/* Reader Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#181817]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-8 py-3 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={onExitSharedView}
              className="flex items-center space-x-1.5 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors text-xs font-medium cursor-pointer"
              title="Go to Fiat Journal"
            >
              <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center font-serif font-bold text-xs shadow-2xs">
                F
              </div>
              <span className="font-semibold tracking-tight hidden sm:inline text-sm">
                Fiat Journal
              </span>
            </button>

            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">/</span>

            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50 text-[11px] font-medium shrink-0">
              <Share2 className="w-3 h-3" />
              <span>Public Reader</span>
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />

            {note && (
              <>
                {/* Copy Markdown */}
                <button
                  id="btn-reader-copy-md"
                  onClick={handleCopyMarkdown}
                  title="Copy raw Markdown"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
                      <span className="hidden md:inline">Copy MD</span>
                    </>
                  )}
                </button>

                {/* Download Markdown */}
                <button
                  id="btn-reader-download-md"
                  onClick={handleDownload}
                  title="Download .md file"
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {/* Primary Action Button */}
            {isOwner ? (
              <button
                id="btn-reader-open-vault"
                onClick={() => onOpenVault(note?.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <span>Edit in Vault</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : currentUser ? (
              <button
                id="btn-reader-go-vault"
                onClick={() => onOpenVault()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <span>Open My Vault</span>
              </button>
            ) : onSignIn ? (
              <button
                id="btn-reader-sign-in"
                onClick={onSignIn}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                <span>Sign In</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* Reader Content Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 sm:px-10 py-10">
        {loading ? (
          /* Loading Skeleton State */
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
              Loading shared note from secure vault...
            </p>
          </div>
        ) : error || !note ? (
          /* Not Found or Private Error State */
          <div className="py-16 text-center max-w-md mx-auto space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500 flex items-center justify-center border border-stone-200 dark:border-stone-700 shadow-2xs">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Note Unavailable or Private
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {error ||
                  'This note could not be found. The link might be invalid, or public sharing has been disabled by the author.'}
              </p>
            </div>
            <button
              onClick={onExitSharedView}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go to Fiat Journal</span>
            </button>
          </div>
        ) : (
          /* Clean Document Reader */
          <article className="space-y-8 animate-in fade-in duration-200">
            {/* Note Metadata Header */}
            <div className="space-y-4 border-b border-stone-200/80 dark:border-stone-800 pb-6">
              {/* Folder and Tags Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {note.folder && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                    <Folder className="w-3 h-3 text-stone-400" />
                    <span>{note.folder}</span>
                  </span>
                )}
                {note.tags &&
                  note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      <span>#{tag}</span>
                    </span>
                  ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight leading-tight">
                {note.title || 'Untitled Note'}
              </h1>

              {/* Meta details: Author, Date, Reading Stats */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-400 dark:text-stone-400 font-sans">
                {note.authorEmail && (
                  <div className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span>Shared by {note.authorEmail}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Updated {formatDate(note.updatedAt || note.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {readTimeMin} min read &bull; {wordCount} words
                  </span>
                </div>
              </div>
            </div>

            {/* Markdown Content Presentation */}
            <div
              id="public-note-content"
              className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 leading-relaxed font-sans"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 tracking-tight mt-8 mb-4">
                      {children}
                    </h2>
                  ),
                  h2: ({ children }) => (
                    <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-7 mb-3 border-b border-stone-100 dark:border-stone-800 pb-1.5">
                      {children}
                    </h3>
                  ),
                  h3: ({ children }) => (
                    <h4 className="text-base font-semibold text-stone-900 dark:text-stone-200 mt-5 mb-2">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 text-[15px] sm:text-[16px] leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-4 space-y-1 text-[15px]">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-4 space-y-1 text-[15px]">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500/80 dark:border-blue-500/60 pl-4 py-1 italic text-stone-600 dark:text-stone-400 my-5 bg-stone-50/50 dark:bg-stone-900/30 rounded-r-md">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6 border border-stone-200 dark:border-stone-800 rounded-lg shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-stone-100 dark:bg-stone-800 px-3 py-2 border-b border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 border-b border-stone-100 dark:border-stone-800/60 text-stone-600 dark:text-stone-300">
                      {children}
                    </td>
                  ),
                  code: ({ inline, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-[13px]"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="p-4 rounded-xl bg-stone-900 text-stone-100 overflow-x-auto font-mono text-xs my-5 shadow-2xs">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                  input: ({ checked, ...props }) => (
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled
                      className="mr-2 rounded border-stone-300 dark:border-stone-600 text-blue-600 w-4 h-4 align-middle"
                      {...props}
                    />
                  ),
                  img: ({ src, alt, ...props }) => (
                    <span className="block my-5">
                      <img
                        src={src}
                        alt={alt || 'Shared note illustration'}
                        className="max-w-full h-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs object-contain"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        {...props}
                      />
                      {alt && (
                        <span className="block text-center text-xs text-stone-400 dark:text-stone-500 mt-2 italic">
                          {alt}
                        </span>
                      )}
                    </span>
                  ),
                }}
              >
                {note.content}
              </ReactMarkdown>
            </div>

            {/* Reader Footer Attribution */}
            <div className="pt-12 mt-12 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400 dark:text-stone-400">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Fiat Journal Public Reader &bull; Encrypted Vault Sync</span>
              </div>
              <button
                onClick={onExitSharedView}
                className="hover:text-stone-900 dark:hover:text-stone-100 underline underline-offset-4 cursor-pointer"
              >
                Create your own Markdown vault &rarr;
              </button>
            </div>
          </article>
        )}
      </main>
    </div>
  );
};
