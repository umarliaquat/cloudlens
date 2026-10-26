# CloudLens: Product Requirements Document (PRD)

Cloud cost clarity portal for AWS consultancies and their clients. Version 1.1 · Concept project with simulated data · Author: Umar Liaquat · Status: Draft, ready for build in Codex

## 1. About this document

**Purpose.** This PRD defines what CloudLens is, who it is for, how it behaves, and how it should be built. It is written so that a human reviewer and a coding agent (Codex) can both work from it without guessing.

**What CloudLens is, in one line.** A multi-client portal where an AWS consultancy shows its clients where their cloud money goes, explains cost changes in plain language, and manages savings recommendations through a human approval flow with a full audit trail.

**Nature of the project.** CloudLens is a self-initiated portfolio concept. It does not connect to real AWS accounts. All data is simulated, but shaped like real AWS billing and optimization data so a real integration could replace the mock layer later. Every public description of the project must say this clearly.

**How to use this document with Codex.**

- Treat Sections 6 to 12 as the source of truth for behavior and data.
- Where the text says MUST, it is required for the build. SHOULD is expected unless time runs out. COULD is optional.
- Visual design is NOT defined here. The owner will provide the design and visual direction separately. Build everything against a single theme/token file (Section 14) so styling can be swapped without touching components.
- If a requirement is ambiguous, pick the option marked as the default and note the assumption in the README.

**Out of scope (non-goals).**

- Connecting to real AWS accounts or executing any change in AWS.
- Billing, payments, or invoicing of CloudLens itself.
- Multi-cloud (Azure, GCP), Kubernetes cost allocation, native mobile apps.
- SSO/SAML, SOC 2 style compliance work, real-time streaming data.

## 2. Product overview

### 2.1 Problem

Companies running on AWS receive large, detailed bills that are hard to interpret. The people who must act on them (engineers, finance, executives) struggle with three gaps:

1. **Understanding gap.** "Why did the bill go up?" Raw billing data is detailed but not readable for non-technical people.
2. **Audience gap.** An executive, an engineer, and a consultant need different views of the same data, and most tools serve one audience well.
3. **Action gap.** Tools list waste, but turning a recommendation into a safe, owned, approved, tracked decision is where things stall.

### 2.2 Niche and positioning

The FinOps (cloud financial management) market is crowded. CloudLens targets a narrower slot: **a client-facing cost portal for AWS consultancies and managed service providers (MSPs) serving small and mid-sized clients.** The consultancy manages many clients from one place and gives each client a clear, role-appropriate view with plain-language explanations and a trusted approval trail. This is a hypothesis about a gap; competitor research (Section 5) should confirm or adjust it.

### 2.3 Vision and principles

- **Clarity before completeness.** Answer "what changed and why" before showing every metric.
- **Right view for the right role.** Same data, different depth.
- **Human stays in control.** AI explains and suggests; people decide. Nothing changes without an approved decision.
- **Trust through traceability.** Every decision has an owner, a time, and a reason.
- **Honest data.** Show partial, estimated, and missing data as such.

### 2.4 Value proposition by audience

- **Client executive:** "Understand my cloud spend and savings in one minute."
- **Client engineer:** "Find the cause of a cost change and act safely on recommendations."
- **Consultant (MSP):** "See which clients need attention today and show my value."

## 3. Users and permissions

### 3.1 Personas

**Priya, Client Executive (CFO or VP Engineering).** Non-technical or semi-technical. Reviews monthly. Wants totals, trends, forecast vs budget, and proof of savings. Pain: bills she cannot explain to her board. Key tasks: check spend vs budget, read the savings summary, export a report.

**Daniel, Client Engineer (DevOps or platform engineer).** Technical, uses it weekly. Wants breakdowns by service, account, region, and tag, and trustworthy recommendations. Pain: cost spikes with no owner, recommendations he cannot verify. Key tasks: investigate an anomaly, review and decide on recommendations, check tag coverage.

**Maya, Consultant (MSP cloud advisor).** Manages 10 to 30 clients. Daily user. Wants a cross-client overview, early warning on problems, and client-ready reports. Pain: stitching reports together by hand. Key tasks: see which client needs attention, leave notes, manage client users.

### 3.2 Role permissions

| Capability | Executive | Engineer | Consultant |
| --- | --- | --- | --- |
| View overview and trends | Yes | Yes | Yes (all assigned clients) |
| Cost explorer (full breakdowns) | Summary level | Full | Full |
| View anomalies | Yes | Yes | Yes |
| Mark anomaly as expected/investigating | No | Yes | Yes |
| View recommendations | Yes (summary) | Yes (full) | Yes |
| Approve, dismiss, request changes | No | Yes | No (can comment) |
| Manage budgets | View | Edit | Edit |
| View audit log | Yes | Yes | Yes |
| Export reports | Yes | Yes | Yes |
| Manage users and client access | No | No | Yes |
| Cross-client overview | No | No | Yes |

A user belongs to one organization type (client or MSP). Client users see only their own client. Consultants see only clients they are assigned to.

## 4. Goals and success measures

**Product goals**

1. A user can find the cause of a cost spike in under a minute.
2. A recommendation can be understood and decided on without leaving its detail view.
3. Every decision is traceable.
4. A consultant can identify the client needing attention from one screen.

**Concept-project success targets** (to be measured in a small usability test; these are targets, not results):

- At least 80% task success across three core tasks (find spike cause, approve a recommendation, locate who approved something).
- Median time to identify a spike's cause under 60 seconds.
- System Usability Scale (SUS) score of 70 or higher from 5 testers.
- Zero critical accessibility violations in automated checks (axe) on key pages.
- No hard-coded colors or spacing outside the theme file.

