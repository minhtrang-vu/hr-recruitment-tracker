# HR Recruitment Tracker — Vibe Coding Guide

> A step-by-step prompt guide to reproduce the HR Recruitment Tracker to ~80% fidelity.  
> Three phases. Each phase ends with a checklist and fix instructions.  
> All prompt templates are copy-paste ready.

---

## How to Use This Guide

1. **Copy the prompt** for the current phase exactly as written.
2. **Paste into your AI coding tool** (Cursor, Windsurf, Claude, etc.).
3. **Run the checklist** after generation. Tick every box before moving to the next phase.
4. **Use the fix prompts** for any unticked box — do not proceed with broken foundations.

---

## Tech Stack Reference

| Layer | Choice |
|---|---|
| Framework | React (Vite) |
| Styling | Tailwind CSS — spacing scale only, no arbitrary values |
| Font | Sora (all weights via Google Fonts) |
| Icons | Slicons Essential Line Icons — outline/line style only |
| Database | Firebase Realtime Database (Phase 3 only) |
| Auth | Firebase Anonymous Auth (Phase 3 only) |
| AI API | Groq API (Phase 2) |
| Email API | Resend API (Phase 2) |
| State | React state + SessionStorage for UI state preservation |

---

## Color Token Reference (use throughout all phases)

```css
--background:       #F0FAF4;   /* main content canvas */
--sidebar:          #1A3A2E;   /* sidebar + dark feature cards base */
--surface:          #2D6A4F;   /* secondary green surfaces / headers */
--card:             #FFFFFF;   /* KPI & content card fills (frosted) */
--card-accent:      #D8F3DC;   /* tinted card fills, chart fills */
--primary:          #52B788;   /* CTAs, active pill, focus ring */
--feature:          #0F1F18;   /* dark highlight cards (score gauge) */
--foreground:       #13241C;   /* text on light surfaces */
--muted-foreground: #6B7280;   /* helper / secondary text */
--destructive:      #EF4444;   /* delete / reject / negative trend */
```

**Inversion rule:** Dark text on light canvas and white cards. Light text only on dark sidebar (`--sidebar`) and dark feature cards (`--feature`). Never use `bg-white` or `text-black` directly — always use tokens.

---

## Badge Color Mapping (fixed, used everywhere)

### Stage Badges
| Stage | Background | Text |
|---|---|---|
| Applied | `#D8F3DC` | `#1A3A2E` |
| Screening | `#DBEAFE` | `#1E40AF` |
| Interview | `#FEF3C7` | `#92400E` |
| Assessment | `#EDE9FE` | `#5B21B6` |
| Offer | `#FFEDD5` | `#C2410C` |
| Hired | `#D1FAE5` | `#065F46` |
| Rejected | `#FEE2E2` | `#991B1B` |

> **Closed Job Override:** If the application's linked job `status === "Closed"`, all stage badges render as `bg-gray-200 text-gray-600` regardless of stage.

### Recommendation Badges
| Badge | Background | Text |
|---|---|---|
| Strong Hire | `#D1FAE5` | `#065F46` |
| Hire | `#DBEAFE` | `#1E40AF` |
| Hold | `#FEF3C7` | `#92400E` |
| Reject | `#FEE2E2` | `#991B1B` |

### Job Status Badges
| Status | Style |
|---|---|
| Open | `--primary` accent |
| Closed | muted gray |

### Job Closed Badge (Pipeline cards)
```
background: bg-gray-700  text: text-white  border: border-gray-600  dot: bg-gray-400
```

---

## Department → jobId Prefix Mapping (fixed, R2.4)

| Department | Prefix |
|---|---|
| Engineering | `ENG` |
| Marketing | `MKT` |
| Human Resources | `HRS` |
| Product | `PRD` |
| Finance | `FIN` |
| Design | `DSN` |
| Sales | `SAL` |

Format: `{PREFIX}{2-digit-year}{3-digit-sequence}` — e.g. `MKT26001`

---

## R5.8 — Recommendation Badge Logic

| Badge | Condition |
|---|---|
| **Strong Hire** | Average ≥ 4.5 AND no individual score below 4 |
| **Hire** | Average 3.5–4.4 AND no individual score below 3 |
| **Hold** | Average 2.8–3.4 AND Technical ≥ 3 AND no score is 1 |
| **Reject** | Average < 2.8 OR any individual score ≤ 2 |

Scores: Technical, Communication, Culture Fit — each integer 1–5. Badge auto-generates; user cannot manually set it.

---

---

# PHASE 1 — Shell + Full UI (Static / Mock Data)

**Goal:** All 7 pages render correctly with complete layout, navigation, design tokens, and shared components. No Firebase. No real API calls. All data is hardcoded mock data.

---

## Phase 1 Prompt

