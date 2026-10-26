# CloudLens: competitor research and product correction

Research date: 26 October 2026. This document supplements the PRD; it does not silently replace its requirements or the approved visual system.

## What was actually researched

This is a desk-research pass across all eight competitor entries in PRD section 5: official documentation, vendor product material and published screen examples. Vantage's grouped cost-report image and DoiT's anomaly-chart image were also inspected visually in the browser. It is not a hands-on evaluation of authenticated products, a customer interview study, a pricing comparison or proof of demand. Features not established by the sources are marked unverified, not absent. Vendor claims are distinguished from our product judgments below.

The earlier implementation was driven by requirements and visual references without an adequate competitive workflow analysis. Passing calculation tests and a build did not validate its product usefulness.

## Findings that change the premise

- **A client-facing MSP portal is not an uncontested category.** Vantage explicitly markets multi-client management and client reporting. CloudHealth has partner/customer tenants and customer reporting. Flexera One documents MSP customer operations. We cannot claim the existence of multiple clients, dashboards or access roles as a differentiator.
- **Plain-language explanations are also established capabilities.** The opportunity must concern their evidence, audience and place in the workflow, rather than simply adding AI text.
- **The possible opening is narrower and still unvalidated:** a deliberately small AWS advisory workspace for smaller consultancies, where a consultant explains a material change, the client engineer decides on a scoped action, and both can trace implementation and savings evidence through the monthly review.
- Billing, reseller margin, multi-cloud, autonomous infrastructure changes and comprehensive commitment optimization remain outside CloudLens's present PRD scope. Studying those capabilities is not a reason to add them to our homepage.

## Competitors: problem, information and workflow

### 1. AWS Cost Explorer, Billing, Budgets and Cost Anomaly Detection

**Problem:** establish where AWS charges come from, what the month may cost, and which spending changes warrant investigation.

**Information:** Cost Explorer's documented dashboard includes estimated MTD cost, month-end forecast, daily cost graph, leading cost trends and recent reports. A trend opens the chart/context that produced it. Cost Anomaly Detection identifies contributing service/account/region/usage-type combinations. Budget limits and unusual-spend detection answer different questions.

**CloudLens judgment:** retain the essential financial orientation, but explain the dominant change and give a direct investigation path. Define cost basis and exclusions; a number called "cloud spend" alone is insufficient. Do not assume AWS lacks useful explanations or multi-account tools. Independent-client advisory collaboration is the workflow to investigate, not generic multi-account visibility.

