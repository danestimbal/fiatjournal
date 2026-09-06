# Journal & Reflections Web Application

A secure, user-authenticated journaling and reflection platform powered by Google Cloud Run, Cloud Firestore, Firebase Authentication, and the Gemini 3.6 Flash API.

---

## Architecture Overview

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **User Identity** | Firebase Authentication | Federated Google Sign-In with popup client flow; credentials never touched by custom code. |
| **Backend Database** | Cloud Firestore | Isolated document storage where every reflection is strictly scoped to `/users/{userId}/reflections/{reflectionId}`. |
| **AI Processing Engine** | Gemini 3.6 Flash API | Multi-turn conversational reflections, brainstorming partner, and session summarization with resilient fallback ladder. |
| **Backend Service Layer** | Node.js Express & TypeScript | Secure server-side API proxy ensuring the `GEMINI_API_KEY` is never exposed to the client browser. |
| **Secret Management** | Google Cloud Secret Manager | Dynamic runtime credential injection. |

---

## Security Directives & Countermeasures

### 1. Zero Insecure Defaults & Owner-Bound Security Rules
Database reads and writes are restricted exclusively to authenticated users matching their document namespace:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/reflections/{reflectionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 2. Secret Management & Access Control
All communication with Gemini is proxied server-side via `/api/reflect` and `/api/summarize-session`. The client browser never receives or stores the `GEMINI_API_KEY`.

### 3. Model Resilience Fallback Ladder
The Express backend incorporates an automated fallback ladder ordered by availability and latency:
1. `gemini-3.6-flash` (Primary)
2. `gemini-3.1-flash-lite` (High-Availability Fallback)
3. `gemini-flash-latest` (Dynamic Alias)
4. `gemini-3.7-flash` (Deep Reasoning Fallback)

---

## Deployment & Configuration Guide

### 1. Prerequisites
Ensure you have the Google Cloud SDK (`gcloud`) installed and authorized:
```bash
gcloud auth login
gcloud config set project fiatjournal
```

Enable required Google Cloud APIs:
```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com
```

### 2. Secret Manager Bindings
Create and populate the `GEMINI_API_KEY` secret, and grant the Cloud Run runtime service account access:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Obtain your Google Cloud project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant the default Cloud Run service account access to read the secret
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 3. Deploy to Google Cloud Run
Deploy the application using `gcloud run deploy`:

```bash
gcloud run deploy journal-reflections \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 3000
```

### 4. Verification Binding (Campaign Labeling)
Apply the mandatory resource label to register the service for challenge verification:

```bash
gcloud run services update journal-reflections \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## Functional Walkthrough & Test Suite Specification

### Test Case 1: Unauthenticated Landing & Google Sign-In
- **Initial State**: User arrives at the root URL while unauthenticated.
- **Expected Visuals**:
  - Top navigation bar displays the application title and "Sign In with Google" button.
  - Landing hero displays privacy guarantees and 3 feature pillars.
  - No private entries or sidebar entries are exposed.
- **Action**: Click "Continue with Google" or "Sign In with Google".
- **Expected Outcome**: Google Sign-In popup opens; upon approval, auth state resolves, the landing page transitions to the private dashboard, and user profile avatar appears in the top navigation.

### Test Case 2: User Isolation in Cloud Firestore
- **Action**: Authenticate as User A and create a journal entry titled "Personal Goals".
- **Verification**: Entry is saved to `/users/{UserA_UID}/reflections/{id}`.
- **Action**: Sign out and authenticate as User B.
- **Expected Outcome**: User B sees an empty reflection vault; User A's reflections are inaccessible. Security rules reject cross-user document reads.

### Test Case 3: Multi-Turn Conversation with Gemini
- **Action**: Type a reflection prompt: "I am feeling overwhelmed with three competing priorities this week."
- **Action**: Click "Reflect" or press Enter.
- **Expected Outcome**:
  1. The user's input immediately appears in the conversation stream and persists to Firestore.
  2. Gemini reflection indicator displays ("Gemini 3.6 Flash is reflecting...").
  3. Gemini returns a structured markdown response with empathetic questions and actionable framing.
  4. Response displays model badge (`gemini-3.6-flash`) and persists to Firestore without data loss.

### Test Case 4: Brainstorming & Mode Switching
- **Action**: Select the "Brainstorm" mode pill in the top bar.
- **Action**: Enter "Brainstorm 4 creative experiments to test a new habit tracker."
- **Action**: Click "Reflect".
- **Expected Outcome**: System instruction adjusts tone to divergent, creative brainstorming. Gemini returns innovative proposals formatted with bullet points.

### Test Case 5: Session Summarization & Synthesis
- **Action**: With 2 or more conversational turns in the session, click "Summarize Session".
- **Expected Outcome**:
  1. The server calls `/api/summarize-session`.
  2. A stylized amber synthesis card appears above the conversation stream containing:
     - A synthesized 2-3 sentence executive summary.
     - Extracted key takeaways/insights.
     - Auto-updated concise session title.
  3. Session is saved to Firestore.

### Test Case 6: Input Protection & Error Escalation
- **Action**: Submit an input during a simulated network interruption.
- **Expected Outcome**:
  1. An accessible error banner appears with a "Retry Save" button.
  2. The user's typed reflection remains intact and is not lost or wiped.
  3. Clicking "Retry Save" attempts persistence again.

### Test Case 7: Session History & Search
- **Action**: Create 3 different sessions with distinct titles and topics.
- **Action**: In the search bar on the left sidebar, type a keyword from one session.
- **Expected Outcome**: Sidebar filters in real time to show only matching sessions. Clicking any session smoothly loads its full history into the main workspace.