**Post-launch metrics** (documented in the case study, not measurable here): time to insight, share of recommendations actioned, realized savings, weekly active users per client.

## 5. Competitors and references

The owner is doing the competitive research. This section gives the model and agent context. All positioning notes below are hypotheses to verify.

### 5.1 Direct competitors (FinOps tools)

| Product | Positioning (as understood) | Study this | Possible gap for CloudLens |
| --- | --- | --- | --- |
| AWS Cost Explorer / Billing / Budgets / Cost Anomaly Detection | Native AWS cost tools | Baseline filters, group-by, anomaly alerts | Hard for non-technical users; no multi-client or approval trail |
| Vantage | Developer-friendly cost reporting across providers | Report builder, clean cost reports | Verify MSP and client-portal features |
| CloudZero | Cost attribution to teams, products, features | Allocation and unit-cost views | Verify non-technical executive views |
| nOps | Recommendations and automation | Savings and automation flows | Verify approval and audit trail depth |
| CloudHealth | Enterprise governance and reporting | Policies, enterprise reporting | Likely heavy for SMB clients |
| Datadog Cloud Cost Management | Cost next to performance data | Cost + observability context | Tied to the Datadog ecosystem |
| DoiT | Cloud optimization with services | Services-plus-software model | Verify portal depth |
| Flexera One | Enterprise cost management with MSP/partner features | Multi-customer views | Verify UX for SMB clients |

### 5.2 Pattern references (not competitors)

- **AWS Cloudscape design system:** tables with preferences, split panels, status indicators, create flows. Study for console conventions.
- **Stripe Dashboard:** metric cards, drill-down, exportable reports.
- **Xero (expense approvals):** status groups (draft, awaiting approval, awaiting payment) with inline actions.
- **Toggl Track (approvals):** "Request changes" with a comment instead of only approve/reject.
- **Snowflake:** cost management page with summary cards and empty states; users and roles table.
- **Shopify:** roles and permissions screen.
- **Browserbase:** timeline view of an AI agent's steps, useful for explanation transparency.
- **Ramp (spend approvals):** approval and audit patterns for spend decisions; verify details during research.

## 6. Core user flows

Flows are written as numbered steps. "Screen" names refer to Section 10.

### Flow A. Sign in and land on the right view

1. User signs in with email and password (demo accounts, Section 11.4).
2. System loads the user's role and accessible clients.
3. Executive and Engineer land on the Client Overview. Consultant lands on the Portfolio Overview.
4. A visible role/client indicator is always shown. For demos, a role switcher lets a reviewer swap between demo users (default ON).

### Flow B. Understand this month's spend (Executive)

1. Open Client Overview.
2. See month-to-date spend, forecast, budget status, and savings found (cards), plus a spend trend chart.
3. Change the time range or compare to the previous period.
4. Open the top anomaly or the top recommendation from the overview.
5. Export a report (PDF or CSV).

### Flow C. Investigate a cost spike (Engineer)

1. From the Overview or Anomalies list, open an anomaly.
2. Anomaly detail shows what changed (service, account, region, amount, percent), when it started, a chart with the baseline, and the likely cause (rule-based driver plus AI explanation).
3. Drill into the Cost Explorer pre-filtered to the anomaly.
4. Mark the anomaly as Investigating, Expected, or Resolved, with an optional note.
5. The action is written to the audit log.

### Flow D. Review and decide on a recommendation (Engineer)

1. Open Recommendations. Filter by type, risk, savings, status.
2. Open a recommendation. See the resource, evidence (e.g. average CPU over 14 days), estimated monthly savings, risk level, AI explanation, and history.
3. Choose one:
   - **Approve:** confirm dialog restates the resource and the savings. Status becomes Approved.
   - **Request changes:** a comment is required. Status becomes Changes requested and the consultant is notified in-app.
   - **Dismiss:** a reason is required (e.g. "needed for quarterly batch job"). Status becomes Dismissed.
4. The decision, user, time, and reason are written to the audit log.
5. After the team performs the change outside CloudLens, the engineer marks it Implemented. A demo control advances simulated time so savings appear as Verified.

### Flow E. Manage budgets and alerts

1. Open Budgets. Create a budget (scope: whole client, account, or tag; amount; period).
2. Set alert thresholds (e.g. 50%, 80%, 100% of budget and forecast-to-exceed).
3. When a threshold is crossed, an in-app alert appears and a notification entry is created.

### Flow F. Consultant portfolio review (Consultant)

1. Open Portfolio Overview. Each client shows spend vs budget, open anomalies, pending recommendations, and an attention score.
2. Sort by attention score. Open the highest.
3. Leave a note on a recommendation or anomaly (visible to the client).
4. Generate a client report for the period.

### Flow G. Audit and export

1. Open Audit Log. Filter by user, action type, date, and object.
2. Open an entry to see before/after values and reason.
3. Export the log as CSV.

## 7. Feature specification

Priority: MUST, SHOULD, COULD. Each feature lists requirements and acceptance criteria (AC).

### F1. Authentication and roles (MUST)

- Email and password sign-in with seeded demo users, session cookies, sign-out.
- Role-based access control enforced in the API, not only in the UI.
- Tenant isolation: every query is scoped by client and role.
- AC: a client user cannot read another client's data by changing an ID; the API returns 404 for other tenants and 403 for forbidden actions within a visible tenant.

### F2. Client Overview dashboard (MUST)

- Cards: month-to-date spend, forecast for month end (formula in Section 12.8), budget used (%), identified savings (open recommendations), realized savings (verified).
- Spend trend chart with time range (7, 30, 90 days, month, custom) and compare-to-previous-period toggle.
- Top movers: the five services with largest change in spend.
- Shortcuts to the top anomaly and top recommendations.
- AC: all numbers reconcile with the Cost Explorer for the same filters; partial-day data is labelled.

