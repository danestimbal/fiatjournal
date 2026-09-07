import React, { useState } from 'react';
import {
  X,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  FolderOpen,
} from 'lucide-react';
import { UserProfile, ReflectionSession } from '../types';
import {
  StorageProviderType,
  STORAGE_PROVIDER_OPTIONS,
  canAccessAppCloudStorage,
} from '../lib/tierLimits';
import {
  findOrCreateFiatJournalFolder,
  syncAllNotesToGoogleDrive,
  GOOGLE_DRIVE_FOLDER_NAME,
} from '../lib/googleDrive';
import {
  connectGoogleDriveAccount,
  getCachedDriveAccessToken,
} from '../lib/firebase';

interface StorageSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  activeStorageProvider: StorageProviderType;
  onSelectStorageProvider: (provider: StorageProviderType) => void;
  notes: ReflectionSession[];
  onTriggerUpgrade: (reason: string) => void;
}

export const StorageSettingsModal: React.FC<StorageSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  activeStorageProvider,
  onSelectStorageProvider,
  notes,
  onTriggerUpgrade,
}) => {
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = currentUser?.subscriptionTier || 'free';
  const hasAppCloudAccess = canAccessAppCloudStorage(currentTier);
  const hasDriveToken = Boolean(getCachedDriveAccessToken());

  const handleConnectDrive = async () => {
    try {
      setIsConnectingDrive(true);
      setErrorMessage(null);
      const token = await connectGoogleDriveAccount();
      if (token) {
        onSelectStorageProvider('google_drive');
        setSyncSuccessMessage('Google Drive connected! Your journals will save to the Fiat Journal folder.');
      }
    } catch (err: any) {
      console.error('Drive connection error:', err);
      setErrorMessage(err?.message || 'Failed to authorize Google Drive. Please try again.');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  const handleSyncAllToDrive = async () => {
    let token = getCachedDriveAccessToken();
    if (!token) {
      try {
        setIsConnectingDrive(true);
        token = await connectGoogleDriveAccount();
      } catch (err: any) {
        setErrorMessage('Please authenticate with Google to sync files to your Drive.');
        setIsConnectingDrive(false);
        return;
      }
      setIsConnectingDrive(false);
    }

    try {
      setIsSyncingDrive(true);
      setErrorMessage(null);
      setSyncSuccessMessage(null);
      setSyncProgress({ current: 0, total: notes.length });

      const result = await syncAllNotesToGoogleDrive(token, notes, (current, total) => {
        setSyncProgress({ current, total });
      });

      setSyncSuccessMessage(
        `Successfully synced ${result.syncedCount} reflection${
          result.syncedCount === 1 ? '' : 's'
        } to Google Drive folder "${GOOGLE_DRIVE_FOLDER_NAME}"!`
      );
    } catch (err: any) {
      console.error('Drive sync error:', err);
      setErrorMessage(err?.message || 'Failed to sync journals to Google Drive.');
    } finally {
      setIsSyncingDrive(false);
      setSyncProgress(null);
    }
  };

  const handleSelectProvider = (providerId: StorageProviderType) => {
    setErrorMessage(null);
    setSyncSuccessMessage(null);

    if (providerId === 'fiat_cloud') {
      if (!hasAppCloudAccess) {
        onTriggerUpgrade(
          'Fiat Managed Cloud Storage is an upgraded Pro feature. Upgrade to Pro for multi-device cloud sync and automated backups, or connect your personal Google Drive for free.'
        );
        return;
      }
      onSelectStorageProvider('fiat_cloud');
    } else if (providerId === 'google_drive') {
      onSelectStorageProvider('google_drive');
    } else {
      onSelectStorageProvider('local');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="storage-settings-modal"
        className="relative w-full max-w-xl bg-white dark:bg-[#181816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-800/60 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
                Storage &amp; Sync Architecture
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Bring Your Own Storage (BYOS) or use Fiat Managed Cloud
              </p>
            </div>
          </div>

          {/* Freemium Policy Alert */}
          <div className="mt-4 p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Zero-Lock-in Storage Philosophy
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                Plan: {currentTier.toUpperCase()}
              </span>
            </div>
            <span>
              Free accounts can store journals on their own <strong>Google Drive</strong> or <strong>Local Device</strong> without limits. Using <strong>Fiat Managed Cloud Storage</strong> requires an upgraded Pro plan.
            </span>
          </div>

          {/* Feedback Messages */}
          {syncSuccessMessage && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{syncSuccessMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Provider Selection Cards */}
          <div className="mt-5 space-y-3">
            {/* 1. Google Drive (Free BYOS) */}
            <div
              onClick={() => handleSelectProvider('google_drive')}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                activeStorageProvider === 'google_drive'
                  ? 'border-amber-600/70 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#151513]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Personal Google Drive
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        FREE • BYOS
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Saves your entries to <code>Google Drive &gt; Fiat Journal</code> as standard Markdown (.md) files.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {activeStorageProvider === 'google_drive' ? (
                    <span className="flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 gap-1">
                      <Check className="w-4 h-4 text-amber-600" /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">Select</span>
                  )}
                </div>
              </div>

              {/* Google Drive Sub-actions when active */}
              {activeStorageProvider === 'google_drive' && (
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${hasDriveToken ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span>{hasDriveToken ? 'Connected via Google Account' : 'Needs Authorization'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!hasDriveToken ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConnectDrive();
                          }}
                          disabled={isConnectingDrive}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
                        >
                          {isConnectingDrive && <RefreshCw className="w-3 h-3 animate-spin" />}
                          <span>Connect Google Drive</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSyncAllToDrive();
                          }}
                          disabled={isSyncingDrive}
                          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-colors shadow-xs"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncingDrive ? 'animate-spin' : ''}`} />
                          <span>
                            {isSyncingDrive
                              ? `Syncing (${syncProgress?.current || 0}/${syncProgress?.total || notes.length})...`
                              : 'Sync All Notes to Drive'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!hasDriveToken && (
                    <div className="p-2.5 rounded-lg bg-stone-100/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                      <strong>Google Authorization Note:</strong> Because this app is in active development, Google may display a screen saying <em>&quot;Make sure you trust gen-lang-client-...&quot;</em>. Click <strong>Advanced &rarr; Go to app (unsafe)</strong> to allow Fiat Journal to save files into your Google Drive.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Local Device Storage (Free Offline) */}
            <div
              onClick={() => handleSelectProvider('local')}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeStorageProvider === 'local'
                  ? 'border-amber-600/70 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#151513]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center mt-0.5">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Local Device Storage
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        FREE • OFFLINE
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Retains journals in browser storage with instant offline access and complete isolation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {activeStorageProvider === 'local' ? (
                    <span className="flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 gap-1">
                      <Check className="w-4 h-4 text-amber-600" /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-stone-400">Select</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Fiat Managed Cloud Storage (App Storage - Upgraded Only) */}
            <div
              onClick={() => handleSelectProvider('fiat_cloud')}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                activeStorageProvider === 'fiat_cloud'
                  ? 'border-amber-600/70 bg-amber-50/20 dark:bg-amber-950/20 shadow-xs'
                  : hasAppCloudAccess
                  ? 'border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-[#151513]'
                  : 'border-amber-200/80 dark:border-amber-900/40 bg-amber-50/30 dark:bg-amber-950/10 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mt-0.5">
                    <Cloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                        Fiat Managed Cloud Storage (App Cloud)
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        {hasAppCloudAccess ? 'INCLUDED IN PRO' : 'PRO UPGRADE'}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      App-hosted Firebase Firestore cloud synchronization across all phones, tablets, and computers, with automated snapshots and team collaboration.
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  {activeStorageProvider === 'fiat_cloud' ? (
                    <span className="flex items-center text-xs font-semibold text-amber-700 dark:text-amber-400 gap-1">
                      <Check className="w-4 h-4 text-amber-600" /> Active
                    </span>
                  ) : hasAppCloudAccess ? (
                    <span className="text-xs text-stone-400">Select</span>
                  ) : (
                    <span className="flex items-center text-xs font-semibold text-amber-800 dark:text-amber-400 gap-1">
                      <Lock className="w-3.5 h-3.5" /> Requires Pro
                    </span>
                  )}
                </div>
              </div>

              {!hasAppCloudAccess && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
                  <span className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                    Free users Bring Your Own Drive. Upgrade to unlock Fiat Cloud storage.
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerUpgrade(
                        'Fiat Managed Cloud Storage is an upgraded feature. Upgrade to Pro for multi-device cloud sync and automated backups, or connect your personal Google Drive for free.'
                      );
                    }}
                    className="px-3 py-1 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 text-xs font-semibold flex items-center space-x-1 cursor-pointer hover:bg-stone-800 transition-colors"
                  >
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>Current Sanctuary Notes: {notes.length}</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-medium cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
