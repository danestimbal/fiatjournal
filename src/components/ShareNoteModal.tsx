import React, { useState } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  Mail,
  Download,
  ExternalLink,
  Shield,
  FileText,
  Sparkles,
} from 'lucide-react';
import { ReflectionSession, Collaborator, UserProfile } from '../types';
import { canAccessCollaboratorSharing } from '../lib/tierLimits';

interface ShareNoteModalProps {
  note: ReflectionSession;
  currentUser: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenUpgrade?: () => void;
  onUpdateShareSettings: (updatedSettings: {
    isShared: boolean;
    sharedWith: string[];
    collaborators: Collaborator[];
    isPublic: boolean;
  }) => Promise<void>;
}

export const ShareNoteModal: React.FC<ShareNoteModalProps> = ({
  note,
  currentUser,
  isOpen,
  onClose,
  onOpenUpgrade,
  onUpdateShareSettings,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState<'viewer' | 'editor'>('viewer');
  const [collaborators, setCollaborators] = useState<Collaborator[]>(
    note.collaborators ||
      (note.sharedWith || []).map((email) => ({
        email,
        role: 'viewer',
        addedAt: Date.now(),
      }))
  );
  const [isPublic, setIsPublic] = useState(Boolean(note.isPublic));
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Build the shareable URL
  const shareableUrl = `${window.location.origin}${window.location.pathname}?share=${note.id}`;

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    setErrorNotice(null);

    if (!cleanEmail) return;

    // Simple email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorNotice('Please enter a valid email address.');
      return;
    }

    if (currentUser?.email && cleanEmail === currentUser.email.toLowerCase()) {
      setErrorNotice('You are already the owner of this note.');
      return;
    }

    if (collaborators.some((c) => c.email.toLowerCase() === cleanEmail)) {
      setErrorNotice('This user is already in the collaborators list.');
      return;
    }

    const updated = [
      ...collaborators,
      {
        email: cleanEmail,
        role: roleInput,
        addedAt: Date.now(),
      },
    ];

    setCollaborators(updated);
    setEmailInput('');

    try {
      setIsSaving(true);
      const emailList = updated.map((c) => c.email);
      await onUpdateShareSettings({
        isShared: emailList.length > 0 || isPublic,
        sharedWith: emailList,
        collaborators: updated,
        isPublic,
      });
    } catch (err) {
      console.error('Failed to add collaborator:', err);
      setErrorNotice('Could not save sharing settings. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCollaborator = async (emailToRemove: string) => {
    const updated = collaborators.filter(
      (c) => c.email.toLowerCase() !== emailToRemove.toLowerCase()
    );
    setCollaborators(updated);

    try {
      setIsSaving(true);
      const emailList = updated.map((c) => c.email);
      await onUpdateShareSettings({
        isShared: emailList.length > 0 || isPublic,
        sharedWith: emailList,
        collaborators: updated,
        isPublic,
      });
    } catch (err) {
      console.error('Failed to remove collaborator:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    const nextPublic = !isPublic;
    setIsPublic(nextPublic);

    try {
      setIsSaving(true);
      const emailList = collaborators.map((c) => c.email);
      await onUpdateShareSettings({
        isShared: emailList.length > 0 || nextPublic,
        sharedWith: emailList,
        collaborators,
        isPublic: nextPublic,
      });
    } catch (err) {
      console.error('Failed to toggle public link:', err);
      setIsPublic(!nextPublic);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleCopyMarkdown = async () => {
    try {
      const fullText = `# ${note.title}\n\n${note.content}`;
      await navigator.clipboard.writeText(fullText);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2200);
    } catch {
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2200);
    }
  };

  const handleDownloadMarkdown = () => {
    const fullText = `# ${note.title}\n\n${note.content}`;
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (note.title || 'untitled_note')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    link.download = `${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = () => {
    const subject = encodeURIComponent(`Shared Note: ${note.title || 'Untitled Note'}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm sharing a note with you from Fiat Journal: "${note.title}".\n\nYou can view it here: ${shareableUrl}\n\n---\n\n${note.content.slice(0, 500)}...`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div
      id="share-note-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="share-note-modal-card"
        className="bg-white dark:bg-[#1a1a18] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 text-stone-900 dark:text-stone-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-[#FAFAFA] dark:bg-[#161615]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50 shadow-2xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
                Share Note
              </h2>
              <p className="text-[11px] text-stone-400 dark:text-stone-400 truncate max-w-[280px]">
                {note.title || 'Untitled Note'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-share-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {!canAccessCollaboratorSharing(currentUser?.subscriptionTier) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                    Pro Mindful Feature
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                    Collaborator Note Sharing &amp; direct email invites require a Pro Mindful or Team Sanctuary subscription.
                  </p>
                </div>
              </div>
              {onOpenUpgrade && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenUpgrade();
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shrink-0 shadow-2xs transition-colors cursor-pointer"
                >
                  Upgrade
                </button>
              )}
            </div>
          )}

          {errorNotice && (
            <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
              <span>{errorNotice}</span>
              <button
                onClick={() => setErrorNotice(null)}
                className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Section 1: Invite Collaborators */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Share with specific users</span>
            </label>
            <form onSubmit={handleAddCollaborator} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Mail className="w-3.5 h-3.5 absolute left-2.5 top-3 text-stone-400" />
                <input
                  type="email"
                  placeholder={
                    canAccessCollaboratorSharing(currentUser?.subscriptionTier)
                      ? "Enter email address (e.g. user@gmail.com)"
                      : "Upgrade to Pro to invite collaborators"
                  }
                  disabled={!canAccessCollaboratorSharing(currentUser?.subscriptionTier)}
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-blue-500 focus:bg-white dark:focus:bg-[#20201d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>

              <select
                value={roleInput}
                disabled={!canAccessCollaboratorSharing(currentUser?.subscriptionTier)}
                onChange={(e) => setRoleInput(e.target.value as 'viewer' | 'editor')}
                className="px-2.5 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-700 dark:text-stone-300 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="viewer">Can View</option>
                <option value="editor">Can Edit</option>
              </select>

              <button
                type="submit"
                disabled={!emailInput.trim() || isSaving || !canAccessCollaboratorSharing(currentUser?.subscriptionTier)}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium disabled:opacity-40 transition-colors shadow-2xs cursor-pointer shrink-0"
              >
                Share
              </button>
            </form>
          </div>

          {/* Collaborators List */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-400 uppercase tracking-wider">
              People with access
            </span>

            {/* Note Owner */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'Y'}
                </div>
                <div className="truncate">
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {currentUser?.displayName || currentUser?.email || 'You'}
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-400 ml-1.5">
                    (Owner)
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50">
                Full Access
              </span>
            </div>

            {/* Shared Collaborators */}
            {collaborators.length === 0 ? (
              <p className="text-[11px] text-stone-400 dark:text-stone-400 italic px-1">
                No external collaborators invited yet.
              </p>
            ) : (
              collaborators.map((c) => (
                <div
                  key={c.email}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {c.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-stone-800 dark:text-stone-200 font-medium truncate">
                      {c.email}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded capitalize">
                      {c.role}
                    </span>
                    <button
                      onClick={() => handleRemoveCollaborator(c.email)}
                      title="Remove collaborator"
                      className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-stone-100 dark:border-stone-800" />

          {/* Section 2: Public / Link Sharing */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isPublic ? (
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Lock className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                )}
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Public Link Sharing
                  </span>
                  <p className="text-[11px] text-stone-400 dark:text-stone-400">
                    {isPublic
                      ? 'Anyone with the link can view this journal note'
                      : 'Only explicitly invited collaborators can access'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleTogglePublic}
                disabled={isSaving}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isPublic ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Link Input & Copy Button */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="flex-1 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-600 dark:text-stone-400 font-mono select-all truncate"
              />
              <button
                id="btn-copy-share-url"
                onClick={handleCopyShareLink}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs cursor-pointer ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <hr className="border-stone-100 dark:border-stone-800" />

          {/* Section 3: Quick Export & Outbound Sharing */}
          <div>
            <span className="text-[11px] font-medium text-stone-400 dark:text-stone-400 uppercase tracking-wider block mb-2">
              Export & Communication
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleCopyMarkdown}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium transition-all cursor-pointer text-center"
              >
                {copiedMarkdown ? (
                  <Check className="w-4 h-4 text-emerald-600 mb-1" />
                ) : (
                  <FileText className="w-4 h-4 text-stone-500 mb-1" />
                )}
                <span>{copiedMarkdown ? 'Copied' : 'Copy MD'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium transition-all cursor-pointer text-center"
              >
                <Download className="w-4 h-4 text-stone-500 mb-1" />
                <span>Download</span>
              </button>

              <button
                onClick={handleSendEmail}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 text-xs font-medium transition-all cursor-pointer text-center"
              >
                <Mail className="w-4 h-4 text-stone-500 mb-1" />
                <span>Email Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-100 dark:border-stone-800 bg-[#FAFAFA] dark:bg-[#161615] flex items-center justify-between text-xs text-stone-400 dark:text-stone-400">
          <div className="flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Vault Encrypted & Synced to Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
