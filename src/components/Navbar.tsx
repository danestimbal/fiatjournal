import React from 'react';
import { UserProfile, PublicPageType } from '../types';
import {
  Sidebar,
  Columns,
  LogIn,
  LogOut,
  User as UserIcon,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Shield,
  LifeBuoy,
  Plus,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  user: UserProfile | null;
  loadingAuth: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onToggleNav: () => void;
  isNavOpen: boolean;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  viewMode: 'landing' | 'vault' | 'public_reader' | 'admin';
  onSelectViewMode: (mode: 'landing' | 'vault' | 'admin') => void;
  onOpenTutorial?: () => void;
  isAdmin?: boolean;
  onOpenSupport?: () => void;
  onOpenUpgrade?: () => void;
  onNavigatePage?: (page: PublicPageType) => void;
  onNewJournal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  onSignIn,
  onSignOut,
  onToggleNav,
  isNavOpen,
  onToggleCopilot,
  isCopilotOpen,
  viewMode,
  onSelectViewMode,
  onOpenTutorial,
  isAdmin = false,
  onOpenSupport,
  onOpenUpgrade,
  onNavigatePage,
  onNewJournal,
}) => {
  return (
    <header
      id="obsidian-app-header"
      className="h-11 px-3 bg-[#F5F5F3] dark:bg-[#181816] border-b border-[#E8E8E6] dark:border-[#2e2e2a] flex items-center justify-between select-none shrink-0 text-xs font-sans text-stone-700 dark:text-stone-300 transition-colors"
    >
      {/* Left controls */}
      <div className="flex items-center space-x-2">
        {viewMode === 'vault' && (
          <button
            id="toggle-nav-sidebar-btn"
            onClick={onToggleNav}
            title={isNavOpen ? 'Hide Vault Navigator' : 'Show Vault Navigator'}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              isNavOpen
                ? 'text-stone-800 dark:text-stone-100 bg-stone-200/80 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50'
            }`}
          >
            <Sidebar className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => onSelectViewMode(viewMode === 'vault' ? 'landing' : 'vault')}
          title={viewMode === 'vault' ? 'Return to Home' : 'Open Workspace'}
          className="flex items-center space-x-2 pl-1 border-l border-stone-300 dark:border-stone-700 hover:opacity-80 transition-opacity cursor-pointer text-left"
        >
          <div className="w-5 h-5 rounded bg-stone-900 dark:bg-amber-400 text-amber-300 dark:text-stone-950 flex items-center justify-center font-bold text-[10px]">
            F
          </div>
          <span className="font-semibold text-stone-800 dark:text-stone-100 tracking-tight">
            Fiat Journal
          </span>
        </button>

        {/* Public Navigation Links (when on landing or browsing public pages) */}
        {onNavigatePage && (
          <nav className="hidden lg:flex items-center space-x-3 ml-4 pl-3 border-l border-stone-300/80 dark:border-stone-700/80 text-[11px]">
            <button
              id="navbar-link-pricing"
              onClick={() => onNavigatePage('pricing')}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer font-medium"
            >
              Pricing
            </button>
            <button
              id="navbar-link-terms"
              onClick={() => onNavigatePage('terms')}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer font-medium"
            >
              Terms
            </button>
            <button
              id="navbar-link-about"
              onClick={() => onNavigatePage('about')}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer font-medium"
            >
              About
            </button>
            <button
              id="navbar-link-contact"
              onClick={() => onNavigatePage('contact')}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer font-medium"
            >
              Contact
            </button>
          </nav>
        )}
      </div>

      {/* Right controls: Theme toggle, PWA install, User & Copilot toggle */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Theme Light/Dark Toggle */}
        <ThemeToggle />

        {/* App Tutorial & Feature Guide - shown only when logged in */}
        {user && onOpenTutorial && (
          <button
            id="navbar-tutorial-btn"
            onClick={() => {
              if (viewMode === 'landing') {
                onSelectViewMode('vault');
              }
              onOpenTutorial();
            }}
            title="App Tutorial & Feature Guide"
            className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Support Helpdesk Button - available to logged-in users */}
        {user && onOpenSupport && (
          <button
            id="navbar-support-btn"
            onClick={onOpenSupport}
            title="Need Help & Support Sanctuary"
            className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Administrator Console Button - displayed for admin users */}
        {user && isAdmin && (
          <button
            id="navbar-admin-btn"
            onClick={() => onSelectViewMode(viewMode === 'admin' ? 'vault' : 'admin')}
            title={viewMode === 'admin' ? 'Exit Admin and return to Vault' : 'Open Fiat Admin Console'}
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
              viewMode === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{viewMode === 'admin' ? 'Exit Admin' : 'Admin'}</span>
          </button>
        )}

        <PWAInstallButton variant="navbar" />

        {user && (!user.subscriptionTier || user.subscriptionTier === 'free') && onOpenUpgrade && (
          <button
            id="navbar-upgrade-btn"
            onClick={onOpenUpgrade}
            title="Upgrade to Pro Sanctuary"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] transition-all shadow-2xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Upgrade</span>
          </button>
        )}

        {viewMode === 'vault' && onNewJournal && (
          <button
            id="navbar-new-journal-btn"
            onClick={onNewJournal}
            title="Create New Journal (Select Reflection Template)"
            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-[11px] font-medium transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Journal</span>
          </button>
        )}

        {user && viewMode === 'landing' && (
          <button
            id="navbar-open-journal-btn"
            onClick={() => onSelectViewMode('vault')}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <span>Open Journal</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}

        {loadingAuth ? (
          <div className="flex items-center space-x-1.5 text-stone-400 text-[11px]">
            <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
            <span>Auth...</span>
          </div>
        ) : user ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="flex items-center space-x-1.5 bg-white/80 dark:bg-stone-800/90 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-700 text-[11px]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-4 h-4 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              )}
              <span className="text-stone-700 dark:text-stone-300 font-medium max-w-[100px] truncate hidden sm:inline">
                {user.displayName || user.email}
              </span>
            </div>

            <button
              id="navbar-signout-btn"
              onClick={onSignOut}
              title="Sign out of Fiat Journal"
              className="p-1 rounded text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            id="navbar-signin-btn"
            onClick={onSignIn}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}

        {viewMode === 'vault' && (
          <button
            id="btn-toggle-copilot-header"
            onClick={onToggleCopilot}
            title={isCopilotOpen ? 'Hide Gemini Co-pilot' : 'Show Gemini Co-pilot'}
            className={`inline-flex items-center space-x-1 px-2 py-1 rounded transition-colors cursor-pointer text-xs font-medium ${
              isCopilotOpen
                ? 'text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-950/60 hover:bg-blue-200/60 dark:hover:bg-blue-900/60 border border-blue-300/60 dark:border-blue-800/60'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <Columns className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] hidden sm:inline">Co-pilot</span>
          </button>
        )}
      </div>
    </header>
  );
};
