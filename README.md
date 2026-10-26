# CloudLens

A cloud-cost clarity portal for AWS consultancies and their clients. **Portfolio concept with simulated data. No AWS account is connected, and CloudLens never changes AWS resources.**

## Product research

[Competitor research and product audit](research/competitive-analysis-2026-10-26.md) documents the eight PRD competitors and the reasoning behind the revised experience. The [workspace implementation notes](research/workspace-update-2026-10-26.md) connect that research to the current pages. This is public-source research, not validated customer demand or authenticated competitor-product testing.

## Run locally

Node.js 20.9+ is required (tested on Node 24).

```sh
npm install
npm run dev
```

Open http://localhost:3000.

- `/` — approved detailed overview: four KPIs, daily/cumulative spending, cost drivers, AWS service breakdown, measured savings and recommendations ready for review.
- `/cost-explorer`, `/anomalies`, `/recommendations` — scoped cost analysis, investigation feed and recommendation queue.
- `/network-flows` — interactive modeled NAT-processing Sankey with cost/GB weighting, source/category filters and a matching evidence table.
- `/budgets`, `/reports`, `/audit-log` — client/account budgets, report library with CSV and print previews, and activity history.
- `/portfolio`, `/users` — consultant client portfolio and demo user access management. These default to the consultant persona when no role is supplied.
- `/settings` — workspace details, locally saved notification preferences and simulated data sources.
- Version B is retained in the source and saved previews as a reference, but is no longer selectable in the application.
- `/design-system` — the approved palette, typography, action treatment and core specimens.

The demo toolbar switches personas and state previews. Date filters are reflected in the URL. Client identity belongs in the sidebar; the compact overview header shows one data-provenance line and an account-scope filter.

## Foundation

- Next.js 16 App Router + React 19 + TypeScript.
- CSS custom properties in `src/styles/theme.css`; semantic colors match the approved Figma study, including `color-border-active: #FFE1D1`.
- Geist and Geist Mono, served locally from Fontsource packages.
- Tabler Outline icons; Radix dialogs for focus trapping and accessible overlays.
- Accessible SVG charts, keyboard-reachable data points, and a tabular alternative. Chart colors consume shared theme variables.
- Typed `CostProvider` contract and deterministic `MockProvider`, accessed by a validated Next.js route handler.
- Pure analysis functions with Vitest tests.

## Phase-one scope

The approved overview and ten populated workspace pages share the same design system and data provider. Implemented interactions include date ranges, intersecting cost filters and grouped series, comparable-period breakdowns, saved analyses, chart/table views, a network Sankey, recommendation evidence and simulated decisions, recorded implementation, browser-local budgets, client-review snapshots, CSV export and browser print. Consultant preview adds portfolio priorities with explicit reasons, fictional client switching and local member management. Invitations do not send email.

Populated desktop main views are the current refinement scope. Responsive polish, new-page empty/error states and other edge cases are deliberately deferred. Recent chart geometry and calculation checks are documented in the [desktop chart audit](research/desktop-chart-audit-2026-10-26.md); a complete visual and interaction audit has not been performed.

## Deliberately deferred

Authentication, real session switching, server-side RBAC/tenant isolation, database persistence, append-only server audit storage, complete recommendation state transitions/optimistic locking, automatic anomaly detection, AI services, background report generation, notification delivery and budget alert delivery are **not yet implemented**. UI persona restrictions are not a security boundary. All exposed API data is fictional. Use only simulated data in a hosted demonstration; real customer data requires a production security and persistence foundation.

Prisma + SQLite (portable to PostgreSQL) and shared server auth/RBAC modules remain the planned foundation for durable workflows after the main screens are refined.

Demo mutations are stored in localStorage under `cloudlens-demo-v1` and scoped `cloudlens-budgets-*`, `cloudlens-reports-*`, `cloudlens-members-v1` and `cloudlens-preferences` keys; settings provides a confirmed reset. Browser-local events are not a production audit log.

## Data and assumptions

- Stable demo date: 25 October 2026, so screenshots and calculations remain reproducible.
- 180 days of seeded cost records per fictional client. Today's partial records are labelled and excluded from aggregates and forecasts.
- Money is integer cents. Forecast is complete MTD plus trailing seven-day average × remaining days, rounded only at the result boundary.
- October month comparisons use October 1–24 versus September 1–24. Other date ranges use the preceding equal-length period. Service/chart totals reconcile at integer precision.
- The Brightloop network example represents 59,400 GB and $2,673 in estimated NAT processing within $3,935 total VPC charges. It is a separate simulated flow dataset, not a live AWS integration or a representation of all data-transfer fees.
- Recommendation evidence is seeded. Verified savings are explicitly simulated. Forecast is estimated.
- Primary buttons use the deeper approved orange to retain white-text contrast. Active navigation keeps the peach fill, #FFE1D1 stroke and subtle shadow.
- The earlier `design/build-theme-study.js` is a historical Figma-generation source; it is not the application and should not be rerun to update code.

## Checks

```sh
npm run typecheck
npm test
npm run build
```

The application source is in `src/app`, shared components in `src/components`, domain types in `src/lib`, provider in `src/server/providers`, and calculations in `src/server/analysis`.

## Hosting

The standard Next.js build has server-rendered routes and a Route Handler, suitable for Vercel or a Node.js server. A separate GitHub Pages adapter creates a browser-only version of the simulated demo without changing the local server application.

```sh
npm ci
npm run build
npm start
```

No AWS credentials, API keys or environment variables are needed for the simulated demo. Browser-local changes are device-specific and are not shared across users.

### GitHub Pages

```sh
npm ci
npm run build:pages
```

The build creates `.pages-build/out` with the `/cloudlens` base path, prerendered route entry points and local static assets. The Pages version reads simulated data in the browser rather than calling a server API. Production data integrations are not available on this static host.

GitHub Pages serves the generated export from the `gh-pages` branch. The main branch retains the Next.js source. After changing the application, run the static build and publish the contents of `.pages-build/out` to `gh-pages`. The optional Actions workflow template is retained at `scripts/pages-workflow.example.yml`; using it requires permission to upload Actions workflows.