### F3. Cost Explorer (MUST)

- Group by: service, account, region, tag key. Filters: date range, service, account, region, tag value.
- Chart plus table. Table supports sorting, column preferences, pagination or virtualization, and CSV export.
- Top N plus "Other" bucket for long tails; an "Untagged" bucket for missing tags.
- Drill-down: click a row to filter deeper.
- AC: totals in chart and table match; changing filters updates the URL so views are shareable.

### F4. Anomaly detection and feed (MUST)

- Detection algorithm in Section 12.4. Each anomaly has severity (Low, Medium, High), impact in currency, start date, affected dimension, status (New, Investigating, Expected, Resolved).
- Detail page with baseline chart, driver breakdown, AI explanation, notes, and status history.
- AC: injected seed anomalies are detected; recurring "expected" anomalies can be marked so they do not alert again.

### F5. Recommendations and approval workflow (MUST)

- Recommendation types and rules in Section 12.5.
- List with filters, sort by savings, and status groups. Detail with evidence, risk, AI explanation, comments, history.
- Actions: Approve, Request changes (comment required), Dismiss (reason required), Mark implemented.
- Status model: Open, Approved, Changes requested, Dismissed, Implemented, Verified, Stale. Valid transitions are defined in Section 12.9.
- AC: only Engineers can decide; every decision creates an audit entry; concurrent decisions are handled (Section 9).

### F6. Audit log (MUST)

- Append-only record of decisions, status changes, budget edits, user and access changes, exports, and sign-ins.
- Fields: time, actor, role, action, object type and ID, before, after, reason.
- AC: entries cannot be edited or deleted through the UI or API. The only exception is the demo reset (Section 12.11), which exists only when DEMO\_MODE is on.

### F7. AI explainer (SHOULD)

- Plain-language explanation for anomalies and recommendations (contract in Section 12.6).
- Always labelled "AI-generated". Includes evidence used. Can be regenerated. Thumbs up/down feedback.
- Falls back to a rule-based template if the model fails or times out (exact templates in Section 12.10). The app must work fully without an API key.
- AC: every number in an explanation exists in the input facts (validated before display).

### F8. Budgets and alerts (SHOULD)

- Budgets per client, account, or tag; thresholds; in-app alert center.
- AC: budget status colors/labels do not rely on color alone.

### F9. Reports and export (SHOULD)

- Client report for a period: summary, top movers, anomalies, recommendations decided, savings. Export as PDF and CSV.
- AC: exported numbers match on-screen numbers for the same filters.

### F10. Consultant Portfolio Overview (SHOULD)

- Table or cards of clients with spend vs budget, open anomalies, pending recommendations, attention score, last activity.
- Attention score: weighted sum of open High anomalies, budget overrun risk, and stale recommendations (default weights in Section 12.8, configurable).
- AC: sorting by attention score puts the seeded problem client first.

### F11. User and access management (COULD)

- Consultant can invite (simulated), change a role, and remove a client user. All actions audited.

### F12. Tag coverage and ownership view (COULD)

- Percent of spend that is tagged by key (team, environment, owner). Lists top untagged spend.

### F13. AI workload spend view (COULD)

- Dedicated view for generative AI service spend (e.g. Amazon Bedrock) by model and team in the seed data. Include only if the competitor research supports it as a differentiator.

### F14. Notifications center (COULD)

- In-app list of alerts, comments, and decisions relevant to the user.

### F15. Demo toolbar (MUST for demo builds)

- Persistent, collapsible bar with persona switcher, advance-time, and reset, active only when DEMO\_MODE is true. Full behavior, endpoints, and acceptance criteria are in Section 12.11.
- AC: with DEMO\_MODE off the toolbar and the /api/demo endpoints do not exist.

## 8. Use cases

- **UC1.** Executive asks: "Why is our forecast over budget?" and finds the top movers and the anomaly behind it.
- **UC2.** Engineer asks: "What caused the jump in data transfer last Tuesday?" and traces it to one account and service.
- **UC3.** Engineer reviews an idle-instance recommendation, sees 14-day CPU evidence, approves it, and marks it implemented.
- **UC4.** Engineer requests changes on a rightsizing recommendation because a release is coming; the consultant replies with a note.
- **UC5.** Executive checks who approved a shutdown and when.
- **UC6.** Consultant opens Portfolio Overview and sees which client has a budget at risk.
- **UC7.** Consultant produces a monthly report for a client and exports it.
- **UC8.** Engineer marks a recurring month-end batch spike as Expected so it stops alerting.
- **UC9.** Executive tries to open the approval action and sees a clear read-only explanation instead of a broken button.

## 9. Edge cases and error handling

**Data**

- New client or account with no data: empty state explaining what will appear and when.
- Today's data is incomplete: label "partial" and exclude from anomaly detection and trend calculations.
- Billing data may arrive late: show a "data as of" timestamp.
- Fewer than 7 complete days of history: hide the forecast. Fewer than 14: hide anomalies. Show a short explanation in both cases.
- Credits, refunds, and negative line items: show as separate rows, never hide silently.
- Untagged spend: always an explicit "Untagged" bucket.
- Removed or suspended account: keep history, mark the account status.
- Comparing periods of unequal length (e.g. February vs March): normalize to daily average and say so.
- Rounding: store money as integer minor units or decimal, round only at display; totals must match.
- Time zones: all daily buckets in UTC, labelled.

**Anomalies**

- Multiple overlapping anomalies on the same service: group into one event with sub-drivers.
- Recurring predictable spikes: allow "Expected" with a recurrence note.
- Very small absolute amounts with large percent change: suppressed by minimum-impact threshold.

**Recommendations and approvals**

