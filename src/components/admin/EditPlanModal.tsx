import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Save,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { SubscriptionPlan } from '../../types';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  onSave: (updatedPlan: SubscriptionPlan) => void;
  allPlans?: SubscriptionPlan[];
  onSelectPlan?: (plan: SubscriptionPlan) => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSave,
  allPlans,
  onSelectPlan,
}) => {
  const [formData, setFormData] = useState<SubscriptionPlan | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (plan) {
      setFormData({
        ...plan,
        monthlyPrice: plan.monthlyPrice !== undefined ? plan.monthlyPrice : plan.price || 0,
        annualPrice: plan.annualPrice !== undefined ? plan.annualPrice : (plan.price ? plan.price * 10 : 0),
        isPublished: plan.isPublished !== undefined ? plan.isPublished : true,
      });
      setNewFeatureText('');
      setValidationError(null);
    }
  }, [plan]);

  if (!isOpen || !formData) return null;

  const handleAddFeature = () => {
    const trimmed = newFeatureText.trim();
    if (!trimmed) return;
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: [...prev.features, trimmed],
      };
    });
    setNewFeatureText('');
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFormData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: prev.features.filter((_, idx) => idx !== indexToRemove),
      };
    });
  };

  const handleFeatureChange = (index: number, value: string) => {
    setFormData((prev) => {
      if (!prev) return prev;
      const updated = [...prev.features];
      updated[index] = value;
      return {
        ...prev,
        features: updated,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Plan name is required.');
      return;
    }
    if (formData.monthlyPrice < 0 || formData.annualPrice < 0) {
      setValidationError('Prices must be positive numbers or zero.');
      return;
    }

    const finalPlan: SubscriptionPlan = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: formData.monthlyPrice, // keep legacy price in sync
      features: formData.features.filter((f) => f.trim().length > 0),
    };

    onSave(finalPlan);
    onClose();
  };

  return (
    <div
      id="edit-plan-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="edit-plan-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#161615] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Edit Subscription Tier: {formData.name}
              </h3>
              <p className="text-xs text-stone-500">
                Configure public pricing, quota entitlements, and feature bullets
              </p>
            </div>
          </div>
          <button
            id="btn-close-edit-plan"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tier Switcher Tabs */}
        {allPlans && allPlans.length > 1 && (
          <div className="px-6 pt-2 pb-0 bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 flex items-center space-x-1.5 overflow-x-auto shrink-0">
            <span className="text-[11px] font-semibold text-stone-400 dark:text-stone-500 mr-1.5 uppercase tracking-wider">
              Select Tier:
            </span>
            {allPlans.map((p) => {
              const isSelected = p.id === formData.id;
              return (
                <button
                  key={p.id}
                  id={`btn-modal-switch-tier-${p.id}`}
                  type="button"
                  onClick={() => {
                    if (onSelectPlan) {
                      onSelectPlan(p);
                    } else {
                      setFormData({
                        ...p,
                        monthlyPrice: p.monthlyPrice !== undefined ? p.monthlyPrice : p.price || 0,
                        annualPrice: p.annualPrice !== undefined ? p.annualPrice : (p.price ? p.price * 10 : 0),
                        isPublished: p.isPublished !== undefined ? p.isPublished : true,
                      });
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'border-amber-500 text-stone-900 dark:text-stone-100 bg-white dark:bg-[#161615] shadow-xs'
                      : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
                  }`}
                >
                  {p.name}
                  {p.monthlyPrice !== undefined && ` ($${p.monthlyPrice}/mo)`}
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {validationError && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
              {validationError}
            </div>
          )}

          {/* Published toggle banner */}
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  Public Visibility
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    formData.isPublished
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {formData.isPublished ? 'Published to Public' : 'Draft / Hidden'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Controls whether this tier is shown on the public Pricing page and Upgrade modals
              </p>
            </div>
            <button
              type="button"
              id="btn-toggle-plan-published"
              onClick={() =>
                setFormData((prev) => (prev ? { ...prev, isPublished: !prev.isPublished } : prev))
              }
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                formData.isPublished
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300'
              }`}
            >
              {formData.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{formData.isPublished ? 'Visible' : 'Hidden'}</span>
            </button>
          </div>

          {/* Row 1: Plan Name & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Plan Display Name
              </label>
              <input
                id="edit-plan-name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pro Mindful"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Badge / Tagline Pill
              </label>
              <input
                id="edit-plan-badge-input"
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. Most Popular, Starter, Teams"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 2: Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Plan Subtitle / Description
            </label>
            <textarea
              id="edit-plan-description-input"
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of who this plan is for..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Row 3: Pricing (Monthly & Annual) */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                Pricing Configuration
              </span>
              <span className="text-[11px] text-stone-500">
                Shown on both Public Pricing Page and Upgrade Modals
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Monthly Billing Rate ($ / month)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-stone-400 text-xs font-bold">$</span>
                  <input
                    id="edit-plan-monthly-price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.monthlyPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyPrice: Number(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-12 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="absolute right-3 text-stone-400 text-[11px]">/ mo</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-400 mb-1">
                  Annual Billing Rate ($ / year)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-stone-400 text-xs font-bold">$</span>
                  <input
                    id="edit-plan-annual-price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.annualPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, annualPrice: Number(e.target.value) || 0 })
                    }
                    className="w-full pl-7 pr-12 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <span className="absolute right-3 text-stone-400 text-[11px]">/ yr</span>
                </div>
              </div>
            </div>

            {formData.annualPrice > 0 && formData.monthlyPrice > 0 && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                &bull; Annual plan equals ${(formData.annualPrice / 12).toFixed(2)}/mo (
                {Math.round((1 - formData.annualPrice / (formData.monthlyPrice * 12)) * 100)}% discount compared to monthly)
              </p>
            )}
          </div>

          {/* Row 4: Entitlement Quotas (AI & Storage) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Gemini AI Quota Label
              </label>
              <input
                id="edit-plan-ai-quota"
                type="text"
                value={formData.geminiQuota}
                onChange={(e) => setFormData({ ...formData, geminiQuota: e.target.value })}
                placeholder="e.g. 25 prompts / day or Unlimited"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Storage &amp; Note Limit Label
              </label>
              <input
                id="edit-plan-storage-limit"
                type="text"
                value={formData.storageLimit}
                onChange={(e) => setFormData({ ...formData, storageLimit: e.target.value })}
                placeholder="e.g. 50 notes or Unlimited"
                className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Row 5: Feature Bullet Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Included Features ({formData.features.length})
              </label>
              <span className="text-[11px] text-stone-500">Rendered on pricing comparison cards</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.features.map((feat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Remove feature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add feature input */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                id="edit-plan-new-feature-input"
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="Add a new feature bullet point..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <button
                type="button"
                id="btn-add-feature-bullet"
                onClick={handleAddFeature}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end space-x-3 bg-stone-50/50 dark:bg-stone-900/50 shrink-0">
          <button
            type="button"
            id="btn-cancel-edit-plan"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-save-plan-changes"
            onClick={handleSubmit}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save &amp; Publish Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
