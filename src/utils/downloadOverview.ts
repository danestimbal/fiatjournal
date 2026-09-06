/**
 * Utility to download the Fiat Journal Architecture & Features specification
 * as a Markdown (.md) file directly in the user's browser.
 */
export function downloadAppOverviewMd(): void {
  // First try fetching the static file; fallback to embedded text if fetch is blocked
  fetch('/fiat-journal-overview.md')
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.text();
    })
    .then((text) => {
      triggerBlobDownload(text, 'Fiat-Journal-Architecture-and-Features.md');
    })
    .catch((err) => {
      console.warn('Direct fetch failed, falling back to static generation:', err);
      const fallbackText = getEmbeddedOverviewMarkdown();
      triggerBlobDownload(fallbackText, 'Fiat-Journal-Architecture-and-Features.md');
    });
}

function triggerBlobDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getEmbeddedOverviewMarkdown(): string {
  return `# Fiat Journal — Mindful Reflection & Knowledge Sanctuary
> **An Obsidian-Inspired Markdown Vault Powered by Google Gemini, Firebase, and Cloud Run**

---

## 1. Executive Summary & Vision
Fiat Journal is a contemplative, distraction-free personal knowledge management sanctuary and journaling workspace. Inspired by the principles of Obsidian, it combines minimalist GitHub Flavored Markdown (GFM) authoring with an intelligent Socratic AI Co-pilot powered by Google Gemini.

## 2. Core Architecture & Technology Stack
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Iconography: Lucide React
- Compression: JSZip (Client-side async ZIP packaging)
- Authentication: Firebase Auth (Google Sign-In & federated SSO)
- Database: Cloud Firestore (User-isolated collections & real-time sync)
- Compute: Google Cloud Run (Containerized single-port 3000 deployment)
- Artificial Intelligence: Google Gemini API (@google/genai)

## 3. Comprehensive Feature Matrix
- 3-Pane Obsidian Layout (Vault Navigator, Searchable Notes List, Markdown Editor & Live Preview)
- 3 Guided Reflection Frameworks (Daily Mindfulness & Gratitude, Decision & Problem-Solving Matrix, Weekly Retrospective & Continuous Growth) plus Blank Slate
- Multi-Format Export Engine (Raw Markdown .md, Standalone Styled HTML .html, Paginated PDF .pdf, Complete Vault ZIP .zip)
- Storage & Tier Limits (Free Sanctuary 50-note cap & 25 daily AI calls, Pro Mindful unlimited notes & exports)
- Admin Console & Integrated Support Helpdesk

## 4. How We Leverage Cloud & AI Services
- Firebase Authentication: Federated Google SSO, zero custom password storage, cryptographic token binding.
- Cloud Firestore: Path-bound documents (/users/{userId}/interactions/{interactionId}), zero-crash payload hygiene (stripping undefined), owner security rules.
- Google Cloud Run: Unified container deployment, auto-scaling to zero, reverse proxy on port 3000, Secret Manager integration.
- Google Gemini: 4-tier model fallback ladder (gemini-3.6-flash -> gemini-3.1-flash-lite -> gemini-flash-latest -> gemini-3.7-flash), Socratic prompts, 1-click markdown note insertion.

---
*Generated for Fiat Journal*
`;
}