- Resource changed or deleted after the recommendation was created: mark Stale, show why, block approval.
- Two engineers decide at the same time: optimistic locking with a version number; second user sees a clear conflict message and the latest state.
- Recommendation on a production-tagged resource: show an extra warning in the confirm dialog.
- Conflicting recommendations for one resource: show only the highest-impact one, link the others.
- Estimate is overstated or unknown: show a range and a confidence label, never a false-precise number.
- Request changes without a comment, or dismiss without a reason: blocked with inline validation.
- Undo: decisions are not deleted; a new decision supersedes and is logged.

**Permissions and sessions**

- Role changes while the user is signed in: re-check on every API call.
- Direct link to another tenant's object: 404. Forbidden action in own tenant: 403 with a human-readable message and the role needed.
- User removed: sessions invalidated; historical audit entries keep the name.
- Session expiry: preserve the URL and return after sign-in.

**AI**

- Model timeout, error, or rate limit: fall back to the template explanation and show a neutral note.
- Output includes a number not in the input: reject and use the template.
- Empty or low-confidence evidence: the explanation states uncertainty explicitly.
- Prompt injection through resource names or tags: treat all input fields as data, never as instructions.

**UI**

- Very long service or tag names: truncate with tooltip and accessible full text.
- Large tables: pagination or virtualization; sticky header; horizontal scroll inside the table container only.
- Charts: every chart has a data-table alternative and keyboard-reachable data points.
- Loading, empty, and error states exist for every data component.
- Color is never the only carrier of meaning (status, severity, budget).
- Export of large reports: show progress and handle failure with retry.

**Budgets**

- Threshold already exceeded when a budget is created: warn immediately.
- Overlapping budgets: allowed, each evaluated separately.
- Budget edited mid-period: history preserved, change audited.

## 10. Information architecture and screens

**Navigation (by role)**

- Client users: Overview, Cost Explorer, Anomalies, Recommendations, Budgets, Reports, Audit Log, Settings.
- Consultant: Portfolio, then the same client sections inside a selected client, plus Users and Access.

**Screen inventory**

1. Sign in
2. Portfolio Overview (Consultant)
3. Client Overview
4. Cost Explorer
5. Anomalies list and Anomaly detail
6. Recommendations list and Recommendation detail (with decision dialogs)
7. Budgets list and Budget editor
8. Reports (generate and download)
9. Audit Log
10. Users and Access (Consultant)
11. Notifications/alerts panel
12. Empty, error (403, 404, 500), and session-expired pages

**Responsive requirement.** All screens MUST work from 360px width to desktop. Data tables switch to a stacked or scroll-contained pattern on small screens.

## 11. Data model and seed data

### 11.1 Entities (logical model)

- **Organization:** id, name, type (MSP or Client).
- **Client:** id, name, industry, msp\_org\_id, currency, created\_at.
- **AwsAccount:** id, client\_id, aws\_account\_id (12 digits, fake), name, environment (prod, staging, dev), status.
- **User:** id, name, email, password\_hash, role (executive, engineer, consultant), org\_id.
- **ClientAccess:** user\_id, client\_id (consultant assignments and client membership).
- **CostRecord (daily):** id, client\_id, account\_id, date (UTC), service, region, usage\_type, tag\_team, tag\_env, tag\_owner, amount (minor units), currency, is\_credit (bool).
- **Resource:** id, account\_id, type (ec2, ebs, eip, s3, snapshot), resource\_aws\_id, name, tags (json), state, monthly\_cost, created\_at.
- **UtilizationMetric:** resource\_id, date, cpu\_avg, cpu\_max, network\_in, network\_out.
- **Anomaly:** id, client\_id, dimension (service/account/region), dimension\_value, start\_date, end\_date, impact\_amount, percent\_over\_baseline, severity, status, ai\_explanation\_id.
- **Recommendation:** id, client\_id, resource\_id, type, evidence (json), est\_monthly\_savings (min, expected, max), risk (low, medium, high), confidence, status, version, created\_at, decided\_by, decided\_at.
- **Decision/Comment:** id, object\_type, object\_id, user\_id, kind (approve, request\_changes, dismiss, note, implemented), text, created\_at.
- **Budget:** id, client\_id, scope\_type, scope\_value, amount, period, thresholds (json).
- **Alert:** id, client\_id, type, object\_ref, created\_at, read\_by.
- **AuditEntry:** id, time, actor\_id, actor\_role, action, object\_type, object\_id, before (json), after (json), reason.
- **AiExplanation:** id, object\_type, object\_id, prompt\_version, output (json), source (model or template), created\_at, feedback.

### 11.2 Seed data requirements

Generate deterministically with a fixed random seed. Cover the last 180 days relative to the build date. Three fictional clients (no real company names):

1. **Brightloop Retail** (e-commerce, 4 accounts). Seed a data-transfer and EC2 spike starting 7 days ago, about 35 to 40 percent above baseline, plus several idle instances. This is the main demo client.
2. **Medora Health** (healthcare SaaS, 3 accounts). Stable spend, tag coverage problems (about 30 percent untagged), one budget at risk of overrun.
3. **Tallyard Logistics** (logistics, 5 accounts). Gradual growth in generative AI service spend, a recurring month-end batch spike to mark as Expected.

Each client has 8 to 15 services, at least 3 regions, and realistic weekday/weekend patterns. Include at least: 12 idle or oversized EC2 recommendations, 8 unattached volumes, 6 old snapshots, 4 unused addresses, 3 buckets without lifecycle rules, one stale recommendation, and one production-tagged high-risk item.

### 11.3 Mock data provider

All data enters through a provider interface (Section 12.3) so the mock can be replaced.

### 11.4 Demo users

