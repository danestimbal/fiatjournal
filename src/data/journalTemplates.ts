export interface JournalTemplate {
  id: string;
  name: string;
  tagline: string;
  category: 'Daily' | 'Decisions' | 'Weekly' | 'Custom';
  icon: 'sun' | 'compass' | 'calendar' | 'file-text';
  accentColor: string; // Tailwind color classes for badges/accents
  defaultTitle: (dateStr: string) => string;
  defaultFolder: string;
  tags: string[];
  description: string;
  content: (dateStr: string) => string;
}

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'daily-mindfulness',
    name: 'Daily Mindfulness & Gratitude',
    tagline: 'Morning intention, three gratitude anchors, focus priorities, and evening closure.',
    category: 'Daily',
    icon: 'sun',
    accentColor: 'amber',
    defaultTitle: (dateStr) => `Daily Mindfulness — ${dateStr}`,
    defaultFolder: 'Inbox',
    tags: ['Daily', 'Mindfulness', 'Gratitude'],
    description: 'A scientifically grounded ritual to begin your morning with presence and close your evening with gratitude.',
    content: (dateStr) => `# Daily Mindfulness & Gratitude Anchor
*Date:* ${dateStr} | *Presence:* 🧘 Calm & Centered

---

### 🌅 Morning Grounding
- **One Intention for Today:** 
- **Energy Level (1-10):** 
- **Mindful Check-in:** *How does my mind and body feel right now?*

### 🙏 Three Points of Gratitude
1. 
2. 
3. 

### 🎯 Essential Priorities (The Vital Few)
- [ ] **Primary Focus (Must Accomplish):** 
- [ ] **Secondary Priority:** 
- [ ] **Act of Kindness or Mindful Connection:** 

### 🌿 Space for Freeform Thoughts
> "Between stimulus and response there is a space. In that space is our power to choose our response." — Viktor Frankl

*Write freely without judgment...*


---

### 🌙 Evening Reflection & Closure
- **What went well today?** 
- **What challenged me, and how did I respond?** 
- **One realization or learning to carry forward:** 
`,
  },
  {
    id: 'decision-matrix',
    name: 'Decision & Problem-Solving Matrix',
    tagline: 'Dissect dilemmas, analyze second-order effects, expose blind spots, and commit to action.',
    category: 'Decisions',
    icon: 'compass',
    accentColor: 'indigo',
    defaultTitle: (dateStr) => `Decision Matrix — ${dateStr}`,
    defaultFolder: 'Projects',
    tags: ['Decision', 'Strategy', 'Problem-Solving'],
    description: 'A structured mental model framework to eliminate paralysis, weigh risks, and make clear choices under uncertainty.',
    content: (dateStr) => `# Structured Decision & Problem-Solving Matrix
*Created:* ${dateStr} | *Status:* In Evaluation 🧭

---

### 🔍 1. The Core Problem or Dilemma
*Define the decision concisely. What is the fundamental choice or challenge?*

> 

### 🎯 2. Desired Outcomes & Constraints
- **What does optimal success look like?** 
- **Non-Negotiables (Budget, Ethics, Time, Health):** 
- **Hard Decision Deadline:** 

### ⚖️ 3. Exploration of Alternatives

#### Option A: [Option Name]
- **Pros & Direct Upside:** 
- **Cons & Downside Risks:** 
- **Second-Order Consequences (3–6 months out):** 

#### Option B: [Option Name]
- **Pros & Direct Upside:** 
- **Cons & Downside Risks:** 
- **Second-Order Consequences (3–6 months out):** 

### 🛡️ 4. Pre-Mortem & Blind Spots
*Imagine it is 6 months from now and this decision proved to be a failure. Why did it happen?*
- **Potential Blind Spot:** 
- **Preemptive Safeguard:** 

### 🚀 5. Resolution & 48-Hour Action Step
- **Selected Direction:** 
- **First 48-Hour Step:** 
  - [ ] 
`,
  },
  {
    id: 'weekly-retrospective',
    name: 'Weekly Retrospective & Growth',
    tagline: 'Celebrate victories, diagnose friction, calibrate energy, and set next week\'s big rocks.',
    category: 'Weekly',
    icon: 'calendar',
    accentColor: 'emerald',
    defaultTitle: (dateStr) => `Weekly Retrospective — Week of ${dateStr}`,
    defaultFolder: 'Notes',
    tags: ['Weekly', 'Retrospective', 'Growth'],
    description: 'Weekly checkpoint to reflect on energy, celebrate wins, extract lessons from setbacks, and align priorities.',
    content: (dateStr) => `# Weekly Retrospective & Continuous Growth
*Week of:* ${dateStr} | *Review Cycle:* End-of-Week Calibration 📈

---

### 🏆 1. Highlights & Victories
*What gave me momentum, joy, or satisfaction this week?*
- 
- 
- 

### 🌊 2. Friction, Bottlenecks & Energy Drains
*Where was energy lost or progress stalled? What contributed to it?*
- **What went off course:** 
- **Root cause:** 
- **Correction for next week:** 

### 📊 3. Life & Craft Calibration
- [ ] **Mind & Health (Sleep, Movement, Stillness):** 
- [ ] **Craft & High-Impact Work:** 
- [ ] **Relationships & Presence:** 

### 💡 4. Core Insight of the Week
> The single most valuable lesson I learned this week: 

### 🎯 5. Next Week's 3 Big Rocks
1. [ ] 
2. [ ] 
3. [ ] 
`,
  },
];