```
WHAT — Build the complete UI shell for an HR Recruitment Tracker web app using React + Vite + Tailwind CSS. This phase uses only static mock data — no Firebase, no API calls. Every page must render correctly with realistic hardcoded data.

HOW IT LOOKS — Design System:
- Font: Sora (Google Fonts), all weights. Never use Inter, Roboto, or system fonts.
- Icons: Slicons Essential Line Icons only — outline/line style, single stroke weight, currentColor, sizes 16/20/24px. Never mix icon families or use emojis as icons. Fixed icon-to-action mapping: plus=add, edit=edit, trash=delete, x=reject/close, arrow-right=Pass, refresh=regenerate, save=save, search=search, warning=error, check-circle=success, trending-up/trending-down=KPI deltas, arrow-left=back, sparkles=generate, paperclip=CV link.
- Colors: Use only these CSS tokens — never direct color values:
  --background: #F0FAF4 (main content canvas)
  --sidebar: #1A3A2E (sidebar + dark cards)
  --surface: #2D6A4F (secondary surfaces)
  --card: #FFFFFF (card fills)
  --card-accent: #D8F3DC (tinted fills)
  --primary: #52B788 (CTAs, active states)
  --feature: #0F1F18 (dark highlight cards)
  --foreground: #13241C (text on light)
  --muted-foreground: #6B7280 (helper text)
  --destructive: #EF4444 (delete/reject)
- Inversion rule: dark text on light surfaces; light text only on --sidebar and --feature cards.
- Tailwind spacing only — no arbitrary values.
- Glassmorphism cards on light canvas: white frosted surface, subtle border, soft shadow, rounded-xl/2xl.

LAYOUT — App Shell:
- App background: full viewport #F3F4F6, outer padding 16px desktop / 12px tablet / 0px mobile.
- Main content area: white background, 24px rounded corners, internal padding 32px desktop / 24px tablet / 16px mobile, positioned right of sidebar.
- Top header bar: fixed/sticky at top of main content viewport, height ~72px. Left: page title. Right: primary action button. Always visible while scrolling.

RESPONSIVE — 3 breakpoints:
Desktop (>1024px):
- Fixed left sidebar, 220px wide, full 100vh height, dark forest background (#1A3A2E).
- Shows icon + text label per nav item. Nav items: 40px height, rounded corners.
- Hover = slightly lighter charcoal surface. Active = elevated dark-gray card, semibold text. No bright accent backgrounds inside sidebar.
- Nav items: Dashboard, Jobs, Candidates, Pipeline, AI JD Generator, Mailing Cycle.

Tablet (768px–1024px):
- Sidebar collapses to icon-only strip, 48px wide. Same dark background. Hover tooltip shows page name.

Mobile (<768px):
- Sidebar hidden entirely.
- Fixed bottom tab bar, height 56px, exactly 5 tabs with icon + short label: Dash · Jobs · Users · Stages · More
- Active tab: accent green underline (#52B788) + icon tint.
- "More" tab opens a frosted-backdrop bottom sheet containing: AI JD Generator, Email Batch Dispenser, Feedback.
- Sub-pages (AI JD Generator, Email Batch Dispenser, Feedback) show an arrow-left back button in the top header bar to return.
- All interactive elements: minimum touch target 44×44px.
- Modals become bottom sheets: full viewport width, max-height 90vh, 4px drag-handle pill at top, sticky full-width 48px Save button fixed to bottom, frosted blur backdrop.
- "Add" buttons become FABs (bottom-right, Slicons plus, touch target ≥44×44px).
- Tables become horizontally scrollable card lists (one card per record).

PAGES — Build all 7 routes with mock data:

1. /dashboard
- 4 KPI stat cards in a row (desktop) / 2×2 grid (tablet+mobile): Open Jobs, Total Candidates, Active Applications, Hired Applications. Each card: white frosted surface, label + large stat (32px bold desktop / 24px mobile) + trend delta with trending-up/trending-down Slicons icon. No colorful emojis, no mini charts.
- Hiring Funnel Bar Chart: stages Applied → Screening → Interview → Assessment → Offer → Hired + Rejected drop-off layer. 200px tall on mobile. Bar color: vertical gradient #0B2B26 to #8EB69B.
- Recruitment Health dark card (#0F1F18): circular radial score gauge, status text (EXCELLENT VELOCITY / OPTIMAL RATE / BOTTLENECK WARNING), radial glow from top-left using #2D6A4F.
- Empty state: Slicons inbox/file illustration + "No data yet. Start by creating your first job opening."
- Read-only page — no action button in header.

2. /jobs
- Header + "Add Job" button (Slicons plus). Mobile: FAB.
- Filter bar: search by title (Slicons search icon), filter by status dropdown, filter by department dropdown, filter by location dropdown (Remote/Onsite), "Clear filters" (Slicons x).
- Desktop/tablet: data table. Columns: title, department, location, deadline, openings (hired_count/headcount), status badge, actions (Slicons toggle, edit, trash).
- Mobile: job cards with same data.
- Table footer: "Showing n of total jobs".
- Status badge: Open (--primary accent) / Closed (muted gray).
- Empty state: Slicons briefcase/folder + context message.

3. /candidates — Two tabs: Candidates | Applications
Candidates tab:
- Header + "Add Candidate" (Slicons user-plus). Mobile: FAB.
- Search bar (Slicons search, debounced) — search by name/email.
- Desktop/tablet: data table. Columns: name, email, phone, created date, applications column (most recent active application job title truncated + stage badge; if multiple applications append "+n" tag where n = total minus 1; no dot indicators), actions.
- Mobile: candidate cards.
- Live count: "N candidates · N applications".
- Empty state illustration.

Applications tab:
- Filter bar: search by name, filter by job dropdown, filter by stage dropdown, filter by recommendation dropdown, Clear button.
- Desktop/tablet: data table. Columns: candidate name + candidateId, email, job title + jobId, stage badge, applied date, actions. Row click → /applications/:applicationId.
- Mobile: application cards. Card click → /applications/:applicationId.
- "same candidate" badge when same candidate has consecutive rows in filtered results.
- Pagination footer: "Showing n of total applications" — 20 records per page, Previous/Next controls.
- Empty state illustration.

4. /pipeline
- Mandatory job selector dropdown at top — board does not render until a job is selected.
- No "All Jobs" mode.
- 6 Kanban columns: Applied → Screening → Interview → Assessment → Offer → Hired.
- Desktop/tablet: each column min-width 280px, 12px horizontal padding, gap-3 vertical spacing between cards.
- Cards: frosted white, candidate name + job title + application date. Card width: calc(100% - 24px).
- "Pass" button (Slicons arrow-right) — disabled at Hired stage and on closed jobs.
- "Reject" button (Slicons x, icon-only, 44×44px, tooltip "Reject Candidate") — confirmation required, disabled on closed jobs.
- "Job Closed" badge on cards of closed jobs: bg-gray-700 text-white border-gray-600 dot bg-gray-400. Pass + Reject both disabled.
- Mobile: horizontal scroll Kanban, column width 85vw, Pass + Reject as full-width buttons (≥44px height).
- Empty state before job is selected: "Please select a job to view the pipeline."

5. /feedback
- Desktop: 30–35% left panel / 65–70% right panel split. Mobile: stacked (left above, right below).
- Mandatory cascading filter: Department dropdown (required) → Job dropdown (enabled only after department selected, filtered by chosen department, required).
- Additional filters: recommendation dropdown (All / Strong Hire / Hire / Hold / Reject), interviewer dropdown, Clear button.
- Left panel: candidate profile summary (name, job title, current stage, metadata) + Average Score Card (radial gauge, overall avg, total evaluations, Slicons award icon).
- Right panel: feedback history, 2-column grid desktop/tablet, 1-column mobile, newest first.
- Each feedback card: interviewer name, Technical / Communication / Culture Fit scores, average score, recommendation badge, comments. Mobile: 3 scores in a horizontal row, full-width badge below.
- "Add Feedback" button (Slicons edit/plus) — enabled only when stage === "Interview".
- Empty state before Department + Job selected: "Please select a Department and a Job above to view or add feedback."
- Empty state when selected but no feedback: "No interview feedback has been submitted yet."

6. /ai-generator
- Desktop/tablet: 40% left input panel / 60% right preview panel side-by-side.
- Mobile: stacked, input on top, preview below. Generate button full-width. When output generated, page auto-scrolls to preview panel.
- Input panel: Job Title, Department, Key Responsibilities, Required Qualifications, Tone selector (Professional default). All 4 fields required before Generate is enabled.
- API Key field: label "AI API Key" + "Configure Key" ghost button. Input type password (masked). Placeholder "sk-ant-...". Helper link: "Get your API key at console.groq.com/keys" (opens new tab, muted + underline hover). Security note: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry." Validation error: "Please enter a valid API key." Wrong key error: "Invalid API key. Please check and try again."
- Generate button: Slicons sparkles icon. During API call: disabled + spinner (Slicons refresh).
- Preview panel: placeholder before generation → spinner during → read-only generated JD with structured headings after. Sections in order: Job Summary, Key Responsibilities, Required Qualifications, Preferred Skills, Benefits & Working Environment.
- "Regenerate" button (Slicons refresh) + "Save as Job" button (Slicons save): side-by-side, each 50% width on mobile.
- Error: "Generation failed. Please try again." with Slicons warning.

7. /mailing-cycle
- Desktop/tablet: left panel (job selector) + right panel (recipient management).
- Left panel: scrollable list of closed jobs (status === "Closed"). Search bar "Search by Job ID". Each item: Job Title, Department, Closed Date. By default hides jobs where mailing is already completed.
- Right panel: hidden until job selected. Datatable of linked applications where stage !== "Offered" AND stage !== "Hired". Columns: Checkbox, Candidate Name, Email, Current Stage.
- Email Preview Section: read-only fixed layout showing the Rejected Email Template with sample data rendered.
- API Key Input (Resend): same pattern as AI JD API key field. Helper link: "Get your Resend API key at resend.com/api-keys". Same security note and error messages.
- "Send Batch Email" button: primary CTA, loading spinner + disabled while sending. Full-width mobile. Disabled until valid Resend key detected.
- Mobile: full-screen bottom sheet (max-height 95vh), dual-tab navigation inside (Tab 1: "Template Preview", Tab 2: "Recipient List (n)"), "Send Email" sticky footer 48px.

APPLICATION DETAIL — /applications/:applicationId
- Application info card: applicationId, candidate fullName, email, phone, CV link (Slicons paperclip/link), linked job title, applicationDate, current stage badge.
- If stage === "Hired": green hired banner at top.
- If stage === "Rejected": red rejected banner at top.
- If linked job status === "Closed": all stage badges render as bg-gray-200 text-gray-600.
- Progress summary: current stage badge, feedback round count, overall average score (X.X / 5), current recommendation badge (shows "Pending" if no feedback).
- Stage progress bar: 6-step visual indicator (Applied → Screening → Interview → Assessment → Offer → Hired), current stage highlighted.
- Action buttons: "Add Feedback" (enabled only when stage === "Interview", disabled with tooltip otherwise). "Pass to {Next Stage}" (conditional). "Reject" (conditional).
- Dynamic "Back" button (Slicons arrow-left): reads "Back to Applications" if arrived from /candidates, reads "Back to Pipeline" if arrived from /pipeline. Preserves previous page state.
- Feedback history section: header "Interview Feedback" + submission count badge. Feedback cards newest first: interviewer name, submission date, recommendation badge, Technical / Communication / Culture Fit score boxes with fill bars, average score, comments (hidden if empty).
- Empty state: "No interview feedback has been submitted yet."

SHARED COMPONENTS — Build all of these as reusable components:
- Toast notifications: Slicons check-circle (success, green) / warning (error, red). Auto-dismiss after 3000ms. Non-intrusive.
- Confirmation modal: Slicons warning/trash + warning message + "Confirm" + "Cancel" buttons. Required for ALL destructive actions and ALL stage transitions.
- Empty states: every page, Slicons line illustration + context-specific next-action message.
- Badge chips: stage / status / recommendation — fixed color mapping (use the mapping table provided separately). Never custom colors.
- Loading spinner: Slicons refresh/loader.
- FAB: Slicons plus, bottom-right, touch target ≥44×44px. Mobile only.
- Radial gauge: reusable circular % gauge component.

SHARED MODALS — Build all as centered overlay desktop (max-w 560px, max-h 80vh, vertically scrollable) / bottom sheet mobile (full width, max-h 90vh, drag handle pill, sticky 48px Save). Backdrop: frosted blur.
- Create/Edit Job: title, department, location (remote/onsite), employmentType, requiredSkills, description, deadline, status. Inline field errors.
- Create/Edit Candidate: fullName, email, phone. Inline validation.
- Create Application (Link to Job): candidateId (auto-fill), jobId dropdown (active jobs only), cvLink (required URL). appliedDate auto-set.
- Add Feedback: interviewer (required), technicalScore 1–5, communicationScore 1–5, cultureFitScore 1–5, comments (optional). Recommendation badge auto-generates in real time as scores change — user cannot manually set it.
- Stage Transition Confirmation: candidate name, current stage → next stage, warning: "Once moved to the next stage, this application cannot return to the previous stage.", Confirm Move + Cancel.
- Generic Confirmation: warning message + Confirm + Cancel.
- Job Closure Confirmation: "Are you sure you want to close this job opening? This will freeze the hiring pipeline for this position." + Confirm Close + Cancel.

CONSTRAINTS:
- Tailwind CSS only. No arbitrary values (no square bracket syntax).
- Sora font only. No fallback fonts in design.
- Slicons icons only. No other icon libraries. No emojis as icons.
- All colors via CSS tokens only.
- Use gap-* for spacing; never mix margin/padding + gap on the same element.
- Touch targets ≥44×44px on all mobile interactive elements.
- Semantic HTML + ARIA roles + visible accent-green focus ring.
- Contrast: ≥AA on light cards (dark text) and dark surfaces (light text).
- No Firebase, no API calls in this phase — all data is static mock data.

EDGE CASES:
- Empty states on every single page — never show a blank screen.
- Candidate with 0 applications: show muted italic "No applications yet" in applications column.
- Candidate with multiple applications: show most recent active job title + stage badge + "+n" tag (n = total minus 1). No dot indicators.
- Pipeline board: show empty state "Please select a job to view the pipeline." before job is selected.
- Feedback page: show empty state "Please select a Department and a Job above to view or add feedback." before both selectors are filled.
- All modals: if required fields are empty on Save, show inline field errors — do not close modal.
- Closed job: all stage badges across the entire app render gray. Pass + Reject buttons disabled on Pipeline Board. "Job Closed" badge on pipeline cards.

EXAMPLES:
- jobId format: MKT26001 (Marketing, year 2026, sequence 001)
- candidateId format: CAN000001
- applicationId: any unique string
- feedbackId: any unique string
- Recommendation badge preview: if technicalScore=4, communicationScore=5, cultureFitScore=4 → avg=4.33, no score below 3 → badge = "Hire"
- Recommendation badge preview: if technicalScore=5, communicationScore=5, cultureFitScore=4 → avg=4.67, no score below 4 → badge = "Strong Hire"
```

---

## Phase 1 — Expected Output Checklist

Go through every item. Only move to Phase 2 when all boxes are ticked.
If a box is unticked, use the fix prompt in the Fix Guide below — do not proceed with a broken foundation.

### 1.1 App Shell & Navigation
**How to check:** Open the app on desktop, shrink the browser to tablet width (~900px), then to mobile width (~375px). Click every nav item.

- [ ] **Desktop:** Left side has a dark green sidebar. Right side is a light green/white content area. They are clearly separated.
- [ ] **Desktop sidebar:** Shows icon + text label for each page. Hovering a nav item lightens it slightly. The active page looks like a raised card with bold text. Nothing inside the sidebar is bright green.
- [ ] **Desktop sidebar pages listed:** Dashboard, Jobs, Candidates, Pipeline, AI JD Generator, Mailing Cycle
- [ ] **Tablet:** Sidebar shrinks to a narrow strip of icons only (no labels). Hovering an icon shows a tooltip with the page name.
- [ ] **Mobile:** Sidebar disappears entirely. A tab bar appears fixed at the bottom with exactly 5 tabs: Dash · Jobs · Users · Stages · More
- [ ] **Mobile active tab:** The active tab has a green underline and the icon is tinted green.
- [ ] **Mobile "More" tab:** Tapping More opens a frosted overlay menu from the bottom containing: AI JD Generator, Email Batch Dispenser, Feedback.
- [ ] **Mobile sub-pages** (AI JD, Email, Feedback): A back arrow (←) appears in the top bar to return.
- [ ] **Top header bar:** Always visible at the top even when scrolling down. Shows page title on the left and the main action button (e.g. "Add Job") on the right.
- [ ] **All pages navigate correctly:** Clicking every nav item takes you to the right page. No broken links.

### 1.2 Look & Feel — Colors and Font
**How to check:** Look at the app visually. Use the prompt below if anything looks off.

- [ ] **Font feels rounded and clean** — not the default browser font (Arial/system) and not Inter. Text should feel slightly geometric and friendly.
- [ ] **Sidebar and dark cards** are a deep forest green, not black, not navy, not charcoal.
- [ ] **Main content background** is a very light mint/green-tinted white — not pure white, not gray.
- [ ] **Content cards** (KPI cards, job rows, etc.) look slightly frosted/white sitting on that light background.
- [ ] **Action buttons** (Add Job, Save, etc.) are a medium green — not blue, not dark green.
- [ ] **Dark text on light surfaces. Light text on the dark sidebar and dark cards.** Never dark text on dark backgrounds.
- [ ] **Page titles** are noticeably large and bold. KPI numbers are even larger. Body text is clearly smaller.
- [ ] **Helper text** (labels, hints, timestamps) is smaller and grayed out compared to body text.

> 🔍 **If colors look wrong:** Use the Visual/Styling fix prompt in the Fix Guide.

### 1.3 Cards & Surfaces
**How to check:** Look at the KPI cards and content cards on any page.

- [ ] **Content cards** have a soft white background, a faint border, and a subtle drop shadow. They look slightly "lifted" off the page.
- [ ] **Recruitment Health card** (on Dashboard) is very dark — almost black-green. Text inside is white/light. There is a faint green glow visible in the top-left corner of the card.
- [ ] **All cards, modals, and buttons** have consistent rounded corners — nothing is sharp/square.

### 1.4 Icons
**How to check:** Look at every button and action across the app.

- [ ] **All icons are thin outline style** — no thick filled/solid icons anywhere.
- [ ] **No emojis used as icons** anywhere in the app.
- [ ] **Correct icon per action:** ➕ for Add, ✏️-outline for Edit, 🗑️-outline for Delete, → for Pass, ✕ for Reject/Close, 🔍 for Search, ← for Back, ✨-outline for Generate.

> 🔍 **If icons look filled/solid or wrong:** Use the Visual/Styling fix prompt.

