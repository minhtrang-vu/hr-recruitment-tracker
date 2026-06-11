# HR Recruitment Tracker — UI Planning Document

# A. Key Component Requirements

> **Icon system (global):** All icons use the **Slicons – Essential Line Icons** set. Rules: outline/line style only (no filled glyphs), single consistent stroke weight, rounded joins, default sizes **16 / 20 / 24px**, color inherits from `currentColor`. Never mix icon families and never use emojis as icons.

---

## Layout & Navigation Components

| Component | Specification |
|---|---|
| **App Background** | Full viewport background `#F3F4F6`. Provides visual separation between navigation and content. Outer padding: 16px desktop / 12px tablet / 0px mobile. |
| **Sidebar (Desktop)** | Fixed left navigation, 220px width, 100vh height, attached directly to the left edge of the viewport. Dark background with subtle elevation. Contains logo at top, navigation menu (Dashboard, Jobs, Candidates, Pipeline, AI JD Generator), and optional user profile section at bottom. Nav items: 40px height, rounded corners, icon + label. Default state blends into sidebar background. Hover = slightly lighter charcoal-gray surface. Active = elevated dark-gray card (surface-elevated) with subtle shadow and semibold text. No bright accent-colored backgrounds inside the sidebar. |
| **Sidebar Layout** | Sidebar stretches from top to bottom of the viewport with no outer margin. |
| **Sidebar (Tablet)** | Collapsed version, width 48px. Icon-only navigation. Tooltip displays page name on hover. Maintains active-state highlight. |
| **Bottom Tab Bar (Mobile)** | Fixed to bottom of viewport, height 56px. Contains 5 tabs (icon + short label): Dashboard · Jobs · Candidates · Pipeline · More ··· Active tab indicated by accent green underline and icon tint. "More" tab opens a bottom sheet containing: AI JD Generator, Email Batch Dispenser. Active state on "More" tab persists while on either sub-page. Sub-pages include a back arrow (`arrow-left`) in the header to return. |
| **Top Header Bar** | Located inside the main content container. Left: page title. Right: primary action button. Height ~72px. Consistent across all pages. |
| **Main Content Wrapper** | Positioned to the right of the sidebar. Sits inside a large white card container rather than touching the viewport edges. Features 24px border radius, subtle shadow, and clear separation from the app background. |
| **Main Content Area** | Occupies all remaining width after sidebar. White background with 24px rounded corners. Internal padding: 32px desktop / 24px tablet / 16px mobile. Content sections organized using cards with consistent spacing. |

---

## F1 — Dashboard (`/dashboard`)

| Component | Description |
|---|---|
| **KPI Stat Cards ×4** | Open Jobs, Total Candidates, Active Applications, Hired Applications. Each card = light/white frosted surface with: small label (top), large stat number, trend delta line ("↑ / ↓ x% than last month") using Slicons `trending-up` / `trending-down`. Desktop 1×4 / Tablet+Mobile 2×2, min-height 80px. No mini charts, no colorful emojis/icons. |
| **Hiring Funnel Bar Chart** | Counts per stage (Applied → Screening → Interview → Assessment → Offer → Hired) + a dedicated **Rejected** drop-off layer. 200px tall, stacked on mobile. Bar color: vertical gradient from left `#0B2B26` to right `#8EB69B`. |
| **Recruitment Health Card (dark)** | Dark accent card (`#0F1F18`) for headline metric — circular score gauge for at-a-glance recruitment health score. Radial glow effect using `#2D6A4F` originating from top-left, auto-adjusted based on card size, fading smoothly into the dark surface. |
| **Empty State** | "No data yet. Start by creating your first job opening." with a Slicons `inbox`/`file` illustration. |
| **Refresh Dashboard** | Mobile: Replaced by FAB. |

---

## F2 — Job Management (`/jobs`)

| Component | Description |
|---|---|
| **Page header + "Add Job" button** | Slicons `plus` leading icon. Mobile: becomes a **FAB** (bottom-right). |
| **Filter bar** | Search by title (Slicons `search` icon input), filter by status (dropdown), filter by department (dropdown), "Clear filters" (Slicons `x`). |
| **Searchable data table** | Columns: title, department, location, deadline, status, actions. Row actions use Slicons `toggle` (open/close job), `edit`, `trash`. Mobile: Job Cards. |
| **Status badge** | "Open" / "Closed" (Closed muted). |
| **Table footer** | "Showing n of total jobs". |
| **Empty-state illustration** | Slicons `briefcase`/`folder` line illustration. |

