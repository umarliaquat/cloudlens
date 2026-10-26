# CloudLens

Build the local application in this checkout. The approved visual direction is locked in `src/styles/theme.css` and `design/theme-study.tokens.json`; Figma is reference material, not the application delivery surface.

- Use Next.js App Router, React and TypeScript. Keep data/calculations out of view components.
- Use Tabler Outline icons, 16 px navigation icons, 36 px navigation rows and 240 px desktop sidebar.
- Respect the approved orange/neutral palette, active stroke #FFE1D1, Scout-inspired active shadow and Pace-inspired button inset light.
- Keep visual tokens in theme.css; SVG charts consume the shared theme export. Responsive breakpoints are constants.
- All data is simulated. Never imply a real AWS connection or automatic AWS changes.
- The detailed Figma review 01 is the approved Client Overview; the calm alternative was declined. Do not reintroduce the version picker, root-level breadcrumbs, industry eyebrow or separate client-metadata row. Client identity belongs in the sidebar. Keep one demo-data/completeness line under the compact title; account scope appears in its filter. Version B is archived reference only.
- Populated primary pages now exist for Cost Explorer, Anomalies, Recommendations, Budgets, Reports, Audit Log, Client portfolio, Users & access and Settings. Preserve their shared shell and tokens. The owner explicitly deferred empty, error and other edge states on these pages. Authentication and durable server workflows remain future phases; do not claim those are implemented.
- Test meaningful calculations and edge cases. Check keyboard and mobile behavior before delivery.
- Currency is integer minor units internally; calculations exclude the partial current day. Distinguish estimated and verified savings.
- Overview summary has at most four KPIs: MTD spend, forecast, identified savings and verified savings. Use the Cloudflare-style inset body/card treatment without copying its metric count. Do not add unrelated counts or fabricated trends to the summary.
- Homepage spend chart defaults to daily costs, with a cumulative toggle and an explicit selected-period actual total. Derive both from the same records; chart and data table share the mode. Keep forecast and budget units consistent with that mode. Do not invent fluctuations for visual effect.
- Workspace pages now follow the research-backed comparison and decision flows. Cost Explorer groups its chart and comparison table from the same filters; saved analyses and review exports remain browser-local. Network flows is an October 1–24 Brightloop-only modeled NAT processing report: 59,400 GB, $2,673 estimated processing within $3,935 VPC billing. Sankey bands and table must conserve the same records. Never label this diagram as total VPC or all data-transfer cost.
- Keep approval, recorded external implementation and measured savings separate. Recommendations with evidenceReady=false cannot be approved. Portfolio priority uses explicit overrun/observed-impact/pending-decision reasons, never a composite score. Audit events must be client-scoped. User capabilities and client assignments are separate demo concepts, not real server authorization.
- Desktop is the current refinement scope. The owner deferred responsive refinements and empty/error states. Do not claim interactive browser QA when browser access is disabled; report automated and route verification separately.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