### 1.5 Shared Components
**How to check:** Perform each action described.

- [ ] **Toast notifications:** Save a record → a green success message appears at the top/bottom and disappears on its own after ~3 seconds. Try an error action → red message appears and disappears the same way.
- [ ] **Confirmation modal:** Try deleting a job or rejecting a candidate → a popup appears asking you to confirm before anything is deleted. Cancelling does nothing.
- [ ] **Empty states:** Delete all mock data on any page (or start fresh) → you see an illustrated message with a helpful hint, never a blank screen.
- [ ] **Stage/status badges:** Each stage (Applied, Screening, Interview, Assessment, Offer, Hired, Rejected) has its own distinct color. All badges for the same stage look identical across every page.
- [ ] **On mobile:** "Add" buttons are replaced by a floating ➕ button at the bottom-right corner of the screen.
- [ ] **Radial gauge:** Visible on the Dashboard Health card and Feedback left panel — a circular progress ring showing a percentage.

### 1.6 Shared Modals
**How to check:** Open any create/edit modal on desktop, then on mobile.

- [ ] **Desktop:** Modal appears centered on screen, has a dimmed blurred background behind it, and scrolls internally if content is long.
- [ ] **Mobile:** Modal slides up from the bottom. There is a small pill/handle at the very top. The Save button is always visible at the bottom even when scrolling inside the modal.
- [ ] **Create/Edit Job modal** has all fields: Title, Department, Location, Employment Type, Skills, Description, Deadline, Status. Trying to save with empty required fields shows an error message on that field — modal stays open.
- [ ] **Create/Edit Candidate modal** has: Full Name, Email, Phone. Saving with wrong email format or wrong phone format shows an inline error.
- [ ] **Create Application modal** has: Job dropdown (showing only active jobs), CV Link field. Candidate ID fills in automatically.
- [ ] **Add Feedback modal** has: Interviewer name, 3 score sliders/inputs (Technical, Communication, Culture Fit, each 1–5), Comments. The Recommendation badge (Strong Hire / Hire / Hold / Reject) updates automatically as you change the scores — you cannot set it manually.
- [ ] **Stage Transition confirmation** shows: candidate name, where they are now → where they will go, the warning "Once moved to the next stage, this application cannot return to the previous stage.", Confirm + Cancel.
- [ ] **Close Job confirmation** shows the correct warning message and Confirm Close + Cancel.

### 1.7 Dashboard (`/dashboard`)
**How to check:** Go to the Dashboard page.

- [ ] **4 KPI cards** show: Open Jobs, Total Candidates, Active Applications, Hired Applications. On desktop they are in one row. On tablet and mobile they are in a 2×2 grid.
- [ ] **Each KPI card** has a label, a large number, and a small up/down trend indicator with an arrow icon.
- [ ] **Funnel chart** shows bars for all stages: Applied, Screening, Interview, Assessment, Offer, Hired, and a Rejected layer. Bars go from dark green on one end to light green on the other.
- [ ] **Recruitment Health card** is dark, has a circular gauge, and shows one of these status texts: EXCELLENT VELOCITY, OPTIMAL RATE, or BOTTLENECK WARNING.
- [ ] **No data:** If there is no mock data, a friendly empty state message appears instead of a blank/broken chart.

### 1.8 Jobs (`/jobs`)
**How to check:** Go to the Jobs page. Try the filters. Switch to mobile.

- [ ] **"Add Job" button** is top-right on desktop. On mobile it becomes a floating ➕ button.
- [ ] **Filter bar** has: a title search box, Status dropdown, Department dropdown, Location dropdown, and a Clear button. Filters work together — results narrow as you apply more.
- [ ] **Desktop/tablet:** Jobs shown in a table with columns: Title, Department, Location, Deadline, Openings, Status, Actions (toggle/edit/delete icons).
- [ ] **Mobile:** Jobs shown as individual cards with the same information.
- [ ] **Status badges:** "Open" is green. "Closed" is muted/gray.
- [ ] **Footer** shows "Showing X of Y jobs".
- [ ] **No jobs:** An illustrated empty state appears.

### 1.9 Candidates (`/candidates`)
**How to check:** Go to the Candidates page. Click both tabs.

- [ ] **Two tabs** at the top: Candidates and Applications. Clicking switches between them.
- [ ] **Candidates tab:** Has a search bar. Desktop shows a table; mobile shows cards. The Applications column shows the most recent job title + stage badge. If a candidate has more than 1 application, shows "+n" after the pill (e.g. "+2"). No colored dots.
- [ ] **Applications tab:** Has filter bar (name, job, stage, recommendation). Desktop table; mobile cards. Clicking a row/card goes to that application's detail page.
- [ ] **"Same candidate" badge** appears when the same candidate appears in consecutive rows after filtering.
- [ ] **Footer** shows "Showing X of Y applications" with Previous/Next buttons. Shows 20 records per page.
- [ ] **Both tabs** show an empty state illustration when there's no data.

### 1.10 Pipeline Board (`/pipeline`)
**How to check:** Go to Pipeline. Try without selecting a job, then select one. On mobile, scroll horizontally.

- [ ] **Before selecting a job:** The board area shows an empty state — "Please select a job to view the pipeline." No columns visible yet.
- [ ] **After selecting a job:** 6 columns appear: Applied, Screening, Interview, Assessment, Offer, Hired.
- [ ] **Each card** shows: candidate name, job title, application date. Cards look like small frosted white tiles.
- [ ] **Pass button** (→ arrow icon): Clicking it opens a confirmation popup. Disabled on cards in the Hired column and on cards from closed jobs.
- [ ] **Reject button** (✕ icon, no label): Hovering shows "Reject Candidate" tooltip. Clicking opens a confirmation popup. Disabled on cards from closed jobs.
- [ ] **Closed job cards** show a "Job Closed" gray badge. Both Pass and Reject are visibly grayed out and unclickable.
- [ ] **Mobile:** Columns scroll horizontally. Each column is nearly full screen width. Pass and Reject appear as full-width buttons at the bottom of each card, large enough to tap easily.

### 1.11 Feedback (`/feedback`)
**How to check:** Go to Feedback. Try selecting department then job. Switch to mobile.

- [ ] **Before selecting:** The page shows an empty state — "Please select a Department and a Job above to view or add feedback."
- [ ] **Department dropdown** must be selected first. Job dropdown is grayed out until a department is chosen.
- [ ] **After both are selected:** Feedback cards appear. Left panel shows candidate summary and a circular average score gauge. Right panel shows feedback cards.
- [ ] **Desktop/tablet:** Feedback cards in a 2-column grid. Mobile: single column, with the 3 scores (Technical, Communication, Culture Fit) shown in a horizontal row and the recommendation badge below them full-width.
- [ ] **"Add Feedback" button** is clickable only for applications in the Interview stage. For any other stage it is grayed out.
- [ ] **After selecting a job with no feedback yet:** Shows "No interview feedback has been submitted yet." — not a blank screen.

### 1.12 AI JD Generator (`/ai-generator`)
**How to check:** Go to AI JD Generator. Try on desktop and mobile.

- [ ] **Desktop/tablet:** Two panels side by side — input form on the left, preview on the right.
- [ ] **Mobile:** Input form on top, preview below. Generate button is full width.
- [ ] **Input form** has 4 fields: Job Title, Department, Key Responsibilities, Required Qualifications. Plus a Tone selector (defaults to "Professional") and an API Key field.
- [ ] **API key field** shows dots/asterisks instead of the typed key. Below it is a clickable link to get a Groq API key, and a security note explaining the key is not saved anywhere.
- [ ] **Generate button** is grayed out until all 4 fields and the API key are filled. While generating, a spinner appears and the button stays disabled.
- [ ] **After generation:** Preview panel shows the JD with 5 clearly labeled sections. The text is read-only — you cannot edit it directly.
- [ ] **Regenerate and Save as Job** buttons appear after generation. On mobile they are side by side, each taking half the width.
- [ ] **If generation fails:** An error message with a warning icon appears. The form inputs are preserved.

### 1.13 Mailing Cycle (`/mailing-cycle`)
**How to check:** Go to Mailing Cycle. Select a closed job.

- [ ] **Left panel:** Shows a list of closed jobs with a search box. Each item shows Job Title, Department, and Closed Date. Jobs where emails have already been sent are hidden by default.
- [ ] **Right panel:** Hidden until you click a job. Then shows a table of recipients (excluding Hired/Offered candidates) with checkboxes to include/exclude each person.
- [ ] **Email preview section:** Shows the rejection email template with sample placeholder data filled in. It is read-only.
- [ ] **Resend API key field:** Same masked input pattern as the AI JD page. Has a link to get a Resend API key and the same security note.
- [ ] **Send Batch Email button:** Grayed out until a Resend API key is entered. Shows a loading spinner while sending.
- [ ] **Mobile:** The page opens as a full-screen sheet with two tabs inside: "Template Preview" and "Recipient List (n)". The Send button is always visible at the bottom.

### 1.14 Application Detail (`/applications/:applicationId`)
**How to check:** Click any application row/card to open its detail page.

- [ ] **Info card at top** shows: Application ID, candidate name, email, phone, CV link (clickable), job title, application date, and a stage badge.
- [ ] **If Hired:** A green banner appears at the very top of the page.
- [ ] **If Rejected:** A red banner appears at the very top.
- [ ] **If the linked job is closed:** All stage badges on this page appear in gray, not their normal colors.
- [ ] **Progress summary** shows: current stage, how many feedback rounds have been submitted, average score (e.g. "4.2 / 5"), and a recommendation badge (or "Pending" if no feedback yet).
- [ ] **Stage progress bar:** A 6-step visual row (Applied → Screening → Interview → Assessment → Offer → Hired) with the current stage highlighted.
- [ ] **Action buttons:** "Add Feedback" is only clickable when the application is in the Interview stage — grayed out otherwise with a tooltip explaining why. Pass and Reject buttons appear only when relevant (hidden when Hired or Rejected).
- [ ] **Back button** says "Back to Applications" if you came from the Candidates page, or "Back to Pipeline" if you came from the Pipeline Board. Going back restores the previous page exactly as you left it (same filters, same scroll position).
- [ ] **Feedback history** at the bottom lists past feedback cards newest first. Shows "No interview feedback has been submitted yet." when empty.

### 1.15 Responsive & Accessibility
**How to check:** Use the app on a real phone or with browser DevTools set to mobile. Tab through the interface with a keyboard.

- [ ] **Easy to tap on mobile:** All buttons, icons, dropdowns, and tabs are large enough to tap without mis-hitting. Nothing feels cramped.
- [ ] **Keyboard navigation:** Pressing Tab moves focus visibly from element to element. The focused element has a visible green outline/ring.
- [ ] **Tables on mobile:** If a table appears, it scrolls horizontally rather than getting cut off. The first column (name/title) stays visible while scrolling.
- [ ] **Text is always readable:** Dark text on light backgrounds. Light text on dark sidebar and dark cards. No dark text on dark backgrounds anywhere.

---

## Phase 1 — Fix Guide

### Visual / Styling Errors
**How to check:** Compare visually against the design token table and badge color mapping table in this guide.

**Fix prompt:**
```
Fix the following visual issues in the HR Recruitment Tracker UI.

WHAT IS WRONG: [describe exactly what looks wrong — e.g. "sidebar background is white instead of #1A3A2E", "stage badges are all the same color", "font is Inter not Sora"]

CONSTRAINTS:
- All colors must use CSS token variables, never direct hex values in JSX.
- Font must be Sora only.
- Badge colors follow this fixed mapping: [paste badge color mapping table from guide].
- Slicons icons only — outline style, currentColor.
- Tailwind spacing scale only, no arbitrary values.
```

---

### Routing / Navigation Errors
**How to check:** Click every nav item, every back button, every row click that should navigate.