---

## F3 — Candidate & Application Management (`/candidates`)

**Tab structure:** Candidates ↔ Applications. Full-width pill/underline tab switcher below the page header. Candidates tab shows Candidate Cards, Applications tab shows Application Cards. Both vertically stacked on mobile.

| Component | Description |
|---|---|
| **Candidates header + "Add Candidate"** | Slicons `user-plus`. Mobile: FAB. |
| **Candidates search bar** | Slicons `search`, debounced. Search by name/email. |
| **Candidates data table** | Columns: name, email, phone, created date, actions. Job column: shows most recent active application's job title (truncated) + stage badge. If candidate has multiple applications, append a `+n` tag (e.g. "+2") where n = total applications minus 1. No dot indicators. Mobile: Candidate Cards. |
| **Applications filter bar** | Search by name, filter by job, filter by stage. |
| **Applications data table** | Columns: name, email, job title, stage, date, actions. Each row = 1 Application; click row → `/applications/:applicationId`. Mobile: Application Cards. Card click → `/applications/:applicationId`.  Job column: shows most recent active application's job title (truncated) + stage badge. If candidate has multiple applications, append a "+n" tag (e.g. "+2") where n = total applications minus 1. No dot indicators.|
| **Pagination summary footer** | "Showing n of total applications", real-time. |
| **Stage badge chips** | Color-coded per stage. |
| **Empty-state illustration** | Both tabs. |
|**Active Tracking Pill / Status**| If candidate has multiple applications, append a "+n" tag (e.g. "+2") where n = total applications minus 1. No dot indicators.|

---

## F4 — Pipeline Board (`/pipeline`)

| Component | Description |
|---|---|
| **Mandatory Job selector dropdown** | Must pick one job before the board renders. No "All Jobs" mode. |
| **6 Kanban columns** | Applied → Screening → Interview → Assessment → Offer → Hired. Desktop/tablet: each column min-width = 280px. Column padding: 12px horizontal. Cards fill column width with `gap-3` vertical spacing. |
| **Application cards** | Frosted card: candidate name, job title, application date. Card width: `calc(100% - 24px)`, accounting for 12px padding on each side of the column. |
| **"Pass" button** | Slicons `arrow-right`. Disabled at Hired and on closed jobs. |
| **"Reject" button** | Slicons `x`, icon-only, 44×44px touch target, tooltip "Reject Candidate" on hover/long-press. Confirmation required. Disabled on closed jobs. |
| **"Job Closed" badge** | Displayed on cards belonging to a closed job. Pass and Reject both disabled. background: "bg-gray-700",text: "text-white",border: "border-gray-600",dot: "bg-gray-400"|
| **Mobile Layout** | Horizontal scroll Kanban; each column width = 85vw so cards fill the screen. Cards stacked vertically per column. Pass and Reject as full-width buttons on each card. |

---

## F5 — Interview Feedback (`/feedback`)

Desktop: 30–35% left / 65–70% right split. Mobile: stacked.

| Component | Description |
|---|---|
| **Page header + application selector dropdown** + **Applicant Filter Bar** | Search by name, job, department, or ID. Filter by job, filter by stage — stage filter locked to Interview. |
| **"Add Feedback" button** | Slicons `edit`/`plus`. Enabled only when stage === "Interview". |
| **Feedback card list** | Each card: interviewer, 3 scores (Technical / Communication / Culture Fit), average, recommendation badge, comments. Desktop/Tablet 2-col grid; Mobile 1-col with 3 scores in a horizontal row and full-width badge below. |
| **Recommendation badge** | Strong Hire / Hire / Hold / Reject (color-coded, system-generated). |
| **Left: Candidate Profile Summary** | Name · Job Title · Current Stage · Metadata|
|**Left: Average Score Card**|Radial gauge · overall avg · total evaluations · award icon|
|**Right: Feedback History**|Newest first. Interviewer · 3 scores · recommendation badge · comments. Desktop/tablet 2-col grid; mobile 1-col.|
| **Empty-state** | "No interview feedback has been submitted yet." |

---

## F6 — AI JD Generator (`/ai-generator`)

