import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Edit3,
  Columns,
  Search,
  FolderTree,
  Share2,
  CheckCircle2,
  CheckSquare,
  ArrowRight,
  ArrowLeft,
  MousePointerClick,
  LocateFixed,
  Brain,
  Plus,
  Pin,
  Eye,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userName?: string | null;
}

interface StepConfig {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  targetSelectors: string[];
  targetIcon: React.ComponentType<{ className?: string }>;
  targetIconName: string;
  targetLocation: string;
  pointerLabel: string;
  pointerDirection: 'bottom' | 'top';
  description: string;
  preview: React.ReactNode;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  userName,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [pulseCount, setPulseCount] = useState(0);

  const steps: StepConfig[] = [
    {
      id: 'markdown',
      badge: 'Step 1 of 4 • In-Place Markdown',
      title: 'Direct In-Place Markdown Editing',
      subtitle:
        'Switch between Live Visual and Raw Markdown without breaking flow.',
      targetSelectors: ['#btn-mode-interactive', '#editor-mode-selector'],
      targetIcon: Sparkles,
      targetIconName: 'Live Visual Mode',
      targetLocation: 'Editor Header (Top Right)',
      pointerLabel: 'Live Visual & Markdown Selector',
      pointerDirection: 'bottom',
      description:
        'Click the "Live Visual" toggle button to edit paragraphs, headings, and interactive tasks directly in-place without raw formatting clutter. Or switch to "Raw" when you want full Markdown source control.',
      preview: (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3.5 text-left space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-200/60 dark:border-stone-800/60 pb-1.5">
            <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
              # Morning Reflection
            </span>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-medium text-[10px] flex items-center gap-1 border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Live Visual Mode</span>
            </span>
          </div>
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
            Cultivating intentionality before the workday begins. Key priorities for today:
          </p>
          <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="line-through text-stone-400 dark:text-stone-500">
                Review architecture RFC document
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 rounded border border-stone-400 dark:border-stone-600" />
              <span>Synthesize weekly team reflections</span>
            </div>
          </div>
          <div className="pt-1 text-[10px] text-blue-600 dark:text-blue-400 italic flex items-center gap-1">
            <MousePointerClick className="w-3 h-3" />
            <span>Click directly on any sentence to edit inline immediately</span>
          </div>
        </div>
      ),
    },
    {
      id: 'copilot',
      badge: 'Step 2 of 4 • Thought Partner',
      title: 'Gemini 3.6 Flash AI Co-pilot',
      subtitle:
        'A mindful assistant that listens, challenges, and structures your thoughts.',
      targetSelectors: ['#btn-toggle-copilot-header'],
      targetIcon: Columns,
      targetIconName: 'Gemini Co-pilot Toggle',
      targetLocation: 'Top Navigation Bar (Top Right)',
      pointerLabel: 'Gemini 3.6 Flash Co-pilot',
      pointerDirection: 'bottom',
      description:
        'Click the Gemini Co-pilot icon in the top navigation bar to open side-by-side reflection assistance. Choose between Socratic Inquiry, Brainstorming, or Synthesizing to unpack blind spots and deepen clarity.',
      preview: (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3.5 text-left space-y-2 font-sans">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center space-x-1.5 font-medium text-stone-800 dark:text-stone-200">
              <Brain className="w-3.5 h-3.5 text-amber-500" />
              <span>Gemini Reflection Co-pilot</span>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-medium bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              gemini-3.6-flash
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-700 dark:text-stone-300 leading-relaxed shadow-2xs">
            <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1 text-[11px]">
              Socratic Inquiry:
            </span>
            "You noted feeling overwhelmed by competing priorities. What would happen if you paused project B for 48 hours to create momentum for project A?"
          </div>
          <div className="flex gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Summarize Key Takeaways
            </span>
            <span className="px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              Unpack Core Tension
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'organization',
      badge: 'Step 3 of 4 • Organization',
      title: 'Folders, Pins & Fast Full-Text Search',
      subtitle:
        'Structure reflections into custom folders and find insights in milliseconds.',
      targetSelectors: ['#note-list-search-container', '#btn-search-notes', '#btn-add-folder-section'],
      targetIcon: Search,
      targetIconName: 'Search Bar & Folder Controls',
      targetLocation: 'Note List Header & Sidebar',
      pointerLabel: 'Search notes or press "/" key',
      pointerDirection: 'bottom',
      description:
        'Use the search bar or press "/" anywhere to perform instant full-text filtering across all note titles and bodies. Organize entries into custom folders, and click the Pin icon on any note to keep it anchored at the top.',
      preview: (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3.5 text-left space-y-2.5 font-sans">
          <div className="flex items-center space-x-2 bg-white dark:bg-stone-800 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-xs text-stone-400">
            <Search className="w-3.5 h-3.5 text-blue-500" />
            <span>Search title, tags, or journal content...</span>
            <kbd className="ml-auto text-[10px] font-mono bg-stone-100 dark:bg-stone-700 px-1 py-0.5 rounded text-stone-500">
              /
            </kbd>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
              📁 Projects
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              📌 Pinned (3)
            </span>
            <span className="px-2 py-0.5 rounded-md bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              ⭐ Starred
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      badge: 'Step 4 of 4 • Security & Sharing',
      title: 'Cloud Firestore Isolation & Note Sharing',
      subtitle:
        'Safe, backed up to the cloud, and shareable on your exact terms.',
      targetSelectors: ['#btn-share-note', '#sync-status-indicator'],
      targetIcon: Share2,
      targetIconName: 'Share Note & Synced Status',
      targetLocation: 'Note Editor Action Bar (Top Center/Right)',
      pointerLabel: 'Share note & view cloud sync status',
      pointerDirection: 'bottom',
      description:
        'All reflections synchronize with Cloud Firestore under strict owner-bound isolation: only your authenticated account can access your vault. Click "Share" to invite collaborators by email or generate secure read-only links.',
      preview: (
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 p-3.5 text-left space-y-2 font-sans">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Real-Time Cloud Firestore Sync</span>
            </div>
            <span className="text-[10px] text-stone-400">PWA Offline Capable</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <Share2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate">Collaborators: team@company.com</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-medium shrink-0">
              Editor
            </span>
          </div>
          <p className="text-[10px] text-stone-400 dark:text-stone-500">
            Works offline anywhere, reconciling cleanly when network connectivity resumes.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];
  const StepTargetIcon = current.targetIcon;

  // Measure and locate target element bounding rectangle
  const measureTarget = useCallback(() => {
    if (!isOpen) {
      setTargetRect(null);
      return;
    }

    let foundEl: HTMLElement | null = null;
    for (const selector of current.targetSelectors) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el && el.offsetParent !== null) {
        foundEl = el;
        break;
      }
    }

    if (foundEl) {
      // Scroll into view if needed
      try {
        foundEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      } catch {
        // ignore
      }
      const rect = foundEl.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, current]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        measureTarget();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentStep, measureTarget, pulseCount]);

  useEffect(() => {
    const handleResizeOrScroll = () => {
      measureTarget();
    };
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);
    return () => {
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [measureTarget]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete();
    onClose();
  };

  const handleHighlightAgain = () => {
    setPulseCount((prev) => prev + 1);
    measureTarget();
  };

  return (
    <>
      {/* Target Element Spotlight & Pointing Arrow (Renders on Top of UI) */}
      {targetRect && (
        <div
          id="onboarding-spotlight-overlay"
          className="fixed pointer-events-none z-[75] transition-all duration-300 ease-out"
          style={{
            top: Math.max(4, targetRect.top - 5),
            left: Math.max(4, targetRect.left - 5),
            width: targetRect.width + 10,
            height: targetRect.height + 10,
          }}
        >
          {/* Glowing Animated Ring */}
          <div className="absolute inset-0 rounded-xl ring-4 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-stone-900 shadow-[0_0_30px_rgba(59,130,246,0.65)] animate-pulse" />

          {/* Corner Pulsing Ping Dot */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 text-white items-center justify-center text-[9px] font-bold">
              {currentStep + 1}
            </span>
          </span>

          {/* Floating Pointer Arrow Callout pointing directly to the Icon */}
          <div
            className={`absolute ${
              targetRect.top < 130
                ? 'top-full mt-2.5 left-1/2 -translate-x-1/2'
                : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
            } flex flex-col items-center pointer-events-auto z-[80]`}
          >
            {targetRect.top >= 130 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-xl border border-blue-400 whitespace-nowrap animate-bounce">
                <StepTargetIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{current.pointerLabel}</span>
              </div>
            )}

            {/* Upward Arrow when below the target */}
            {targetRect.top < 130 ? (
              <div className="flex flex-col items-center">
                <div className="w-0 h-0 border-x-6 border-x-transparent border-b-6 border-b-blue-600" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-semibold shadow-xl border border-blue-400 whitespace-nowrap animate-bounce mt-0.5">
                  <span className="text-amber-300 font-mono text-xs">▲</span>
                  <StepTargetIcon className="w-3 h-3 shrink-0" />
                  <span>{current.pointerLabel}</span>
                </div>
              </div>
            ) : (
              <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-blue-600 mt-0.5" />
            )}
          </div>
        </div>
      )}

      {/* Main Modal Backdrop & Dialog */}
      <div
        id="onboarding-modal-backdrop"
        className="fixed inset-0 z-[60] bg-stone-950/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      >
        <div
          id="onboarding-modal-dialog"
          className="w-full max-w-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-stone-900 dark:text-stone-100 flex flex-col relative my-auto mt-16 md:mt-20"
        >
          {/* Top Header Bar */}
          <div className="px-5 pt-4 pb-3 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Feature Guide{userName ? ` for ${userName}` : ''}
              </span>
              <span>&bull;</span>
              <span className="text-[11px] font-mono bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-md font-medium text-stone-700 dark:text-stone-300">
                {currentStep + 1} / {steps.length}
              </span>
            </div>
            <button
              id="btn-skip-onboarding"
              onClick={handleFinish}
              className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              Skip Tutorial
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 md:p-6 space-y-4 flex-1">
            {/* Direct Target Icon Pointer Callout Banner */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <StepTargetIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-200 truncate">
                      {current.targetIconName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-medium">
                      Pointed
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 dark:text-blue-300 truncate">
                    📍 {current.targetLocation}
                  </p>
                </div>
              </div>

              {/* Button to Re-Pulse Target Element */}
              <button
                onClick={handleHighlightAgain}
                title="Locate and illuminate this icon"
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 text-blue-700 dark:text-blue-300 text-[11px] font-medium border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors shadow-2xs shrink-0 cursor-pointer"
              >
                <LocateFixed className="w-3 h-3 text-blue-500" />
                <span className="hidden sm:inline">Highlight</span>
              </button>
            </div>

            {/* Step Title & Subtitle */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[11px] font-medium text-stone-600 dark:text-stone-300 mb-1.5">
                <StepTargetIcon className="w-3 h-3 text-blue-500" />
                <span>{current.badge}</span>
              </span>
              <h3 className="text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {current.title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {current.subtitle}
              </p>
            </div>

            {/* Interactive Preview Mockup */}
            <div className="animate-in fade-in duration-200">{current.preview}</div>

            {/* Detailed Explanation */}
            <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              {current.description}
            </p>
          </div>

          {/* Footer Navigation Controls */}
          <div className="px-5 py-3.5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-950/40 flex items-center justify-between">
            {/* Step Progress Indicators */}
            <div className="flex items-center space-x-1.5">
              {steps.map((step, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? 'w-7 bg-blue-600 dark:bg-blue-400'
                      : 'w-2 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400'
                  }`}
                  title={`Step ${idx + 1}: ${step.targetIconName}`}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {currentStep > 0 && (
                <button
                  id="btn-onboarding-prev"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  id="btn-onboarding-next"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
                >
                  <span>Next Icon</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="btn-onboarding-finish"
                  onClick={handleFinish}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
                >
                  <span>Start Journaling</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