**Fix prompt:**
```
Fix routing issues in the HR Recruitment Tracker.

WHAT IS WRONG: [describe — e.g. "clicking a candidate row does not navigate to /applications/:applicationId", "back button on Application Detail does not return to pipeline"]

RULES:
- Row click on Applications table/card → /applications/:applicationId.
- Card click on Pipeline Board → /applications/:applicationId.
- Back button reads "Back to Applications" if arrived from /candidates, "Back to Pipeline" if arrived from /pipeline.
- Returning to Pipeline Board must restore: selected jobId, horizontal scroll position, column context.
- Returning to Candidates from Application Detail must restore: active tab, scroll position, active filters.
- Sub-pages on mobile (AI JD, Email, Feedback) show arrow-left back button in top header bar.
```

---

### Mobile Layout Errors
**How to check:** Resize browser to <768px. Check every page.

**Fix prompt:**
```
Fix mobile layout issues in the HR Recruitment Tracker (viewport <768px).

WHAT IS WRONG: [describe — e.g. "data table shows instead of cards", "bottom tab bar shows 6 tabs instead of 5", "More bottom sheet is not frosted", "modal is not a bottom sheet on mobile"]

MOBILE RULES:
- Exactly 5 tabs in bottom bar: Dash · Jobs · Users · Stages · More
- More → frosted bottom sheet: AI JD Generator, Email Batch Dispenser, Feedback
- All list views: cards, not data tables, on mobile
- Modals: bottom sheet, full width, max-h 90vh, 4px drag-handle pill, sticky 48px Save button, frosted blur backdrop
- FAB replaces all "Add" buttons: bottom-right, Slicons plus, ≥44×44px
- Kanban columns: horizontal scroll, 85vw per column, full-width Pass + Reject buttons ≥44px
- All touch targets ≥44×44px
- Sidebar is hidden on mobile — bottom tab bar only
```

---

### Shared Component Errors
**How to check:** Trigger each shared component — delete an item, submit a form, move a pipeline card.

**Fix prompt:**
```
Fix shared component issues in the HR Recruitment Tracker.

WHAT IS WRONG: [describe — e.g. "toast does not auto-dismiss after 3 seconds", "confirmation modal does not appear before delete", "feedback badge does not update in real time as scores change", "empty state missing on pipeline page before job selected"]

RULES:
- Toast: auto-dismiss 3000ms. Success = check-circle icon green. Error = warning icon red.
- Confirmation modal: REQUIRED before every destructive action (delete, reject, close job, stage transition, unlink). Shows warning icon + message + Confirm + Cancel.
- Empty states: EVERY page must have one — never blank screen.
- Add Feedback modal: recommendation badge must update in real time as technicalScore, communicationScore, cultureFitScore change — using R5.8 logic:
  - avg ≥ 4.5 AND no score below 4 → Strong Hire
  - avg 3.5–4.4 AND no score below 3 → Hire
  - avg 2.8–3.4 AND Technical ≥ 3 AND no score is 1 → Hold
  - avg < 2.8 OR any score ≤ 2 → Reject
```

---

---

# PHASE 2 — Business Logic + All Module Rules + API Integration (Static Data)

**Goal:** All 7 modules + Application Detail enforce correct business rules, validations, ID formats, data flows, and API integrations — still on static/mock data. No Firebase yet.

---

## Phase 2 Prompt — F1 Dashboard Logic

```
WHAT — Implement the Dashboard business logic for the HR Recruitment Tracker.

HOW IT BEHAVES:

KPI Calculations (from mock data):
- Open Jobs = count of Job records where status === "Open"
- Total Candidates = count of unique Candidate profiles
- Active Applications = count of Application records where stage is one of: Applied, Screening, Interview, Assessment, Offer
- Hired Applications = count of Application records where stage === "Hired"
- All counts recalculate every time user navigates to Dashboard — no caching.

Hiring Cycle Cohort Isolation Rule (F1.1):
- Funnel chart and conversion rate calculations operate ONLY on applications from jobs where job.status === "Open".
- Applications from closed jobs are completely excluded from funnel calculations.
- Data is partitioned by jobId — no cross-job aggregation.

Stage Conversion Rate Formula (F1.2):
For Intermediate Stages (Screening, Interview, Assessment, Offer):
  Stage CVR% = (PassedFrom(S) + ActiveIn(S)) / (PassedFrom(S) + ActiveIn(S) + RejectedAt(S)) × 100
  Where:
  - PassedFrom(S) = applications that have moved past stage S to any higher stage
  - ActiveIn(S) = applications currently at stage S
  - RejectedAt(S) = applications rejected while at stage S (stage === "Rejected" AND rejectedAtStage === S)

For Terminal Stage (Hired):
  Hired CVR% = Count of Hired Applications / Total Applicants (N_Total) × 100

Applied stage always renders as 100%.

Recruitment Health Metric (F1.3):
  Throughput Ratio% = (Count of Hired + Count of Active Applications) / Total Applicants × 100
  - Ratio ≥ 70%: status = "EXCELLENT VELOCITY", radial gauge accent green
  - Ratio 40–69%: status = "OPTIMAL RATE", radial gauge balanced green
  - Ratio < 40%: status = "BOTTLENECK WARNING", radial gauge warning red/amber

CONSTRAINTS:
- Read-only page — no data created or modified from Dashboard.
- If zero jobs or applications exist, show empty state — never blank chart.
- Funnel must display both application count AND conversion rate % per stage.
- Mock data must include a realistic mix of stages and rejectedAtStage values to test all CVR branches.
```

---

## Phase 2 Prompt — F2 Job Management Logic

```
WHAT — Implement Job Management business rules for the HR Recruitment Tracker.

HOW IT BEHAVES:

jobId generation (R2.4):
- Format: {PREFIX}{2-digit-year}{3-digit-sequence} e.g. MKT26001
- PREFIX is strictly locked to: Engineering=ENG, Marketing=MKT, Human Resources=HRS, Product=PRD, Finance=FIN, Design=DSN, Sales=SAL. No free-text truncation.
- Sequence = max existing sequence for that department prefix + 1, zero-padded to 3 digits.
- jobId assigned on creation, never editable.
- In Phase 3 this will use a Firebase transaction — for now simulate with in-memory counter.

Create Job:
- Required fields: title, department, deadline. Block save with inline errors if empty.
- deadline must be a valid future date on creation. Editing allows past deadlines.
- status defaults to "Open" on creation.
- createdDate = Date.now() on creation.

Edit Job:
- Pre-fills modal with existing values.
- When Job Title is updated, update denormalized jobTitle in all linked Application records (simulate with in-memory update in this phase).

Close Job:
- Requires confirmation modal: "Are you sure you want to close this job opening? This will freeze the hiring pipeline for this position."
- Sets status = "Closed". Does NOT auto-close based on headcount.
- Linked applications remain visible on Pipeline Board but Pass + Reject are disabled. "Job Closed" badge on each card.

Delete Job:
- Cascade delete: removes job + all linked applications + all nested feedback records.
- Simulate with in-memory deep delete in this phase.

Filter & Search:
- Filters: title search (real-time), status dropdown, department dropdown, location dropdown (Remote/Onsite).
- All filters combine with AND logic.
- Clear button resets all filters.

Table sorting:
- Sort all records by createdDate descending (newest at top). Preserved across all filter applications.

Rules enforced:
- R2.1: title, department, deadline required.
- R2.2: deadline must be future date on creation.
- R2.3: status = Open | Closed only. Default Open.
- R2.5: closed job applications remain visible but locked on Pipeline Board.
- R2.6: manual closure only via confirmation modal.
- R2.9: increasing headcount does not auto-reopen job.
- R2.10: deleting a Hired application decreases hired_count but does not auto-change job status.

EDGE CASES:
- hired_count tracks applications at stage "Hired". Display as hired_count/headcount in openings column.
- If department not in the fixed 7-item list, block job creation with inline error.
```

---

## Phase 2 Prompt — F3 Candidate & Application Management Logic

```
WHAT — Implement Candidate and Application Management business rules.

HOW IT BEHAVES:

candidateId generation (R3.6):
- Format: CAN{6-digit-sequence} e.g. CAN000001
- Sequence = global max across ALL candidates + 1, starting at 000001.
- In Phase 3 this will use a Firebase atomic transaction — simulate with in-memory counter.

Create Candidate:
- Required: fullName, email, phone.
- Email validation: regex /^[^\s@]+@[^\s@]+\.[^\s@]+$/
- Phone validation: Vietnamese mobile format — 10 digits, starting with 03, 05, 07, 08, or 09 — regex /^(03|05|07|08|09)\d{8}$/
- Block save with inline errors if empty or format invalid.
- createdDate = Date.now() on creation.

Create Application (Link to Job):
- Required: jobId (dropdown of active jobs only), cvLink (non-empty URL string).
- stage always = "Applied" on creation — user cannot set initial stage.
- applicationDate = Date.now().
- lastActivityDate = Date.now().

Duplicate Application Guard (R3.2):
- Before creating: check if an application for this candidateId + jobId already exists with stage in [Applied, Screening, Interview, Assessment, Offer].
- If found: block submission, show toast warning: "This candidate has already applied for this position and their application is currently active."
- Re-application allowed ONLY if previous application for same job is at stage Rejected or Hired.

Delete Candidate (R3.5):
- Permanently blocked if candidate has any application at stage "Offer" or "Hired".
- If blocked: show error — do not delete.
- If allowed: cascade delete candidate + all linked applications + all nested feedbacks.

Delete Application (R3.4, R3.5):
- Blocked if application stage is "Offer" or "Hired".
- If allowed: delete application + all linked feedback records.

Unlink Application (R3.8):
- Deletes specific applicationId and its nested feedbacks.
- Preserves master Candidate profile (fullName, email, phone).
- Blocked if application stage is "Offer" or "Hired".
- Confirmation dialog: "Are you sure you want to unlink this candidate from the job? This will remove the application and its interview feedback history but will preserve the candidate's master profile details."

Applications column display (Candidates tab):
- Shows most recent active application: job title (truncated) + stage badge.
- If multiple applications: append "+n" tag where n = total applications minus 1. No dot indicators.
- 0 applications: muted italic "No applications yet".

Table sorting (R3.7):
- Candidates tab: sort by createdDate descending.
- Applications tab: sort by applicationDate descending.

EDGE CASES:
- "same candidate" badge: appears in Applications tab when the same candidate has consecutive rows in filtered results.
- hasHiredApplication boolean on Candidate: set to true when any application reaches Hired. Blocks profile deletion.
```

---

## Phase 2 Prompt — F4 Pipeline Board Logic

```
WHAT — Implement Pipeline Board business rules.

HOW IT BEHAVES:

View:
- Mandatory job selector dropdown — board does not render until job selected. No "All Jobs" mode.
- On selection: load all applications where jobId matches.
- 6 columns: Applied → Screening → Interview → Assessment → Offer → Hired.
- Rejected is terminal, not shown as a column.
- Within each column: applications sorted by applicationDate descending.

Pass Application Forward:
- Identifies next stage in fixed sequence: Applied → Screening → Interview → Assessment → Offer → Hired.
- Disabled at Hired (terminal).
- Opens confirmation modal: candidate name, current stage → next stage, warning "Once moved to the next stage, this application cannot return to the previous stage.", Confirm Move + Cancel.
- On confirm: update application.stage, set application.lastActivityDate = Date.now(). Card moves immediately (optimistic UI).
- When application moves to Hired: increment job.hired_count.

Reject Application:
- Confirmation: "Mark this application as Rejected?"
- On confirm: set application.stage = "Rejected", set application.lastActivityDate = Date.now(), set application.rejectedAtStage = [current stage before rejection]. Card removed from board immediately.
- Reject button hidden at Hired stage.

Closed Job handling:
- Cards belonging to closed jobs show "Job Closed" badge (bg-gray-700 text-white border-gray-600 dot bg-gray-400).
- Pass and Reject both disabled on closed job cards.

State Preservation (R4.8):
- Cache current board state: selected jobId, horizontal scroll position, active column views.
- When navigating back from /applications/:applicationId → restore exact board state instantly without reload.
- Use sessionStorage or URL query parameters.

Card click → /applications/:applicationId.

Rules enforced:
- R4.1: Fixed stage order, no skipping.
- R4.2: One stage at a time.
- R4.3: Rejected is terminal — cannot move forward.
- R4.4: Hired is terminal — Pass and Reject both hidden.
- R4.6: No drag-and-drop in v1 — only Pass and Reject buttons.
- R4.7: Every Pass must show confirmation modal before executing.

EDGE CASES:
- If stage === "Offer" and Pass is clicked: next stage is "Hired". Show confirmation and increment hired_count on confirm.
- When application is rejected from any stage: store rejectedAtStage for F1 CVR calculation.
```