One user per role per client, plus one consultant assigned to all three clients. Credentials documented in the README and shown only on the sign-in page of the demo build.

## 12. System architecture and tech stack

### 12.1 Recommended stack (defaults)

- **Framework:** Next.js (App Router) with TypeScript, full-stack in one repo.
- **UI:** React with an accessible headless component library (e.g. Radix primitives) and CSS driven by the theme file. Final visual styling follows the owner's direction.
- **Charts:** a React charting library that supports accessible labels (e.g. Recharts or visx).
- **Tables:** TanStack Table for sorting, column preferences, virtualization.
- **Database/ORM:** SQLite for local and demo, Prisma ORM, schema portable to Postgres.
- **Validation:** Zod on every API input and output.
- **Auth:** session cookies with hashed passwords (Auth.js or equivalent), role checks in a shared server module.
- **AI:** Anthropic Claude API via a server-side service, model name configurable by environment variable; template fallback.
- **Reports:** server-side PDF generation and CSV streaming.
- **Testing:** Vitest for business logic, Playwright for key flows, axe for accessibility.
- **Hosting:** local first; optional Vercel deploy with a hosted database.

### 12.2 Module layout

- /app (routes and pages)
- /components (UI components, token-driven)
- /server/auth, /server/rbac, /server/audit
- /server/providers (mock and AWS adapter)
- /server/analysis (anomaly, recommendations, savings)
- /server/ai (explainer service, prompts, validators)
- /prisma (schema, seed)
- /tests
- AGENTS.md (working rules for Codex) and README.md (setup, demo users, assumptions)

### 12.3 Data provider interface

A single interface with two implementations: MockProvider (default, reads the seeded database) and AwsProvider (documented stub, not required). Methods map to real AWS APIs for future integration:

- getCostAndUsage and getForecast (Cost Explorer)
- getAnomalies (Cost Anomaly Detection)
- getRecommendations (Compute Optimizer)
- getUtilization (CloudWatch metrics)
- listAccounts and listTags (Organizations and tagging APIs)
- getBudgets (Budgets)

Verify exact API names and response shapes against current AWS documentation before any real integration. Real access would use a customer-deployed read-only IAM role assumed through STS with an external ID.

### 12.4 Anomaly detection rules (defaults, configurable)

1. For each dimension value (service within account), compute a baseline from the trailing 14 complete days (median) and a spread (median absolute deviation).
2. Flag a day when cost exceeds baseline + 3 x spread AND the increase is at least 30 percent AND at least 50 in client currency.
3. Merge consecutive flagged days into one anomaly. Impact = sum of excess over baseline.
4. Severity: High if impact is 500 or more or 60 percent or more over baseline; Medium if 150 or more; otherwise Low.
5. Driver: break the anomaly down by usage type and region to report the largest contributor.
6. Skip incomplete days and series with fewer than 14 days of history.

### 12.5 Recommendation rules (defaults)

| Type | Rule | Savings estimate | Default risk |
| --- | --- | --- | --- |
| Idle EC2 instance | average CPU below 5 percent and low network for 14 days | full monthly instance cost | Medium (High if prod-tagged) |
| Oversized EC2 instance | max CPU below 40 percent for 14 days | difference to one size smaller | Medium |
| Unattached EBS volume | unattached for more than 7 days | full monthly volume cost | Low |
| Old snapshot | older than 90 days, no linked image | monthly snapshot cost | Low |
| Unused Elastic IP | unassociated for more than 7 days | monthly address cost | Low |
| S3 without lifecycle rule | large bucket with no lifecycle policy | estimated tiering savings as a range | Low |

Savings are shown as expected value with a range and a confidence label. Recommendations become Stale if the underlying resource state changes.

### 12.6 AI explainer contract

- **Input:** structured facts only (object type, amounts, dates, drivers, evidence, risk, prompt version). No free-form user text.
- **Output (JSON):** headline, explanation (2 to 4 sentences, plain language), evidence (list of facts used), risk\_note, suggested\_next\_step, confidence (low, medium, high).
- **Guardrails:** use only provided facts; no invented numbers; no instructions to execute changes; fixed length; tone suitable for non-technical readers.
- **Validation:** numeric values in output must exist in input; otherwise fall back to the template.
- **Operations:** cache per object and version, timeout of about 10 seconds, store prompt version, show "AI-generated" label, allow feedback.

### 12.7 API surface (REST, JSON, under /api)

- POST /auth/sign-in, POST /auth/sign-out, GET /me
- GET /clients, GET /clients/:id/overview
- GET /clients/:id/costs (groupBy, from, to, filters, page)
- GET /clients/:id/anomalies, GET /anomalies/:id, PATCH /anomalies/:id/status
- GET /clients/:id/recommendations, GET /recommendations/:id, POST /recommendations/:id/decision (approve, request\_changes, dismiss, implemented; requires version)
- POST /recommendations/:id/comments
- GET/POST/PATCH /clients/:id/budgets
- GET /clients/:id/audit-log, GET /clients/:id/reports (format)
- GET/POST/PATCH /users (consultant only)
- POST /ai/explain (internal, server only)

All endpoints validate input with Zod, check role and tenant, and write audit entries for mutations.

### 12.8 Calculation contracts

All formulas below are defaults. Implement them as pure functions in /server/analysis with unit tests, and read every constant from one config file.

**Month-end forecast.** Uses complete days only. Today's partial day is excluded from both terms and labelled partial.

```latex
\text{Forecast} = \text{MTD Spend} + \left(\text{Trailing 7-Day Daily Average} \times \text{Remaining Days in Month}\right)
```

