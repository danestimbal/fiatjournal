# Fiat Journal — Mindful Reflection & Knowledge Sanctuary
> **An Obsidian-Inspired Markdown Vault Powered by Google Gemini, Firebase, and Cloud Run**

---

## 1. Executive Summary & Vision

**Fiat Journal** is a contemplative, distraction-free personal knowledge management sanctuary and journaling workspace. Inspired by the principles of Obsidian, it combines minimalist GitHub Flavored Markdown (GFM) authoring with an intelligent Socratic AI Co-pilot powered by Google Gemini.

Designed for thinkers, writers, engineers, and mindfulness practitioners, Fiat Journal provides structured mental frameworks, an organized hierarchical vault, resilient multi-format export capabilities, and seamless cross-device synchronization with zero-knowledge local caching.

---

## 2. Core Architecture & Technology Stack

| Layer | Technology | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite + TypeScript | High-performance single-page app with reactive state management. |
| **Styling & Design System**| Tailwind CSS | High-contrast, mathematically balanced light & dark themes. |
| **Icons & Visual Language** | Lucide React | Clean, scalable vector iconography for intuitive navigation. |
| **Archival & Compression** | JSZip | Client-side, streamed asynchronous ZIP packaging for vault backups. |
| **Authentication** | Firebase Authentication | Secure Google SSO & federated identity; zero local password storage. |
| **Database & Persistence** | Cloud Firestore | Real-time multi-device document store with owner-bound security rules. |
| **Compute & Deployment** | Google Cloud Run | Stateless containerized hosting with auto-scaling and reverse proxy. |
| **Artificial Intelligence**| Google Gemini API (`@google/genai`) | Multi-tier resilient Socratic reflection co-pilot with prompt insertion. |

---

## 3. Comprehensive Feature Matrix

### 3.1 Three-Pane Obsidian Workspace
- **Pane 1: Vault Navigator**:
  - Hierarchical folder navigation (`Inbox`, `Notes`, `Projects`, `Archive`, `Trash`).
  - Custom folder creation, renaming, and safe deletion.
  - One-click Vault Backup archive button (`.zip`).
  - Real-time tier quota tracker displaying note consumption against the 50-note Free tier cap.
- **Pane 2: Note List**:
  - Instant full-text search across titles, markdown content, and tags.
  - Filter by folder, pinned notes, and favorites.
  - Swipe actions on touch devices for quick pinning, favoriting, or archiving.
- **Pane 3: Markdown Editor & Live Preview**:
  - Raw and split-screen markdown editing with instant rendering.
  - Interactive GFM task checkboxes (`[ ]` and `[x]`).
  - Live character, word, and estimated reading time counters.
  - Focus mode and distraction-free editing toggles.

### 3.2 Reflection Frameworks & Templates
When initiating a new journal entry, the **Journal Template Modal** prompts the user to select from curated reflection frameworks:
1. **Daily Mindfulness & Gratitude Anchor**:
   - Morning intention setting and presence anchor.
   - Energy check-in (1–10 scale).
   - Three points of gratitude.
   - Essential daily priorities (the vital few).
   - Freeform stream-of-consciousness writing area.
   - Evening reflection and closure realization.
2. **Decision & Problem-Solving Matrix**:
   - Core problem/dilemma framing.
   - Desired outcomes, non-negotiables, and decision deadlines.
   - Multi-option analysis with upside, downside risks, and second-order consequences.
   - Pre-mortem blind spot identification and preemptive mitigation.
   - Decisive resolution with a concrete 48-hour action step.
3. **Weekly Retrospective & Continuous Growth**:
   - Momentum highlights and celebrated victories.
   - Friction, bottlenecks, and energy drain diagnostics.
   - Life and craft calibration (Mind, Craft, Relationships).
   - Core insight synthesis.
   - Next week's 3 major priority commitments.
4. **Blank Journal Entry**:
   - Clean canvas for unstructured, spontaneous writing.

### 3.3 Multi-Format Export Suite
- **Raw Markdown (`.md`)**: Direct client-side blob download available across all tiers.
- **Standalone Styled HTML (`.html`)**: Complete standalone HTML article formatted with responsive typography, dark mode styles, and task checkboxes (Pro/Team).
- **Printable PDF Engine (`.pdf`)**: Native paginated print stylesheet with isolated page breaks and headers (Pro/Team).
- **Complete Vault Archive (`.zip`)**: Client-side compressed archive packaging all notes organized into their respective folder subdirectories (Pro/Team).

### 3.4 Subscription Tiers & Feature Gating
- **Free Sanctuary**:
  - Up to 50 active notes with cloud sync.
  - 25 daily Gemini AI reflection queries.
  - Raw Markdown export.
  - Full access to all 3 journaling templates.