Desktop/tablet: 40/60 split (input left, preview right). Mobile: stacked.

| Component | Description |
|---|---|
| **Input panel** | Job Title · Department · Skills · Description · Tone (Professional default) · Generate button (Slicons `sparkles`). |
| **API Key Input** | Field label: "AI API Key" + "Configure Key" ghost/outline button to the right of the label. Input type: password (masked). Placeholder: `sk-ant-...`. Full-width on mobile. Helper link below field: "Get your API key at [console.groq.com/keys](https://console.groq.com/keys)" — clickable, opens in new tab, muted color with underline on hover. Security note: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry." Validation error: "Please enter a valid API key to generate a job description." Wrong/rejected key error: "Invalid API key. Please check and try again." |
| **Generate button** | Loading spinner (Slicons `refresh`) + disabled state. Full-width on mobile. |
| **Preview panel** | Read-only JD. Sections: Job Overview · Responsibilities · Requirements · Benefits · Application Process. |
| **"Regenerate" button** | Slicons `refresh`. Mobile 50% width. |
| **"Save as Job" button** | Slicons `save`. Opens pre-filled Create Job modal. Mobile 50% width. |
| **Error message** | "Generation failed. Please try again." with Slicons `warning`. |

---

## F7 — Email Batch Dispenser (`/email`)

Desktop/tablet: 40/60 split (template preview left, recipient list right). Mobile: step-by-step screens — Step 1: Select target group → Step 2: Preview template → Step 3: Review & send recipients.

| Component | Description |
|---|---|
| **API Key Input** | Input type: password (masked). Placeholder: `sk-ant-...`. Full-width on mobile. Helper link below field: "Get your Resend API key at [resend.com/api-keys](https://resend.com/api-keys) — clickable, opens in new tab, muted color with underline on hover." — clickable, opens in new tab, muted color with underline on hover. Security note: "API keys are not saved to localStorage, sent to any server, or logged. Each session requires re-entry." Validation error: "Please enter a valid API key to generate a job description." Wrong/rejected key error: "Invalid API key. Please check and try again." |
| **Target Group Selector** | Switch between Hired Candidates and Rejected Candidates. |
| **Template Preview Panel** | Read-only email preview with sample candidate data rendered. |
| **Recipient Checklist** | Table with checkboxes. Columns: Name, Email, Application Stage. Users can exclude recipients before sending. |
| **Send Batch Email Button** | Primary CTA. Loading spinner + disabled state during processing. Full-width on mobile. |
| **Error Message** | "Email dispatch failed. Please try again." with Slicons `warning`. |

---

## Application Detail (`/applications/:applicationId`)

| Component | Description |
|---|---|
| **Application info card** | applicationId, fullName, email, phone, cvLink (Slicons `paperclip`/`link`), linked job title, applicationDate, stage badge. |
| **Progress summary** | Current stage, feedback count, overall average, current recommendation badge. |
| **Feedback history section** | Cards newest-first. |
| **"Add Feedback" button** | Enabled only when stage === "Interview". |
| **"Back to Applications" button** | Slicons `arrow-left`. |
| **Empty-state** | "No interview feedback has been submitted yet." |
|**Stage badge chips:**| Color-coded per stage. RULE: If the application's linked job status is CLOSED, all stage badges render as gray (bg-gray-200 text-gray-600) instead of their stage-specific color.|
---

## Shared Modal Layer

| Modal | Fields / Content |
|---|---|
| **Create / Edit Job** | title, department, location, employmentType, requiredSkills, description, deadline, status. Inline errors. |
| **Create / Edit Candidate** | fullName, email, phone, cvLink. Email + VN phone validation. |
| **Create Application (Link to Job)** | candidateId (auto), jobId (required dropdown of active jobs), appliedDate (auto-now). |
| **Add Feedback** | interviewer, technicalScore (1–5), communicationScore (1–5), cultureFitScore (1–5), comments, recommendation badge (system-generated). |
| **Confirmation dialog** | Slicons `warning`/`trash` + warning message + Confirm + Cancel. |

**Modal responsive:** Desktop/Tablet centered max-w 560px / max-h 80vh scrollable. Mobile bottom sheet with 4px drag-handle pill + sticky full-width 48px Save button. Backdrop = frosted blur.

---

## Cross-cutting / Global UI Components