---

## Phase 2 Prompt — F5 Interview Feedback Logic

```
WHAT — Implement Interview Feedback business rules.

HOW IT BEHAVES:

Add Feedback:
- Stage lock: "Add Feedback" enabled ONLY when application.stage === "Interview". For all other stages: button disabled with message "Feedback can only be submitted for applications currently in the Interview stage."
- Required fields: interviewer (name string), technicalScore (1–5 integer), communicationScore (1–5 integer), cultureFitScore (1–5 integer). comments is optional.
- All scores must be integers 1–5. No decimals accepted.
- Recommendation badge auto-generates in real time as scores change (R5.8):
  - avg ≥ 4.5 AND no score below 4 → Strong Hire
  - avg 3.5–4.4 AND no score below 3 → Hire
  - avg 2.8–3.4 AND Technical ≥ 3 AND no score is 1 → Hold
  - avg < 2.8 OR any score ≤ 2 → Reject
- On save: generate feedbackId, set createdDate = Date.now(), link to applicationId. Update application.lastActivityDate = Date.now().
- Feedback is read-only after submission — no editing in v1.

View Feedback:
- Mandatory cascading filter: Department (required) → Job (enabled after department, filtered by department, required) → renders feedback content.
- Additional filters: recommendation dropdown, interviewer dropdown.
- Clear button resets both dropdowns and returns to locked empty state.
- Only applications where stage === "Interview" appear in the active list.
- Applications that advance past Interview or are Rejected: instantly removed from this view (real-time in Phase 3, simulate filtering in Phase 2).
- Feedback cards: sorted newest first. Overall average calculated across all submissions for selected scope.

Left panel:
- Candidate profile summary: name, job title, current stage, metadata.
- Average Score Card: radial gauge, overall avg, total evaluations count, Slicons award icon.

Right panel:
- 2-column grid desktop/tablet, 1-column mobile.
- Each card: interviewer name, submission date, recommendation badge, Technical / Communication / Culture Fit scores with fill bars, average score, comments (hidden if empty).

Rules enforced:
- R5.1: Scores integers 1–5 only.
- R5.2: Recommendation fully system-generated — user cannot set or override.
- R5.3: Interviewer name required.
- R5.4: Stage lock — feedback only when stage === "Interview".
- R5.5: Read-only after submission.
- R5.9: Badge updates in real time in modal as scores change.
- R5.10: No "View All" mode — Department → Job cascade strictly enforced.
- R5.11: Only stage === "Interview" applications shown in active list.

EDGE CASES:
- If all 3 scores are 5: avg = 5.0, no score below 4 → Strong Hire.
- If technicalScore = 2: any score ≤ 2 → Reject regardless of avg.
- If technicalScore = 3, communicationScore = 3, cultureFitScore = 3: avg = 3.0, Technical ≥ 3, no score is 1 → Hold.
```

---

## Phase 2 Prompt — F6 AI JD Generator Logic + Security

```
WHAT — Implement AI JD Generator with Groq API integration and security rules.

HOW IT BEHAVES:

Generate Flow:
1. User fills all 4 required fields: Job Title, Department, Key Responsibilities, Required Qualifications.
2. Generate button enabled only when all 4 fields filled AND API key is present in memory.
3. User clicks Generate → call Groq API → render structured JD in preview panel.
4. User reviews output. Clicks "Regenerate" to call API again (preserving form inputs).
5. User clicks "Save as Job" → opens pre-filled Create/Edit Job modal with title and description auto-populated from AI output. User must complete: department, headcount, deadline, status.
6. User clicks Confirm Save in modal → executes standard F2 Job Creation flow → jobId generated → navigate to /jobs.

Groq API call:
- Model: use a current Groq-supported chat model.
- Prompt must instruct the model to return a structured JD with exactly these 5 sections in order: 1. Job Summary, 2. Key Responsibilities (5–8 bullets), 3. Required Qualifications, 4. Preferred Skills, 5. Benefits & Working Environment.
- Every generated JD must end with this exact Equal Opportunity Statement: "We are an equal opportunity employer and welcome applications from all qualified candidates regardless of race, color, religion, sex, gender identity, sexual orientation, national origin, age, disability, or any other protected characteristic."
- R6.7: All 5 sections must always be present. R6.8: Empty sections not allowed — AI generates reasonable professional content if input is insufficient.
- R6.12: jobId is NOT generated or assigned during this phase — strictly deferred to Confirm Save transaction.

API Key Security (critical):
- API key is stored in component memory (React state) only — not localStorage, not sessionStorage, not any database.
- Key must NEVER appear in rendered HTML source.
- Key must NEVER be logged to console (no console.log, console.error containing the key).
- Key is only sent as the Authorization header in the direct POST request to the Groq API endpoint.
- User must re-enter the key each session.
- UI field: type="password" (masked). Placeholder: "sk-ant-...". Helper link to console.groq.com/keys (opens new tab). Security note displayed: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry."

Error handling:
- R6.3: If API call fails: show "Generation failed. Please try again." with Slicons warning. Preserve form inputs.
- Invalid/wrong key: show "Invalid API key. Please check and try again."
- During API call: Generate button disabled + spinner. Cannot submit twice.

Rules enforced:
- R6.1: All 4 fields required before Generate enabled.
- R6.2: Disabled + spinner during call.
- R6.4: Preview is read-only — no direct editing.
- R6.5: "Save as Job" opens modal — does not auto-save.
- R6.6: Generated JD not stored unless user explicitly confirms Save.

EDGE CASES:
- If user changes input fields after generation, "Save as Job" uses the most recently generated output.
- Regenerate preserves all form input values.
- Mobile: when output is generated, page auto-scrolls to preview panel.
```

---

## Phase 2 Prompt — F7 Batch Email Dispatcher Logic + Security

```
WHAT — Implement Batch Email Dispatcher with Resend API integration and security rules.

HOW IT BEHAVES:

Page Initialization:
- Load closed jobs (status === "Closed").
- Default view hides jobs where all eligible candidates already have batchEmailLogs.rejectedNotificationSent === true.
- Left panel search by jobId: typing exact jobId bypasses default filter, force-renders that job including completed ones in read-only state.

Job Selection:
- User selects a closed job from left panel.
- Right panel shows all linked applications where stage !== "Offered" AND stage !== "Hired".
- Columns: Checkbox, Candidate Name, Email, Current Stage.
- Idempotency guard (R7.4): applications where batchEmailLogs.rejectedNotificationSent === true → row checkbox disabled and unchecked by default.

Send Batch Email:
- User reviews recipient list, unchecks any recipients to exclude.
- Clicks "Send Batch Email".
- System locks interface, shows loading spinner.
- Before sending: force-set all selected application stages to "Rejected" if not already terminal (R7.2 Catch-All Rejection Treatment).
- Send emails via Resend API using the fixed Rejected Email Template.
- Rate limiting (R7.5): use Promise.allSettled, maximum 50 concurrent requests per dispatch wave.
- On success per application: set batchEmailLogs.rejectedNotificationSent = true, set lastActivityDate = Date.now().
- On complete: refresh left panel — hide job from default view if no remaining unsent recipients.
- Error: show "Email dispatch failed. Please try again." with Slicons warning. Do not mark as sent if dispatch failed.

Fixed Email Template (inject variables exactly):
Subject: Your Application for the {jobTitle} Position
Body:
Dear {candidateName},

Thank you for your interest in the {jobTitle} position and for the time and effort you invested throughout our recruitment process. We appreciate the opportunity to have learned more about your background and experience.

After careful consideration, we have concluded our hiring cycle for this role and will not be moving forward with your application at this stage. We want to be transparent: this was a highly competitive process, and this outcome is not necessarily a reflection of your capabilities or potential.

Your profile will be retained in our talent pool, and we will reach out should a suitable opportunity arise in the future. We genuinely encourage you to continue pursuing roles where your skills can be fully recognized and rewarded.

We wish you every success in your career ahead.

Sincerely, The HR Team

Variables to inject: {candidateName} = candidate fullName, {jobTitle} = job title string.

Resend API Key Security (critical):
- API key stored in component memory (React state) only — not localStorage, not sessionStorage, not any database.
- Key must NEVER appear in rendered HTML source.
- Key must NEVER be logged to console.
- Key only sent as Authorization header in direct POST to Resend API endpoint.
- User must re-enter each session.
- "Send Batch Email" button disabled until valid Resend key is present in memory.
- UI field: type="password" masked. Helper link to resend.com/api-keys (new tab). Same security note as F6.

Rules enforced:
- R7.1: Only closed jobs processed. Open jobs excluded.
- R7.2: Non-terminal applications force-set to Rejected before email dispatch.
- R7.4: Already-sent applications: checkbox disabled, unchecked by default.
- R7.5: Max 50 concurrent requests (Promise.allSettled).
- R7.6: Job hidden from default view once all eligible applications marked sent. jobId search overrides this.

EDGE CASES:
- If user excludes all recipients and clicks Send: no API calls fired, show informational toast.
- If Resend key is missing when Send is clicked: show validation error, do not fire any requests.
- Partial send failure: mark successfully sent rows as sent, show error for failed rows.
```

---

## Phase 2 Prompt — Application Detail Logic

```
WHAT — Implement Application Detail page (/applications/:applicationId) business rules.

HOW IT BEHAVES:

Load:
1. Load application record by applicationId.
2. Load all feedback records linked to applicationId.
3. Calculate: feedback count, overall average score (average of all feedback record averages), current recommendation badge per R5.8 logic applied to overall avg.
4. If no feedback: recommendation shows "Pending".

Display:
- Application info card: applicationId, candidate fullName, email, phone, CV link (Slicons paperclip/link, opens new tab), linked job title, applicationDate, current stage badge.
- If stage === "Hired": green hired banner at top.
- If stage === "Rejected": red rejected banner at top.
- If linked job status === "Closed": all stage badges render as bg-gray-200 text-gray-600.
- Progress summary: current stage badge, feedback count, overall avg score (X.X / 5), recommendation badge.
- Stage progress bar: 6 steps (Applied → Screening → Interview → Assessment → Offer → Hired), current step highlighted.
- Feedback history: sorted newest first. Each card: interviewer name, submission date, recommendation badge, Technical / Communication / Culture Fit score boxes with fill bars, average score, comments (hidden if empty).

Actions:
- "Add Feedback": enabled only when stage === "Interview". Disabled with tooltip "Feedback can only be submitted for applications currently in the Interview stage" for all other stages.
- "Pass to {Next Stage}": shows next stage name. Hidden when stage is Hired or Rejected.
- "Reject": conditional. Hidden when stage is Hired or Rejected.
- Both Pass and Reject: reuse exact F4 Pipeline Board validation rules, confirmation dialogs, and terminal-state restrictions.
- After successful stage transition: immediately update application.stage and application.lastActivityDate. If transitioned to Hired: increment job.hired_count.

Dynamic Back Button (arrow-left):
- Reads "Back to Applications" if user arrived from /candidates.
- Reads "Back to Pipeline" if user arrived from /pipeline.
- Returning to Pipeline Board: restores selected jobId, horizontal scroll position, column context (from sessionStorage / URL params).
- Returning to Candidates: restores active tab, scroll position, active filters.

Rules enforced:
- CD1: Candidate profile info is read-only from this screen.
- CD2: Candidate profile fields cannot be edited from this screen.
- CD3: Feedback sorted newest first.
- CD4: No feedback → "No interview feedback has been submitted yet."
- CD5: Overall recommendation from average of ALL feedback records, not just latest.
- CD6: Back to Pipeline preserves selected jobId, scroll position, column context.
- CD7: Stage transitions reuse exact F4 logic.
- CD8: After transition, returning to Pipeline shows updated application in new column.

EDGE CASES:
- If application has 0 feedbacks: avg score shows "--", recommendation badge shows "Pending".
- If application stage is Rejected or Hired: Pass and Reject buttons are both hidden.
- If arrived from a direct URL (not from /candidates or /pipeline): back button defaults to "Back to Applications".
```

