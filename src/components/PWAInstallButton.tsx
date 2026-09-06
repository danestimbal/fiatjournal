import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, X, Smartphone, Check } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'navbar' | 'hero' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'default' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If already running as an installed PWA, hide the button completely
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => setInstalledSuccess(false), 3000);
      }
    } finally {
      setInstalling(false);
    }
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'hero') {
      return (
        <button
          id="pwa-install-hero-btn"
          onClick={handleInstallClick}
          disabled={installing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 whitespace-nowrap sm:min-w-[200px] shrink-0"
        >
          {installedSuccess ? (
            <>
              <Check className="w-4 h-4 text-stone-950" />
              <span>Installed!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-stone-950" />
              <span>{installing ? 'Installing...' : 'Install Fiat Journal App'}</span>
            </>
          )}
        </button>
      );
    }

    return (
      <button
        id="pwa-install-nav-btn"
        onClick={handleInstallClick}
        title="Install Fiat Journal as an app on your device"
        disabled={installing}
        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-amber-400/20 text-amber-900 hover:bg-amber-400/30 border border-amber-300/60 text-[11px] font-medium transition-colors cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-amber-800" />
        <span className="hidden sm:inline">Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'hero' ? (
          <button
            id="pwa-install-hero-ios-btn"
            onClick={() => setShowIOSGuide(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-sm transition-all border border-stone-300 shadow-sm cursor-pointer whitespace-nowrap sm:min-w-[200px] shrink-0"
          >
            <Smartphone className="w-4 h-4 text-stone-700" />
            <span>Install on iPhone / iPad</span>
          </button>
        ) : (
          <button
            id="pwa-install-nav-ios-btn"
            onClick={() => setShowIOSGuide(true)}
            title="Install Fiat Journal on your home screen"
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-stone-200 text-stone-700 hover:bg-stone-300/80 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install on iOS</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 text-stone-800">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs">
                    F
                  </div>
                  <h3 className="text-base font-semibold text-stone-900">Install Fiat Journal</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-stone-600 leading-relaxed">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 font-medium">1. Tap Share</strong> in the Safari bottom toolbar.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 shrink-0">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-stone-900 font-medium">2. Tap Add to Home Screen</strong> in the sharing sheet.
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700 shrink-0">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <strong className="text-stone-900 font-medium">3. Tap Add</strong> in the upper-right corner.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-stone-900 py-2.5 text-xs sm:text-sm font-medium text-stone-50 hover:bg-stone-800 transition cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback: If not triggered yet (e.g. browser beforeinstallprompt hasn't fired or user is on desktop browser),
  // show install button on the landing page if in 'hero' mode
  if (variant === 'hero') {
    return (
      <button
        id="pwa-install-guide-btn"
        onClick={() => setShowIOSGuide(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium text-sm transition-all border border-stone-200 cursor-pointer whitespace-nowrap sm:min-w-[200px] shrink-0"
      >
        <Smartphone className="w-4 h-4 text-stone-600" />
        <span>Install PWA App</span>
      </button>
    );
  }

  return null;
};
