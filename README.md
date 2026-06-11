**Project Planning Document**

**HR Recruitment Tracker** **System**

A web-based recruitment management system for HR teams to manage job openings, track candidates, log interview feedback, and generate job descriptions with AI assistance.

**1\. What does this app do?**

| HR Recruitment Tracker is a web application that supports HR departments in managing their entire recruitment workflow — from creating job openings and building a candidate database, to tracking pipeline stages, recording interview evaluations, and generating job descriptions using AI. The system is built as a single-page application with real-time Firebase Cloud Firestore persistence, designed for small-to-medium HR teams that need a centralized, multi-user collaborative tool. |
| :---- |

**2\. Who uses it and what do they need?**

| Recruiter Primary user — owns the full hiring cycle |
| :---- |
| Needs: A fast way to create job openings without writing job descriptions from scratch every time. |
| Needs: A single place to view and manage all candidates across positions. |
| Needs: A visual pipeline board to see where every candidate stands at a glance. |
| Needs: Real-time dashboard metrics to report on hiring progress. |
| Pain point: Data is currently scattered across spreadsheets with no single source of truth. |

| Interviewer Secondary user — participates in evaluation rounds |
| :---- |
| Needs: A structured form to log technical, communication, and culture fit scores after each interview. |
| Needs: A recommendation field to submit a clear hiring decision (Strong Hire / Hire / Hold / Reject). |
| Pain point: Feedback is given verbally or informally and never recorded consistently. |

**3\. What are the core features?**