---

## Phase 2 — Security Audit Prompts

Run these two prompts after F6 and F7 are implemented.

### Security Audit — F6 AI JD Generator

```
Audit the AI JD Generator (F6) implementation for API key security violations. Check every file in the F6 module.

CHECK FOR AND FIX ALL OF THE FOLLOWING:
1. API key stored in localStorage → VIOLATION: remove, replace with React state only
2. API key stored in sessionStorage → VIOLATION: remove, replace with React state only
3. API key stored in any database or sent to any backend → VIOLATION: remove entirely
4. API key appears in any rendered HTML attribute (data-*, value rendered in DOM) → VIOLATION: ensure input type="password" and value is in React state only
5. console.log, console.error, console.warn, or console.debug containing the API key variable or any string that could include it → VIOLATION: remove all such statements
6. API key passed to any function other than the direct Groq API fetch call → VIOLATION: scope key only to the fetch call
7. API key included in any URL parameter → VIOLATION: key must only be in Authorization header
8. The word "Bearer" + key visible in any log → VIOLATION: remove

CONFIRM these are correctly implemented:
- Key is in React component state (useState), cleared on component unmount
- Key only appears in: Authorization: Bearer ${key} header inside the fetch/axios call to Groq API
- input type="password" so key is masked in UI
- Security note displayed: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry."
- User must re-enter key each session (state does not persist across page reloads)

Report every violation found and fix all of them.
```

---

### Security Audit — F7 Batch Email Dispatcher

```
Audit the Batch Email Dispatcher (F7) implementation for API key security violations. Check every file in the F7 module.

CHECK FOR AND FIX ALL OF THE FOLLOWING:
1. Resend API key stored in localStorage → VIOLATION
2. Resend API key stored in sessionStorage → VIOLATION
3. Resend API key stored in Firebase or any backend → VIOLATION
4. Resend API key in rendered HTML or any DOM attribute → VIOLATION
5. console.log/error/warn/debug containing key variable → VIOLATION
6. API key passed to any function other than the direct Resend API fetch call → VIOLATION
7. API key in any URL parameter → VIOLATION (key belongs in Authorization header only)
8. Any candidate email address or personal data logged to console → VIOLATION

CONFIRM these are correctly implemented:
- Key in React component state (useState) only
- Key only in: Authorization: Bearer ${key} header in direct Resend API POST call
- input type="password" masking
- "Send Batch Email" button disabled when key not present in state
- Security note shown: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry."
- Promise.allSettled batch pattern with max 50 concurrent requests
- Fixed email template injects {candidateName} and {jobTitle} — no other variables
- Applications where rejectedNotificationSent === true have checkbox disabled and unchecked

Report every violation found and fix all of them.
```

---

## Phase 2 — Expected Output Checklist

Go through every item. Only move to Phase 3 when all boxes are ticked.
If a box is unticked, use the fix prompt in the Fix Guide below.

### 2.1 Dashboard Logic
**How to check:** Use mock data with a known mix of stages. Count manually and compare to what the UI shows.

- [ ] **Open Jobs count** only includes jobs that are currently open — closed jobs are not counted.
- [ ] **Active Applications count** includes only applications in these stages: Applied, Screening, Interview, Assessment, Offer. Hired and Rejected do not count.
- [ ] **Funnel chart** only reflects data from currently open jobs — numbers do not change when you look at closed jobs' applications separately (F1.1 cohort isolation).
- [ ] **Applied bar** always shows 100% conversion.
- [ ] **Intermediate stage bars** (Screening, Interview, Assessment, Offer) each reflect only that stage's own pass/fail performance — not cumulative totals.
- [ ] **Hired bar** shows what percentage of ALL applicants ultimately got hired (not just the previous stage).
- [ ] **Recruitment Health card** shows EXCELLENT VELOCITY (green gauge) when pipeline is healthy, OPTIMAL RATE (balanced green) when steady, BOTTLENECK WARNING (red/amber) when too many are dropping off. The status text and gauge color change correctly per the thresholds.
- [ ] **No data:** Friendly empty state appears — no blank or broken chart.

> 🔍 **If numbers look wrong:** Use the CVR fix prompt in the Fix Guide.

### 2.2 Job Management Logic
**How to check:** Create a new job and inspect the ID. Test each rule by trying to break it.

- [ ] **Job ID format (R2.4):** Create a Marketing job → ID starts with `MKT`. Create an Engineering job → starts with `ENG`. The number part is 3 digits (e.g. `001`, `002`). The year is the current 2-digit year. Example: `MKT26001`.
- [ ] **Saving without required fields:** Try saving a job with no title, or no deadline → the modal stays open and shows a red error message on the empty field. Nothing is saved.
- [ ] **Future deadline only:** Try creating a job with yesterday's date as deadline → it should be blocked with an error.
- [ ] **Closing a job:** Click Close on a job → a confirmation popup appears with a warning message. Confirming closes it. The job shows a "Closed" badge. No job closes automatically.
- [ ] **Closed job on Pipeline Board:** Go to Pipeline, select the closed job → all cards show a "Job Closed" gray badge. The Pass and Reject buttons are grayed out and unclickable.
- [ ] **Delete a job:** Delete a job that has applications → go to Candidates and Applications tabs and confirm those applications are also gone. No orphaned records remain.
- [ ] **Job list order:** Newest created jobs appear at the top. This stays true even after filtering.
- [ ] **Openings column:** Shows "hired / headcount" (e.g. "2/5" meaning 2 hired out of 5 open spots).

### 2.3 Candidate & Application Logic
**How to check:** Create candidates and try to break the validation rules.

- [ ] **Candidate ID format:** First candidate created gets ID `CAN000001`. Second gets `CAN000002`. The number always has 6 digits.
- [ ] **Invalid email:** Try saving a candidate with `notanemail` as email → blocked with an inline error.
- [ ] **Invalid phone:** Try saving with a phone that doesn't start with 03/05/07/08/09, or has fewer than 10 digits → blocked with an inline error.
- [ ] **Duplicate application guard (R3.2):** Link the same candidate to the same job twice while the first application is still active → a warning toast appears: "This candidate has already applied for this position and their application is currently active." The second application is not created.
- [ ] **Re-application allowed:** Reject or hire a candidate's application, then try linking them to the same job again → this time it works.
- [ ] **New application always starts as "Applied":** There is no way to pick a different starting stage.
- [ ] **Deleting a candidate with an Offer or Hired application:** The delete button should either be blocked or show an error — you cannot delete a candidate who has been offered or hired (R3.5).
- [ ] **Deleting an application at Offer or Hired stage:** Should be blocked the same way (R3.5).
- [ ] **Unlink confirmation message:** The confirmation popup says "...This will remove the application and its interview feedback history but will preserve the candidate's master profile details." After confirming, the candidate profile still exists but the application is gone.
- [ ] **Candidate list order:** Most recently added candidates appear at the top. Applications tab: most recently applied appear at the top.

### 2.4 Pipeline Board Logic
**How to check:** Select a job and move candidates through stages. Try edge cases.

- [ ] **Pass flow:** Click Pass on a card → a popup shows the candidate name, current stage, next stage, and the warning "Once moved to the next stage, this application cannot return to the previous stage." Confirming moves the card immediately.
- [ ] **Reject flow:** Click Reject → popup asks "Mark this application as Rejected?" Confirming removes the card from the board instantly.
- [ ] **Stage order:** You can only move Applied → Screening → Interview → Assessment → Offer → Hired in that exact order. You cannot skip a stage.
- [ ] **Hired column:** No Pass or Reject buttons visible on Hired cards at all.
- [ ] **Rejected is final:** Once rejected, the application never reappears on the board.
- [ ] **Board memory (R4.8):** Select a job on the Pipeline Board, scroll to a specific column, then click a card to open Application Detail, then click "Back to Pipeline" → you return to the same job, same scroll position, same columns. The board does not reset.

### 2.5 Feedback Logic
**How to check:** Try adding feedback at different stages. Change scores and watch the badge.

- [ ] **Add Feedback blocked outside Interview stage (R5.4):** Open an application in the Applied or Screening stage → the "Add Feedback" button is grayed out. Hovering it shows a tooltip explaining why.
- [ ] **Scores only accept 1–5 integers:** Typing 6 or 0 or a decimal is blocked or shows an error.
- [ ] **Badge updates live (R5.9):** In the Add Feedback modal, change the score fields → the recommendation badge (Strong Hire / Hire / Hold / Reject) updates immediately without saving. You cannot click or set it manually.
- [ ] **R5.8 edge cases — test these specific score combinations:**
  - Technical=2, Communication=5, Culture Fit=5 → should show **Reject** (any score ≤ 2 triggers Reject)
  - Technical=5, Communication=5, Culture Fit=5 → should show **Strong Hire**
  - Technical=3, Communication=3, Culture Fit=3 → should show **Hold**
  - Technical=4, Communication=4, Culture Fit=3 → avg=3.67, no score below 3 → should show **Hire**
- [ ] **Feedback page cascading filter (R5.10):** Department must be selected before Job dropdown activates. Clearing resets both to blank and locks the page again.
- [ ] **Only Interview-stage applications shown:** If you pass an application from Interview to Assessment, it disappears from the Feedback page's list immediately.
- [ ] **Feedback is read-only after saving:** There is no edit button on submitted feedback cards.

### 2.6 AI JD Generator
**How to check:** Try generating with and without fields filled. Check the output structure.

- [ ] **Generate button stays grayed out** until all 4 fields (Job Title, Department, Key Responsibilities, Required Qualifications) AND the API key are filled.
- [ ] **After clicking Generate:** A spinner appears, the button is disabled. When done, the preview panel shows the generated JD.
- [ ] **Generated JD structure:** Has exactly 5 sections in this order: Job Summary, Key Responsibilities, Required Qualifications, Preferred Skills, Benefits & Working Environment. No section is empty.
- [ ] **Equal Opportunity Statement** appears at the very end of every generated JD, word for word.
- [ ] **"Save as Job" does NOT save immediately:** It opens the Create Job modal with the title and description pre-filled. You still need to fill in Department, Headcount, Deadline, and Status before confirming.
- [ ] **After confirming save:** You are taken to the Jobs page and the new job appears in the list with a properly formatted Job ID (e.g. `ENG26001`) — the ID was only generated at this final save step, not during AI generation.
- [ ] **Regenerate:** Clicking Regenerate keeps all form inputs and requests a new JD.
- [ ] **Mobile:** After generation, the page automatically scrolls down to show the preview panel.
- [ ] **If the API call fails:** An error message with a warning icon appears. All form inputs are still there — nothing is cleared.

### 2.7 Batch Email Dispatcher
**How to check:** Close a job that has candidates in various stages. Go to Mailing Cycle and send.

