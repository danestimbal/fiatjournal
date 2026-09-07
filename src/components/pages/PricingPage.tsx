import React, { useState } from 'react';
import {
  Check,
  Sparkles,
  Shield,
  Zap,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  User,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import { UserProfile, SubscriptionPlan } from '../../types';

interface PricingPageProps {
  currentUser: UserProfile | null;
  onSelectPlan: (tier: 'free' | 'pro' | 'enterprise') => void;
  onBack: () => void;
  onSignIn?: () => void;
  onOpenContact?: () => void;
  isAdmin?: boolean;
  onOpenAdminPricing?: () => void;
  plans?: SubscriptionPlan[];
}

export const PricingPage: React.FC<PricingPageProps> = ({
  currentUser,
  onSelectPlan,
  onBack,
  onSignIn,
  onOpenContact,
  isAdmin = false,
  onOpenAdminPricing,
  plans,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const currentTier = currentUser?.subscriptionTier || 'free';

  const freePlan = plans?.find((p) => p.tierKey === 'free' || p.id === 'plan_free');
  const proPlan = plans?.find((p) => p.tierKey === 'pro' || p.id === 'plan_pro');
  const enterprisePlan = plans?.find((p) => p.tierKey === 'enterprise' || p.id === 'plan_enterprise');

  const displayedPlans = [
    {
      id: 'free' as const,
      name: freePlan?.name || 'Free Sanctuary',
      badge: freePlan?.badge || 'Starter',
      description: freePlan?.description || 'Essential private journaling and mindful reflection tools.',
      monthlyPrice: freePlan?.monthlyPrice ?? 0,
      annualPrice: freePlan?.annualPrice ?? 0,
      features: freePlan?.features && freePlan.features.length > 0 ? freePlan.features : [
        'Bring Your Own Storage (Google Drive & Local)',
        '50 active notes & unlimited folders',
        'Gemini 3.6 Flash partner (25 prompts/day)',
        'Offline PWA progressive web app support',
        'Standard Markdown export (Raw .md)',
        'Community support sanctuary',
      ],
      ctaText: currentTier === 'free' && currentUser ? 'Current Plan' : 'Start Free',
      highlighted: false,
    },
    {
      id: 'pro' as const,
      name: proPlan?.name || 'Pro Mindful',
      badge: proPlan?.badge || 'Most Popular',
      description: proPlan?.description || 'Deep cognitive journaling with unlimited Gemini AI and rich insights.',
      monthlyPrice: proPlan?.monthlyPrice ?? 12,
      annualPrice: proPlan?.annualPrice ?? 99,
      features: proPlan?.features && proPlan.features.length > 0 ? proPlan.features : [
        'Fiat Managed Cloud Storage (Multi-Device Sync)',
        'Everything in Free Sanctuary',
        'Unlimited notes & nested folders',
        'Unlimited Gemini 3.6 Flash & Fallback ladder',
        'Collaborative note sharing with secure links',
        'Full export: PDF, HTML, and Obsidian .zip',
        'Semantic tag discovery & mood taxonomy',
        'Priority ticket support (< 4 hr response)',
      ],
      ctaText: currentTier === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      highlighted: true,
    },
    {
      id: 'enterprise' as const,
      name: enterprisePlan?.name || 'Team Sanctuary',
      badge: enterprisePlan?.badge || 'Teams & Orgs',
      description: enterprisePlan?.description || 'Collaborative workspaces for executive reflection, teams, and coaching.',
      monthlyPrice: enterprisePlan?.monthlyPrice ?? 29,
      annualPrice: enterprisePlan?.annualPrice ?? 240,
      features: enterprisePlan?.features && enterprisePlan.features.length > 0 ? enterprisePlan.features : [
        'Everything in Pro Mindful',
        'Multi-member collaborative team workspaces',
        'Custom workspace domains & branding',
        'Role-based access permissions & audit logs',
        'Dedicated SLA & 24/7 priority assistance',
        'Centralized team billing & seat licenses',
        'Early access to Gemini 3.7 Deep Reasoning',
      ],
      ctaText: currentTier === 'enterprise' ? 'Current Plan' : 'Upgrade to Team',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'How does Bring Your Own Storage (Google Drive) work on the Free plan?',
      a: 'Free users can connect their personal Google Drive with a single click. Fiat Journal creates a dedicated "Fiat Journal" folder on your Google Drive and saves your notes as open Markdown (.md) files. You own your data with zero hosting costs, while Pro users get Fiat Managed Cloud Storage for instant multi-device sync without setup.',
    },
    {
      q: 'Will my private notes ever be used to train AI models?',
      a: 'Never. Fiat Journal operates under a zero-training pledge. All Gemini API calls use stateless, zero-retention enterprise inference endpoints. Your thoughts, journals, and reflections remain 100% yours.',
    },
    {
      q: 'Can I export my journal if I decide to leave?',
      a: 'Yes, anytime. Fiat Journal respects open standards. You can download all your notes in clean, standard Markdown (.md) or download a complete Obsidian-compatible archive with zero lock-in.',
    },
    {
      q: 'How does the Gemini Fallback Ladder work on Pro?',
      a: 'If primary models encounter high network traffic, Fiat Journal seamlessly routes your reflection requests across an automated ladder (Gemini 3.6 Flash → Gemini 3.1 Flash-Lite → Gemini Flash Latest) to ensure zero latency interruptions.',
    },
    {
      q: 'Can I switch between monthly and annual plans or cancel?',
      a: 'You can switch or cancel your subscription anytime with a single click. Downgrades take effect at the end of your current billing period, and we provide a 30-day money-back guarantee.',
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
          {isAdmin && onOpenAdminPricing && (
            <button
              onClick={onOpenAdminPricing}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Pricing Editor</span>
            </button>
          )}

          {!currentUser && (
            <button
              onClick={onSignIn}
              className="px-3.5 py-1.5 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-6 pt-12 sm:pt-16">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest, Transparent Sanctuary Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
            Invest in Your Inner Clarity
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            Choose a plan tailored to your reflective cadence. All plans include distraction-free
            markdown writing, strict Firestore data privacy, and ethical AI assistance.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-stone-200/70 dark:bg-stone-800/80 border border-stone-300/60 dark:border-stone-700/60 text-xs font-medium">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs font-semibold'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                Save 30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {displayedPlans.map((plan) => {
            const isCurrent = currentUser && currentTier === plan.id;
            const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
            const periodLabel = billingCycle === 'annual' ? '/ year' : '/ month';

            return (
              <div
                key={plan.id}
                id={`pricing-card-${plan.id}`}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                  plan.highlighted
                    ? 'bg-white dark:bg-[#1A1A18] border-2 border-stone-900 dark:border-amber-400 shadow-xl p-7'
                    : 'bg-[#FDFBF9] dark:bg-[#171715] border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md p-6'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-stone-900 dark:bg-amber-400 text-stone-50 dark:text-stone-950 text-[11px] font-bold tracking-wide uppercase shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {plan.name}
                    </h3>
                    {!plan.highlighted && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-stone-600 dark:text-stone-400 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-5 pb-6 border-b border-stone-200 dark:border-stone-800 flex items-baseline">
                    <span className="text-4xl font-extrabold text-stone-900 dark:text-stone-50 font-mono">
                      ${price}
                    </span>
                    <span className="ml-2 text-xs text-stone-500 dark:text-stone-400">
                      {plan.monthlyPrice === 0 ? 'forever' : periodLabel}
                    </span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-stone-700 dark:text-stone-300">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4">
                  <button
                    id={`btn-select-plan-${plan.id}`}
                    disabled={isCurrent}
                    onClick={() => {
                      if (!currentUser && plan.id !== 'free' && onSignIn) {
                        onSignIn();
                      } else {
                        onSelectPlan(plan.id);
                      }
                    }}
                    className={`w-full py-3 px-4 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      isCurrent
                        ? 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 cursor-default'
                        : plan.highlighted
                        ? 'bg-stone-900 hover:bg-stone-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-stone-50 dark:text-stone-950 shadow-md hover:shadow-lg'
                        : 'bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="mt-20">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Detailed Feature Comparison
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
              Every detail engineered for thoughtful writing, complete privacy, and zero distraction.
            </p>
          </div>

          <div className="overflow-x-auto border border-stone-200 dark:border-stone-800 rounded-2xl bg-white dark:bg-[#181816] shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/60 font-semibold text-stone-900 dark:text-stone-100">
                  <th className="p-4 w-1/3">Feature Sanctuary</th>
                  <th className="p-4 text-center w-1/5">Free Sanctuary</th>
                  <th className="p-4 text-center w-1/5 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">
                    Pro Mindful
                  </th>
                  <th className="p-4 text-center w-1/5">Team Sanctuary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                <tr>
                  <td className="p-4 font-medium">Daily Reflection Storage</td>
                  <td className="p-4 text-center">Up to 50 notes</td>
                  <td className="p-4 text-center font-semibold bg-amber-50/30 dark:bg-amber-950/10 text-emerald-600 dark:text-emerald-400">
                    Unlimited
                  </td>
                  <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Gemini 3.6 Flash Partner</td>
                  <td className="p-4 text-center">25 calls / day</td>
                  <td className="p-4 text-center font-semibold bg-amber-50/30 dark:bg-amber-950/10 text-emerald-600 dark:text-emerald-400">
                    Unlimited
                  </td>
                  <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    Unlimited + Priority
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Resilient Model Fallback Ladder</td>
                  <td className="p-4 text-center text-stone-400">&mdash;</td>
                  <td className="p-4 text-center font-semibold bg-amber-50/30 dark:bg-amber-950/10 text-emerald-600 dark:text-emerald-400">
                    Full 4-tier ladder
                  </td>
                  <td className="p-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                    Full + Deep Reasoning
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Markdown Export Formats</td>
                  <td className="p-4 text-center">Raw .md</td>
                  <td className="p-4 text-center bg-amber-50/30 dark:bg-amber-950/10">
                    Raw .md, PDF, HTML
                  </td>
                  <td className="p-4 text-center">Complete Vault Zip &amp; API</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Collaborator Note Sharing</td>
                  <td className="p-4 text-center text-stone-400">&mdash;</td>
                  <td className="p-4 text-center bg-amber-50/30 dark:bg-amber-950/10">
                    Direct Email Links
                  </td>
                  <td className="p-4 text-center">Shared Team Workspaces</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Firestore Owner-Bound Isolation</td>
                  <td className="p-4 text-center text-emerald-600 dark:text-emerald-400">
                    Included
                  </td>
                  <td className="p-4 text-center text-emerald-600 dark:text-emerald-400 bg-amber-50/30 dark:bg-amber-950/10">
                    Included
                  </td>
                  <td className="p-4 text-center text-emerald-600 dark:text-emerald-400">
                    Included + Audit Trail
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium">Support SLA</td>
                  <td className="p-4 text-center">Community &amp; Tickets</td>
                  <td className="p-4 text-center bg-amber-50/30 dark:bg-amber-950/10 font-medium">
                    Priority (&lt; 4 hr)
                  </td>
                  <td className="p-4 text-center font-medium">Dedicated 24/7 Hotline</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-20 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Frequently Answered Questions
            </h2>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
              Have questions? We are always here to help.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-[#181816] overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-xs font-semibold text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-5 pb-4 pt-1 text-xs text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