| Component | Description |
|---|---|
| **Toast notifications** | Save/delete/move confirmations (Slicons `check-circle` success, `warning` error). |
| **Confirmation modal** | Required for all destructive actions. |
| **Empty states** | Every page, with Slicons line illustration + next-action guidance. |
| **Badge chips** | Stage / status / recommendation (fixed color mapping). |
| **Loading/Spinner states** | Slicons `refresh`/`loader`, especially AI Generate. |
| **FAB (mobile)** | Slicons `plus`, replaces "Add …". |
| **Radial gauge** | Reusable circular % gauge for single-ratio metrics. |
| **Map widget (optional)** | Reserved component pattern for any future geographic distribution view — must use a mapping library, never hand-drawn SVG paths. |
| **Promo / community card** | Optional green feature card pattern. |

---

# B. Design Standards

## Color Tokens

| Token | Value | Used for |
|---|---|---|
| `--background` (light canvas) | `#F0FAF4` | Main content area background |
| `--sidebar` (deep forest) | `#1A3A2E` | Sidebar surface, dark feature cards |
| `--surface` (mid green) | `#2D6A4F` | Secondary green surfaces / headers |
| `--card` | `#FFFFFF` frosted | KPI & content card fills |
| `--card-accent` (light green) | `#D8F3DC` | Tinted card fills, chart fills |
| `--primary` / `--accent` | `#52B788` | CTAs, active pill, focus ring, positive trend |
| `--feature` (near-black) | `#0F1F18` | Dark highlight cards (e.g. score gauge) |
| `--foreground` | `#13241C` on light / white on dark | Text — inverts with surface |
| `--muted-foreground` | gray | Helper / secondary text |
| `--destructive` | red tone | Delete / Reject / negative trend |

> **Inversion rule:** The app is **not** uniformly dark. Use dark text on light canvas & white cards; light text only on the dark sidebar and dark feature cards. Keep total palette to 3–5 colors. All colors via tokens — never direct `bg-white`/`text-black`.

---

## Typography

- **Font:** Sora (single family, multiple weights).
- **Page title:** 28–32px (mobile 20px), bold.
- **Section heading:** 18–20px.
- **KPI stat number:** 32px (mobile 24px), bold.
- **Body:** 14–15px, `leading-relaxed`.
- **Helper / trend text:** muted gray, ≥12px.

---

## Spacing & Layout

- Tailwind spacing scale (`p-4`, `gap-4`); no arbitrary values.
- Flexbox-first; grid only for 2D layouts (KPI grid, Kanban, feedback grid, split layout).
- Use `gap-*`; never mix margin/padding + gap on the same element.
- App shell = **dark sidebar + light content canvas**, responsive to bottom tab bar on mobile.

---

## Surface & Glassmorphism Style

- **Cards on light canvas:** white/near-white frosted surfaces, subtle border, soft shadow, `rounded-xl`/`2xl` radius.
- **Dark feature cards:** `#0F1F18` background, light text, accent-green data viz.
- `--radius`: consistent rounding across cards, modals, buttons, badges.
- Keep depth soft and layered; avoid heavy gradients (subtle green tint only).

---

## Icons (Slicons)

- Use **Slicons Essential Line Icons** everywhere; outline style, single stroke weight, `currentColor`.
- Sizes 16/20/24px; touch target wrapper ≥ 44×44px on mobile.
- Fixed icon-to-action mapping: `plus`=add · `edit`=edit · `trash`=delete · `x`=reject/close · `arrow-right`=Pass · `refresh`=regenerate · `save`=save · `search`=search · `warning`=error · `check-circle`=success · `trending-up/down`=KPI deltas.

---

## Accessibility & Responsive

- Touch targets ≥ 44×44px on mobile.
- Semantic HTML + ARIA roles, alt text, visible accent-green focus ring.
- Mobile-first transforms: sidebar → bottom tab bar, modal → bottom sheet, buttons → full-width, Add → FAB.
- Contrast: ensure ≥ AA on both light cards (dark text) and dark surfaces (light text).

---

## Consistency Rules

- One action type → one button variant (delete = destructive, CTA = primary).
- Fixed badge color mapping for stage / status / recommendation across the whole app.
- Empty state + confirmation dialog + toast are mandatory shared patterns on every page.
- All icons from Slicons only; never mix families or use emojis.
- KPI cards always pair a stat number with trend delta.
