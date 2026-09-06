import React, { useState } from 'react';
import {
  Shield,
  Lock,
  FileText,
  Printer,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../../types';

interface TermsPageProps {
  currentUser?: UserProfile | null;
  onBack: () => void;
  onOpenContact?: () => void;
  isAdmin?: boolean;
  onOpenAdminTerms?: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({
  currentUser = null,
  onBack,
  onOpenContact,
  isAdmin = false,
  onOpenAdminTerms,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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

        <div className="flex items-center space-x-2">
          {isAdmin && onOpenAdminTerms && (
            <button
              onClick={onOpenAdminTerms}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Policy Editor</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="px-3 py-1 rounded-md border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {copied ? 'Link Copied!' : 'Copy Link'}
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Legal Content Container */}
      <div className="max-w-4xl mx-auto px-6 pt-12 sm:pt-16">
        {/* Document Header */}
        <div className="border-b border-stone-200 dark:border-stone-800 pb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium mb-4">
            <FileText className="w-3.5 h-3.5 text-stone-500" />
            <span>Legal Covenant &amp; Ethical Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-50">
            Terms of Service &amp; Data Sanctuary
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Effective Date: September 1, 2026
            </span>
            <span>&bull;</span>
            <span>Version 2.4</span>
            <span>&bull;</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Zero-AI-Training Certified
            </span>
          </div>
        </div>

        {/* Ethical Highlights Box */}
        <div className="my-8 p-5 rounded-2xl bg-[#F7F9F7] dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 flex items-start space-x-4">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-200">
              The Fiat Journal Sanctity Pledge
            </h3>
            <p className="text-xs text-emerald-900/90 dark:text-emerald-300/80 mt-1 leading-relaxed">
              We believe a journal is the most sacred personal space in modern life. Unlike standard
              cloud notes apps, Fiat Journal is architected around strict cryptographic isolation,
              zero tracking algorithms, and a solemn guarantee that your personal reflections will
              never be used to train AI models.
            </p>
          </div>
        </div>

        {/* Clauses Body */}
        <div className="space-y-10 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              1. Acceptance of Terms &amp; Purpose
            </h2>
            <p>
              By accessing, creating an account with, or utilizing Fiat Journal (&ldquo;the
              Service&rdquo;), you agree to be bound by these Terms of Service. If you are entering
              into these terms on behalf of a team or educational institution, you confirm that you
              have full authority to bind that entity.
            </p>
            <p>
              Fiat Journal provides a minimalist, distraction-free markdown canvas and cognitive
              reflection partner powered by Google Cloud Firestore and the Gemini API. The Service is
              dedicated exclusively to reflective writing, personal self-discovery, and mindful
              productivity.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              2. Absolute Data Ownership &amp; Zero AI Training
            </h2>
            <div className="p-4 rounded-xl bg-stone-100/70 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-stone-900 dark:text-stone-100">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Zero-Data Retention &amp; No Model Training Guarantee</span>
              </div>
              <p className="text-xs">
                You retain 100% ownership of all reflections, markdown documents, attachments, and
                metadata you compose within Fiat Journal. We do not claim any copyright, license, or
                ownership over your words.
              </p>
              <p className="text-xs">
                When you choose to engage the Gemini Co-pilot, your active note context is passed to
                our server-side API proxy strictly for real-time generative reflection. All requests
                execute with zero data logging for model training. Google and Fiat Journal do not
                retain, index, or use your private notes to train foundation models.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              3. Architectural Security &amp; Isolation
            </h2>
            <p>
              Fiat Journal implements database-level isolation. Each user profile, note collection,
              and interaction turn is stored under an owner-bound path in Cloud Firestore (e.g.,{' '}
              <code className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs">
                /users/&#123;userId&#125;/reflections/&#123;reflectionId&#125;
              </code>
              ).
            </p>
            <p>
              Firestore security rules enforce that only the authenticated user matching{' '}
              <code className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono text-xs">
                request.auth.uid == userId
              </code>{' '}
              or explicitly authorized collaborators may read or write documents.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              4. Subscriptions, Billing &amp; 30-Day Guarantee
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Free Sanctuary:</strong> Provided at no monetary charge with generous note
                capacity and daily AI reflections for personal journaling.
              </li>
              <li>
                <strong>Pro Mindful &amp; Team Sanctuary:</strong> Billed on either a monthly or
                discounted annual cadence. Subscriptions automatically renew unless canceled prior
                to the renewal date.
              </li>
              <li>
                <strong>30-Day Money-Back Guarantee:</strong> If you are not completely satisfied with
                your Pro or Team subscription within the first 30 days of purchase, contact{' '}
                <a href="mailto:billing@fiat.app" className="underline hover:text-stone-900">
                  billing@fiat.app
                </a>{' '}
                for a prompt, no-questions-asked refund.
              </li>
              <li>
                <strong>Cancellations:</strong> You may cancel or downgrade at any time via your user
                dashboard. Your premium features will remain active until the conclusion of the
                billed period.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              5. Data Portability &amp; No Vendor Lock-in
            </h2>
            <p>
              We believe your thoughts should never be trapped in a proprietary walled garden. You
              may export your complete vault at any time in open, industry-standard Markdown (.md)
              format, as well as rendered PDF or Obsidian-ready folder archives.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              6. Acceptable Use Policy
            </h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Deploy automated scraping, denial-of-service bots, or reverse-engineer the API proxy.</li>
              <li>Store or distribute malicious payloads, viruses, or unlawful material.</li>
              <li>Attempt to bypass Firestore security rules or access other tenants&apos; data.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              7. Account Deletion &amp; Permanent Purge
            </h2>
            <p>
              You have the right to be forgotten. Requesting account deletion triggers an automated
              purge of your user record, reflection documents, AI interactions, and support history
              from Cloud Firestore within 7 business days.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              8. Contact &amp; Legal Notices
            </h2>
            <p>
              For legal inquiries, privacy concerns, or security disclosures, please reach our
              governance team at:
            </p>
            <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
              <p className="font-semibold text-stone-900 dark:text-stone-100">
                Fiat Journal Sanctuary Trust &amp; Governance
              </p>
              <p className="text-stone-600 dark:text-stone-400 mt-1">
                Email:{' '}
                <a href="mailto:legal@fiat.app" className="underline hover:text-stone-900 dark:hover:text-stone-200">
                  legal@fiat.app
                </a>{' '}
                &bull; Security:{' '}
                <a href="mailto:security@fiat.app" className="underline hover:text-stone-900 dark:hover:text-stone-200">
                  security@fiat.app
                </a>
              </p>
              <p className="text-stone-500 mt-0.5">Sanctuary Operations &bull; Global Digital Rights</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
