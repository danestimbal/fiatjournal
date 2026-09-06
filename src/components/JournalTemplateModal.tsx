import React, { useState, useEffect } from 'react';
import {
  X,
  Sun,
  Compass,
  Calendar,
  FileText,
  Sparkles,
  Check,
  Folder,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { JOURNAL_TEMPLATES, JournalTemplate } from '../data/journalTemplates';

interface JournalTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFolder?: string;
  customFolders?: string[];
  onCreateJournal: (params: {
    title: string;
    content: string;
    folder: string;
    tags: string[];
    mode: 'reflection' | 'brainstorm' | 'summary';
  }) => Promise<void> | void;
}

export const JournalTemplateModal: React.FC<JournalTemplateModalProps> = ({
  isOpen,
  onClose,
  currentFolder = 'Inbox',
  customFolders = [],
  onCreateJournal,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('daily-mindfulness');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>(
    currentFolder === 'Archive' || currentFolder === 'Trash' ? 'Inbox' : currentFolder
  );
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Format today's date nicely
  const getTodayFormatted = () => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  };

  // Reset or update default title when template changes
  useEffect(() => {
    if (!isOpen) return;
    const dateStr = getTodayFormatted();
    if (selectedTemplateId === 'blank') {
      setCustomTitle('Untitled Journal');
    } else {
      const tmpl = JOURNAL_TEMPLATES.find((t) => t.id === selectedTemplateId);
      if (tmpl) {
        setCustomTitle(tmpl.defaultTitle(dateStr));
      }
    }
  }, [selectedTemplateId, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dateStr = getTodayFormatted();
  const selectedTemplate = JOURNAL_TEMPLATES.find((t) => t.id === selectedTemplateId);

  // Available folders
  const allFolderOptions = Array.from(
    new Set(['Inbox', 'Notes', 'Projects', 'Personal', 'Work', ...customFolders])
  );

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = JOURNAL_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setCustomTitle(tmpl.defaultTitle(dateStr));
      if (tmpl.defaultFolder) {
        setSelectedFolder(tmpl.defaultFolder);
      }
    } else if (id === 'blank') {
      setCustomTitle('Untitled Journal');
      setSelectedFolder('Inbox');
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (selectedTemplateId === 'blank') {
        await onCreateJournal({
          title: customTitle.trim() || 'Untitled Journal',
          content: 'Start writing your thoughts, reflections, or mindful observations here...',
          folder: selectedFolder || 'Inbox',
          tags: ['Journal'],
          mode: 'reflection',
        });
      } else if (selectedTemplate) {
        await onCreateJournal({
          title: customTitle.trim() || selectedTemplate.defaultTitle(dateStr),
          content: selectedTemplate.content(dateStr),
          folder: selectedFolder || selectedTemplate.defaultFolder,
          tags: selectedTemplate.tags,
          mode: 'reflection',
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter templates
  const filteredTemplates = JOURNAL_TEMPLATES.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'compass':
        return <Compass className="w-5 h-5 text-indigo-500" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-emerald-500" />;
      default:
        return <FileText className="w-5 h-5 text-stone-500" />;
    }
  };

  return (
    <div
      id="journal-template-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-modal-title"
    >
      <div
        id="journal-template-modal-card"
        className="w-full max-w-2xl bg-white dark:bg-[#1c1c1a] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[90vh] overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/75 dark:bg-[#222220]/75 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="template-modal-title"
                className="text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 tracking-tight"
              >
                New Journal &amp; Reflection
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Choose a structured reflection framework or start fresh
              </p>
            </div>
          </div>
          <button
            id="btn-close-template-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-5 pt-3 pb-2 border-b border-stone-100 dark:border-stone-850 flex items-center space-x-1.5 shrink-0 overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Frameworks' },
            { id: 'daily', label: 'Daily Anchors' },
            { id: 'decisions', label: 'Decisions & Strategy' },
            { id: 'weekly', label: 'Weekly Reviews' },
          ].map((cat) => (
            <button
              key={cat.id}
              id={`tab-category-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <div className="flex-1" />

          {/* Toggle Preview Button */}
          {selectedTemplate && (
            <button
              id="btn-toggle-template-preview"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 flex items-center space-x-1 px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isPreviewMode ? 'View Templates' : 'Preview Prompt'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isPreviewMode && selectedTemplate ? (
            /* Template Markdown Preview */
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center space-x-2">
                  {getIcon(selectedTemplate.icon)}
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    {selectedTemplate.name}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">
                  Full Template Preview
                </span>
              </div>
              <div className="bg-stone-50 dark:bg-[#161614] p-4 rounded-xl border border-stone-200 dark:border-stone-800 font-mono text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                {selectedTemplate.content(dateStr)}
              </div>
            </div>
          ) : (
            /* Templates Grid */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filteredTemplates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  return (
                    <div
                      key={template.id}
                      id={`template-card-${template.id}`}
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-left group ${
                        isSelected
                          ? 'border-stone-900 dark:border-stone-100 bg-stone-50/80 dark:bg-stone-800/40 shadow-xs ring-1 ring-stone-900/10 dark:ring-stone-100/10'
                          : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#1a1a18]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 group-hover:scale-105 transition-transform">
                            {getIcon(template.icon)}
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          )}
                        </div>
                        <h3 className="text-xs font-semibold text-stone-900 dark:text-stone-100 mb-1 leading-snug">
                          {template.name}
                        </h3>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-3 leading-relaxed">
                          {template.tagline}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-850 flex items-center justify-between">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {template.category}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {template.tags.length} prompts
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blank Option */}
              <div
                id="template-card-blank"
                onClick={() => handleSelectTemplate('blank')}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedTemplateId === 'blank'
                    ? 'border-stone-900 dark:border-stone-100 bg-stone-50/80 dark:bg-stone-800/40 shadow-xs ring-1 ring-stone-900/10 dark:ring-stone-100/10'
                    : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#1a1a18]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                      Blank Journal Entry
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Write freely on a clean canvas without predefined prompts
                    </div>
                  </div>
                </div>
                {selectedTemplateId === 'blank' && (
                  <span className="w-5 h-5 rounded-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Customization Details (Title & Folder Target) */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-3">
            <div className="text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
              Journal Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Title input */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="input-template-custom-title"
                  className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Entry Title
                </label>
                <input
                  id="input-template-custom-title"
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Daily Reflection"
                  className="w-full px-3 py-1.5 bg-stone-50 dark:bg-[#161615] border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-500 transition-all shadow-2xs"
                />
              </div>

              {/* Folder destination */}
              <div>
                <label
                  htmlFor="select-template-folder"
                  className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1"
                >
                  Destination Folder
                </label>
                <div className="relative">
                  <select
                    id="select-template-folder"
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full appearance-none pl-8 pr-6 py-1.5 bg-stone-50 dark:bg-[#161615] border border-stone-200 dark:border-stone-700 rounded-lg text-xs text-stone-800 dark:text-stone-100 focus:outline-hidden focus:border-stone-400 dark:focus:border-stone-500 transition-all shadow-2xs cursor-pointer"
                  >
                    {allFolderOptions.map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                  </select>
                  <Folder className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/75 dark:bg-[#222220]/75 shrink-0">
          <button
            id="btn-cancel-template-modal"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center space-x-2">
            <button
              id="btn-confirm-create-template"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-xs font-medium rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span>
                {selectedTemplateId === 'blank' ? 'Create Blank Entry' : 'Create from Template'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
