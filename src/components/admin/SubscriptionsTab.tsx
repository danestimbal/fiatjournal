import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  FileText,
  UserCheck,
  Settings2,
} from 'lucide-react';
import { SubscriptionPlan, SubscriptionTransaction, AdminUser } from '../../types';
import { INITIAL_SUBSCRIPTION_PLANS, INITIAL_TRANSACTIONS } from '../../data/adminSeedData';
import { EditPlanModal } from './EditPlanModal';

interface SubscriptionsTabProps {
  users: AdminUser[];
  onUpgradeUserPlan: (userId: string, tier: 'pro' | 'enterprise') => Promise<void>;
  plans?: SubscriptionPlan[];
  onUpdatePlan?: (plan: SubscriptionPlan) => void;
}

export const SubscriptionsTab: React.FC<SubscriptionsTabProps> = ({
  users,
  onUpgradeUserPlan,
  plans: initialPlans,
  onUpdatePlan,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans || INITIAL_SUBSCRIPTION_PLANS);
  const [transactions] = useState<SubscriptionTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedUserForUpgrade, setSelectedUserForUpgrade] = useState<string>('');
  const [upgradeTier, setUpgradeTier] = useState<'pro' | 'enterprise'>('pro');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);

  useEffect(() => {
    if (initialPlans && initialPlans.length > 0) {
      setPlans(initialPlans);
    }
  }, [initialPlans]);

  const handleSavePlan = (updatedPlan: SubscriptionPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
    if (onUpdatePlan) {
      onUpdatePlan(updatedPlan);
    }
  };

  // Dynamic calculations
  const proUsersCount = users.filter((u) => u.subscriptionTier === 'pro').length;
  const enterpriseUsersCount = users.filter((u) => u.subscriptionTier === 'enterprise').length;
  const freeUsersCount = users.filter((u) => u.subscriptionTier === 'free').length;

  const proPrice = plans.find((p) => p.tierKey === 'pro' || p.id === 'plan_pro')?.monthlyPrice ?? 12;
  const enterprisePrice = plans.find((p) => p.tierKey === 'enterprise' || p.id === 'plan_enterprise')?.monthlyPrice ?? 29;

  const mrr = proUsersCount * proPrice + enterpriseUsersCount * enterprisePrice;
  const arr = mrr * 12;
  const totalPaidSubscribers = proUsersCount + enterpriseUsersCount;
  const conversionRate = Math.round(
    (totalPaidSubscribers / ((users.length || 1) > 0 ? users.length : 1)) * 100
  );

  const handleGrantUpgrade = async () => {
    if (!selectedUserForUpgrade) return;
    await onUpgradeUserPlan(selectedUserForUpgrade, upgradeTier);
    setIsUpgradeModalOpen(false);
    setSelectedUserForUpgrade('');
  };

  return (
    <div className="space-y-6">
      {/* Top Financial & Subscriber Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Monthly Recurring (MRR)
            </span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">${mrr}</p>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>ARR: ${arr.toLocaleString()} / year</span>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Paid Subscribers
            </span>
            <CreditCard className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {totalPaidSubscribers}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">
            {proUsersCount} Pro &bull; {enterpriseUsersCount} Enterprise
          </span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Free Sanctuary Users
            </span>
            <UserCheck className="w-4 h-4 text-stone-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100">
            {freeUsersCount}
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Eligible for upgrades</span>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              Conversion Rate
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {conversionRate}%
          </p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Target benchmark 12%</span>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Active Subscription Tiers
          </h3>
          <p className="text-xs text-stone-500">
            Feature entitlements, pricing configurations, and member capacity
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            id="admin-edit-subscription-tiers-header-btn"
            onClick={() => {
              setEditingPlan(plans.find((p) => p.id === 'plan_pro') || plans[0]);
              setIsEditPlanModalOpen(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-medium text-xs transition-colors cursor-pointer shadow-xs"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-500" />
            <span>Edit Plan Tiers</span>
          </button>
          <button
            id="admin-grant-subscription-btn"
            onClick={() => setIsUpgradeModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Grant Complimentary Access</span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const isPro = plan.id === 'plan_pro';
          const isEnterprise = plan.id === 'plan_enterprise';

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isPro
                  ? 'bg-amber-50/30 dark:bg-stone-900 border-amber-300 dark:border-amber-800/60 shadow-sm'
                  : isEnterprise
                  ? 'bg-purple-50/20 dark:bg-stone-900 border-purple-200 dark:border-purple-800/50 shadow-xs'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isPro
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : isEnterprise
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                    }`}
                  >
                    {plan.badge || plan.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-stone-500 font-medium">
                      {plan.id === 'plan_free'
                        ? `${freeUsersCount} active`
                        : plan.id === 'plan_pro'
                        ? `${proUsersCount} active`
                        : `${enterpriseUsersCount} active`}
                    </span>
                    <button
                      id={`btn-card-header-edit-${plan.id}`}
                      onClick={() => {
                        setEditingPlan(plan);
                        setIsEditPlanModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700"
                      title={`Edit ${plan.name}`}
                    >
                      <Settings2 className="w-3 h-3 text-stone-500" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                <h4 className="mt-3 text-lg font-bold text-stone-900 dark:text-stone-100">
                  {plan.name}
                </h4>
                <p className="mt-1 text-xs text-stone-500 leading-relaxed min-h-[36px]">
                  {plan.description}
                </p>

                <div className="mt-4 flex items-baseline gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">
                      ${plan.monthlyPrice !== undefined ? plan.monthlyPrice : plan.price}
                    </span>
                    <span className="text-xs text-stone-500">/ month</span>
                  </div>
                  {(plan.annualPrice !== undefined ? plan.annualPrice : 0) > 0 && (
                    <span className="text-xs text-stone-500 font-mono">
                      (${plan.annualPrice}/yr)
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>AI Quota:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {plan.geminiQuota}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 dark:text-stone-400">
                    <span>Storage Limit:</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      {plan.storageLimit}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-stone-600 dark:text-stone-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-3 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500 font-mono">
                    {plan.annualPrice > 0 ? `$${plan.annualPrice}/yr rate` : 'Always free'}
                  </span>
                  <button
                    id={`btn-subtab-edit-tier-${plan.id}`}
                    onClick={() => {
                      setEditingPlan(plan);
                      setIsEditPlanModalOpen(true);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 transition-all shadow-xs cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transactions & Invoices Log */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 uppercase tracking-wider">
              Recent Billing Transactions & Invoices
            </h4>
            <p className="text-[11px] text-stone-500">Verified Stripe and subscription webhook events</p>
          </div>
          <span className="text-xs font-medium text-stone-500">
            {transactions.length} recorded events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-medium">
              <tr>
                <th className="px-4 py-2.5">Invoice ID</th>
                <th className="px-4 py-2.5">User Account</th>
                <th className="px-4 py-2.5">Plan</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Date</th>
                <th className="px-4 py-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-stone-700 dark:text-stone-300">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30">
                  <td className="px-4 py-3 font-mono font-medium text-stone-900 dark:text-stone-100">
                    {tx.invoiceId}
                  </td>
                  <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">
                    {tx.userEmail}
                  </td>
                  <td className="px-4 py-3 text-stone-600 dark:text-stone-400">{tx.planName}</td>
                  <td className="px-4 py-3 font-semibold text-stone-900 dark:text-stone-100">
                    ${tx.amount.toFixed(2)} {tx.currency}
                  </td>
                  <td className="px-4 py-3">
                    {tx.status === 'paid' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] border border-emerald-200 dark:border-emerald-800">
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-medium text-[11px] border border-rose-200 dark:border-rose-800">
                        Refunded
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-[11px]">
                    {new Date(tx.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer">
                      <FileText className="w-3 h-3" />
                      PDF
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grant Access Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Grant Subscription Access
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Elevate a user's subscription tier directly without requiring payment checkout.
            </p>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Select User Account
                </label>
                <select
                  value={selectedUserForUpgrade}
                  onChange={(e) => setSelectedUserForUpgrade(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200"
                >
                  <option value="">-- Choose a user --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName ? `${u.displayName} (${u.email})` : u.email} - Currently{' '}
                      {u.subscriptionTier.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Grant Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpgradeTier('pro')}
                    className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                      upgradeTier === 'pro'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Pro Mindful ($9/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpgradeTier('enterprise')}
                    className={`py-2 px-3 rounded-lg border text-left cursor-pointer transition-all ${
                      upgradeTier === 'enterprise'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 font-semibold'
                        : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    Team Sanctuary ($29/mo)
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedUserForUpgrade}
                onClick={handleGrantUpgrade}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 font-medium text-xs cursor-pointer disabled:opacity-50"
              >
                Apply Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      <EditPlanModal
        isOpen={isEditPlanModalOpen}
        onClose={() => setIsEditPlanModalOpen(false)}
        plan={editingPlan}
        onSave={handleSavePlan}
        allPlans={plans}
        onSelectPlan={(p) => setEditingPlan(p)}
      />
    </div>
  );
};