Sources: [Cost Explorer dashboard](https://docs.aws.amazon.com/cost-management/latest/userguide/ce-exploring-data.html), [Cost Anomaly Detection](https://docs.aws.amazon.com/cost-management/latest/userguide/manage-ad.html).

### 2. Vantage

**Problem:** make infrastructure spend reportable and accountable across providers, teams and MSP customers.

**Information and flow:** saved reports combine filters, time ranges, grouping and comparisons. Charts and their underlying cost tables support investigation rather than acting as independent decorations. The published grouping screenshot shows service/category selections reflected in a segmented time-series chart. Dashboards compose reports, with common date controls and chart/table widget choices. Its MSP offering explicitly includes client reporting and embedded dashboards.

**CloudLens judgment:** a saved report should represent a useful recurring question, not merely a CSV file. Scope must persist from a change into its chart, table and export. Multi-client reporting is already competitive territory.

Sources: [Cost Reports](https://docs.vantage.sh/cost_reports/), [Dashboards](https://docs.vantage.sh/dashboards/), [MSP offering](https://www.vantage.sh/solutions/for-msps), [published grouping image](https://assets.vantage.sh/docs/cost-report-grouping.png).

### 3. CloudZero

**Problem:** connect technical charges to the teams, products, customers and outcomes that generate them.

**Information and flow:** Explorer combines scoped totals and change comparisons with a ranked, drillable table. Dimensions supply business groupings; resource details provide metadata and configuration context. Views encode a scope and its notification destinations. A finding can become an Insight linked back to the investigation query. Its documented anomaly workflow also preserves filters when opening Explorer.

**CloudLens judgment:** service spend is a starting point, not a complete answer. Add a justified workload/owner/environment model before introducing business metrics. Cost per order or customer must have an actual denominator; a fictional business label does not establish unit economics. Role-oriented information is not an unoccupied feature category.

Sources: [Explorer](https://docs.cloudzero.com/docs/explorer), [Dimensions](https://docs.cloudzero.com/docs/organize-your-costs), [Anomalies](https://docs.cloudzero.com/docs/anomaly-detection).

### 4. nOps

**Problem:** prioritize and implement cost optimizations, with emphasis on worthwhile savings for manageable effort.

**Information and flow:** its recommendations material describes category, effort and potential impact, resource-linked opportunities, implementation guidance and savings tracking. The savings experience distinguishes a monthly savings rate from cumulative saved-to-date and provides a history view. The cited announcement says savings tracking is calculated from recommendation estimates as items are implemented/resolved; that is not independently measured, normalized before/after savings.

**CloudLens judgment:** recommendation amount alone is inadequate. Show prerequisites, utilization evidence, effort, owner, risk and implementation/rollback guidance. Define our own savings verification method rather than borrowing a vendor's label. The depth of nOps's client/consultant approval and audit workflow was not established by this pass; do not claim it lacks one.

Sources: [Recommendations introduction](https://www.nops.io/blog/introducing-nops-cost-optimization-recommendations/), [Savings experience and methodology](https://www.nops.io/blog/new-ai-powered-inform-cost-savings-recommendations/).

### 5. CloudHealth

**Problem:** govern cloud estates and provide partner/customer reporting, including commercial operations where applicable.

**Information and flow:** partner documentation describes customer cost-history bar charts, projected-versus-actual summaries, policy notifications, customer dashboards and allocation through Perspectives. Its partner API documents hierarchical partner/customer tenants. Margin and invoice reporting solve reseller needs; those are distinct from a client's engineering investigation.

**CloudLens judgment:** client portals and partner/customer separation are not new. Learn from reusable reporting and consistent customer context. Do not copy margin or invoice widgets into an advisory portal that explicitly excludes billing. Whether CloudHealth is too complex or expensive for our intended smaller firms remains unverified.

Sources: [Partner reports](https://help.cloudhealthtech.com/partners/reporting), [Partner API](https://apidocs.cloudhealthtech.com/).

### 6. Datadog Cloud Cost Management

**Problem:** connect cloud expense to operational behavior and engineering ownership.

**Information and flow:** its Explorer provides query filters, groupings and a cost-change side panel. Recommendation documentation combines billing with resource/observability signals; instrumentation prerequisites vary by recommendation type. Documented actions include cases, dismissals with reasons and scoped automations, including optional approval safeguards.

**CloudLens judgment:** CPU, memory, usage and deployment evidence matter because an engineer needs to assess consequences, not just a claimed saving. A billing amount cannot establish underutilization. Approval and action tracking are already present in the market; our proposed workflow must be demonstrably easier for the consultant/client handoff.

Sources: [Explorer](https://docs.datadoghq.com/cloud_cost_management/reporting/explorer/), [Recommendations and actions](https://docs.datadoghq.com/cloud_cost_management/recommendations/).

### 7. DoiT

**Problem:** help users investigate and manage cloud costs, with contextual access to operational and expert support.

**Information and flow:** the anomaly detail documentation separates excess cost, actual cost, expected maximum and event timing. Its published chart uses an expected range, detected/inactive markers and distinct cost components. Contributors and a prefiltered report explain the spike; review status, comments and history preserve the response. Context can also accompany an expert inquiry.

**CloudLens judgment:** "+99%" beside a sparkline is insufficient evidence. Show actual versus expected, affected interval, contributor impact and investigation scope. Keep consultant advice distinguishable from a computed observation. Expert collaboration alone is not a unique proposition.

Sources: [Anomaly investigation](https://help.doit.com/docs/governance/cloud-anomalies/investigate-anomalies), [Reports and latency](https://help.doit.com/docs/cloud-analytics/reports).

### 8. Flexera One

**Problem:** organize cost accountability, financial planning and optimization across complex organizations and MSP customers.

**Information and flow:** the FinOps landing page surfaces connection issues, unallocated spend, potential savings, vendor/service spending and purchase-option savings. Widgets route to matching analyses. Cloud dashboards show a monthly bar chart that controls lower-level views. Partner documentation includes customer grouping, policy management and billing exploration.

**CloudLens judgment:** trust and allocation coverage belong in the product's normal information model, not only in error screens. Expose missing cost ownership where it affects a decision. Its broad commercial and multi-cloud coverage is not a backlog for our AWS-only concept.

Sources: [FinOps landing page](https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/finops-dashboard), [Cloud dashboard](https://docs.flexera.com/flexera-one/cloud/using-cloud-cost-optimization/accessing-the-cloud-dashboard/), [MSP capability releases](https://docs.flexera.com/flexera-one/feature-list/features-by-release-grouped-by-capability/partner-service-layer-features-by-release).

## Audit of the current CloudLens implementation

These are observations from the local source, not competitor claims.

| Finding | Why it weakens the product | Correction before a UI rebuild |
| --- | --- | --- |
| `CostRecord` contains date, service, account, region, amount and partial status only. | It cannot substantiate usage, resource, workload, rate or ownership claims. | Model the specific billing and operational evidence needed by our three core scenarios. |
| `seedCosts` maps services to only three account names and alternates regions; client metadata advertises differing account counts. | Account coverage looks credible but is not tied to an account inventory. | Explicit client/account/resource relationships; derive displayed coverage from that inventory. |
| Inter-region-traffic and increased-capacity narratives are seeded prose without usage types, traffic quantities or instance inventory changes. | A plausible explanation is presented without an evidentiary chain. | Separate observed cost drivers, correlated events and consultant hypotheses. Every claim links to supporting records. |
| Client datasets mainly reuse a service template with scaling factors; recommendations repeat across clients. | Different industries do not produce distinct user problems. | Build independent, reconciled scenarios with a reason for each client/workload and recommendation. |
| The overview leads with totals, a trend and highest-spend services. | High spend is not the same as the cause of a material change. | Rank change contributors by dollar delta and connect them to the relevant decision. |
| Cost Explorer grouping changes the table while its chart remains an aggregate line. | The graph cannot show which selected groups caused the shape of the total. | Grouped series and a comparable prior-period breakdown; graph and table use the same query contract. |
| Portfolio attention is `min(100, 30 × high-severity events + 25 × forecast-over-budget)`. | Arbitrary precision disguises an unvalidated prioritization rule and excludes actionable work. | Start with explicit reasons: ongoing excess cost, forecast overrun, overdue decisions and missing evidence. Test any later scoring method. |
| The savings progress denominator mixes potential, implemented and verified monthly estimates. | It is not a meaningful measure of adoption or realized savings, even though it is labelled. | Show separate lifecycle amounts and implementation dates. Compare realized savings against an explicit baseline and measurement window. |
| Role changes mostly alter access/actions and identity in the shared overview. | Priya's monthly review and Daniel's investigation still get nearly the same hierarchy. | Role-specific task ordering; consultant's starting view is the portfolio. |
| Reports are templates plus saved table snapshots. | They omit the narrative and decisions that make an advisory review useful. | Report: outcome vs plan, explained variance, work completed, pending decisions, evidence links and assumptions. |

Relevant source locations: `src/lib/domain.ts`, `src/server/providers/mock.ts`, `src/server/analysis/costs.ts`, `src/components/cloudlens-app.tsx`, `src/components/workspace/analysis-pages.tsx`, `src/components/workspace/consultant-pages.tsx`, `src/components/workspace/operations-pages.tsx`.

## Homepage proposal: each element earns its space

This is a product proposal, not an implemented redesign or a change to the locked palette/typography.

Primary questions, in order: **Are we on plan? What materially changed? What needs a decision? What value has the consultancy delivered?**

| Element | User question / decision | Required data and presentation | Drill-down |
| --- | --- | --- | --- |
| Compact context | Which client and period am I reviewing, and can I trust the figures? | Client, linked account coverage, cost basis, through-date, update time and provisional status. Currency and exclusions are explicit. | Source/coverage details. |
| Maximum four summary metrics | Where do we stand financially? | Working set: MTD spend with like-for-like delta; forecast with dollar variance to the budget; actionable estimated monthly savings; measured savings for a defined reporting window. Treat this set as a proposal until the evidence model and tasks are checked. | Each opens its own matching scope and metric definition. |
| Actual vs plan chart | When did spending diverge? | Cumulative actual and forecast against a cumulative budget trajectory, all in cumulative USD. Mark material events. If daily costs are offered, use a separate labelled mode; never compare daily spend with a monthly total line. | Date/workload investigation with scope preserved. |
| What changed | Which few drivers explain the bill increase? | Ranked rows: workload/service, owner, prior/current comparable spend, dollar delta and share of net change. Clearly separate increases and offsets; contributions can exceed 100% of net change when offsets exist. Link usage/rate evidence. | Filtered explorer and resource evidence. |
| Decision queue | What requires my team's response? | Resource/workload, proposed action, expected saving, risk, prerequisites, accountable person and age/due date. Separate waiting for client approval from waiting for consultant evidence. | Evidence and decision history; no unexplained approval button. |
| Consultancy progress | What was delivered this month? | Implemented changes, date, baseline/measurement method, observed outcomes and client-visible consultant note. Link every saving to an action; avoid a decorative progress percentage. | Review/report with evidence. |

**Role ordering:** Priya gets financial position, explained variance and outcomes first. Daniel gets ongoing cost incidents and decisions first, with technical evidence available immediately. Maya gets a client work queue ordered by explicit monetary exposure and overdue work, with assigned owner and next review date. These are views of the same records, not separately invented dashboards.

**Move off the homepage:** full service inventory, audit history, user administration and a report-template gallery. They remain accessible through purposeful navigation. Navigation counts should describe pending work, not decorate every destination.

**Do not add without evidence:** generic AI prose, an AI-spend module solely because a client has Bedrock costs, commitment-coverage charts without commitments, unit economics without usage/outcome data, an opaque health score, or graphs added merely to equalize card decoration.

## Evidence-first demo plan

Simulation is acceptable for this concept. Unsupported stories are not. Seed raw records first; derive every displayed number and explanation from them.

1. **Unplanned transfer increase.** A named workload changes cross-region transfer usage after a recorded configuration event. Include usage type, billed transfer quantity/rate, source/destination context where available, dates and owner. Derive expected/actual/excess cost for exactly the shown scope. Treat the event as correlation until confirmed. The investigation opens an already-filtered breakdown.
2. **Safe, reviewable optimization.** A specified resource has an observation window, CPU/memory or appropriate storage/network evidence, pricing assumptions and constraints. A consultant proposes an action; an engineer can approve, request evidence or decline with a reason. Implementation is a separate event, followed by a defined measurement window and an explicitly simulated savings result.
3. **Planned growth, not waste.** Another client's costs increase with documented workload volume or an approved rollout. Include a real simulated denominator if discussing efficiency. The product should let a consultant classify the increase as expected and explain its budget impact rather than treating every higher bill as failure.

Minimum supporting concepts: explicit account inventory; cost basis and charge type; service/usage type/quantity/unit; resource/workload; owner/team/environment tags including unallocated values; comparable periods; detection and data timestamps; anomaly contributors and expected values; recommendation prerequisites/effort/risk; decision/implementation events; measurement baseline and outcome. Shared and non-resource costs must remain visible and reconcile; do not force them onto a fictional resource.

Use one query/metric contract for scope, cost basis, currency, period, grain, exclusions and completeness. Chart, table, explanation and exported report must reconcile under that contract.

## Decision gates before further screen expansion

1. Map three complete tasks on the evidence model: explain a cost change, decide on a safe optimization, and deliver the monthly client review.
2. Write the homepage information contract: question, user, calculation, evidence, comparison, action and scope for every element.
3. Review the content hierarchy in a wireframe using those scenarios, retaining the approved DS. Do not lock widgets because they already have CSS.
4. Implement the highest-value end-to-end path first; then extend the other pages. Deferred empty/error states stay deferred during this phase, but provenance and metric definitions are normal-state requirements.
5. Test with representative consultants and client engineers/executives. Ask them to identify the main change, explain its evidence, choose the next action and find a recorded decision. PRD targets such as under-60-second investigation and 80% task success remain targets until measured.

Open research questions: Is consultant/client approval actually where the intended small consultancies lose time? What evidence must a client see before approving a change? Who owns implementation and follow-up? What do existing tools fail to communicate in a monthly review? Would users choose a new portal over their existing tooling? Public documentation cannot answer these questions.

## Working rule for subsequent implementation

For each product decision record: **user → problem → evidence/source → metric definition → information treatment → next action → validation**. An attractive component or a competitor screenshot is not sufficient justification on its own.
