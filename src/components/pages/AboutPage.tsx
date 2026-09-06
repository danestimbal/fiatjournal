import React from 'react';
import {
  Sparkles,
  Shield,
  Heart,
  Brain,
  FolderTree,
  Lock,
  ArrowLeft,
  Compass,
  Feather,
  Coffee,
  CheckCircle2,
  Users,
  Terminal,
  Code2,
  Database,
  Smartphone,
  Download,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { downloadAppOverviewMd } from '../../utils/downloadOverview';

interface AboutPageProps {
  currentUser?: UserProfile | null;
  onBack: () => void;
  onExploreVault?: () => void;
  onOpenContact?: () => void;
  onOpenPricing?: () => void;
  isAdmin?: boolean;
  onOpenAdminAbout?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  currentUser = null,
  onBack,
  onExploreVault,
  onOpenContact,
  onOpenPricing,
  isAdmin = false,
  onOpenAdminAbout,
}) => {
  const pillars = [
    {
      icon: <Feather className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
      title: 'Distraction-Free Markdown Sanctuary',
      description:
        'A serene writing canvas that values typography, whitespace, and focus. No vanity metrics, no algorithmic feeds, and no social notifications to shatter your train of thought.',
    },
    {
      icon: <Brain className="w-5 h-5 text-blue-700 dark:text-blue-400" />,
      title: 'Socratic Gemini AI Companion',
      description:
        'Powered by Gemini 3.6 Flash and resilient fallback ladders. Rather than writing for you, the companion reads your reflection to ask clarifying questions, detect cognitive blindspots, and synthesize action items.',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      title: 'Data Sovereignty & Zero Training',
      description:
        'Your words belong only to you. Every reflection is safeguarded in Cloud Firestore behind strict owner-bound rules, never used for training foundation models, and always exportable in standard Markdown.',
    },
  ];

  const milestones = [
    {
      year: 'Phase 1',
      title: 'The DICT Mindful Reflection Inception',
      description:
        'Born out of Department of Information and Communications Technology (DICT) digital wellbeing workshops, addressing cognitive overload among knowledge workers and educators.',
    },
    {
      year: 'Phase 2',
      title: 'Local-First Markdown & Firestore Sync',
      description:
        'Engineered an instant-response editor combining client-side caching with seamless Cloud Firestore synchronization and real-time collaboration.',
    },
    {
      year: 'Phase 3',
      title: 'Resilient Gemini 3.6 Model Ladders',
      description:
        'Introduced server-side multi-tier fallback pipelines across Gemini 3.6 Flash and 3.1 Flash-Lite to guarantee zero AI downtime during deep reflection sessions.',
    },
    {
      year: 'Phase 4',
      title: 'Enterprise RBAC, PWA & Support Desks',
      description:
        'Released progressive web app installability, multi-tenant administrative consoles, in-app broadcast announcements, and priority support desks.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#141412] text-stone-900 dark:text-stone-100 font-sans transition-colors pb-24">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-[#FBFBFA]/90 dark:bg-[#141412]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace</span>
        </button>

        <div className="flex items-center space-x-3">
          {isAdmin && onOpenAdminAbout && (
            <button
              onClick={onOpenAdminAbout}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin About Manager</span>
            </button>
          )}

          <button
            onClick={onExploreVault}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Enter Vault
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pt-12 sm:pt-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium mb-4">
            <Compass className="w-3.5 h-3.5 text-stone-500" />
            <span>Our Origin &amp; Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
            Quiet Spaces for Deeper Thinking
          </h1>

          <p className="mt-5 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            In an era driven by algorithmic notifications, dopamine loops, and fragmented attention,
            Fiat Journal was created as a quiet counter-movement: an intentional digital sanctuary where
            thoughts can unfold without hurry.
          </p>
        </div>

        {/* Narrative / Story */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
              Why We Built Fiat Journal
            </h2>
            <p>
              Traditional note applications often fall into two extremes: complex graph databases that
              require hours of manual configuration, or algorithmic social apps engineered to maximize
              screen time.
            </p>
            <p>
              We wanted something different: the timeless simplicity of a leatherbound notebook paired
              with the intelligent cognitive mirroring of modern AI. A tool that helps you clarify your
              own thinking rather than flooding you with automated noise.
            </p>
            <p>
              Every decision in Fiat Journal—from our low-contrast typographic hierarchy to our
              owner-bound Cloud Firestore security rules—is designed to protect your attention and
              honor your inner life.
            </p>
          </div>

          {/* Feature Highlight Graphic Block */}
          <div className="p-6 rounded-2xl bg-[#F8F8F6] dark:bg-[#1A1A18] border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 text-xs text-stone-500">
              <span className="font-mono">sanctuary_architecture.ts</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">100% Private</span>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-stone-600 dark:text-stone-400">
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-amber-700 dark:text-amber-400 font-bold">// 1. Distraction Zero</span>
                <p className="text-stone-700 dark:text-stone-300 mt-1">
                  canvas.render({'{'} ads: false, analyticsTrackers: 0, typography: &apos;refined&apos; {'}'})
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-blue-700 dark:text-blue-400 font-bold">// 2. Cognitive Partner</span>
                <p className="text-stone-700 dark:text-stone-300 mt-1">
                  gemini.reflect({'{'} model: &apos;gemini-3.6-flash&apos;, zeroTraining: true {'}'})
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">// 3. Owner Bound</span>
                <p className="text-stone-700 dark:text-stone-300 mt-1">
                  firestore.isolate(&apos;/users/$userId/reflections&apos;)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 3 Pillars */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              The Three Pillars of Our Craft
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Guiding principles behind every pixel, query, and interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                  {pillar.icon}
                </div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {pillar.title}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones / Evolution */}
        <div className="mt-24">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              The Journey of Fiat Journal
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              From DICT training incubators to an offline-first cognitive sanctuary.
            </p>
          </div>

          <div className="space-y-6">
            {milestones.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="sm:w-28 shrink-0">
                  <span className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs font-bold">
                    {item.year}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture & Specification Download */}
        <div className="mt-20 p-6 rounded-2xl bg-stone-100/80 dark:bg-[#1c1c1a] border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Application Architecture &amp; Cloud Specification
              </h3>
            </div>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xl leading-relaxed">
              Read how Fiat Journal leverages Firebase Authentication, Cloud Firestore, Google Cloud Run, and Gemini AI with resilient fallback ladders.
            </p>
          </div>
          <button
            id="btn-about-download-spec"
            onClick={downloadAppOverviewMd}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 text-xs font-semibold transition-all cursor-pointer shadow-xs shrink-0"
            title="Download full architectural description and feature matrix as Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Spec (.md)</span>
          </button>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 p-8 rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Begin Your Mindful Practice Today</h2>
          <p className="text-xs sm:text-sm text-stone-300 dark:text-stone-700 max-w-xl mx-auto leading-relaxed">
            Create your first reflection, structure your projects, and experience what clarity feels like
            when distraction is removed.
          </p>
          <div className="pt-2">
            <button
              onClick={onExploreVault || onBack}
              className="px-6 py-3 rounded-xl bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-all cursor-pointer shadow-md"
            >
              Open Your Private Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
