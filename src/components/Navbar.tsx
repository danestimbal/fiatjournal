import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  Sun,
  Moon,
  HardDrive,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

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
  onOpenStorageSettings?: () => void;
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
  onOpenStorageSettings,
  onNavigatePage,
  onNewJournal,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

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
          id="navbar-brand-logo-btn"
          onClick={() => {
            if (user) {
              onSelectViewMode('vault');
            } else {
              onSelectViewMode('landing');
            }
          }}
          title={user ? 'Fiat Journal Workspace' : 'Fiat Journal Home'}
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

      {/* Right controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        {/* Guest theme toggle (only shown if not logged in) */}
        {!user && <ThemeToggle />}

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
          <div className="flex items-center space-x-2">
            {/* Quick Google Drive Storage Indicator / Button */}
            {onOpenStorageSettings && (
              <button
                id="navbar-storage-settings-btn"
                type="button"
                onClick={onOpenStorageSettings}
                title="Configure Storage & Google Drive Sync"
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-700 bg-white/80 dark:bg-stone-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-[11px] text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline font-medium">Google Drive</span>
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              {/* Profile Avatar Dropdown Trigger */}
              <button
                id="navbar-profile-dropdown-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                className={`flex items-center space-x-1.5 px-2 py-1 rounded-md border transition-all cursor-pointer select-none ${
                  isDropdownOpen
                    ? 'bg-stone-200/90 dark:bg-stone-700/90 border-stone-300 dark:border-stone-600 shadow-xs'
                    : 'bg-white/80 dark:bg-stone-800/90 hover:bg-stone-100 dark:hover:bg-stone-700/80 border-stone-200 dark:border-stone-700 text-[11px]'
                }`}
              >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
              )}
              <span className="text-stone-700 dark:text-stone-300 font-medium max-w-[100px] truncate hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-stone-400 transition-transform duration-150 ${
                  isDropdownOpen ? 'rotate-180 text-stone-600 dark:text-stone-200' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div
                id="navbar-profile-dropdown-menu"
                className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 py-1"
              >
                {/* User Header Section */}
                <div className="px-3.5 py-3 border-b border-stone-100 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/40">
                  <div className="flex items-center space-x-2.5">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-200 dark:ring-stone-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {user.displayName || 'Mindful User'}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Badges row */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.subscriptionTier === 'enterprise'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : user.subscriptionTier === 'pro'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      {user.subscriptionTier === 'enterprise'
                        ? 'Team Sanctuary'
                        : user.subscriptionTier === 'pro'
                        ? 'Pro Mindful'
                        : 'Free Sanctuary'}
                    </span>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                {/* Core Preferences & Helpdesk Items (Theme, Tutorial/Guide, Support) */}
                <div className="p-1.5 space-y-0.5">
                  {/* 1. Theme / Dark Mode Toggle */}
                  <button
                    id="profile-dropdown-theme-toggle"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTheme();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-amber-100 group-hover:text-amber-700 dark:group-hover:bg-amber-950/60 dark:group-hover:text-amber-400 transition-colors">
                        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-medium">Theme Mode</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[11px] font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-stone-700/60">
                      <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                    </div>
                  </button>

                  {/* 2. Tutorial & Feature Guide */}
                  {onOpenTutorial && (
                    <button
                      id="profile-dropdown-tutorial-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (viewMode === 'landing') {
                          onSelectViewMode('vault');
                        }
                        onOpenTutorial();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-blue-100 group-hover:text-blue-700 dark:group-hover:bg-blue-950/60 dark:group-hover:text-blue-400 transition-colors">
                          <HelpCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Tutorial &amp; Feature Guide</span>
                      </div>
                    </button>
                  )}

                  {/* 3. Support Sanctuary */}
                  {onOpenSupport && (
                    <button
                      id="profile-dropdown-support-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenSupport();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950/60 dark:group-hover:text-emerald-400 transition-colors">
                          <LifeBuoy className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Help &amp; Support Sanctuary</span>
                      </div>
                    </button>
                  )}

                  {/* 4. New Journal with Template Picker */}
                  {onNewJournal && (
                    <button
                      id="profile-dropdown-new-journal-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        if (viewMode !== 'vault') {
                          onSelectViewMode('vault');
                        }
                        onNewJournal();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">New Journal</span>
                      </div>
                    </button>
                  )}

                  {/* 5. Storage & Google Drive BYOS Settings */}
                  {onOpenStorageSettings && (
                    <button
                      id="profile-dropdown-storage-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenStorageSettings();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60 transition-colors">
                          <HardDrive className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Storage &amp; Google Drive</span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">Sync</span>
                    </button>
                  )}
                </div>

                {/* Account & Administration Section */}
                <div className="p-1.5 border-t border-stone-100 dark:border-stone-800 space-y-0.5">
                  {isAdmin && (
                    <button
                      id="profile-dropdown-admin-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onSelectViewMode(viewMode === 'admin' ? 'vault' : 'admin');
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                          <Shield className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">
                          {viewMode === 'admin' ? 'Exit Admin Console' : 'Open Admin Console'}
                        </span>
                      </div>
                    </button>
                  )}

                  {(!user.subscriptionTier || user.subscriptionTier === 'free') && onOpenUpgrade && (
                    <button
                      id="profile-dropdown-upgrade-btn"
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenUpgrade();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium">Upgrade to Pro</span>
                      </div>
                    </button>
                  )}

                  {/* Public Landing Page shortcut */}
                  <button
                    id="profile-dropdown-landing-btn"
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectViewMode(viewMode === 'landing' ? 'vault' : 'landing');
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-stone-200 dark:group-hover:bg-stone-700 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">
                        {viewMode === 'landing' ? 'Return to Workspace' : 'Public Home Page'}
                      </span>
                    </div>
                  </button>

                  <button
                    id="profile-dropdown-signout-btn"
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
                        <LogOut className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium">Sign Out</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
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