- **Pro Mindful Plan**:
  - Unlimited notes and folder hierarchies.
  - Unlimited Gemini 3 reflection co-pilot queries.
  - Styled HTML, Printable PDF, and Complete Vault ZIP exports.
  - Multi-user collaborator sharing with viewer/editor permissions.
  - Offline local sync and priority support.
- **Team Sanctuary Plan**:
  - Shared organization vaults, team roles, and administrative controls.

### 3.5 Administration & Helpdesk
- **Admin Console**: Super-admin interface for reviewing tenant user accounts, managing subscription statuses, toggling system maintenance modes, and broadcasting in-app announcement banners.
- **Support Hub**: In-app ticketing system allowing users to file bug reports or support queries directly to administrators.

---

## 4. How We Leverage Cloud & AI Services

### 4.1 Firebase Authentication
- **Federated Google Sign-In**: Authentication is delegated to Google Identity Services through Firebase Auth client popups. The app never captures, transmits, or stores user passwords, completely eliminating password-related attack vectors.
- **Identity Context**: Authenticated tokens deliver cryptographically verified `uid`, `email`, and `displayName` values that directly scope database read/write permissions.
- **Guest Fallback**: Visitors can immediately use the workspace in local guest mode; their work is stored in browser state and seamlessly migrates upon signing in.

### 4.2 Cloud Firestore
- **Document Model**:
  ```
  /users/{userId}/interactions/{interactionId}
  /users/{userId}/folders/{folderId}
  /support_tickets/{ticketId}
  /system_announcements/{announcementId}
  ```
- **Zero-Crash Payload Hygiene**: To ensure bulletproof transactions, all payloads sent to `saveReflectionSession` undergo strict undefined-stripping prior to invoking Firestore's `setDoc`/`updateDoc` methods.
- **Owner-Bound Security Rules (`firestore.rules`)**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /users/{userId}/folders/{folderId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /support_tickets/{ticketId} {
        allow create: if request.auth != null;
        allow read: if request.auth != null && (request.auth.uid == resource.data.userId || request.auth.token.role == 'admin');
      }
    }
  }
  ```

### 4.3 Google Cloud Run
- **Unified Full-Stack Deployment**: The React frontend bundle and Node.js backend proxy run as a single container image deployed on Google Cloud Run.
- **Stateless Compute**: Automatically scales from zero instances during inactivity up to handle concurrent traffic spikes, ensuring optimal resource utilization.
- **Strict Ingress & Port Mapping**: All external traffic is routed through Cloud Run ingress to port `3000`, cleanly isolating `/api/*` backend routes from frontend static asset serving.
- **Google Cloud Secret Manager Integration**: Production runtime secrets (such as the Gemini API key) are stored in Secret Manager and injected securely as environment variables during container launch.

### 4.4 Google Gemini API (`@google/genai`)
- **Resilient 4-Tier Fallback Ladder**:
  To guarantee unbroken uptime even during high traffic or regional availability disruptions, AI reflection requests execute through an automated fallback ladder:
  1. `gemini-3.6-flash` (Primary — rapid latency, optimized for real-time interaction)
  2. `gemini-3.1-flash-lite` (High-Availability Fallback)
  3. `gemini-flash-latest` (Dynamic Alias)
  4. `gemini-3.7-flash` (Deep Reasoning Fallback)
- **Error Recovery Matrix**: Catches recoverable HTTP errors (`429`, `503`, `500`) and sequentially steps down the fallback ladder before surfacing any error to the user interface.
- **Socratic Thinking Partner**: System instructions guide Gemini to act not as an intrusive content generator, but as a thoughtful Socratic thinking partner—posing reflective questions, identifying cognitive biases, and highlighting patterns across journal entries.
- **1-Click Insertion Workflow**: Any insight or reflection generated in the Co-pilot can be appended directly into the active note body as formatted markdown with a single click.

---

## 5. Security & Threat Modeling Matrix

| Threat Zone | Potential Vulnerability | Implemented Mitigation |
| :--- | :--- | :--- |
| **Input Surfaces** | Malicious script or prompt injection in notes or export files. | Strict input sanitization; note content is rendered as data, never executed as raw scripts. |
| **Planning & Reasoning**| API quota abuse or subscription limit bypass. | Tier quota validation in `tierLimits.ts` enforced both on the client and in backend handlers. |
| **Tool Execution** | Client-side memory exhaustion during large vault ZIP compression. | Streamed asynchronous compression using JSZip with defensive size checks and memory limits. |
| **Memory & State** | Cross-tenant document read/write leakage in Firestore. | Owner-bound path security rules (`request.auth.uid == userId`) isolating all user collections. |
| **Inter-System Communication** | Leakage of API keys or service credentials to browser bundles. | Server-side API proxy on Cloud Run; Gemini API keys are never exposed to client-side bundles. |

---

*Generated for Fiat Journal • Built with Google AI Studio, Cloud Run, Firebase, and Gemini.*
