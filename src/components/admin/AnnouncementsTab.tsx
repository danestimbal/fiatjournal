import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Sparkles,
  AlertCircle,
  Wrench,
  Info,
  Trash2,
  Edit2,
  CheckCircle2,
  Eye,
  X,
  Send,
} from 'lucide-react';
import { InAppAnnouncement } from '../../types';

interface AnnouncementsTabProps {
  announcements: InAppAnnouncement[];
  onCreateAnnouncement: (
    announcement: Omit<InAppAnnouncement, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onUpdateAnnouncement: (id: string, updates: Partial<InAppAnnouncement>) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({
  announcements,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<InAppAnnouncement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<InAppAnnouncement['type']>('feature');
  const [targetAudience, setTargetAudience] = useState<InAppAnnouncement['targetAudience']>('all');
  const [priority, setPriority] = useState<InAppAnnouncement['priority']>('normal');
  const [isPublished, setIsPublished] = useState(true);

  // Preview target
  const [previewItem, setPreviewItem] = useState<InAppAnnouncement | null>(
    announcements.find((a) => a.isPublished) || announcements[0] || null
  );

  const publishedCount = announcements.filter((a) => a.isPublished).length;
  const draftCount = announcements.length - publishedCount;

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setTitle('');
    setContent('');
    setType('feature');
    setTargetAudience('all');
    setPriority('normal');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann: InAppAnnouncement) => {
    setEditingAnnouncement(ann);
    setTitle(ann.title);
    setContent(ann.content);
    setType(ann.type);
    setTargetAudience(ann.targetAudience);
    setPriority(ann.priority);
    setIsPublished(ann.isPublished);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingAnnouncement) {
      await onUpdateAnnouncement(editingAnnouncement.id, {
        title: title.trim(),
        content: content.trim(),
        type,
        targetAudience,
        priority,
        isPublished,
        updatedAt: Date.now(),
      });
    } else {
      await onCreateAnnouncement({
        title: title.trim(),
        content: content.trim(),
        type,
        targetAudience,
        priority,
        isPublished,
      });
    }

    setIsModalOpen(false);
  };

  const handleTogglePublish = async (ann: InAppAnnouncement) => {
    await onUpdateAnnouncement(ann.id, {
      isPublished: !ann.isPublished,
      updatedAt: Date.now(),
    });
  };

  const getTypeIcon = (t: InAppAnnouncement['type']) => {
    switch (t) {
      case 'feature':
        return <Sparkles className="w-3.5 h-3.5 text-amber-500" />;
      case 'maintenance':
        return <Wrench className="w-3.5 h-3.5 text-orange-500" />;
      case 'alert':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-500" />;
      case 'info':
      default:
        return <Info className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Total Announcements
            </span>
            <Megaphone className="w-4 h-4 text-stone-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {announcements.length}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Broadcast library</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Currently Published
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {publishedCount}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Live for app users</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Drafts / Inactive
            </span>
            <Edit2 className="w-4 h-4 text-stone-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">{draftCount}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Prepared for schedule</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Target Reach
            </span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">100%</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">All registered clients</span>
        </div>
      </div>

      {/* Header & New Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            In-App Broadcast Announcements
          </h3>
          <p className="text-xs text-stone-500">
            Deliver product updates, feature announcements, and maintenance alerts directly inside the app
          </p>
        </div>
        <button
          id="admin-create-announcement-btn"
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Live In-App Preview Banner */}
      {previewItem && (
        <div className="bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300/70 dark:border-amber-800/60 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <Eye className="w-3.5 h-3.5" />
              <span>Live In-App User Display Preview</span>
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">
              Audience: {previewItem.targetAudience.toUpperCase()} &bull; Priority: {previewItem.priority}
            </span>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-lg p-3.5 border border-stone-200 dark:border-stone-800 shadow-xs flex items-start space-x-3">
            <div className="p-1.5 rounded-md bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
              {getTypeIcon(previewItem.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                {previewItem.title}
              </h5>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                {previewItem.content}
              </p>
            </div>
            <button
              onClick={() => handleTogglePublish(previewItem)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                previewItem.isPublished
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}
            >
              {previewItem.isPublished ? 'Published Live' : 'Unpublished Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((ann) => (
          <div
            key={ann.id}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
          >
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                {getTypeIcon(ann.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {ann.title}
                  </h4>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {ann.type}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {ann.targetAudience}
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                  {ann.content}
                </p>
                <div className="mt-2 flex items-center space-x-3 text-[11px] text-stone-400">
                  <span>
                    Created:{' '}
                    {new Date(ann.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {ann.authorEmail && <span>By: {ann.authorEmail}</span>}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
              <button
                onClick={() => setPreviewItem(ann)}
                title="Preview in header"
                className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleTogglePublish(ann)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  ann.isPublished
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                {ann.isPublished ? 'Live' : 'Draft'}
              </button>

              <button
                onClick={() => handleOpenEdit(ann)}
                className="p-1.5 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 cursor-pointer"
                title="Edit Announcement"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onDeleteAnnouncement(ann.id)}
                className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 text-stone-400 hover:text-rose-600 cursor-pointer"
                title="Delete Announcement"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                {editingAnnouncement ? 'Edit Announcement' : 'Compose In-App Announcement'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ✨ New Gemini Copilot capabilities launched"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Announcement Body *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the feature, announcement, or maintenance notice..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200"
                  >
                    <option value="feature">Feature</option>
                    <option value="info">Info</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Audience
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200"
                  >
                    <option value="all">All Users</option>
                    <option value="pro">Pro Users</option>
                    <option value="free">Free Users</option>
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
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <input
                  id="announcement-published-chk"
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-stone-900 focus:ring-stone-400"
                />
                <label
                  htmlFor="announcement-published-chk"
                  className="text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  Publish immediately (display to users upon save)
                </label>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs cursor-pointer inline-flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{editingAnnouncement ? 'Save Changes' : 'Broadcast Announcement'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