- MTD Spend: sum of all complete days from the first of the month through yesterday (UTC).
- Trailing 7-Day Daily Average: total of the last 7 complete days divided by 7. If the month is less than 7 days old, the window reaches back into the previous month.
- Remaining Days in Month: days in the month minus the number of complete days elapsed this month, including today.
- Fewer than 7 complete days of history in total: hide the forecast and show an explanation.
- The forecast is a single expected value, always labelled "estimate". Round only at display.

**Budget and comparison figures.**

- Budget used (%) = MTD Spend divided by budget amount.
- Forecast vs budget (%) = forecast divided by budget amount. Over 100 means the client is forecast to exceed the budget.
- Change vs previous period (%) = (current minus previous) divided by previous. If previous is 0, show "new", never infinity.
- Periods of unequal length are compared as daily averages and labelled as such.

**Savings totals.**

- Identified savings = sum of expected monthly savings of recommendations in Open, Approved, or Changes requested. Excludes Dismissed and Stale.
- Realized savings = sum of expected monthly savings of recommendations in Verified.
- Show totals per month and label them "estimated" until verified.

**Attention score (consultant portfolio).** A placeholder heuristic for ranking clients, not a validated model. Weights are configurable.

```latex
\text{Score} = \min\left(100,\; 30 \times H + 25 \times B + 10 \times S\right)
```

- H = number of High-severity anomalies in New or Investigating status.
- B = 1 if any active client-level budget has forecast over 100 percent, otherwise 0.
- S = number of recommendations that are Stale, or Open for more than 14 days.
- Bands: 0 to 29 Low, 30 to 59 Medium, 60 and above High. Always show the band as a text label as well as any color.
- Ties are broken by higher MTD Spend first.
- Seed data must produce a clear order: Brightloop Retail highest, then Medora Health, then Tallyard Logistics.

### 12.9 Recommendation state machine

This table is the only set of valid transitions. Any other request returns 409 with a plain-language message. Every transition checks the record's version number, increments it, and writes an audit entry (actor, role, from, to, reason or comment).

| From | Action | Actor | Requirement | To |
| --- | --- | --- | --- | --- |
| (new) | Create from rules | System | Rule match in Section 12.5 | Open |
| Open | Approve | Engineer | Confirm dialog | Approved |
| Open | Request changes | Engineer | Comment required | Changes requested |
| Open | Dismiss | Engineer | Reason required | Dismissed |
| Changes requested | Respond and resubmit | Consultant | Note required | Open |
| Changes requested | Approve | Engineer | Confirm dialog | Approved |
| Changes requested | Dismiss | Engineer | Reason required | Dismissed |
| Dismissed | Reopen | Engineer | Reason required | Open |
| Approved | Revoke approval | Engineer | Reason required | Open |
| Approved | Mark implemented | Engineer | Optional note | Implemented |
| Implemented | Verify savings | System | Demo clock at least 14 days after implemented date | Verified |
| Open, Changes requested, Approved | Resource changed or deleted | System | Resource state differs from evidence | Stale |
| Stale | Refresh | System | Regenerated from current resource state | Open (new version) |
| Stale | Dismiss | Engineer | Reason required | Dismissed |

- Verified is final. Executives and Consultants cannot change status, except the Consultant's Respond and resubmit action.
- In this concept, verification is simulated: when the demo clock passes the 14-day mark, the expected savings are marked verified and labelled "simulated verification". A real product would compare actual cost before and after the change.
- Stale recommendations cannot be approved. The decision buttons are disabled with an explanation.

### 12.10 Deterministic fallback templates

These templates let the app work fully offline, with no API key. They are used when no key is set, when the model fails or times out, or when its output fails validation. Output is stored with source = template and labelled "Auto-generated summary", not "AI-generated", because no model was used.

**Formatting rules.** Currency uses the client's currency with thousands separators, no decimals for 100 or more, two decimals below 100. Percentages have no decimals. Dates read like 14 Oct 2026. If a value is missing, omit the whole sentence that uses it. Never print "undefined" or an empty placeholder.

**Anomaly template**

- headline: {service} spend is {pct}% above its usual level
- explanation: {service} in {account\_name} cost {amount\_day} on {peak\_date}, compared with a typical {baseline\_day} per day over the previous 14 days. Since {start\_date}, this adds up to {impact} more than expected. The biggest contributor is {top\_driver} in {top\_region}.
- evidence: Baseline (14-day median): {baseline\_day} | Peak day: {peak\_date}, {amount\_day} | Extra spend so far: {impact} | Largest driver: {top\_driver} ({driver\_share}% of the increase)
- risk\_note: Severity: {severity}. If this continues, the month-end forecast rises by about {forecast\_delta}.
- suggested\_next\_step: Check what changed in {account\_name} around {start\_date}, such as a new deployment, a traffic increase, or a configuration change. Mark the anomaly as Expected if this is planned.
- confidence: High if 3 or more days flagged, Medium if 2, Low if 1.

**Recommendation templates** (shared fields: {resource\_name}, {account\_name}, {days}, {monthly\_cost}, {savings}, {risk}, {owner}; {prod\_warning} = "This resource is tagged as production, so confirm with its owner first." when the environment tag is prod, otherwise empty)