- [ ] **Only closed jobs appear** in the left panel. Open jobs are not shown.
- [ ] **Jobs where all emails are already sent** are hidden from the default view. Typing the Job ID in the search box makes them reappear (read-only).
- [ ] **Already-sent recipients (R7.4):** If you previously sent emails to some candidates, their checkboxes appear unchecked and grayed out when you reopen the same job — you cannot re-send to them.
- [ ] **Non-terminal candidates treated as Rejected (R7.2):** If a candidate is still in Screening or Interview when you send, they get set to Rejected in the system before the email goes out.
- [ ] **Email variables:** The email that goes out says "Dear [candidate's actual name]" and mentions the actual job title — not the placeholder text `{candidateName}` or `{jobTitle}`.
- [ ] **After a successful send:** The job disappears from the default left panel view (all eligible candidates have been contacted).
- [ ] **If sending fails:** An error toast appears. Candidates who were successfully sent still show as sent — only the failed ones remain actionable.

### 2.8 Application Detail
**How to check:** Open an application from both the Candidates page and the Pipeline Board. Test navigation.

- [ ] **All info visible:** Application ID, candidate name, email, phone, CV link, job title, application date, stage badge — all shown on the info card.
- [ ] **Hired banner:** Green banner at the top when stage is Hired.
- [ ] **Rejected banner:** Red banner at the top when stage is Rejected.
- [ ] **Closed job:** All stage badges on this page appear gray (not their normal colors) when the linked job is closed.
- [ ] **Progress bar:** 6 steps shown. The current stage is visually highlighted/filled. Earlier stages look completed.
- [ ] **Score summary:** Shows feedback round count, overall average score (e.g. "4.2 / 5"), and a recommendation badge. If there is no feedback yet, shows "Pending" instead of a badge.
- [ ] **Add Feedback button:** Clickable only when stage is Interview. Grayed out with a tooltip for all other stages.
- [ ] **Pass and Reject buttons:** Follow the exact same rules and show the same confirmation popups as the Pipeline Board. They are hidden when the application is already Hired or Rejected.
- [ ] **Recommendation badge (CD5):** Based on the average of ALL feedback records submitted, not just the most recent one.
- [ ] **Back button from Candidates page:** Says "Back to Applications" and returns to the Candidates page with the same tab, filters, and scroll position as before.
- [ ] **Back button from Pipeline Board:** Says "Back to Pipeline" and returns to the Pipeline Board with the same job selected, same scroll position, same column view as before.

### 2.9 Security Audit
**How to check:** Run the two Security Audit prompts from the Fix Guide. Then do these manual checks.

- [ ] **F6 API key field:** The key you type is hidden (shows dots). Open browser DevTools → go to Application tab → check LocalStorage and SessionStorage → the Groq API key should NOT appear there.
- [ ] **F6 security note** is visible in the UI below the API key field.
- [ ] **F7 Resend key field:** Same checks — key is masked in the UI, not saved in LocalStorage or SessionStorage.
- [ ] **F7 Send button** is grayed out when no Resend key has been entered in the current session.
- [ ] Run the **F6 Security Audit prompt** → it reports no violations.
- [ ] Run the **F7 Security Audit prompt** → it reports no violations.

---

## Phase 2 — Fix Guide

### Business Rule Violations
**How to check:** Cross-reference each rule code (R2.4, R3.2, R4.1, R5.8, etc.) against the checklist.

**Fix prompt:**
```
Fix the following business rule violation in the HR Recruitment Tracker.

RULE VIOLATED: [e.g. R3.2 — duplicate application guard not blocking active applications]

EXACT RULE: [paste the relevant rule text from this guide]

WHAT IS HAPPENING: [describe current wrong behavior]

WHAT SHOULD HAPPEN: [describe correct behavior]

Do not change any other logic. Fix only this specific rule.
```

---

### ID Format Errors
**How to check:** Create a new job and a new candidate, inspect the generated IDs.

**Fix prompt:**
```
Fix ID generation in the HR Recruitment Tracker.

PROBLEM: [e.g. "jobId generates as 'Engineering26001' instead of 'ENG26001'" OR "candidateId is not zero-padded to 6 digits"]

jobId rules:
- Format: {PREFIX}{2-digit-year}{3-digit-sequence}
- PREFIX mapping: Engineering=ENG, Marketing=MKT, Human Resources=HRS, Product=PRD, Finance=FIN, Design=DSN, Sales=SAL
- Sequence = max existing for that PREFIX + 1, zero-padded to 3 digits (e.g. 001, 002, 003)
- Example: MKT26001, ENG26002

candidateId rules:
- Format: CAN{6-digit-sequence}
- Global sequence across all candidates, starting at 000001
- Example: CAN000001, CAN000002
```

---

### API / Security Errors
**How to check:** Run the security audit prompts above. Also open browser DevTools → Application → LocalStorage, SessionStorage — should be empty of API keys.

**Fix prompt:** Use the security audit prompts directly — they are already structured as fix instructions.

---

### CVR / Health Metric Calculation Errors
**How to check:** Use mock data with known values and manually calculate expected CVR%.

**Fix prompt:**
```
Fix the Dashboard CVR calculation for [stage name] in the HR Recruitment Tracker.

CURRENT RESULT: [what the UI shows]
EXPECTED RESULT: [what it should be based on mock data]

CVR formula for intermediate stages:
  CVR% = (PassedFrom(S) + ActiveIn(S)) / (PassedFrom(S) + ActiveIn(S) + RejectedAt(S)) × 100
  - PassedFrom(S): applications that have progressed past stage S to any higher stage
  - ActiveIn(S): applications currently at stage S
  - RejectedAt(S): applications where stage === "Rejected" AND rejectedAtStage === S

CVR formula for Hired (terminal):
  CVR% = Count of Hired Applications / N_Total × 100
  N_Total = total applications for selected open job cohort

Applied stage always = 100%.

Cohort isolation: only include applications from jobs where status === "Open".
```

---

---

# PHASE 3 — Firebase Realtime Database Integration

**Goal:** Replace all static/mock data with live Firebase RTDB. Two prompts, run in order. Do not run Prompt 2 until Prompt 1 is verified working.

---

## ⚠️ Google AI Studio — Firebase Config Key Warning

> **Before pasting either prompt into Google AI Studio:** When the AI asks for your Firebase config or authentication credentials during generation, **provide the config values only in the chat input box when prompted — never paste your Firebase config object (apiKey, authDomain, databaseURL, etc.) directly inside the prompt text itself.**
>
> **Why:** Google AI Studio may cache or log prompt content. Your Firebase `apiKey` and `databaseURL` must not be embedded in any stored prompt.
>
> **What to do instead:**
> 1. Paste the prompt below as-is. It contains a placeholder `YOUR_DATABASE_URL`.
> 2. When the AI asks "what is your database URL?" or requests config details, provide them in that follow-up message — not in the original prompt.
> 3. After the code is generated, move all Firebase config values into a `.env` file (e.g. `VITE_FIREBASE_DATABASE_URL=...`) and reference them via `import.meta.env.VITE_FIREBASE_DATABASE_URL` in code. **Never commit `.env` to git.**
> 4. Add `.env` to your `.gitignore` immediately.

---

## Phase 3 — Prompt 1: Integrate Firebase Realtime Database

Run this first. It wires up read/write connectivity without auth. Verify data flows before moving to Prompt 2.

```
WHAT — Integrate Firebase Realtime Database into my HR Recruitment Tracker web app for full real-time connectivity. Do not change any UI. Only replace the data layer — all business logic and component structure from Phase 2 remains unchanged.

DATABASE URL: YOUR_DATABASE_URL
(Security rules are currently set to public read/write — auth will be added in the next step.)

HOW IT BEHAVES:

1. Firebase Initialization:
- Install and import firebase/app and firebase/database.
- Initialize the Firebase app using the provided databaseURL.
- Export the database instance for use across all modules.
- Store the databaseURL in an environment variable (VITE_FIREBASE_DATABASE_URL). Do not hardcode it directly in source files.

2. Real-time Listening Logic (Read) — apply to ALL data-dependent pages:
- Use a useEffect hook with onValue() to listen to the relevant RTDB path for each page/component.
- Update the corresponding React state (e.g. setJobs, setCandidates, setApplications) whenever data changes in RTDB.
- Include the cleanup function — call off() on the listener reference inside the useEffect return — to prevent memory leaks on component unmount.
- Pages that need onValue listeners: Dashboard (/jobs, /applications, /candidates), Jobs (/jobs), Candidates (/candidates, /applications), Pipeline Board (/applications filtered by jobId), Feedback (/applications, /applications/{id}/feedbacks), Mailing Cycle (/jobs, /applications), Application Detail (/applications/{applicationId}, /applications/{applicationId}/feedbacks).

3. Data Update Logic (Write) — apply to ALL write operations:
- Implement an async handleUpdate(path, key, value) function using Firebase update() to modify a specific node.
- Include proper try/catch blocks: on success show a toast confirmation, on error show an error toast.
- All existing write operations from Phase 2 (create job, create candidate, create application, add feedback, stage transitions, close job, delete operations) must route through Firebase update() or set() calls.

4. RTDB Data Structure — write all data to these exact paths:
/jobs/{jobId} — jobId, title, department, location, employmentType, headcount, hired_count, requiredSkills, description, deadline, status, createdDate
/candidates/{candidateId} — candidateId, fullName, email, phone, hasHiredApplication, createdDate
/applications/{applicationId} — applicationId, candidateId, candidateName, jobId, jobTitle, cvLink, stage, applicationDate, lastActivityDate, rejectedAtStage, batchEmailLogs: { rejectedNotificationSent: boolean, rejectedNotificationSentAt: timestamp | null }
/applications/{applicationId}/feedbacks/{feedbackId} — feedbackId, interviewer, technicalScore, communicationScore, cultureFitScore, comments, recommendation, createdDate
/metadata/job_counters/{PREFIX} — maxSeq (number) — per-department sequence counter
/metadata/candidate_global_counter — maxSeq (number) — global candidate sequence counter

5. Atomic Transactions for ID generation:
- jobId (R2.7): use runTransaction on /metadata/job_counters/{PREFIX}. Read maxSeq, return maxSeq + 1. Generate jobId as PREFIX + 2-digit-year + zero-padded-3-digit-sequence. Example: MKT26001.
- candidateId (R3.6): use runTransaction on /metadata/candidate_global_counter. Global counter, format CAN + zero-padded-6-digit-sequence. Example: CAN000001.
- hired_count: increment via runTransaction when application moves to Hired. Decrement when a Hired application is deleted.

6. Cascade Delete operations:
- Delete Job (R2.8): build a multi-path null-update object covering /jobs/{jobId}, all linked /applications/{applicationId}, and all nested /applications/{applicationId}/feedbacks/{feedbackId}. Fire as a single update() call.
- Delete Candidate: same pattern — /candidates/{candidateId} + all linked applications + their nested feedbacks.
- Delete Application: /applications/{applicationId} + all its /feedbacks/{feedbackId}.
- Unlink Application: same as Delete Application but leave /candidates/{candidateId} intact.

7. Job Title denormalization (R2.11):
- When a job title is edited: build a multi-path update() object that simultaneously updates jobTitle in all linked application records at /applications/{applicationId}/jobTitle.

CONSTRAINTS:
- Firebase Realtime Database only — not Firestore.
- All onValue listeners cleaned up with off() on unmount.
- Never store Groq API key or Resend API key in RTDB or any Firebase path.
- All Phase 2 business rules unchanged — only the data source changes.
- SessionStorage / URL params for UI state preservation unchanged.
- Firebase config values must be read from environment variables, not hardcoded.

EDGE CASES:
- If cascade delete partially fails: show error toast, log error, do not leave orphaned records.
- If runTransaction fails due to collision: Firebase retries automatically — no extra handling needed.
- Offline: Firebase RTDB handles caching natively — no extra implementation needed.
```

---

## Phase 3 — Prompt 2: Secure Firebase with Anonymous Authentication

