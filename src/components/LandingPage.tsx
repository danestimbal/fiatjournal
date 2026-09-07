import React from 'react';
import {
  Shield,
  Sparkles,
  Brain,
  FolderTree,
  Lock,
  ArrowRight,
  FileText,
  CheckCircle2,
  Table,
  CheckSquare,
} from 'lucide-react';
import { UserProfile, PublicPageType } from '../types';
import { PWAInstallButton } from './PWAInstallButton';
import { Footer } from './Footer';

interface LandingPageProps {
  onSignIn: (mode?: 'signin' | 'register') => void;
  loading: boolean;
  onExploreVault: () => void;
  user: UserProfile | null;
  onNavigatePage: (page: PublicPageType) => void;
  onOpenUpgradeModal?: () => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSignIn,
  loading,
  onExploreVault,
  user,
  onNavigatePage,
  onOpenUpgradeModal,
  isAdmin = false,
  onOpenAdmin,
}) => {
  return (
    <div className="min-h-[calc(100vh-2.75rem)] bg-[#FBFBFA] text-stone-900 flex flex-col justify-between select-none">
      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center text-center">
        {/* Hero Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.15] max-w-5xl whitespace-normal sm:whitespace-nowrap">
          Mindful Journaling & Reflection
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl">
          A distraction-free sanctuary for your thoughts, daily reflections, and personal growth.
          Organize your journey with custom folders, rich markdown, and a supportive Gemini AI
          partner that helps you unpack ideas and cultivate insight.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 w-full max-w-2xl sm:max-w-3xl px-2 sm:px-0">
          {user ? (
            <>
              <button
                id="landing-hero-open-vault"
                onClick={onExploreVault}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap sm:min-w-[220px] shrink-0"
              >
                <span>Enter Your Private Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <PWAInstallButton variant="hero" />
            </>
          ) : (
            <>
              <button
                id="landing-hero-register-btn"
                onClick={() => onSignIn('register')}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer whitespace-nowrap sm:min-w-[190px] shrink-0"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="landing-hero-signin-btn"
                onClick={() => onSignIn('signin')}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-medium text-sm border border-stone-300 transition-all shadow-xs hover:shadow disabled:opacity-60 cursor-pointer whitespace-nowrap sm:min-w-[110px] shrink-0"
              >
                <span>Sign In</span>
              </button>
              <button
                id="landing-hero-explore-guest"
                onClick={onExploreVault}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-all border border-stone-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Try Demo Vault</span>
              </button>
              <PWAInstallButton variant="hero" />
            </>
          )}
        </div>

        {/* Interactive Workspace Preview Mockup */}
        <div className="mt-14 w-full max-w-5xl rounded-xl border border-stone-200 bg-white shadow-xl overflow-hidden text-left">
          {/* Mock Window Titlebar */}
          <div className="h-8 bg-[#EFEFED] border-b border-stone-200 px-3 flex items-center justify-between text-[11px] text-stone-500 font-mono">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 font-sans font-medium text-stone-700">
                Fiat Journal &bull; DICT Training Session 02
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-sans">
                Vault Synced
              </span>
              <span>Gemini 3.6 Flash Active</span>
            </div>
          </div>

          {/* 4-Pane Mockup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 h-72 divide-y md:divide-y-0 md:divide-x divide-stone-200 text-xs">
            {/* Mock Pane 1: Navigator */}
            <div className="hidden md:block md:col-span-2 bg-[#F7F7F5] p-3 space-y-2">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                Views
              </div>
              <div className="flex items-center justify-between px-2 py-1 rounded bg-stone-200/70 font-medium text-stone-800">
                <span>📥 Inbox</span>
                <span className="text-[10px] bg-stone-300 px-1 rounded">2</span>
              </div>
              <div className="px-2 py-1 text-stone-600">⭐ Starred</div>
              <div className="px-2 py-1 text-stone-600">📁 Projects</div>
              <div className="pl-4 py-0.5 text-stone-500 text-[11px]">↳ DICT Training</div>
              <div className="pl-4 py-0.5 text-stone-500 text-[11px]">↳ GuroHub</div>
            </div>

            {/* Mock Pane 2: Notes List */}
            <div className="hidden sm:block md:col-span-3 bg-white p-3 space-y-2">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex justify-between">
                <span>Notes (3)</span>
                <span>↓ Modified</span>
              </div>
              <div className="p-2 rounded bg-stone-100 border border-stone-200">
                <div className="font-semibold text-stone-800 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-stone-500" />
                  <span>DICT Training 02</span>
                </div>
                <div className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                  Discussion on multi-turn prompting, context limits, and security...
                </div>
              </div>
              <div className="p-2 rounded hover:bg-stone-50 text-stone-600">
                <div className="font-medium">Strategic Roadmap Q4</div>
                <div className="text-[11px] text-stone-400 truncate mt-0.5">
                  Objectives, deliverables, and team allocation...
                </div>
              </div>
            </div>

            {/* Mock Pane 3: Editor */}
            <div className="col-span-12 md:col-span-4 bg-white p-4 space-y-3">
              <div className="text-stone-400 text-[11px]">Note › DICT Training 02</div>
              <div className="text-base font-bold text-stone-900">
                # DICT Training Session 02
              </div>
              <div className="text-stone-700 space-y-1.5 leading-relaxed text-[11px]">
                <p>
                  Today we explored <mark className="bg-amber-100 px-1 rounded">context injection</mark> with Gemini.
                </p>
                <div className="p-2 bg-stone-50 border border-stone-200 rounded font-mono text-[10px] text-stone-600">
                  | Concept | Status | Action |<br />
                  | Prompting | Done | Review notes |
                </div>
              </div>
            </div>

            {/* Mock Pane 4: Gemini Co-pilot */}
            <div className="hidden lg:block lg:col-span-3 bg-[#FBFBFA] p-3 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-stone-800 font-semibold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Gemini Co-pilot</span>
              </div>
              <div className="bg-amber-50/70 border border-amber-200/80 rounded p-2 text-[10px] text-stone-700">
                I've reviewed your DICT training notes. Would you like me to generate an audit table for the takeaways?
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded text-stone-700 font-medium">
                  + Insert into Note
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Value Pillars with Distinct Light Colored Backgrounds */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          {/* Card 1: Warm Amber Light Tint */}
          <div
            id="landing-card-journal-workspace"
            className="p-6 rounded-2xl bg-[#FDFBF5] border border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-100/90 text-amber-800 flex items-center justify-center mb-4 border border-amber-200 shadow-2xs">
                <FolderTree className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Focused Journal Workspace
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Clean, organized space with collapsible folder navigation, daily reflection lists, live
                markdown formatting, highlights, and custom tags for every mood and topic.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-amber-200/60 text-xs text-amber-900 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>Distraction-free reflective writing</span>
            </div>
          </div>

          {/* Card 2: Cool Blue Light Tint */}
          <div
            id="landing-card-gemini-copilot"
            className="p-6 rounded-2xl bg-[#F4F8FC] border border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100/90 text-blue-800 flex items-center justify-center mb-4 border border-blue-200 shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Gemini 3.6 Flash Co-pilot
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Context-aware AI companion with automated model fallback ladders. Reads your active
                note to suggest action steps and lets you insert markdown tables directly into the document.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-blue-200/60 text-xs text-blue-900 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              <span>1-click &quot;Insert into Note&quot; workflow</span>
            </div>
          </div>

          {/* Card 3: Fresh Sage Emerald Light Tint */}
          <div
            id="landing-card-firestore-security"
            className="p-6 rounded-2xl bg-[#F2F8F5] border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100/90 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-200 shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-stone-900 mb-2">
                Owner-Bound Firestore
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                Every reflection is isolated to your Firebase Authentication UID in Cloud Firestore.
                Strict owner-bound rules protect your personal notes, journals, and private thoughts.
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-emerald-200/60 text-xs text-emerald-900 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Path /users/{'{userId}'}/reflections</span>
            </div>
          </div>
        </div>
      </main>

      {/* Comprehensive Public Footer with visible links */}
      <Footer
        onNavigatePage={onNavigatePage}
        onOpenUpgrade={onOpenUpgradeModal}
        isAdmin={isAdmin}
        onOpenAdmin={onOpenAdmin}
      />
    </div>
  );
};