| Module | Core functions |
| :---- | :---- |
| **F1  Dashboard** | KPI cards (Open Jobs, Total Candidates, Active Applications, Hired Applications), hiring funnel chart (including Rejected status), stage distribution |
| **F2  Job Management** | Add, view (linked in job title \+ job card), edit, delete, close jobs. Fields: title, department, location (remote/onsite), headcount, skills, deadline, status. Searchable table. |
| **F3  Candidate & Application Management** | Centralized Candidate DB: Add, view, edit, delete candidate profiles (General Info). Application DB: Link a candidate to a specific job. Attach a specific CV (cvLink) for each application. Track separate status/stage for each application. Filter by job, stage, name. Auto-enters Applied stage on creation. Candidate table displays a primary application pill (most recently active application, determined by `lastActivityDate` desc) with remaining applications shown as colored stage dots. Expanding a candidate row reveals all applications inline with score, recommendation, and View Detail access.  |
|  |  |
| **F4  Pipeline Board** | Kanban-style view across 6 stages: Applied → Screening → Interview → Assessment → Offer → Hired. Pass or reject candidates. Syncs with Candidate DB and Dashboard. |
| **F5  Feedback Logger** | Score candidates on Technical (1–5), Communication (1–5), Culture Fit (1–5). Add comments, system provide a hiring recommendation badge based on average score. Feedback links to candidate profile. |
| **F6  AI JD Generator** | Enter job title, department, headcount, responsibilities, qualifications → AI generates a professional JD. User can review then save directly as a new job.  |
| **F7 Batch Email Notification (Post-Closure)** | Automatically triggers when a job status changes to **Closed**. Allows users to send automated, template-based bulk emails partitioned by candidate group (`Hired` / `Rejected`). The system injects variables (`{candidateName}`, `{jobTitle}` into a fixed, pre-defined email template. Includes a preview interface for the recipient list and status tracking. |

**4\. What does it look like?**

**Layout**

Fixed left sidebar navigation linking to 6 pages (Dashboard, Jobs, Candidates, Pipeline, AI JD Generator, Mailing Cycle). Main content area fills the remaining width.Main content area fills the remaining width. Each page has a top header bar (page title on the left, primary action button on the right), followed by the page body (table, kanban board, form, or chart area).

Responsive: sidebar collapses to a bottom tab bar on mobile. Tables become horizontally scrollable. Modals stay centered with a max-width constraint.

**Style direction**

| Attribute | Direction |
| :---- | :---- |
| **Visual theme** | Glassmorphism — frosted glass cards (\#FFFFFF with subtle border \+ shadow), semi-transparent surfaces, soft depth layering on a light canvas background (\#F3F4F6). Dark feature cards (\#0F1F18) for contrast elements like the score gauge. |
| **Colour palette** | Green-dominant: deep forest (\#1A3A2E) as sidebar base, mid green (\#2D6A4F) for secondary surfaces/headers, accent green (\#52B788) for CTAs/active pills/focus rings, light green tints (\#D8F3DC for tinted fills, \#F0FAF4 for main content background). Dark text on light surfaces, light text only on dark sidebar and dark feature cards. |
| **Typography** | Clean sans-serif (Sora). Page titles: 28–32px (mobile 20px) bold. Section headings: 18–20px. KPI stats: 32px (mobile 24px) bold. Body: 14–15px, leading-relaxed. Helper text: muted gray, ≥12px. |
| **Key UI patterns** | Modal forms (centered desktop, bottom sheet mobile) for create/edit actions with confirmation dialogs for destructive actions; Kanban columns (6 stages: Applied → Hired) for pipeline view with job selector mandatory; KPI stat cards (4: Open Jobs, Total Candidates, Active Applications, Hired) on dashboard with trend deltas; badge chips for stage labels (Applied, Screening, Interview, Assessment, Offer, Hired) and recommendation badges (Strong Hire, Hire, Hold, Reject); toast notifications (check-circle success, warning error) for save/delete/move confirmations. |

**UX Flow** 

User lands on Dashboard with live metrics already populated → scans KPI cards and funnel chart to assess recruitment health → navigates to Pipeline to action pending candidates → → moves applications forward or rejects → navigates to Feedback to log new interview results → returns to Dashboard to verify counts updated.

**Key UX principles:**

* Every action that modifies data shows a toast confirmation ("Job saved", "Application moved to Screening"). Toasts automatically dismiss after a fast, non-intrusive duration of 3000ms (3 seconds).

* Actions (delete, reject) **and status-changing actions (moving an application to a new stage)** always require a confirmation modal before executing to prevent accidental progression.

* Empty states on every page guide the user toward the next action rather than showing a blank screen.

* Navigation always shows the active page highlighted in the sidebar.

* Contextual navigation must preserve UI states: Whenever a user drills down into a detail page from a filtered list or board (e.g., Pipeline Board), returning via the system's "Back" button must restore the exact view state (scroll position, active filters) without reloading data from scratch.

* Page Layout Structure: The top header bar of each page is strictly set to a fixed/sticky position at the top of the main content viewport. The scrollable content area sits immediately below the header, ensuring navigation controls and page actions remain perpetually visible while scrolling.

**Responsive UI Spec**  
**Breakpoints**

Mobile: \< 768px → Single column, bottom tab bar (56px, 5 tabs: Dashboard, Jobs, Candidates, Pipeline, More). "More" opens bottom sheet with AI JD Generator & Email Batch Dispenser.

Tablet: 768px – 1024px → Sidebar collapsed to icon-only (48px wide) with hover tooltips showing page names.

Desktop: \> 1024px → Full sidebar (220px wide) showing icon \+ text label. Dark forest surface (\#1A3A2E).

**Navigation**

Desktop: Fixed left sidebar, 220px wide, dark forest background (\#1A3A2E). Shows icon \+ text label per page. Nav items: 40px height, rounded corners. Hover \= lighter charcoal surface. Active \= elevated dark-gray card with semibold text. No bright accent backgrounds inside sidebar.

Tablet: Sidebar collapses to icon-only strip, 48px wide. Tooltips on hover show page name. Same dark background.

\*\*Mobile:\*\* Sidebar hidden entirely. Replaced by a bottom tab bar, fixed to viewport bottom, height 56px. Shows 6 icon \+ short label tabs (Dashboard, Jobs, Candidates, Pipeline, AI JD, Mailing).  Active tab highlighted with accent green underline (\#52B788). Sub-pages (AI JD Generator, Email Batch Dispenser) include back arrow (arrow-left) in header to return.

**Dashboard — KPI Cards & Charts**

Desktop: 4 KPI cards in a single row (4 columns). Each card: white frosted background (\#FFFFFF), label \+ large stat (32px bold) \+ trend delta (trending-up/down icon).

Tablet: 2×2 grid. Cards maintain same styling.

Mobile: 2×2 grid. Each card min-height 80px, stat number 24px bold, text truncated with ellipsis if needed. Funnel bar chart stacks vertically, full width. Chart height reduced to 200px on mobile. Bar color: vertical gradient from \#0B2B26 to \#8EB69B.

**Job Management & Candidate Management — Tables**

Mobile: Tables become horizontally scrollable. First column (Job Title / Candidate Name) sticky left. "Add Job" / "Add Candidate" converted to Floating Action Button (FAB) bottom-right, using Slicons plus icon, touch target ≥44×44px.

Application Management Table: Additional column added displaying Job Title being tracked. Table columns: Name, Email, Job Title, Stage, Date, Actions. Row click navigates to /applications/:applicationId. Mobile uses application cards with same click behavior.

All Devices: Status badges (Open/Closed) and stage badges (Applied, Screening, Interview, Assessment, Offer, Hired) use fixed color mapping. Empty state shows Slicons illustration \+ context message.

**Pipeline Board — Kanban**

Logic change: On Desktop/Tablet/Mobile UI, instead of "All Jobs" as default, Pipeline Board requires selecting a Job from a dropdown first before rendering the Kanban view for that specific job. No "All Jobs" Kanban view.

Candidate cards display: Candidate Name, Job Title, Application Date. Cards on light canvas: white frosted background, subtle border \+ shadow, rounded-xl.

Actions per card:

* arrow-right — Pass (disabled at Hired stage and on closed jobs)  
* x — Reject (requires confirmation dialog, disabled on closed jobs)

Job Closed badge displayed on cards belonging to closed jobs

Kanban columns (6 stages): Applied → Screening → Interview → Assessment → Offer → Hired

Mobile: Horizontal scroll Kanban, each column width 85vw so cards fill the screen. Cards stacked vertically per column. Pass and Reject as full-width buttons on each card (≥44px touch height).

**Interview Feedback**

Desktop: 30-35% left / 65-70% right split. Left panel: candidate profile summary \+ Average Score Card (radial gauge, overall avg, total evaluations, award icon). Right panel: feedback history in 2-column grid.

Tablet: 2-column grid for feedback cards. Left panel proportionally adjusted.

Mobile: Single column stacked (left panel above, feedback history below). Score fields (Technical, Communication, Culture Fit, each 1-5) display as horizontal row of 3 within each feedback card. Recommendation badge (Strong Hire/Hire/Hold/Reject) full width below scores.

Add Feedback enabled only when stage \=== "Interview". Applicant filter bar includes search by name/job/department/ID, filter by job, filter by stage (stage always set to Interview).

**AI JD Generator — Split Layout**

Desktop/Tablet: Side-by-side 2-column layout. Left input panel 40% width, right preview panel 60% width. Input panel: Job Title, Department, Skills, Description, Tone (Professional default), API Key input (masked, security note). Generate button with sparkles icon. Preview panel: read-only sections (Job Overview, Responsibilities, Requirements, Benefits, Application Process).

Mobile: Single column stacked layout. Input panel on top, preview panel below. "Generate" button full width. When output is generated, page auto-scrolls to preview panel. Regenerate (refresh icon) and Save as Job (save icon) buttons side by side, each 50% width.

API Key field: Helper text "Your key is used only for this session and never stored." Validation error \+ wrong key error with warning icon.

**Batch Email Dispatcher**

Desktop/Tablet: Split grid modal/view — left panel renders static read-only email template layout (sample candidate data rendered), right panel renders scrollable recipient datatable with parent selection checkboxes. Columns: Name, Email, Stage. Users can exclude recipients.

Mobile: Modal transforms into full-screen mobile bottom-sheet layout (max-height 95vh). Modal incorporates dual-tab navigation inside: Tab 1 "Template Preview", Tab 2 "Recipient List ({n})". Primary execution action button ("Send Email") remains pinned as sticky footer (height 48px) above software keyboards. Loading spinner \+ disabled while sending. Error toast with warning icon on failure.

Target group selector: Hired Candidates / Rejected Candidates.

**Modals**

Desktop/Tablet: Centered overlay, max-width 560px, max-height 80vh, vertically scrollable if content overflows. Backdrop overlay darkened with frosted blur effect. Used for: Create/Edit Job, Create/Edit Candidate, Create Application, Add Feedback, Confirmation Dialog.

Mobile: Modal slides up from bottom as bottom sheet. Full viewport width, max-height 90vh. Top of modal has drag handle indicator (4px wide pill, rounded). Scrollable internally. Primary action button (Save) fixed to bottom of modal, full width, height 48px so it stays reachable above keyboard. Sticky full-width Cancel/Save buttons. Backdrop: frosted blur.

**Touch Targets**

All interactive elements on mobile must meet minimum touch target size: 44×44px.

Applies to: Buttons (primary, secondary, destructive), Table action icons (edit, trash, toggle, x, arrow-right), Kanban card buttons (Pass, Reject), Tab bar items, Dropdown triggers, Modal close button, FAB (Floating Action Button), Filter bar clear button (x).

**Typography Scaling**

Page title: Desktop 28–32px bold, Mobile 20px bold

Section header: Desktop 18–20px, Mobile 16px

Body text: Desktop 14–15px leading-relaxed, Mobile 14px leading-relaxed

Helper / muted text: Desktop 13px, Mobile 12px

KPI card number: Desktop 32px bold, Mobile 24px bold

Font family: Sora (single family, multiple weights). Use Tailwind spacing scale only. No arbitrary values.

**3b. What are the main screens? (Screen Inventory)**

The app consists of 6 primary screens plus 1 modal overlay layer shared across all screens.

| Screen | Route | Key components | Primary action |
| :---- | :---- | :---- | :---- |
| **Dashboard** | /dashboard | 4× KPI stat cards, **Hiring Funnel Bar Chart** (with cohort-based historical isolation and non-skewing localized conversion rate logic), **Success vs. Attrition card**, **Recruitment Health Metric Card** (with dynamic throughput velocity tracking).. | Read-only — no actions |
| **Job Management** | /jobs | Page header \+ "Add Job" button, filter bar (search by title, filter by status dropdown, filter by department dropdown, filter by location dropdown: Remote/Onsite, Clear button), searchable data table (columns: title, department, location (remote/onsite), deadline, openings (hired\_count/headcount), status, actions), table footer showing "Showing {n} of {total} jobs", empty-state illustration.  | Add Job (opens modal) |
| **Candidate & Application Management** | /candidates | **Candidates Tab:** Page header \+ "Export CSV" button \+ "Add Candidate" button, filter bar (search by name/email, filter by job dropdown, filter by stage dropdown, "Clear" button, live count "N candidates · N applications"). Clicking "Clear" resets all search inputs and dropdown selections to default. **Applications column displays:** • 1 primary pill \= most recently active application, determined by `lastActivityDate` desc. Pill shows: colored stage dot \+ truncated job title \+ stage badge. Clickable — navigates to /applications/:applicationId.  • **Remaining applications** \= small colored dots immediately after the pill. Each dot's color matches its stage. Hover shows tooltip: "Job Title · Stage". • **0 applications**: muted italic text "No applications yet". **Expand row:** Clicking ▶ or clicking the row toggles an inline expand row (no navigation). Expand row lists all applications sorted by `lastActivityDate` desc (most recently active first), each showing: job title \+ jobId, stage badge, applied date, score summary (e.g. "Score 4.3 · 2 rounds"), recommendation badge, "View Detail" button → navigates to /applications/:applicationId.   **Applications Tab:** Filter bar (search by name, filter by job dropdown, filter by stage dropdown,filter by recommendation dropdownClear button), data table (columns: candidate name \+ candidateId, email, job title \+ jobId, stage badge, applied date, actions). "same candidate" badge appears when the same candidate has consecutive rows in the filtered results. Table footer: "Showing {n} of {total} applications" — updates real-time with filters. Pagination: 20 records per page, Previous/Next controls. Row click navigates to `/applications/:applicationId`. Empty-state illustration.  | Add Candidate (opens modal) / Link to Job |
| **Pipeline Board** | /pipeline | 6 kanban columns (Applied / Screening / Interview / Assessment / Offer / Hired), application cards with candidate name \+ job \+ application date, Pass and Reject buttons per card. **View recruitment progress** — **Filter by Job (Mandatory Dropdown)**: Selector to filter the board to a single jobId, showing only applications linked to that specific job to maintain strict ATS workflow. | Pass / Reject |
| **Interview Feedback** | /feedback | Page header \+ Department selector dropdown (Mandatory), Job selector dropdown (Disabled until Department is selected, filtered by the chosen department, Mandatory), filter by recommendation dropdown (All / Strong Hire / Hire / Hold / Reject), filter by interviewer dropdown, Clear button, feedback card list per application (interviewer name, technical / communication / culture fit scores, average score, recommendation badge, comments), overall average score across all submissions. **Hiring Position Candidacy Applications section: Only displays applications linked to the selected jobId where `stage === "Interview"`. Once an application transitions out of the Interview stage (Passed or Rejected), it is automatically filtered out from this active list.** Empty state before Department and Job are selected: *"Please select a Department and a Job above to view or add feedback."* Empty state when selection is made but no feedback exists.  | Add Feedback (opens modal) |
| **AI JD Generator** | /ai-generator | Split layout: left input panel (Job Title, Department, Key Responsibilities, Required Qualifications fields \+ Professional tone label \+ Generate button — disabled until all fields filled and API key configured), right preview panel (placeholder before generation → spinner during generation → read-only generated JD output with structured headings \+ Regenerate \+ Save as Job buttons after generation). API key status indicator shown above input fields.  | Generate / Save as Job |
| **Application Detail** | `/applications/:applicationId`  | **Key Components:** Application information card (applicationId, candidate full name, email, phone, CV link, linked job title, applicationDate, current stage badge). If stage \= Hired: green hired banner at top. If stage \= Rejected: red rejected banner at top. **Application progress summary:** Current stage badge, number of feedback rounds, overall average score (X.X / 5), current recommendation badge (Pending if no feedback). **Stage progress bar:** 6-step visual indicator (Applied → Screening → Interview → Assessment → Offer → Hired) with current stage highlighted. **Action buttons:** Add Feedback" — enabled only when `stage === "Interview"`, disabled with tooltip otherwise. Dynamic "Back" button — text reads "Back to Applications" if user arrived from Candidates page, or "Back to Pipeline" if user arrived from Pipeline Board; preserves previous page state (selected jobId filter, scroll position). Pass to {Next Stage} (conditional) & Reject (conditional) displayed in/under/near the Current Stage box. **Feedback history section:** Header "Interview Feedback" \+ submission count badge. Feedback cards sorted newest first, each showing: interviewer name, submission date, recommendation badge, Technical / Communication / Culture Fit score boxes with fill bars, average score, comments (hidden if empty). Empty state: "No interview feedback has been submitted yet." **Processing flow:** 1\. Load application record by `applicationId`. 2\. Retrieve all feedback records linked to `applicationId`. 3\. Calculate: feedback count, overall average score, recommendation badge per R5.8. 4\. Render. Add Feedback enabled only if `stage = Interview` 5\. Pass Application:    \- Reuse F4 Pass logic.    \- Update stage.    \- Update lastActivityDate. 6\. Reject Application:    \- Reuse F4 Reject logic.    \- Update stage.    \- Update lastActivityDate. **Rules:** CD1. Candidate profile information is read-only. Application stage transitions are permitted through Pass and Reject actions following all F4 Pipeline Board validation rules. CD2. Candidate profile fields cannot be edited from this screen. CD3. Feedback sorted newest first. CD4. No feedback → "No interview feedback has been submitted yet." CD5. Overall recommendation calculated from average of all feedback records, not just latest. CD6. If navigated from Pipeline Board, "Back" button returns to Pipeline preserving selected jobId filter, scroll position, and column context.  CD7. Application Detail Stage Transition The Application Detail page provides the same Pass and Reject actions as the Pipeline Board. Stage transitions must reuse the exact validation rules, confirmation dialogs, terminal-state restrictions, and Firestore update logic defined in F4. Successful transitions must immediately update `application.stage` and `application.lastActivityDate`.CD8. After a successful stage transition from Application Detail,returning to Pipeline Board must display the updated application in its new column while preserving board state. | Add Feedback (Enabled only in Interview stage) |
| **Mailing Cycle** | `/mailing-cycle`  | \*\*Left Panel (Job Selector):\*\* Scrollable list of jobs where \`status \=== "Closed"\`. By default, it dynamically filters out and hides jobs that have already completed their mailing cycle. Includes a search bar (Search by Job ID). Typing a valid \`jobId\` overrides the default hidden state to fetch that specific job. Displays Job Title, Department, and Closed Date. \*\*Right Panel (Recipient Management):\*\* Hidden until a job is selected. Once selected, renders a datatable of all linked applications where \`stage \!== "Offered"\` and \`stage \!== "Hired"\`. Columns: Checkbox, Candidate Name, Email, Current Stage, Action. \*\*Email Preview Section:\*\* Fixed read-only view displaying the single Rejected Email Template layout. API status indicator for Resend service. | Select a Closed Job \-\> Check/Uncheck Recipients \-\> Click "Send Batch Email"   |

**Shared modal layer (overlays any screen):**

| Modal | Triggered from | Fields / content |
| :---- | :---- | :---- |
| **Create / Edit Job** | Jobs page, AI JD Generator | title, department, location(remote/onsite), employmentType, headcount, requiredSkills, description, deadline, status |
| **Create / Edit Candidate** | Candidate database tab | fullName, email, phone |
| **Create Application (Link to Job)** | Candidate row action, Jobs page | candidateId (hidden/auto-fill), jobId (dropdown of active jobs, required), **cvLink (required)**, appliedDate (auto-now) |
| **Add Feedback** | Application row action, Application Detail page (`/applications/:applicationId`) | interviewer, technicalScore, communicationScore, cultureFitScore, comments, recommendation badge (system-generated)  |
| **Stage Transition Confirmation**  | Pipeline Board → Pass button  | Candidate name, current stage, next stage, warning message: "Once moved to the next stage, this application cannot return to the previous stage.", Confirm Move, Cancel buttons |
| **Confirmation dialog** | Any delete / reject action / / unlink action |  Warning message \+ Confirm \+ Cancel buttons. Specific behavior additions: 1\. \*\*Delete Application\*\*: Only enabled if the target application stage is NEITHER "Offer" nor "Hired". 2\. \*\*Unlink Application\*\*: Warning message reads: "Are you sure you want to unlink this candidate from the job? This will remove the application and its interview feedback history but will preserve the candidate's master profile details." Only enabled if the target application stage is NEITHER "Offer" nor "Hired". | |
| **Job Closure Confirmation** | Jobs page (Close action) | Warning message: "Are you sure you want to close this job opening?...", Confirm Close, Cancel buttons. |

**5\. What data does it need to store and retrieve?**

| Entity | Key fields | Notes |
| :---- | :---- | :---- |
| **Job** | jobId, title, department, location, employmentType, headcount, hired\_count, requiredSkills, description, deadline, status, createdDate | Status: Open / Closed. hired\_count tracks how many applications hit "Hired". Stored in jobs collection. |
| **Candidate** | candidateId, fullName, email, phone, hasHiredApplication, createdDate | Centralized Profile. hasHiredApplication (boolean) prevents deleting hired candidates. Stored in candidates collection. |
| **Application** | applicationId, candidateId, candidateName, jobId, jobTitle, cvLink, stage, applicationDate, lastActivityDate, batchEmailLogs: { offerNotificationSent: boolean; // Default: false (Updated from hiredNotificationSent) offerNotificationSentAt: Timestamp | null; rejectedNotificationSent: boolean; // Default: false rejectedNotificationSentAt: Timestamp | null} | Core ATS Link entity. candidateName and jobTitle are denormalized for fast rendering. Stored in applications collection. |
| **Feedback** | feedbackId, interviewer, technicalScore, communicationScore, cultureFitScore, comments, recommendation, createdDate | Linked directly to Application. Stored as a **Sub-collection** inside each application document: /applications/{applicationId}/feedbacks/{feedbackId}. |

| |Storage mechanism: All data is persisted in a Firebase Realtime Database (RTDB) instead of Cloud Firestore. This enables real-time synchronization across multiple HR team members and interviewers simultaneously.  Real-time Sync: The system utilizes Realtime Database listeners (\`onSnapshot\` / \`onValue\`) to update the Dashboard, Job tables, and Pipeline Board dynamically without requiring page refreshes.  Security & Auth Guard: To secure the database against automated malicious hacker bots, the database rules enforce a strict \`auth \!= null\` security constraint. Since the application does not utilize a manual login UI screen, security is handled via client-side Firebase Anonymous Authentication (\`signInAnonymously\`). Active database listeners and write operations are strictly deferred until anonymous authentication is successfully resolved and verified.  State Storage: Temporary UI states (such as Kanban scroll position and active job filters) are maintained via browser SessionStorage or URL query parameters to ensure seamless back-navigation context, disappearing only when the browser tab is closed. API Key Management: The personal Groq API key and Resend API key are managed purely client-side and stored securely in the browser's \`localStorage\`. They must never be persisted in the Realtime Database or logged to the console. All client-side AI generation requests and bulk email operations will read their respective keys directly from local storage to ensure zero-knowledge privacy and eliminate server-side security overhead. | | :---- |  |
| :---- |

**7\. Module Flows, Rules & Logic**

Each module below defines its processing flow, business rules, and validation constraints that must be enforced in code.

**F1 — Dashboard**

| Processing flow |
| :---- |
| On page load, read all Jobs, Candidates, Applications, and Feedbacks from Firebase (Firestore). Calculate Metrics for KPI Cards: **Open Jobs** \= count of Job records where status \= "Open". **Total Candidates** \= count of all unique Candidate profiles in the master database. **Active Applications** \= count of Application records where stage is one of the 5 active stages: Applied, Screening, Interview, Assessment, or Offer. **Hired Applications** \= count of Application records where stage \= "Hired". F1.1 Hiring Cycle Cohort Isolation Rule\*\* To ensure metrics reflect real-time operational efficiency and prevent historical data bias (where long-term cumulative hiring volumes artificially distort daily conversion realities), the Hiring Funnel Chart and conversion calculations must strictly operate under a \*\*Hiring Cycle Cohort\*\* model: \* By default, the Dashboard only aggregates application records from currently active positions (\`job.status \=== "Open"\`).  \* Data computation is strictly partitioned by \`jobId\`. Applications from closed or archived hiring cycles are completely isolated from the active workspace view, ensuring that historical completed counters do not inflate current pipeline conversion metrics over long-term operations. F1.2 Stage-Specific Attrition Conversion Rate (CVR %) Formula\*\*  To eliminate visual anomalies where consecutive stages distort due to downstream accumulation, the Stage Conversion Rate (CVR %) isolates the direct performance throughput of each individual milestone. The system applies a sequential calculation for intermediate stages, while utilizing a \*\*Global Yield Rate Calculation\*\* specifically for the final terminal stage (\`Hired\`) to measure absolute sourcing efficiency: 1\. \*\*For Intermediate Stages ($S$ \= Screening, Interview, Assessment, Offer):\*\* The CVR measures the localized transition efficiency from the immediate preceding stage: $$\\text{Stage CVR (\\%)} \= \\left( \\frac{N\_{\\text{PassedFrom}}(S) \+ N\_{\\text{ActiveIn}}(S)}{N\_{\\text{PassedFrom}}(S) \+ N\_{\\text{ActiveIn}}(S) \+ N\_{\\text{RejectedAt}}(S)} \\right) \\times 100$$ 2\. \*\*For the Terminal Stage ($S$ \= Hired):\*\* The CVR strictly measures the ultimate recruitment yield relative to the entire inbound application pipeline pool (Total Applied Cohort) instead of the previous stage: $$\\text{Hired Stage CVR (\\%)} \= \\left( \\frac{\\text{Count of "Hired" Applications}}{\\text{Total Applicants } (N\_{Total})} \\right) \\times 100$$ Where: \* $N\_{\\text{PassedFrom}}(S)$: Count of applications within the selected cohort scope that have successfully progressed past stage $S$ to any subsequent higher stage. \* $N\_{\\text{ActiveIn}}(S)$: Count of applications currently sitting active at stage $S$. \* $N\_{\\text{RejectedAt}}(S)$: Count of applications explicitly rejected while they were sitting at stage $S$ (\`application.stage \=== "Rejected"\` AND \`application.rejectedAtStage \=== S\`). \* $N\_{Total}$: The absolute total number of applications registered in the database for the selected job scope. \*(Standard Base Exception: The initial "Applied" stage CVR always renders as 100% of total inbound applicants).\* \#\#\#\# \*\*F1.3 Health Metric: Recruitment Health Metric Rule\*\* The dark feature card \*\*"Recruitment Health Metric"\*\* acts as the core operational health index of the active workspace. It calculates candidate optimization velocity by analyzing current pipeline loading thresholds against total historical attrition within the selected cohort. \* \*\*Mathematical Formula:\*\*      $$\\text{Throughput Ratio (\\%)} \= \\left( \\frac{\\text{Count of Hired} \+ \\text{Count of Active Applications}}{\\text{Total Applicants } (N\_{Total})} \\right) \\times 100$$     \*(Note: Active applications include all non-terminal intermediate pipeline stages: Applied, Screening, Interview, Assessment, Offer).\* \* \*\*Dynamic Status Mapping & Gauge Control:\*\*     \* \*\*Ratio $\\ge$ 70%:\*\* Status Text \= \`EXCELLENT VELOCITY\` (Radial gauge renders in Accent Green theme). Indicates high pipeline efficiency and low drop-off leakage.     \* \*\*Ratio 40% \- 69%:\*\* Status Text \= \`OPTIMAL RATE\` (Radial gauge renders in Balanced Green theme). Indicates sustainable, steady-state pipeline operational health.     \* \*\*Ratio \< 40%:\*\* Status Text \= \`BOTTLENECK WARNING\` (Radial gauge flips to Warning Red/Amber theme). Serves as an immediate operational trigger indicating that early-stage rejections or process stalls are drying out pipeline throughput. |

| Rules |
| :---- |
| **R1.1** Dashboard is read-only. No data is created or modified from this page. **R1.2** All counts recalculate every time the user navigates to the Dashboard — no caching. **R1.3** If there are zero jobs or applications, display an empty-state message instead of a blank chart **R1.4** Hiring Funnel Chart must display both the application count and conversion rate for each stage. **R1.5** Conversion rates are recalculated whenever application stage data changes.  |

**F2 — Job Management**

| Processing flow — Create Job |
| :---- |
| User clicks "Add Job" → modal form opens. User fills: title (required) \- job.title, department (required), location (remote/onsite) (required), employmentType, requiredSkills, description (required), deadline (required), job.status (default: Open). On Save: validate required fields. If invalid, show inline field errors — do not close modal. If valid: generate jobId following format in R2.4, set createdDate \= now(), `commit to Firestore`., close modal, refresh table. |

| Processing flow — Edit Job |
| :---- |
| 1\. User clicks Edit on a row → modal pre-filled with existing values.2. User updates fields and saves.3. System updates the matching jobId document in Firestore.4. Table refreshes. Dashboard counts update on next visit. |

| Processing flow — CloseJob |
| :---- |
| 1\. User clicks "Close Job" button on a job row or inside the Edit modal. 2\. System opens a confirmation modal displaying: "Are you sure you want to close this job opening? This will freeze the hiring pipeline for this position." 3\. User clicks Confirm → System updates job.status \= "Closed" in Firestore. 4\. Linked applications retain records, but actions are locked per R2.5. 5\. Table refreshes. Closed jobs display a "Closed" badge and are visually muted. |

| Processing flow — Filter & Search |
| :---- |
| Filter bar renders above the table with: Search by title (text input), Filter by job.status (dropdown), Filter by department (dropdown).Filter by location dropdown: Remote/Onsite Filters are applied in real time as the user types or selects. All active filters combine with AND logic (a job must match all active filters to appear). "Clear filters" button resets all filters and shows full list. |

| Rules |
| :---- |
| **R2.1** Title, department, and deadline are required. Save is blocked if any are empty. **R2.2** Deadline must be a valid future date at time of creation. Editing allows past deadlines (job may already be running). **R2.3** Status can only be: Open | Closed. Default on creation \= Open. **R2.4** | Rules | | :---- | | \*\*R2.4\*\* \`jobId\` is system-generated following the format \`{department}{year}{sequence}\` (e.g., \`MKT26001\`). It is assigned on creation and never editable by the user. \*\*Strict Pre-defined 3-Digit Department Mapping\*\*: To prevent dynamic formatting anomalies or split counter pathways in the database, the \`{department}\` prefix is strictly locked to a fixed dictionary mapping of 3 uppercase alphanumeric characters. The system must programmatically resolve the prefix using the explicit static values defined in the system dropdown selection (\`image\_6652c8.png\`): | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Engineering \-\> \`ENG\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Marketing \-\> \`MKT\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Human Resources \-\> \`HRS\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Product \-\> \`PRD\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Finance \-\> \`FIN\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Design \-\> \`DSN\` | \&nbsp;\&nbsp;\&nbsp;\&nbsp;• Sales \-\> \`SAL\` | Any dynamic free-text input or alternative string truncation lengths are strictly blocked. To prevent ID duplication upon record deletion, \`{sequence}\` must be calculated by running an atomic transaction to find the maximum sequence number among existing jobs within that specific 3-letter department node and adding 1 (\`maxSeq \+ 1\`), formatted as a 3-digit padded string. |  **R2.5** Applications linked to a Closed job remain visible on the Pipeline Board but are locked: Pass and Reject buttons are disabled. A "Job Closed" badge is shown on each affected card. Applications are not hidden so recruiters retain full visibility of pipeline state. **R2.6** Manual Closure Only: Jobs can only be closed manually by the user after confirming via a confirmation modal. The system does not automatically close a job based on headcount or hired counts. **R2.7** To prevent duplicate IDs and preserve strict sequence numbering when multiple users create jobs simultaneously, the generation of \`jobId\` must be executed inside a multi-user safe \*\*Firebase Realtime Database Transaction\*\* (\`runTransaction\`). **R2.8** Processing a job deletion must execute a multi-path deep update operation utilizing the Realtime Database \`update()\` function to perform a cascade delete, safely removing the main job document, all linked applications, and their nested feedback branches simultaneously. R2.9 If a recruiter increases headcount above hired\_count, the system does not automatically reopen the job. Reopening must be performed manually by changing status back to Open. R2.10 Deleting a Hired application decreases hired\_count. If hired\_count falls below headcount, job status remains unchanged. Recruiters must manually reopen the job if needed. R2.11. Khi cập nhật Job Title, hệ thống phải dùng Firestore Write Batch để cập nhật chuỗi `jobTitle` denormalized trong các Application liên quan **\*\*R2.12\*\* \*\*Chronological Sorting\*\*:** The data table on the Job Management screen must strictly sort all job records in descending order based on the \`createdDate\` timestamp field (newest created jobs must always appear at the top of the table). This sorting order must be preserved across all real-time snapshot listeners and filter applications. |

**F3 — Candidate & Application Management**

| Add Candidate & Create Application |
| :---- |
| User clicks "Add Candidate" → modal form opens. User fills Candidate Profile: fullName (required), email (required), phone (required). On Save: validate required fields, phone format, and email format. Email must match standard format local@domain.tld validated via regex /^\[^\\s@\]+@\[^\\s@\]+\\.\[^\\s@\]+$/. Phone format must be a valid Vietnamese mobile number: 10 digits, starting with 03, 05, 07, 08, or 09, validated via regex /^(03|05|07|08|09)\\d{8}$/. Save is blocked if empty or format is invalid. If valid: generate `candidateId` following the format `CAN{sequence}`, assigned strictly on creation and never editable. `{sequence}` is a global 6-digit auto-increment calculated by finding the maximum sequence number among all historical candidates in the database and adding 1 (e.g., `maxCandidateSeq + 1`), starting from `000001` for the first record. Create Candidate document in Firestore **Application Creation (Where CV is attached):** To link a candidate to a job, user triggers "Apply to Job" → select active `jobId` (dropdown) and **provides `cvLink` (required, validated as a non-empty string URL)**. System generates unique `applicationId`, stores the provided `cvLink` inside this application record, sets `stage = "Applied"`, sets `applicationDate = now()`, and creates Application document in Firestore Pipeline board and Dashboard update automatically on next visit. |

| Processing flow — Filter & Search |
| :---- |
| Filter bar on Applications tab renders above the table with: Search by name (text input), Filter by Job (dropdown), Filter by Stage (dropdown), Filter by Recommendation, and a "Clear filters" button. Filters are applied client-side in real time as the user types or selects. All active filters combine with AND logic. The "Clear filters" button resets all text search fields and dropdown selectors to their default values, instantly reloading the complete unfiltered list view. |

| Rules |
| :---- |
| **R3.1** fullName, email, and phone are required for Candidate. `jobId` and **`cvLink`** are required for Application. **R3.2** Multi-Application Logic & Strict Duplicate Verification\*\*: A candidate is permitted to re-apply to a previously pursued \`jobId\` \*only\* if their historical application for that specific position has explicitly reached a terminal state (\*\*"Rejected"\*\* or \*\*"Hired"\*\*). Before creating any new application record, the system must programmatically query the database to verify the existence of an ongoing application. If an application already exists for the identical \`candidateId\` and \`jobId\`, and its current stage is in any active, non-terminal phase (\*\*"Applied"\*\*, \*\*"Screening"\*\*, \*\*"Interview"\*\*, \*\*"Assessment"\*\*, or \*\*"Offer"\*\*), the system MUST strictly block the form submission, abort the creation process, and trigger a prominent UI validation warning toast: \*"This candidate has already applied for this position and their application is currently active."\* **R3.3** stage on application creation is always "Applied" — the user cannot manually set the initial stage. **R3.4** Deleting an application also deletes all Feedback records linked to that applicationId. Deleting a candidate master profile cascades to delete all their applications and all associated feedbacks. **R3.5 \*\*Positive Terminal State Application & Profile Deletion Protection\*\*:** To preserve historical data integrity and safeguard the recruitment reporting funnel, the system strictly blocks the deletion or manual removal of any individual \`Application\` record if its current stage has reached either \*\*"Offer"\*\* or \*\*"Hired"\*\*. Consequently, deleting a master \`Candidate\` profile is permanently blocked if that profile contains any active or completed application sitting in the "Offer" or "Hired" stages\[cite: 1\]. To perform a profile deletion, recruiters must programmatically or manually transition the application back into an earlier active stage first. **R3.6** Global \`candidateId\` sequence increments must be safely synchronized using a centralized global counter path (\`metadata/candidate\_global\_counter\`) inside the Realtime Database, wrapped completely in an atomic database Transaction (\`runTransaction\`) to prevent data race conditions during simultaneous candidate registrations.  **\*\*R3.7\*\* \*\*Chronological Sorting\*\*:** To ensure immediate visibility of recent entries, the master Candidate data table (Candidates Tab) must strictly display profiles sorted by the \`createdDate\` timestamp field in descending order (newest candidates at the very top). Similarly, the Applications Tab data table must sort records by the \`applicationDate\` timestamp in descending order (newest applications first). **\*\*R3.8\*\* \*\*Application Unlink Option\*\*:** The system must provide an "Unlink" action button alongside the standard Delete option on candidate rows and the Application Detail page\[cite: 1\]. Unlinking programmatically executes a safe deletion of that specific \`applicationId\` and cascades to erase its nested \`/feedbacks\` sub-collection, while strictly preserving the master \`Candidate\` profile (fullName, email, phone) intact inside the centralized database\[cite: 1\]. Unlinking is subject to the same strict data protection rules as standard deletion and is \*\*permanently blocked\*\* if the target application stage is currently in \*\*"Offer"\*\* or \*\*"Hired"\*\*\[cite: 1\]. |

**F4 — Pipeline Board**

| Processing flow — View |
| :---- |
| **Mandatory Step:** Board requires the user to select a specific job via the **Filter by Job** dropdown at the top. On selection, read all Applications where jobId matches from Firebase . **Pipeline Configuration: Displayed Columns:** 6 Stages (Applied → Screening → Interview → Assessment → Offer → Hired). **Terminal Stages:** Rejected, Hired. Stage Logic Rules: Hired is displayed as the final Kanban column but is also considered a terminal stage. Applications in Hired cannot Pass. Rejected is a terminal stage and is not displayed as a permanent Kanban column. Each card shows: candidate name, applied job title, applicationDate. Within each stage column, applications are sorted by applicationDate in descending order (newest application first). When a candidate card is clicked in the Kanban view, it should open the Application Detail page. If the user navigates to this page from the Kanban board, the “Back” button must return them to the Kanban board view, preserving the previous state (filters, scroll position, and column context).  |

| Processing flow — Pass Application Forward |
| :---- |
| User clicks "Pass" on an application card.  System identifies the next stage in the fixed sequence.  If application is at "Hired" (last stage), the button is disabled.  System opens a confirmation modal displaying: "Once moved to the next stage, this application cannot return to the previous stage.”  If user clicks Confirm Move, system updates application.stage and simultaneously sets application.lastActivityDate \= now() in Firebase. Card moves to the new column immediately (optimistic UI update). |

| Processing flow — Reject Application |
| :---- |
| User clicks "Reject" on an application card at any stage. Confirmation prompt: "Mark this application as Rejected?" On confirm: set `application.stage = "Rejected"` and **simultaneously sets `application.lastActivityDate = now()` in Firebase**. Card is removed from the active board immediately. |

| Rules |
| :---- |
| **R4.1** Stage order is fixed: Applied → Screening → Interview → Assessment → Offer → Hired. No skipping stages. **R4.2** An application can only be in one stage at a time. **R4.3** "Rejected" is a terminal state — a rejected application cannot be moved forward again. **R4.4** "Hired" is a terminal state — the Pass button and Reject button is hidden at this stage. **R4.5** Stage changes made in Pipeline must immediately reflect in the Applications tab list view. **R4.6** The board does not support drag-and-drop in v1 — only the Pass and Reject buttons. **R4.7** Every Pass action must display a confirmation modal before the stage update is executed, and move the card to the new column immediately (optimistic UI update).   **R4.8 State Preservation:** The Pipeline Board must cache or pass its current state (selected `jobId` from the mandatory dropdown, horizontal scroll position of the Kanban columns, and the active column views) to the router session. When a user navigates back from `/applications/:applicationId`, the board must instantly re-render using this cached state instead of resetting to the default empty state. **R4.9** Card status changes via "Pass" or "Reject" must trigger asynchronous `updateDoc` calls to Firestore. The UI must listen via `onSnapshot` to ensure the board updates in real time across all open recruiter dashboards. |

**F5 — Interview Feedback Logger**

| Processing flow — Add Feedback |
| :---- |
| User navigates to a specific application's profile page (/applications/:applicationId) or triggers the log feedback action from the application row. **Stage Validation Check:** The system verifies the current application.stage value. **If application.stage \=== "Interview":** The "Add Feedback" button is active and clicking it opens the feedback modal form. **If application.stage \!== "Interview":** Action is locked. The "Add Feedback" button is disabled/hidden with an active validation message: *"Feedback can only be submitted for applications currently in the Interview stage"*. User fills: interviewer name (required), technicalScore 1–5 (required), communicationScore 1–5 (required), cultureFitScore 1–5 (required), comments (optional). System calculates the average of technicalScore, communicationScore, and cultureFitScore, then automatically generates the recommendation badge according to Rule R5.8. Users do not manually select or edit recommendation values.  On Save: validate all required fields and integer score ranges. Generate `feedbackId`, set `createdDate = now()`, link to `applicationId`. **The system must also find the matching Application record and update its `application.lastActivityDate = now()`.** Save feedback to sub-collection and update parent application document activity status. . Feedback appears in application's profile view. |

| Processing flow — View Feedback |
| :---- |
| 1\. On page load, the system initializes the screen in an empty state. All feedback data and the Job dropdown are locked/disabled. | 2\. \*\*Mandatory Step 1\*\*: User must select a specific department from the \*\*Filter by Department\*\* dropdown. | 3\. Once a department is selected, the system enables the \*\*Filter by Job\*\* dropdown and populates it \*only\* with jobs belonging to that chosen department. | 4\. \*\*Mandatory Step 2\*\*: User selects a specific job from the filtered Job dropdown. | 5\. Upon job selection, the system queries and retrieves all Application records linked to that jobId, **and applies a strict client-side/database filter to retain only records where `application.stage === "Interview"`**. The system then loads the associated Feedback sub-collections for these active interviewees from the Realtime Database. | 6\. The UI displays the feedback cards sorted in chronological order (newest first) and calculates the overall average score across all submissions for the selected scope. | |

| Rules |
| :---- |
| **R5.1** All score fields (technical, communication, culture fit) must be integers between 1 and 5\. Decimal input is not accepted. **R5.2** Recommendation is fully system-generated based on the score rules defined in R5.8. Users cannot manually select, edit, or override the recommendation.  **R5.3** Interviewer name is required — anonymous feedback is not permitted. **R5.4** **Stage Lock Rule:** An application can ONLY receive new Feedback records when its current stage is exactly "Interview". For all other stages (whether preceding like Applied/Screening, or succeeding like Assessment/Offer/Hired/Rejected), the "Add Feedback" button is strictly disabled and historical feedback remains read-only.  **R5.5** Feedback records are read-only after submission in v1 — no editing after save. **R5.6** Deleting an application (from F3) must also delete all linked feedback records. **R5.7** Score Scale (1 \- 5): **5 \- Excellent:** Exceeds expectations; master level. **4 \- Good:** Fully meets requirements; solid performance. **3 \- Average:** Meets minimum baseline; needs minor training. **2 \- Below Average:** Lacks core skills; gaps in knowledge. **1 \- Poor:** Severe lack of skills or major culture/attitude red flags. **R5.8** Recommendation Badge Rules: **Recommendation** **Conditions** **Candidate Profile** **Strong Hire** Average Score \>= 4.5 *(No score below 4\)* Outstanding talent. High technical skills and potential to lead. **Hire** Average Score: 3.5 \- 4.4 *(No score below 3\)* Solid fit. Ready to do the job effectively. **Hold** Average Score: 2.8 \- 3.4 *(Technical \>= 3, no score is 1\)* Potential candidate but has gaps. Keep as backup or need 2nd review. **Reject** Average Score \< 2.8 *OR any score \<= 2* Does not meet requirements or has cultural red flags. **R5.9** The recommendation badge displayed in the feedback modal must update in real time whenever any score field changes. The badge serves as a preview of the recommendation that will be saved.  **\*\*R5.10\*\* \*\*Strict Hierarchical Filtering\*\*:** The Feedback screen does not support "View All" or independent Job filtering. The system must strictly enforce a top-down cascading logic: Department Selection (Required) \-\> Job Selection (Required) \-\> Render Feedback Content. Clicking the "Clear" button resets both dropdowns and returns the screen to its initial locked empty state. **R5.11** **Active Interviewee Workspace Isolation**: The Hiring Position Candidacy Applications list and feedback stream on the `/feedback` screen must strictly display only applications where `stage === "Interview"`. Once an application is **Passed** forward to the Assessment stage or marked as **Rejected** (via F4 pipeline actions), that specific application and its corresponding feedback logs must instantly vanish from the active `/feedback` screen view via real-time synchronization (`onValue`). Historical data integrity is preserved; to review past feedback submissions for candidates who have advanced or been dropped from the workflow, recruiters must navigate directly to the **Application Detail page (`/applications/:applicationId`)** via the Candidates Tab or Pipeline Board, where historical sub-collection records remain accessible in read-only mode per **R5.4**. |

**F6 — AI Job Description Generator**

| Processing flow |
| :---- |
| 1\. User fills input fields \-\> Clicks "Generate" \-\> System calls Groq API and renders the structured JD output in the right preview panel. | 2\. User reviews the output and clicks the "Save as Job" button. | 3\. \*\*Idempotent Transition Step\*\*: Clicking "Save as Job" DOES NOT auto-generate a \`jobId\` or save directly. Instead, it triggers and opens the pre-filled "Create / Edit Job" modal, auto-populating the \`title\` and \`description\` fields from the AI output. | 4\. User completes the remaining required fields inside the modal (department, headcount, deadline, status). | 5\. On clicking "Confirm Save" inside the modal, the execution flow hands off completely to the standard Job Creation Process (F2). | 6\. The system executes a Firestore Transaction to dynamically calculate the maximum sequence number for that specific department, generates the \`jobId\` (format: \`{department}{year}{sequence}\`), and commits the document to Firestore. | 7\. Upon successful persistence, the modal closes, a confirmation toast is displayed, and the router automatically navigates the user to the Job Management screen (\`/jobs\`), where the newly generated job with its correct system-assigned \`jobId\` is instantly visible ain the data table. |  |

| Rules |
| :---- |
| R6.1  All four input fields (title, department, responsibilities, qualifications) are required before Generate is enabled. R6.2  During API call, the Generate button is disabled and a spinner is shown. User cannot submit twice. R6.3  If the API call fails (network error or timeout), display an error message: "Generation failed. Please try again." Form inputs are preserved. R6.4  The AI-generated output is shown in a read-only preview — the user cannot edit the text directly in the preview panel in v1. R6.5  Clicking "Save as Job" does not auto-save immediately — it opens the Job modal so the user can review and set deadline/status before confirming. R6.6  The generated JD is not stored in Firebase unless the user explicitly saves it as a Job.  R6.7 Generated output must always contain all five sections in the exact order defined above. R6.8 Empty sections are not allowed. If information is insufficient, the AI must generate reasonable professional content based on the provided inputs. R6.9 The preview panel renders the generated JD using structured headings and bullet points for readability. R6.10. The system will provide an input field/settings panel in the UI for users to configure their personal Groq API Key. This key is stored in the browser's `localStorage` only. Do not persist API keys in Firestore to ensure zero-knowledge privacy and eliminate server-side security overhead. **R6.11** Every generated Job Description must end with the following Equal Opportunity Statement exactly as written: "We are an equal opportunity employer and welcome applications from all qualified candidates regardless of race, color, religion, sex, gender identity, sexual orientation, national origin, age, disability, or any other protected characteristic." **\*\*R6.12\*\* \*\*Deferred ID Allocation\*\*:** The system must strictly avoid assigning or generating a \`jobId\` during the initial AI text rendering phase (Preview Panel). To prevent broken sequences, ID gaps, or data race conditions between multiple recruiters, the \`jobId\` calculation and allocation must be strictly deferred until the final "Confirm Save" transaction is successfully committed. |

| AI Output Structure |
| :---- |
| The generated Job Description must follow the exact structure below: Job Summary Brief overview of the role and its business purpose. Key Responsibilities 5–8 bullet points describing major duties. Required Qualifications Education, experience, certifications, and core requirements. Preferred Skills Nice-to-have skills and competencies. Benefits & Working Environment Company benefits, development opportunities, and work conditions. |

**F7 — Mailing Cycle Module**

| Processing Flow |
| :---- |
| 1\. \*\*Page Initialization\*\*: User navigates to \`/mailing-cycle\`. The system queries the database and loads Job documents where \`status \=== "Closed"\`. By default, the Left Panel list view employs a visibility filter that hides any job where all eligible candidates have already been processed (i.e., no pending end-of-cycle emails left to send). | 2\. \*\*Job ID Search Override\*\*: If a user needs to review a past, completed job, they can type the exact \`jobId\` into the Left Panel search bar. This action bypasses the default visibility filter, instantly exposing the requested closed job in the list view. | 3\. \*\*Job Selection\*\*: User clicks a closed job from the list. The system extracts the \`jobId\` and executes a query to fetch all Application records linked to this specific \`jobId\`. | 4\. \*\*Recipient Filtering\*\*: The system filters the fetched applications on the client-side to strictly exclude terminal positive states. Only records where \`application.stage \!== "Offered"\` AND \`application.stage \!== "Hired"\` are populated into the recipient datatable. | 5\. \*\*Execution\*\*: User clicks the "Send Batch Email" button. The system locks the interface and triggers POST payload requests to the integrated Resend API service. | 6\. \*\*State Finalization\*\*: Upon successful dispatch, the system updates the application stages to "Rejected", sets \`lastActivityDate \= now()\`, and marks \`batchEmailLogs.rejectedNotificationSent \= true\`. Once all recipients for the selected job are marked as sent, the Left Panel automatically refreshes and hides that job from the default active list view. | |

#### **Fixed Email Templates**

**Template: For Rejected/Unfinished Candidates**

* **\*\*Target Audience\*\*:** All selected applications within the closed job scope that are NOT Offered or Hired (all intermediate pending states are treated as Rejected upon sending).  
* **Subject:** Your Application for the {jobTitle} Position   
* **Body:**

Dear {candidateName}, 

Thank you for your interest in the **{jobTitle}** position and for the time and effort you invested throughout our recruitment process. We appreciate the opportunity to have learned more about your background and experience.

After careful consideration, we have concluded our hiring cycle for this role and will not be moving forward with your application at this stage. We want to be transparent: this was a highly competitive process, and this outcome is not necessarily a reflection of your capabilities or potential.

Your profile will be retained in our talent pool, and we will reach out should a suitable opportunity arise in the future. We genuinely encourage you to continue pursuing roles where your skills can be fully recognized and rewarded.

We wish you every success in your career ahead.

Sincerely, **The HR Team**

| Rules & Constraints |
| :---- |
| \*\*R7.1\*\* \*\*Strict Scope Enforce\*\*: The Mailing Cycle screen only processes jobs that have been manually closed. Active "Open" jobs are completely excluded from the navigation view. \*\*R7.2\*\* \*\*Catch-All Rejection Treatment\*\*: There is only one template allocated for this module: the Rejection Template. Any application processed through this screen that is not in a terminal state (e.g., currently in Screening, Interview, or Assessment) will be automatically forced into the terminal "Rejected" stage in the database before the email dispatch loop runs. \*\*R7.3\*\* \*\*Resend API Integration\*\*: All bulk email operations must route strictly through the Resend API service endpoint. To maintain security, the application must provide an "API Key Configuration" settings panel interface on the UI (similar to the Groq API Key input panel) allowing users to input their personal Resend API Key. The system will store this key exclusively in the browser's \`localStorage\` and read it dynamically before firing the email dispatch loop. The "Send Batch Email" button remains disabled until a valid Resend key is detected in local storage. \*\*R7.4\*\* \*\*Idempotency Guard\*\*: To prevent sending duplicate emails to a candidate for the same closed job cycle, any application document where \`batchEmailLogs.rejectedNotificationSent \=== true\` will have its row checkbox disabled and automatically unchecked by default when the data table loads. \*\*R7.5\*\* \*\*Batch Rate Limiting\*\*: The client-side execution loop utilizing the Resend API must employ an asynchronous batch throttle pattern (\`Promise.allSettled\`) capped at a maximum ceiling of 50 concurrent requests per dispatch wave to safeguard API credit quotas.  \*\*R7.6\*\* \*\*Completed Job Visibility Filter\*\*: To ensure a clean workspace, a closed job is programmatically defined as "Mailing Completed" and hidden from the default list view as soon as there are zero applications left matching the condition \`batchEmailLogs.rejectedNotificationSent \=== false\` (excluding Offered/Hired states). However, the system must retain strict relational data availability; if a recruiter inputs the exact alphanumeric \`jobId\` into the search bar, the system must force-render that specific closed job and display its historical recipient table in a read-only state. || |

**8\. What are the "nice to have" features? (not in v1)**

The following are explicitly out of scope for version 1\. All features below target v2 or v3.

| v2 | Discord notifications — alert recruiters when a candidate is moved or an interviewer submits feedback. |
| :---: | :---- |
| **v2** | Role-based access — separate views for Recruiter vs Interviewer so interviewers only see the feedback form, not the full pipeline. |
| **v2** | CV file upload — attach and preview actual PDF résumés instead of storing just a link. |
| **v2** | Offer letter generator — AI-generated offer letter pre-filled with candidate name, job title, and package details. |
| **v3** | Advanced analytics — time-to-hire metrics, source tracking, drop-off rates per stage, exportable CSV/PDF reports. |
| **v3** | Calendar integration — schedule interviews directly from the pipeline board and sync with Google Calendar. |

HR Recruitment Tracker  ·  Planning Document  ·  v1.0  
