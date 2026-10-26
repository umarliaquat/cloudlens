# Detailed homepage implementation — desktop QA

Approved direction: detailed Figma review 01, not the calm alternative. Desktop is the current delivery scope. Responsive refinements were explicitly deferred by the owner.

## Implemented

Compact header with one provenance line; functional account scope; explicit amortized-cost definition; four inset summary metrics; cumulative actual/forecast/budget chart; observed cost drivers; official AWS service icons; a reconciled service table; measured savings evidence; and recommendation evidence/decision entry points. Existing shared navigation, client selection, role controls and pages are retained.

Costs remain simulated. No AWS integration, real authentication, durable server workflows or automatic resource changes are claimed.

## Verified in the browser at a 1440 px desktop viewport

- Navigation icons are 16 px and navigation rows are 36 px. No desktop page overflow, heading/action collisions or desktop service/decision-table clipping.
- All six service-name buttons open Cost Explorer with the corresponding service query. The VPC investigation displays $3,935 and its filtered records.
- Account scope updates spend, comparisons, forecast, recommendations and savings. The Production forecast does not borrow the all-account budget.
- Month, 7-day and 30-day range controls update the report; MTD and forecast retain their explicitly labelled monthly scope.
- Chart/table toggle exposes 31 cumulative rows for October. Keyboard Enter on Oct 24 opens a daily-cost dialog totaling $1,424. Forecast days open the forecast method.
- Cost-basis, forecast, identified-savings, verified-savings and cost-driver dialogs open and close. Escape restores homepage trigger focus.
- Forecast evidence reconciles $31,504 + $10,591 = $42,095. Cost drivers and offsets reconcile +$1,095 + $873 − $100 = +$1,868.
- Production-scoped CSV was actually downloaded and inspected: actual $23,205.92, prior $21,337.92, delta $1,868, and only Production recommendations. Exact cents are retained in CSV; on-screen amounts are rounded.
- Both recommendation evidence drawers show the correct resource. Missing required reasons are rejected; cancel clears the error before switching actions. Approval confirmation was inspected and cancelled, preserving the initial demo decisions. No AWS action occurs.
- Executive review omits approval actions. Consultant client switching loads Medora's three-account scope; the default view was restored to Brightloop / Engineer.
- Help, notifications, workspace search, recommendations, anomalies, budgets, reports, audit log and settings navigation were exercised. The browser console contained no warnings or errors in the checked flow.
- Print / Save as PDF is connected to the browser print action; no PDF file was generated during this QA pass.

## Automated verification

21 tests across five suites pass. TypeScript and the Next.js production build pass. Tests cover reconciled current/prior/forecast amounts, account aggregation, comparable periods, chart endpoints, partial-day exclusion, evidence scope and separate savings lifecycles.

## Chart refinement

Daily costs are now the default; cumulative spend remains selectable. Both derive from the same integer billing records. The chart displays the selected-period actual total and comparable-period change, a persistent latest actual value, and hover/focus values. Arrow keys move between dates. The data table follows the selected mode. Daily future estimates sum to the same remaining $10,591, excluding the actual-day anchor. The gray daily line is explicitly labelled a budget/day allocation, not a cumulative budget compared against daily costs.

Desktop padding was corrected by measuring the actual plot container and using its width as the SVG viewBox width; this eliminates the fixed-aspect-ratio whitespace at wide desktop sizes. Checked at 1440 and 1920 px, including daily/cumulative switching, chart/table values, keyboard point navigation and forecast-method activation. No browser warnings or errors observed.

## Desktop issues fixed during QA

Oversized navigation SVGs; excessive navigation row height; a non-actionable client selector for client roles; lost focus after closing evidence dialogs; stale required-reason errors when changing recommendation actions; inconsistent singular/plural labels; misleading increase language for clients whose costs decreased; excessive chart/table padding and paired-card whitespace.

Screenshot: `desktop-implemented.png`. Responsive work remains deferred. This is not an exhaustive audit of every action on the other application pages.
