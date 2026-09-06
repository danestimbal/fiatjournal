import React, { useState } from 'react';
import { Sparkles, Info, Wrench, AlertCircle, X, ChevronRight } from 'lucide-react';
import { InAppAnnouncement } from '../types';

interface InAppAnnouncementBannerProps {
  announcements: InAppAnnouncement[];
}

export const InAppAnnouncementBanner: React.FC<InAppAnnouncementBannerProps> = ({
  announcements,
}) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<InAppAnnouncement | null>(null);

  const activeAnnouncements = announcements.filter(
    (a) => a.isPublished && !dismissedIds.includes(a.id)
  );

  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[0];

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds((prev) => [...prev, current.id]);
  };

  const getTypeStyle = (t: InAppAnnouncement['type']) => {
    switch (t) {
      case 'feature':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
          bg: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
          badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300',
        };
      case 'maintenance':
        return {
          icon: <Wrench className="w-3.5 h-3.5 text-orange-500 shrink-0" />,
          bg: 'bg-orange-50/80 dark:bg-orange-950/40 border-orange-200/80 dark:border-orange-900/50',
          badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-300',
        };
      case 'alert':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
          bg: 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
          badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />,
          bg: 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200/80 dark:border-indigo-900/50',
          badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300',
        };
    }
  };

  const style = getTypeStyle(current.type);

  return (
    <>
      <div
        id="in-app-announcement-banner"
        onClick={() => setSelectedAnnouncement(current)}
        className={`w-full border-b transition-colors cursor-pointer text-xs ${style.bg}`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            {style.icon}
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${style.badge}`}
            >
              {current.type}
            </span>
            <span className="font-semibold text-stone-900 dark:text-stone-100 truncate">
              {current.title}
            </span>
            <span className="hidden md:inline text-stone-600 dark:text-stone-300 truncate">
              &mdash; {current.content}
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="hidden sm:inline-flex items-center text-[11px] font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100">
              Details <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
            <button
              onClick={handleDismiss}
              className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              title="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="space-y-1">
                <span
                  className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                    getTypeStyle(selectedAnnouncement.type).badge
                  }`}
                >
                  {selectedAnnouncement.type}
                </span>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {selectedAnnouncement.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
