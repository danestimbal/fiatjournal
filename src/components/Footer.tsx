import React from 'react';
import {
  Shield,
  Sparkles,
  Heart,
  Feather,
  Lock,
  ExternalLink,
  HelpCircle,
  Mail,
  FileText,
  DollarSign,
  Info,
  Download,
} from 'lucide-react';
import { PublicPageType } from '../types';
import { downloadAppOverviewMd } from '../utils/downloadOverview';

interface FooterProps {
  onNavigatePage: (page: PublicPageType) => void;
  isAdmin?: boolean;
  onOpenAdmin?: () => void;
  onOpenUpgrade?: () => void;
  compact?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePage,
  isAdmin = false,
  onOpenAdmin,
  onOpenUpgrade,
  compact = false,
}) => {
  if (compact) {
    return (
      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 py-4 px-6 bg-transparent text-[11px] text-stone-500 dark:text-stone-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Feather className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          <span className="font-semibold text-stone-700 dark:text-stone-300">Fiat Journal</span>
          <span>&bull; Mindful Reflection</span>
        </div>

        <div className="flex items-center flex-wrap gap-4">
          <button
            onClick={() => onNavigatePage('pricing')}
            className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Pricing
          </button>
          <button
            onClick={() => onNavigatePage('terms')}
            className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Terms &amp; Conditions
          </button>
          <button
            onClick={() => onNavigatePage('about')}
            className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => onNavigatePage('contact')}
            className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
          >
            Contact
          </button>
          <button
            id="footer-compact-download-spec"
            onClick={downloadAppOverviewMd}
            className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer inline-flex items-center space-x-1 font-medium"
            title="Download Architecture, Cloud Leverage & Features (.md)"
          >
            <Download className="w-3 h-3 text-stone-400" />
            <span>Architecture (.md)</span>
          </button>

          {isAdmin && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <Shield className="w-2.5 h-2.5" />
              <span>Admin Console</span>
            </button>
          )}
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-[#FBFBFA] dark:bg-[#121210] text-stone-600 dark:text-stone-400 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Prominent Quick Navigation Pill Bar */}
        <div className="mb-10 pb-8 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-stone-400 dark:text-stone-500">
              Quick Links:
            </span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="footer-pill-pricing"
              onClick={() => onNavigatePage('pricing')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-750 shadow-2xs"
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Pricing &amp; Plans</span>
            </button>
            <button
              id="footer-pill-terms"
              onClick={() => onNavigatePage('terms')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-750 shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Terms &amp; Privacy</span>
            </button>
            <button
              id="footer-pill-about"
              onClick={() => onNavigatePage('about')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-750 shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>About Fiat Journal</span>
            </button>
            <button
              id="footer-pill-contact"
              onClick={() => onNavigatePage('contact')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-750 shadow-2xs"
            >
              <Mail className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Contact Us</span>
            </button>
            <button
              id="footer-pill-download-spec"
              onClick={downloadAppOverviewMd}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-850 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors cursor-pointer border border-stone-200/60 dark:border-stone-750 shadow-2xs"
              title="Download Architecture, Cloud Leverage & Features (.md)"
            >
              <Download className="w-3.5 h-3.5 text-stone-600 dark:text-stone-300" />
              <span>Architecture (.md)</span>
            </button>
            {onOpenUpgrade && (
              <button
                id="footer-pill-upgrade"
                onClick={onOpenUpgrade}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade to Pro</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-stone-100 dark:text-stone-900">
                <Feather className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-stone-900 dark:text-stone-100 tracking-tight">
                Fiat Journal
              </span>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
              A distraction-free markdown sanctuary paired with a context-aware Gemini AI companion.
              Designed for intentional thinking, emotional clarity, and lifelong personal discovery.
            </p>

            <div className="flex items-center space-x-3 pt-1">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Zero AI Training</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-300">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Gemini 3.6 Flash</span>
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              Sanctuary
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  id="footer-link-pricing"
                  onClick={() => onNavigatePage('pricing')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-medium text-stone-800 dark:text-stone-200">Pricing &amp; Plans</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-about"
                  onClick={() => onNavigatePage('about')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-stone-400" />
                  <span>About Fiat Journal</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('pricing')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <span>Feature Comparison</span>
                </button>
              </li>
              <li>
                <button
                  id="footer-link-download-spec"
                  onClick={downloadAppOverviewMd}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                  title="Download Architecture, Cloud Leverage & Features as Markdown (.md)"
                >
                  <Download className="w-3.5 h-3.5 text-stone-400" />
                  <span>Architecture &amp; Features (.md)</span>
                </button>
              </li>
              {onOpenUpgrade && (
                <li>
                  <button
                    id="footer-action-upgrade"
                    onClick={onOpenUpgrade}
                    className="hover:text-amber-700 dark:hover:text-amber-300 font-medium text-amber-800 dark:text-amber-400 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Upgrade to Pro</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  id="footer-link-terms"
                  onClick={() => onNavigatePage('terms')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-medium text-stone-800 dark:text-stone-200">Terms &amp; Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('terms')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Data Sovereignty Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigatePage('terms')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
                >
                  Security &amp; Isolation Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Support & Connect */}
          <div className="space-y-3 text-xs">
            <h4 className="font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
              Connect
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  id="footer-link-contact"
                  onClick={() => onNavigatePage('contact')}
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-medium text-stone-800 dark:text-stone-200">Contact Us</span>
                </button>
              </li>
              <li>
                <a
                  href="mailto:support@fiat.app"
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Support Desk (<span className="underline">support@fiat.app</span>)
                </a>
              </li>
              <li>
                <a
                  href="mailto:enterprise@fiat.app"
                  className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Enterprise Solutions
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Horizontal Bar */}
        <div className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p>&copy; 2026 Fiat Journal Sanctuary. All rights reserved.</p>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">&bull;</span>
            <button
              id="footer-bottom-pricing"
              onClick={() => onNavigatePage('pricing')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer font-medium"
            >
              Pricing
            </button>
            <button
              id="footer-bottom-terms"
              onClick={() => onNavigatePage('terms')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer font-medium"
            >
              Terms &amp; Conditions
            </button>
            <button
              id="footer-bottom-about"
              onClick={() => onNavigatePage('about')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer font-medium"
            >
              About
            </button>
            <button
              id="footer-bottom-contact"
              onClick={() => onNavigatePage('contact')}
              className="hover:underline hover:text-stone-800 dark:hover:text-stone-200 cursor-pointer font-medium"
            >
              Contact
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && onOpenAdmin && (
              <button
                id="footer-admin-btn"
                onClick={onOpenAdmin}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </button>
            )}
            <span className="text-[11px] font-mono">v2.4 &bull; Cloud Firestore Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
