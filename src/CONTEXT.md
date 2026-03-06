# BAM Coaches Platform — Project Context

## What is BAM?
By Any Means (BAM) is a multi-entity basketball and business organization founded by Coleman Ayers. The BAM Coaches Platform is a private, membership-based web app for basketball coaches — a structured learning environment with drills, insights, practice planning tools, X&O breakdowns, masterclasses, and a global coach community.

**Membership:** $39.99/month
**Built by:** Coleman Ayers + 15+ BAM coaches working with 1,000+ players/year across 35+ countries

## Organization Structure
- **BAM Basketball** — Player development programs (Virtual Academy, Summer Academy, ADAPT Global AAU)
- **BAM Coaches** — Certification and mentorship program for coaches (this platform)
- **BAM Business** — Services arm (Content Accelerator, Scaling System, Business Blueprint, consulting)

---

## Platform Positioning

> "BAM Coaches Platform is a private community and resource hub for coaches focused on improving players and teams in real training environments."

**Problems it solves:**
- Coaches feeling disconnected from like-minded coaches globally
- Coaches feeling stuck designing drills, games, workouts, practices
- No central hub for modern basketball coaching insight

**Approach:** Balanced — not dogmatic. Draws from modern skill acquisition, ecological dynamics, constraints-led approach, AND traditional methods. Practical above all.

**Who it's for:** Skills trainers, team coaches (youth/HS/college/pro), academy coaches, coaches new to modern concepts, coaches already deep in it.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React (Create React App) |
| Styling | Inline styles only — no Tailwind, no CSS frameworks |
| Icons | lucide-react |
| Fonts | Bebas Neue (headers), DM Sans (body) via Google Fonts |
| Repo | github.com/coleman-ayers/bam-coaches |
| Hosting | Vercel (via Cam's team account) |
| Backend (planned) | Supabase — auth, database, file storage, realtime |
| Video (planned) | Mux |
| Payments (planned) | Stripe |

---

## Design Tokens (never change without discussion)

```js
const C = {
  bg:         "#080808",
  bgCard:     "#0e0e0e",
  bgHover:    "#131313",
  bgElevated: "#161616",
  border:     "#1e1e1e",
  borderMid:  "#282828",
  gold:       "#E2DD9F",   // PRIMARY ACCENT — all active/highlight states
  goldDim:    "rgba(226,221,159,0.10)",
  goldGlow:   "rgba(226,221,159,0.04)",
  goldMid:    "rgba(226,221,159,0.45)",
  text:       "#F5F0E8",   // warm white — primary text
  textMid:    "#9A9488",   // secondary text
  textDim:    "#4A4840",   // muted/labels
  green:      "#6DBF8A",
  greenDim:   "rgba(109,191,138,0.12)",
  blue:       "#7AABCF",
  blueDim:    "rgba(122,171,207,0.12)",
  red:        "#CF7A7A",
  redDim:     "rgba(207,122,122,0.12)",
};
const GOLD = "#E2DD9F";
```

---

## Navigation Structure

**Sidebar** (left, 226px) + **Top Bar** (54px)

- Dashboard
- Community
- **TOOLBOX**
  - Player Development → Drills & Games, Insights
  - Team Coaching → Drills & Games, Insights, X & O Breakdowns
- Practice Plans
- Masterclasses
- Full Workouts
- Playbook Builder

---

## What's Built (v20)

- ✅ Full dashboard UI — sidebar, topbar, layout shell
- ✅ Community feed — posts, likes, comments, prompt tags, leaderboard
- ✅ Player Development — Drills & Games (filterable), Insights
- ✅ Team Coaching — Drills & Games, Insights, X & O Breakdowns
- ✅ Practice Plan builder — drag-and-drop blocks, timeline view
- ✅ Masterclasses page
- ✅ Full Workouts page
- ✅ Playbook Builder — canvas, drag players/ball, screen tool, sticky ball logic
- ✅ Drill detail panel — video placeholder, key points, heart favorite, share
- ✅ Loading screen with BAM branding
- ✅ Light/dark mode toggle
- ✅ Membership tier badge (Max Plan)

---

## What's NOT Built Yet

- ❌ User authentication (login/signup)
- ❌ Real database — all data is currently hardcoded mock data
- ❌ Video hosting and playback (Mux)
- ❌ Real community posts and interactions
- ❌ Payment and subscription management (Stripe)
- ❌ Coach certification tracking
- ❌ Notifications / messaging
- ❌ Admin panel for content management
- ❌ Mobile app

---

## Immediate Build Priorities

1. **Supabase setup** — auth (login/signup for coaches)
2. **Real data layer** — replace mock data with Supabase DB
3. **Community features** — real posts, likes, comments
4. **Video integration** — Mux for drills and masterclasses
5. **Payments** — Stripe subscription management

---

## Community Engine (Weekly Prompts)

Baked-in weekly conversation starters:
- **Monday** — "Drop a clip or describe a moment you want feedback on"
- **Wednesday** — "Wins Wednesday — any small wins this past week?"
- **Thursday** — "Drop a drill/video from this week"
- **Saturday** — "Problem of the Week — what are you trying to solve?"

Post tag colors:
- Wins → green `#6DBF8A`
- Problem → red `#CF7A7A`
- Drill Drop → gold `#E2DD9F`
- Feedback → blue `#7AABCF`
- Question → warm grey

---

## PD Insights — Special Rules

Content includes short-form frameworks, session design concepts, communication insights, and mini-quizzes. All PD Insights should have a subtle upsell nudge toward the **Coaches Certification**. These are teasers — not full lessons. Should feel like "there's more to this."

---

## Drill Library Filter System

Each drill library page needs:
- **Skill** (Finishing, Ball Handling, Defense, Spacing, Transition, Shooting)
- **Type** (On-Air / Constraint Drill / Small-Sided Game)
- **Level** (Beginner / Intermediate / Advanced / Pro)
- **Search** — keyword search within section

Filter UI: horizontal pill row, active pill = gold background

---

## File & Versioning Rules

- Main file: `src/bam-v20-dashboard.jsx`
- Entry: `src/App.js` imports Dashboard from main file
- **Bump version number on every meaningful change** — v20 → v21 → v22 etc.
- All styles inline — never convert to CSS classes unless explicitly asked
- Keep all mock data at top of file in clearly labeled constants
- Use `useState` for all interactive state — no Redux needed yet

---

## Future File Structure (when splitting the monolith)

```
/components
  Avatar.jsx
  PostCard.jsx
  DropCard.jsx
  Sidebar.jsx
  TopBar.jsx
/pages
  Dashboard.jsx
  DrillLibrary.jsx
  Insights.jsx
  PracticePlans.jsx
  PlaybookBuilder.jsx
/data
  mockData.js
/tokens
  colors.js
```

---

## Key People

| Person | Role |
|---|---|
| Coleman Ayers | Founder — building this with AI assistance, learning to code |
| Cam | BAM Business partner — manages Vercel team account |
| Gabe Macias | Co-founder |
| Dev team | Available for implementation support |

---

## Notes for AI Assistants

- Coleman is learning to code — explain changes clearly, don't just dump code
- All styles are inline — no Tailwind, no external style libraries
- Bebas Neue for ALL headings/display text, DM Sans for ALL body/UI text
- The main component file is large (~3800 lines) — single file by design for now
- Never change color tokens without flagging it
- Version the file on every meaningful change
- BAM logo file to be provided by Coleman later (currently text placeholder)
- Priority external tools: GoHighLevel, Make.com, Notion, Stripe (planned), Supabase (planned)
