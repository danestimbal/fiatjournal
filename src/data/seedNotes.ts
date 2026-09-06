import { ReflectionSession } from '../types';

export const INITIAL_SEED_NOTES: Omit<ReflectionSession, 'userId'>[] = [
  {
    id: 'seed-note-1',
    title: 'Phase 2: AralMate Launch & Ecosystem',
    folder: 'Projects',
    tags: ['Projects', 'Notes', 'LMS'],
    isFavorite: true,
    isPinned: true,
    mode: 'reflection',
    createdAt: Date.parse('2026-08-27T10:00:00Z'),
    updatedAt: Date.parse('2026-08-27T14:30:00Z'),
    content: `(Nov 2026 – Jan 2027) ==CREATED AN LMS INSIDE THE GUROHUB PLATFORM==

Focus: **Launch the AralMate student companion platform** and create the connected teacher-to-student ecosystem that no competitor offers.

## 2.1 AralMate Student Platform
- This is a separate platform.
- [x] Build the student-facing course delivery app with PIN-based identification
- [ ] Connect the teacher evaluation engine directly to student progress scores
- [ ] Implement offline-first local cache for audio and lesson handouts
- [ ] Run security penetration testing on student session tokens

### Strategic Value
By bridging asynchronous curriculum modules with live classroom telemetry, instructors save an estimated 6 hours weekly while students gain gamified mastery loops.`,
    turns: [
      {
        id: 'turn-seed-1',
        role: 'user',
        content: 'How should we structure the rollout checklist for AralMate to prevent school network latency issues?',
        timestamp: Date.parse('2026-08-27T14:28:00Z'),
      },
      {
        id: 'turn-seed-2',
        role: 'model',
        content: `### AralMate Deployment & Performance Protocol

| Phase | Milestone | Operational Guardrail |
| :--- | :--- | :--- |
| **1. Edge Caching** | Local asset pre-download | Cache all static assets locally during off-peak morning hours. |
| **2. PIN Auth** | Lightweight token exchange | Restrict payload size to < 2KB per authentication handshake. |
| **3. Offline Sync** | Background queue | Store pending task completions in IndexedDB and batch sync when Wi-Fi reconnects. |`,
        timestamp: Date.parse('2026-08-27T14:30:00Z'),
        modelUsed: 'gemini-3.6-flash',
      },
    ],
  },
  {
    id: 'seed-note-2',
    title: 'Social Media Audit',
    folder: 'Inbox',
    tags: ['Marketing', 'Notes'],
    isFavorite: false,
    mode: 'brainstorm',
    createdAt: Date.parse('2026-08-27T09:15:00Z'),
    updatedAt: Date.parse('2026-08-27T11:45:00Z'),
    content: `Here are the key steps to conduct a social media audit manually:

To conduct the audit manually, you can visit the Facebook page yourself and evaluate it against each step. Here's a quick checklist you can fill out:

### GuroHub Facebook Audit Checklist

| Step | What to Check | Your Notes |
| :--- | :--- | :--- |
| **1. Inventory** | Is this the only/official account? Any duplicates? | Verified official badge active |
| **2. Profile Consistency** | Logo, cover photo, bio, links accurate? | Updated bio links to AralMate |
| **3. Audience** | Follower count, demographics visible? | 42k followers, 68% educators |
| **4. Content Performance** | Likes, shares, comments on recent posts? | Carousel posts lead engagement |
| **5. Posting Frequency** | How often are they posting? Last post date? | 4x weekly schedule |
| **6. Engagement** | Do they reply to comments/messages? | Avg response time < 15 mins |
| **7. Competitors** | How do they compare to similar pages? | Stronger video retention |
| **8. Goals Alignment** | Does content reflect their mission/goals? | Focused on teacher empowerment |
| **9. Findings** | What's working, what isn't? | Reels driving 4x top of funnel |
| **10. Next Steps** | What needs improvement? | Automate weekly webinar registration |`,
    turns: [],
  },
  {
    id: 'seed-note-3',
    title: 'Customer Journey',
    folder: 'Inbox',
    tags: ['Growth', 'Notes'],
    isFavorite: false,
    mode: 'reflection',
    createdAt: Date.parse('2026-08-27T08:00:00Z'),
    updatedAt: Date.parse('2026-08-27T08:45:00Z'),
    content: `Customer sees a Facebook Reel / Ads DAY 1 - Classroom Problem Solver.

## Discovery to Onboarding
1. **Touchpoint 1 (Reel / Short)**: Highlighting 10-second lesson planning using AI templates.
2. **Touchpoint 2 (Landing Page)**: One-click Google Sign-in to personal vault.
3. **Touchpoint 3 (First Win)**: Auto-generating the first interactive class quiz in under 60 seconds.
4. **Touchpoint 4 (Advocacy)**: Exporting student progress reports to share with parents.`,
    turns: [],
  },
  {
    id: 'seed-note-4',
    title: 'Create a Story',
    folder: 'Inbox',
    tags: ['Creative'],
    isFavorite: false,
    mode: 'brainstorm',
    createdAt: Date.parse('2026-08-27T07:20:00Z'),
    updatedAt: Date.parse('2026-08-27T07:55:00Z'),
    content: `create experiences create story inventory.

Focus on the narrative of the modern teacher juggling grading, administration, and student engagement:
- The protagonist: Teacher Maria in a provincial high school.
- The obstacle: Stack of 180 handwritten assignments with 2 hours before parent meetings.
- The catalyst: Discovering the connected digital journal and LMS workflow.
- The transformation: Regaining personal evenings and fostering deeper 1-on-1 mentorship.`,
    turns: [],
  },
  {
    id: 'seed-note-5',
    title: 'Websites to look',
    folder: 'Projects',
    tags: ['Research'],
    isFavorite: false,
    mode: 'reflection',
    createdAt: Date.parse('2026-08-27T06:10:00Z'),
    updatedAt: Date.parse('2026-08-27T06:40:00Z'),
    content: `Research benchmarks and media distribution infrastructure:
- **Railway.com** - Cloud microservices & container deployments
- **bunnystream.com** - Video CDN & video transcoding with low latency
- **Reflective Journaling Frameworks** - Daily introspections, mindful prompts & personal growth systems`,
    turns: [],
  },
  {
    id: 'seed-note-6',
    title: 'Competitive Positioning',
    folder: 'Projects',
    tags: ['Strategy'],
    isFavorite: false,
    mode: 'summary',
    createdAt: Date.parse('2026-08-27T05:30:00Z'),
    updatedAt: Date.parse('2026-08-27T06:05:00Z'),
    content: `The Philippine AI lesson planning market has grown significantly:
- Legacy LMSs are desktop-heavy and require intensive training.
- AralMate & GuroHub provide zero-friction mobile-first micro-tools.
- Differentiation: Direct offline syncing, localized curriculum tags, and an embedded private Gemini reflective partner.`,
    turns: [],
  },
];