| Type | Headline | Explanation | Risk note | Next step |
| --- | --- | --- | --- | --- |
| Idle EC2 | {resource\_name} looks idle and costs about {monthly\_cost} per month | This instance in {account\_name} averaged {cpu\_avg}% CPU over the last {days} days with very little network traffic. If it is no longer needed, stopping or removing it would save about {savings} per month. | Risk: {risk}. {prod\_warning} | Confirm the owner ({owner}) and check for scheduled jobs before approving. |
| Oversized EC2 | {resource\_name} is larger than it needs to be | Peak CPU stayed below {cpu\_max}% over {days} days. Moving from {size\_from} to {size\_to} would save about {savings} per month. | Risk: {risk}. Memory and burst needs are not visible from CPU alone. | Test the smaller size in a non-production environment first. |
| Unattached volume | Volume {resource\_name} is not attached to anything | It has been unattached for {days} days and costs {monthly\_cost} per month. Deleting it would save about {savings} per month. | Risk: Low. Take a snapshot first if the data might be needed. | Check that no one needs the data, then approve. |
| Old snapshot | Snapshot {resource\_name} is {days} days old | This snapshot has no linked image and costs {monthly\_cost} per month. Removing it would save about {savings} per month. | Risk: Low. Make sure it is not the only backup of important data. | Confirm retention requirements, then approve. |
| Unused IP address | Address {resource\_name} is not in use | It has been unassociated for {days} days and costs {monthly\_cost} per month. Releasing it would save about {savings} per month. | Risk: Low. Releasing an address cannot be undone. | Check that no DNS record or allow-list depends on it. |
| Bucket without lifecycle rule | Bucket {resource\_name} has no lifecycle rule | It stores {size\_gb} GB with no rule to move older data to cheaper storage. A lifecycle rule could save between {savings\_min} and {savings\_max} per month. | Risk: Low. Check how often older data is read. | Review access patterns, then approve a lifecycle rule. |

**Validation.** Templates may only use values present in the input facts. The same validator used for model output runs on template output in tests.

### 12.11 Demo controls

A demo toolbar makes the build easy to present and test. It exists only when the environment variable DEMO\_MODE is true. In any other mode the toolbar is not rendered and every /api/demo endpoint returns 404.

**Toolbar behavior**

- A slim persistent bar, collapsible and keyboard accessible, that reserves its own space so it never covers content. It is hidden in print and exports.
- Contents, left to right: a "Simulated data" label; a persona switcher; the demo clock date; an Advance time (+14 days) button; a Reset demo state button.
- Collapsed or expanded state is remembered for the browser session.

**Persona switcher**

- Lists the seeded personas: Priya (Executive), Daniel (Engineer), Maya (Consultant). A client selector appears for Maya.
- Switching signs in as that seeded user through a real session, so all role and tenant rules apply exactly as for a normal user. It never bypasses permissions.
- Persona switches are not written to the audit log. They are logged to the server log only.

**Advance time (+14 days)**

- Moves the demo clock forward 14 days. It does not rewrite cost records, and charts keep using the seeded data window.
- The demo clock affects only age-based logic: verification of Implemented recommendations, "open for more than 14 days" in the attention score, and last-activity displays.
- After the call, a notice summarizes the result, for example "2 recommendations verified, 480 in savings". Each Verified transition writes an audit entry with actor System.

**Reset demo state**

- Shows a confirmation dialog that explains what will be lost.
- Restores the seeded database: recommendation and anomaly statuses, comments, budgets, notifications, the demo clock, and the audit log. It keeps the current persona signed in.
- This is the only way the audit log can be cleared, and only in demo mode.

**Endpoints (all return 404 unless DEMO\_MODE is true)**

- GET /api/demo/state: current demo clock and persona list.
- POST /api/demo/switch-user: body { userId }.
- POST /api/demo/advance-time: body { days: 14 }.
- POST /api/demo/reset.

**Acceptance criteria**

- With DEMO\_MODE off, no toolbar and no demo endpoints.
- A switched persona cannot do anything its role cannot do.
- Reset followed by the demo script (Section 16) works every time from a clean state.
- The seed is deterministic, so two resets produce identical data.

## 13. Non-functional requirements

- **Accessibility:** target WCAG 2.2 AA. Keyboard operable, visible focus, semantic landmarks, labelled form fields, chart data-table alternatives, sufficient contrast, no color-only meaning, reduced-motion support.
- **Responsive:** 360px to desktop; no page-level horizontal scroll.
- **Performance:** key pages usable within about 2 seconds on a typical laptop for seeded data; server-side aggregation; pagination for large lists.
- **Security basics:** hashed passwords, server-side RBAC and tenant checks, input validation, CSRF protection, no secrets in the repository, environment variables for keys, rate limit on sign-in and AI endpoints.
- **Privacy:** no real customer data. State clearly that data is simulated.
- **Reliability:** deterministic seed, idempotent seed script, clear error pages, graceful AI fallback.
- **Internationalization readiness:** currency and date formatting through one utility; strings centralized where practical.
- **Observability (light):** structured server logs and an error boundary on every route.

## 14. Design direction hooks

The owner will supply the visual and interaction direction. To make that easy to apply, the build MUST:

- Use one theme file for design tokens: color roles (surface, text, border, accent, status colors for success/warning/danger/info, chart categorical palette), typography scale, spacing scale, radius, elevation, motion durations, density options.
- Never hard-code visual values in components.
- Support light mode first; dark mode COULD be added through the same tokens.
- Build a base component set before screens: button, input, select, date range picker, table, tabs, card, badge/status tag, alert, dialog, drawer, toast, tooltip, empty state, skeleton, chart wrappers, pagination, breadcrumb.
- Implement states for every interactive component: default, hover, focus, active, disabled, loading, error.
- Provide a hidden /design-system route that renders all components and states for review.

### 14.1 Token contract

This section fixes the names of the tokens, not their values. The owner supplies the values. Codex must create them in one file (theme.css, plus a theme.ts export for chart libraries that cannot read CSS variables) and consume them everywhere through var().