Run this only after Prompt 1 is verified working. This adds the auth guard that matches the `auth != null` database rule.

```
WHAT — Secure my Firebase Realtime Database using Anonymous Authentication combined with my existing real-time listeners. My React app has NO login screen and I do not want to build one. Do not change any UI. Only add the auth layer on top of the existing Firebase integration from Prompt 1.

DATABASE URL: YOUR_DATABASE_URL
Current database rule to enforce: { "rules": { ".read": "auth != null", ".write": "auth != null" } }

HOW IT BEHAVES:

1. Firebase Setup — add Auth imports:
- Add imports for getAuth and signInAnonymously from firebase/auth alongside existing getDatabase imports.
- Initialize the Firebase Auth instance alongside the existing database instance.

2. Authentication + Real-time Integration inside useEffect:
- Inside every useEffect that sets up an onValue listener: FIRST call signInAnonymously(auth) and await its resolution.
- Only AFTER sign-in is successfully resolved (auth != null is now true): trigger the onValue() listener on the relevant RTDB path.
- Show a loading state while auth is resolving — never render DB-dependent UI before auth completes.
- If signInAnonymously fails: show error state "Unable to connect. Please refresh the page." Do not attempt any DB operations.
- Cleanup: unsubscribe the onValue listener (off()) in the useEffect return. Auth session persists for the browser session — no need to re-sign-in on every listener.

3. Update Handler — no changes needed:
- The existing async handleUpdate(path, key, value) function using update() will now safely execute because the user is anonymously authenticated.
- Wrap with a guard: if auth.currentUser is null, abort the write and show error toast "Authentication required. Please refresh."

4. Apply auth guard to ALL write operations:
- Every write function (create job, create candidate, create application, add feedback, stage transition, delete, cascade delete, runTransaction calls) must check auth.currentUser !== null before executing. Abort with error toast if null.

CONSTRAINTS:
- Do not build a login UI — anonymous auth only.
- Auth must resolve before ANY onValue listener is attached.
- Auth must resolve before ANY write or transaction is executed.
- Loading state shown during auth resolution — no blank screen, no error flash.
- If auth fails: error state shown, zero DB operations attempted.
- Do not change any UI styling, layout, or component structure.
- Firebase config values remain in environment variables — do not hardcode.
```

---

---

## Phase 3 — Expected Output Checklist

> Run the **Prompt 1 checklist first**. Only proceed to Prompt 2 when all Prompt 1 boxes are ticked.

### 3.0 — After Prompt 1: Firebase Connected (no auth yet)
**How to check:** Create a job, then open your Firebase Console and look under the database. The data should appear there in real time.

- [ ] **Data appears in Firebase Console:** After creating a job or candidate in the app, open Firebase Console → Realtime Database → you can see the record appear under `/jobs` or `/candidates` without refreshing the console.
- [ ] **Firebase config is not visible in your code files:** Open your project's source files — the database URL and API key should not be written directly in any `.js` or `.jsx` file. They should only be in a `.env` file.
- [ ] **`.env` file is not being tracked by git:** Run `git status` — the `.env` file should not appear in the list of files to commit.
- [ ] **All pages show live data:** The Jobs list, Candidates list, Pipeline Board, Dashboard — all pull real records from Firebase, not hardcoded mock data.
- [ ] **Changes appear instantly:** Open the app in two browser tabs. Create a job in tab 1. Without refreshing tab 2, the job appears there too.
- [ ] **Deleting a job removes everything:** Delete a job in the app → go to Firebase Console → check that the job, its linked applications, and their feedbacks are all gone. Nothing is left behind.
- [ ] **Job IDs still follow the correct format:** Creating a Marketing job still gives `MKT26001`. The format did not break after switching to Firebase.
- [ ] **Candidate IDs still follow the correct format:** Still `CAN000001`, `CAN000002`, etc.
- [ ] **hired_count updates correctly:** Pass a candidate to Hired → the openings column on the Jobs page updates (e.g. from "0/3" to "1/3").

### 3.1 Data Structure (spot-check in Firebase Console)
**How to check:** Create one of each record type, then look in Firebase Console to confirm the data shape.

- [ ] **A job record** has these fields visible: jobId, title, department, location, headcount, hired_count, status, deadline, createdDate — and any others you filled in.
- [ ] **A candidate record** has: candidateId, fullName, email, phone, createdDate.
- [ ] **An application record** has: applicationId, candidateId, jobId, stage, applicationDate, lastActivityDate. Also has a `batchEmailLogs` section with `rejectedNotificationSent` (true/false).
- [ ] **A feedback record** appears nested under its application: in Firebase Console it shows under the application's node, not as a separate top-level entry.
- [ ] **Metadata counters exist:** Under `/metadata` you can see `job_counters` (with entries per department) and `candidate_global_counter`.

### 3.2 Real-time Sync
**How to check:** Open the app in two browser tabs side by side.

- [ ] **Dashboard updates automatically:** Move a candidate to Hired in tab 1 → the Hired Applications count on the Dashboard in tab 2 goes up without refreshing.
- [ ] **Jobs table updates automatically:** Add or close a job in tab 1 → it appears/changes in tab 2 without refreshing.
- [ ] **Pipeline Board updates automatically:** Pass a card in tab 1 → the card moves to the new column in tab 2 without refreshing.
- [ ] **Feedback page cleans up automatically (R5.11):** Have an application visible on the Feedback page in tab 2. In tab 1, pass that application from Interview to Assessment → it disappears from the Feedback page in tab 2 automatically.
- [ ] **No memory leak check:** Navigate between pages multiple times, then come back → the app still responds normally. Data doesn't duplicate or freeze. (If you see duplicated items appearing, there is a listener cleanup issue — use the fix prompt.)

### 3.3 Concurrent ID Generation
**How to check:** Have two people (or two browser tabs) create a job in the same department at the exact same moment.

- [ ] **No duplicate Job IDs:** If two Marketing jobs are created simultaneously, one gets `MKT26001` and the other gets `MKT26002` — they are never both `MKT26001`.
- [ ] **No duplicate Candidate IDs:** Same test — two candidates created at the same time get different `CAN00000X` IDs.

> 🔍 **If duplicates appear:** Use the Transaction fix prompt in the Fix Guide.

### 3.4 Cascade Deletes
**How to check:** Create a full chain (job → application → feedback), then delete from the top.

- [ ] **Delete a job:** After confirming deletion, go to the Candidates page → the applications linked to that job are gone. Go to Firebase Console → nothing remains under that job's applications or their feedbacks.
- [ ] **Delete a candidate:** Their applications are gone. Their feedbacks are gone. Nothing orphaned in Firebase.
- [ ] **Unlink an application:** The application and its feedbacks are gone. The candidate profile still exists in the Candidates list.

### 3.5 — After Prompt 2: Auth Guard Active
**How to check:** Update the Firebase security rules to `auth != null`, then try these checks.

- [ ] **Loading state works:** Refresh the app → for a brief moment you see a loading indicator (not a blank screen, not an error). Then the data loads normally.
- [ ] **Rules are blocking unauthenticated access:** After setting `auth != null` in Firebase Console → open the database URL directly in your browser → you should see a "Permission denied" error, not the actual data.
- [ ] **App still works normally:** After setting the rules, go through the app normally — creating jobs, moving pipeline cards, submitting feedback — everything still works. The anonymous auth is happening invisibly in the background.
- [ ] **Auth error handling:** If you temporarily break the Firebase config (e.g. wrong database URL), the app should show "Unable to connect. Please refresh the page." instead of crashing or showing a blank screen.
- [ ] **Auth persists across navigation:** Navigate from Dashboard → Jobs → Pipeline → back to Dashboard. You are not asked to "reconnect" or shown a loading state again between pages within the same session.

### 3.6 End-to-End Flows
**How to check:** Do each of these full user journeys from start to finish.

- [ ] **Full hiring flow:** Create a job → add a candidate → link them to the job → go to Pipeline and move them through all 6 stages (Applied → Screening → Interview → Assessment → Offer → Hired) → Dashboard shows +1 Hired. Each step works and data persists.
- [ ] **Rejection flow:** Move a candidate to Interview → reject them from the Pipeline Board → they disappear from the board → the Feedback page no longer shows them in the active list.
- [ ] **Feedback flow:** Move a candidate to Interview → add feedback with scores → go to Application Detail → the feedback card appears, the average score and recommendation badge are correct.
- [ ] **AI JD flow:** Generate a JD → click Save as Job → complete the modal → new job appears in the Jobs list in Firebase with a correct Job ID.
- [ ] **Batch email flow:** Close a job → go to Mailing Cycle → select the job → send emails → go to Firebase Console and confirm those applications have `rejectedNotificationSent: true`. The job disappears from the default mailing list.
- [ ] **Delete cascade flow:** Delete a job that has applications with feedbacks → confirm in the app that everything is gone → confirm in Firebase Console that no orphaned records remain.

---

## Phase 3 — Fix Guide

### Real-time Listener Errors
**How to check:** Open app in two browser tabs. Make a change in tab 1. Tab 2 should update without refresh.

**Fix prompt:**
```
Fix real-time synchronization in the HR Recruitment Tracker.

WHAT IS NOT SYNCING: [e.g. "Pipeline Board does not update in tab 2 when a card is moved in tab 1" OR "Feedback screen does not remove application when it is passed to Assessment in Pipeline Board"]

RULES:
- Use Firebase RTDB onValue listener on the relevant data path.
- Listener must be set up in useEffect and unsubscribed (off()) in the cleanup return.
- [For Feedback R5.11]: filter client-side to only show applications where stage === "Interview". When stage changes in RTDB, onValue fires and re-filters — application disappears automatically.
- Pipeline Board cards: listen on /applications path filtered by jobId. When stage changes, board re-renders from RTDB snapshot.
```

---

### Transaction / ID Generation Errors
**How to check:** Have two users create a job or candidate at the exact same time. Both should get unique IDs.

**Fix prompt:**
```
Fix atomic ID generation transaction in the HR Recruitment Tracker.

PROBLEM: [e.g. "Two concurrent job creations in the ENG department both generated ENG26001" OR "candidateId sequence skipped a number after failed creation"]

jobId transaction rules:
- Path: /metadata/job_counters/{PREFIX} where PREFIX is the 3-letter department code
- Use Firebase runTransaction() on this path
- Transaction reads current maxSeq, returns maxSeq + 1
- After transaction: generate jobId as PREFIX + 2-digit-year + zero-padded-3-digit-sequence
- Sequence must NEVER reset — always max + 1 even after deletions

candidateId transaction rules:
- Path: /metadata/candidate_global_counter
- Use Firebase runTransaction() on this path
- Global counter — never per-department
- Format: CAN + zero-padded-6-digit-sequence
```

---

### Cascade Delete Errors
**How to check:** After deleting a job, check in Firebase console that no applications or feedbacks remain for that jobId.

**Fix prompt:**
```
Fix cascade delete in the HR Recruitment Tracker.

PROBLEM: [e.g. "Deleting a job leaves orphaned applications in /applications" OR "Deleting a candidate does not delete nested feedbacks"]

Use Firebase RTDB multi-path update() with null values to simultaneously delete:
- Delete Job: { "/jobs/{jobId}": null, "/applications/{app1Id}": null, "/applications/{app2Id}": null, ... } — gather all applicationIds for this jobId first, then build the multi-path object including all nested feedback paths.
- Delete Candidate: gather all applicationIds for candidateId, then null all: /candidates/{candidateId}, each /applications/{applicationId}, each /applications/{applicationId}/feedbacks/{feedbackId}.
- Delete Application: null /applications/{applicationId} and all /applications/{applicationId}/feedbacks/{feedbackId}.
- Unlink Application: same as Delete Application but leave /candidates/{candidateId} intact.

Build the full null-path object before calling update() to ensure atomicity.
```

---

*HR Recruitment Tracker · Vibe Coding Guide · v1.0*
