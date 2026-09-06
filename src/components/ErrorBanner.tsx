import React from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string | null;
  onRetry?: () => void;
  onDismiss: () => void;
  isRetrying?: boolean;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
  onDismiss,
  isRetrying,
}) => {
  if (!message) return null;

  return (
    <div
      id="error-banner"
      role="alert"
      className="bg-rose-50 border-l-4 border-rose-600 p-4 mb-4 rounded-r-xl shadow-xs transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-rose-900">
              Persistence or AI Operation Notice
            </h4>
            <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 ml-4">
          {onRetry && (
            <button
              id="retry-save-btn"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium transition-colors shadow-2xs disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`}
              />
              <span>{isRetrying ? 'Retrying...' : 'Retry Save'}</span>
            </button>
          )}

          <button
            id="dismiss-error-btn"
            onClick={onDismiss}
            className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100 transition-colors"
            aria-label="Dismiss message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
