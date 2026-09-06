import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  CreditCard,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { UserProfile } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUpgradeTier?: (tier: 'free' | 'pro' | 'enterprise') => Promise<void>;
  onUpgradeSuccess?: (tier: 'free' | 'pro' | 'enterprise') => Promise<void>;
  onNavigateToPricingPage?: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpgradeTier,
  onUpgradeSuccess,
  onNavigateToPricingPage,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTier, setSuccessTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = currentUser?.subscriptionTier || 'free';

  const handleSelectUpgrade = async (tier: 'free' | 'pro' | 'enterprise') => {
    setIsProcessing(true);
    try {
      if (onUpgradeSuccess) {
        await onUpgradeSuccess(tier);
      } else if (onUpgradeTier) {
        await onUpgradeTier(tier);
      }
      setSuccessTier(tier);
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessTier(null);
        onClose();
      }, 1400);
    } catch (err) {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="upgrade-modal-container"
        className="relative w-full max-w-2xl bg-white dark:bg-[#181816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden"
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {successTier ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              Subscription Updated to {successTier.toUpperCase()}!
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 max-w-sm mx-auto">
              Your account benefits have been activated immediately. Enjoy expanded AI reflections,
              rich exports, and enhanced cloud security.
            </p>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            {/* Modal Header */}
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-[11px] font-semibold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sanctuary Upgrade</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                Elevate Your Reflective Practice
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                Currently on the{' '}
                <span className="font-bold text-stone-900 dark:text-stone-200 capitalize">
                  {currentTier} Plan
                </span>
                . Instant activation, zero lock-in, and full data privacy.
              </p>

              {/* Billing Toggle */}
              <div className="mt-4 inline-flex items-center p-0.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-[11px] font-medium border border-stone-200 dark:border-stone-700">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                      : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
                  }`}
                >
                  Annual (Save 30%)
                </button>
              </div>
            </div>

            {/* Plans Comparison */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pro Mindful Card */}
              <div
                id="modal-plan-pro"
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  currentTier === 'pro'
                    ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-stone-900 dark:border-amber-400 bg-stone-50/50 dark:bg-stone-900/40 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Pro Mindful
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                      Most Popular
                    </span>
                  </div>

                  <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-50 font-mono">
                    ${billingCycle === 'annual' ? '99' : '12'}
                    <span className="text-xs font-normal text-stone-500 font-sans ml-1">
                      {billingCycle === 'annual' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Unlimited reflections &amp; folders</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Unlimited Gemini 3.6 Flash &amp; Fallbacks</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Export to PDF, HTML &amp; Obsidian .zip</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Priority Support (&lt; 4 hr SLA)</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    id="btn-modal-upgrade-pro"
                    disabled={isProcessing || currentTier === 'pro'}
                    onClick={() => handleSelectUpgrade('pro')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      currentTier === 'pro'
                        ? 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                        : 'bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 shadow-sm'
                    }`}
                  >
                    <span>{currentTier === 'pro' ? 'Active Plan' : 'Activate Pro Mindful'}</span>
                    {currentTier !== 'pro' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Team Sanctuary Card */}
              <div
                id="modal-plan-enterprise"
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  currentTier === 'enterprise'
                    ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#151513]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      Team Sanctuary
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      Organizations
                    </span>
                  </div>

                  <div className="mt-2 text-2xl font-extrabold text-stone-900 dark:text-stone-50 font-mono">
                    ${billingCycle === 'annual' ? '240' : '29'}
                    <span className="text-xs font-normal text-stone-500 font-sans ml-1">
                      {billingCycle === 'annual' ? '/ year' : '/ month'}
                    </span>
                  </div>

                  <ul className="mt-4 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Everything in Pro Mindful</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Collaborative team workspaces</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Custom domain &amp; audit trails</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Dedicated 24/7 Priority Support</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6">
                  <button
                    id="btn-modal-upgrade-enterprise"
                    disabled={isProcessing || currentTier === 'enterprise'}
                    onClick={() => handleSelectUpgrade('enterprise')}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                      currentTier === 'enterprise'
                        ? 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                        : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <span>
                      {currentTier === 'enterprise' ? 'Active Plan' : 'Activate Team Plan'}
                    </span>
                    {currentTier !== 'enterprise' && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Revert to Free + View Full Pricing Link */}
            <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-500">
              {currentTier !== 'free' ? (
                <button
                  onClick={() => handleSelectUpgrade('free')}
                  disabled={isProcessing}
                  className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 underline cursor-pointer"
                >
                  Downgrade to Free Sanctuary
                </button>
              ) : (
                <span className="flex items-center gap-1 text-[11px]">
                  <Lock className="w-3 h-3 text-stone-400" />
                  30-day money-back guarantee &bull; Cancel anytime
                </span>
              )}

              {onNavigateToPricingPage && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToPricingPage();
                  }}
                  className="font-semibold text-stone-900 dark:text-stone-100 hover:underline cursor-pointer"
                >
                  View Full Feature Comparison &rarr;
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