| Group | Token names |
| --- | --- |
| Surfaces | --color-bg-canvas, --color-bg-surface, --color-bg-raised, --color-bg-subtle |
| Borders | --color-border-default, --color-border-strong |
| Text | --color-text-primary, --color-text-secondary, --color-text-muted, --color-text-inverse |
| Accent and focus | --color-accent-default, --color-accent-hover, --color-accent-subtle, --color-focus-ring |
| Status (each with -fg, -bg, -border) | --color-status-success, --color-status-warning, --color-status-danger, --color-status-info |
| Severity (aliases of status) | --color-severity-low (info), --color-severity-medium (warning), --color-severity-high (danger) |
| Charts | --chart-1 to --chart-8 (categorical), --chart-baseline, --chart-forecast, --chart-anomaly, --chart-grid, --chart-axis-text |
| Typography | --font-sans, --font-mono, --font-size-xs to --font-size-3xl, --font-weight-regular, --font-weight-medium, --font-weight-semibold, --line-height-tight, --line-height-normal |
| Spacing | --space-0 to --space-12 |
| Shape and depth | --radius-sm, --radius-md, --radius-lg, --radius-full, --shadow-sm, --shadow-md, --shadow-lg |
| Motion | --motion-fast, --motion-base, --motion-slow, --motion-ease |
| Layout | --layout-sidebar-width, --layout-content-max, --layout-gutter, --density-row-height-compact, --density-row-height-comfortable |

**Rules**

- Numbers: every currency amount, percentage, and numeric table cell uses tabular figures (font-variant-numeric: tabular-nums, via one shared .num class) and is right-aligned, with the same decimals within a column. Negative amounts show a minus sign and the word "credit" where they are credits.
- Use --font-mono only where fixed width is needed, such as resource IDs and code.
- Status and severity are always shown with a text label or icon in addition to color.
- Breakpoints are constants in theme.ts (CSS variables cannot be used in media queries).
- Dark mode, if added later, is a second set of values under \[data-theme="dark"\] using the same names.
- Respect prefers-reduced-motion by setting motion tokens to zero.
- A check (lint rule or grep in CI) fails the build if a hex color or hard-coded pixel spacing appears outside the theme file.
- The /design-system route renders every token and checks contrast pairs for text on surface and status foreground on background against WCAG AA.

## 15. Build plan for Codex (1 to 2 days)

Suggested order. Each phase ends with a working, runnable app.

- **Phase 0. Setup (short).** Repo, TypeScript, lint, formatting, theme file with placeholder tokens, AGENTS.md, README skeleton.
- **Phase 1. Data.** Prisma schema, deterministic seed (Section 11.2), MockProvider.
- **Phase 2. Backend core.** Auth, RBAC, tenant scoping, audit module, cost and overview endpoints, tests for permissions, demo toolbar with persona switcher and reset (Section 12.11).
- **Phase 3. Core screens.** Sign in, Client Overview, Cost Explorer with filters and URL state.
- **Phase 4. Insight and action.** Anomaly detection and screens; recommendations rules, list, detail, decision flow with optimistic locking; audit log screen.
- **Phase 5. AI and consultant view.** AI explainer service with validator and fallback; Portfolio Overview.
- **Phase 6. Budgets and reports.** Budgets, alerts, report export.
- **Phase 7. Polish.** Accessibility pass, responsive pass, empty/error states, design-system route, README with assumptions, demo script.

**If time runs short, cut in this order:** F13, F14, F12, F11, F9, F8. Never cut F1 to F6.

**Working rules for the agent (put in AGENTS.md):** small commits per phase; write unit tests for anomaly detection, savings calculation, and permission checks; keep business logic out of components; no hard-coded visual values; document every assumption; do not add features outside this PRD without noting it.

## 16. Validation plan

**Automated:** unit tests (analysis and RBAC), Playwright flows for Flows B, C, D, axe checks on key pages.

**Usability test (5 participants, 20 minutes each).** Tasks: (1) find why spend rose this week, (2) review and approve a recommendation, (3) find who approved a past decision. Record task success, time, and comments; run SUS. Use a mix of technical and non-technical participants. Report results honestly, including failures, and list what was changed afterward.

**Demo script (5 minutes).** Sign in as Consultant, spot the problem client, open the anomaly, switch to the Engineer, approve a recommendation, switch to the Executive and show the report and audit trail.

## 17. Assumptions, risks, and open decisions

**Assumptions**

- Data is simulated; no real AWS connection.
- Read-only product: CloudLens never changes AWS resources.
- Single currency per client.

**Risks**

- Scope creep in a 1 to 2 day build. Mitigation: cut order in Section 15.
- AI explanations containing wrong numbers. Mitigation: validator and fallback.
- Charts and tables taking longer than planned. Mitigation: use proven libraries.
- Overclaiming in the portfolio. Mitigation: label the project as a concept with simulated data.

**Open decisions (defaults shown; owner can override)**

1. Brand name: CloudLens (working name).
2. Live model call for explanations or pre-generated text: default is live call with fallback.
3. In-app role switcher for demos: default ON.
4. Include the AI workload spend view (F13): default OFF until research supports it.
5. Light mode only at first: default YES.
6. Deployment: default local plus optional hosted demo.

## 18. Glossary

- **AWS:** Amazon Web Services, a cloud platform.
- **FinOps:** the practice of managing cloud spend across engineering, finance, and business teams.
- **MSP:** managed service provider, a company that runs and optimizes a client's cloud ongoing.
- **Cost Explorer:** AWS tool and API for viewing cost and usage data.
- **CUR:** Cost and Usage Report, detailed billing line items.
- **Anomaly:** an unusual spend pattern relative to a baseline.
- **Rightsizing:** moving a resource to a smaller or cheaper size that still meets demand.
- **Tag:** a label on a resource (team, environment, owner) used to attribute cost.
- **RBAC:** role-based access control.
- **IAM:** AWS Identity and Access Management.
- **Tenant isolation:** ensuring one client can never see another client's data.
- **Audit log:** an append-only record of who did what and when.
