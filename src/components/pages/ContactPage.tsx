import React, { useState } from 'react';
import {
  Mail,
  Send,
  MessageSquare,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building,
  Sparkles,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { UserProfile, ContactSubmission } from '../../types';
import { submitContactForm } from '../../lib/firebase';

interface ContactPageProps {
  currentUser: UserProfile | null;
  onBack: () => void;
  isAdmin?: boolean;
  onOpenAdminContact?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  currentUser,
  onBack,
  isAdmin = false,
  onOpenAdminContact,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    category: 'general' as ContactSubmission['category'],
    priority: 'normal' as ContactSubmission['priority'],
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<ContactSubmission | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim() || 'General Inquiry',
        category: formData.category,
        priority: formData.priority,
        message: formData.message.trim(),
      });
      setSubmittedRecord(record);
    } catch (err: any) {
      setErrorMessage('Failed to transmit message. Please try again or reach support@fiat.app.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedRecord(null);
    setFormData({
      name: currentUser?.displayName || '',
      email: currentUser?.email || '',
      subject: '',
      category: 'general',
      priority: 'normal',
      message: '',
    });
  };

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
          {isAdmin && onOpenAdminContact && (
            <button
              onClick={onOpenAdminContact}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Inbound Inquiries</span>
            </button>
          )}

          <a
            href="mailto:support@fiat.app"
            className="px-3 py-1 rounded-md border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Direct Email
          </a>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-6 pt-12 sm:pt-16">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
            <span>Connect with the Sanctuary Team</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 dark:text-stone-50 leading-[1.15]">
            How Can We Assist Your Journey?
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed">
            Whether you are exploring Team Workspaces, have questions regarding mindful reflection, or
            need technical support, our sanctuary team is here to help.
          </p>
        </div>

        {/* Content Layout: Contact Channels + Form */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Channels & SLA */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 shadow-xs space-y-5">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Direct Contact Inboxes
              </h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      Customer &amp; Technical Support
                    </span>
                    <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                      For general questions, bug reports, and account help:
                    </p>
                    <a
                      href="mailto:support@fiat.app"
                      className="text-stone-800 dark:text-stone-200 font-medium underline mt-0.5 block"
                    >
                      support@fiat.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-amber-100/70 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      Enterprise &amp; Institutional Teams
                    </span>
                    <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                      For team licenses, custom domains, and educational pilots:
                    </p>
                    <a
                      href="mailto:enterprise@fiat.app"
                      className="text-amber-800 dark:text-amber-300 font-medium underline mt-0.5 block"
                    >
                      enterprise@fiat.app
                    </a>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      Security &amp; Ethical Governance
                    </span>
                    <p className="text-stone-500 dark:text-stone-400 mt-0.5">
                      For responsible disclosure and privacy inquiries:
                    </p>
                    <a
                      href="mailto:security@fiat.app"
                      className="text-emerald-800 dark:text-emerald-300 font-medium underline mt-0.5 block"
                    >
                      security@fiat.app
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SLA Box */}
            <div className="p-6 rounded-2xl bg-[#F7F7F5] dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-xs space-y-3">
              <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-semibold">
                <Clock className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                <span>Response Time Pledge</span>
              </div>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                We respect your time as deeply as we respect your focus.
              </p>
              <ul className="space-y-1.5 text-stone-600 dark:text-stone-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Pro &amp; Team Tiers:</strong> Dedicated response within 4 hours
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Free Sanctuary Tier:</strong> Comprehensive response within 24 hours
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Interactive Form or Success State */}
          <div className="lg:col-span-7">
            {submittedRecord ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 shadow-md text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    Message Delivered to Sanctuary
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 max-w-md mx-auto">
                    Thank you, {submittedRecord.name}. Our team has received your message and will
                    respond to{' '}
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {submittedRecord.email}
                    </span>{' '}
                    shortly.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-mono text-stone-600 dark:text-stone-400 inline-block">
                  Reference ID: <span className="font-bold text-stone-900 dark:text-stone-100">{submittedRecord.id}</span>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleResetForm}
                    className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                  >
                    Send Another Inquiry
                  </button>
                  <button
                    onClick={onBack}
                    className="px-5 py-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-semibold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
                  >
                    Return to Workspace
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-7 sm:p-8 rounded-2xl bg-white dark:bg-[#181816] border border-stone-200 dark:border-stone-800 shadow-sm">
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-1">
                  Send a Message
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
                  Fill in the details below and we will get back to you promptly.
                </p>

                {errorMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Elena Rostova"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@organization.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: e.target.value as ContactSubmission['category'],
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400 cursor-pointer"
                      >
                        <option value="general">General Question</option>
                        <option value="partnership">Institutional Partnership</option>
                        <option value="support">Technical &amp; Billing Help</option>
                        <option value="enterprise">Enterprise Team Workspaces</option>
                        <option value="press">Press &amp; Media</option>
                        <option value="security">Security Disclosure</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            priority: e.target.value as ContactSubmission['priority'],
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400 cursor-pointer"
                      >
                        <option value="low">Standard / Low</option>
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent / Time-Sensitive</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of your inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                      Your Message *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe how we can assist you..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-stone-400 resize-y"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-stone-200 text-stone-50 dark:text-stone-900 text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Transmitting Message...</span>
                      ) : (
                        <>
                          <span>Transmit Message to Sanctuary</span>
                          <Send className="w-3.5 h-3.5 ml-1" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
