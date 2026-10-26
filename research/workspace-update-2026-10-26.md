# Research-backed workspace update

Implemented in the local Next.js application using the approved orange/neutral foundation, Tabler interface icons and official AWS service vectors. This pass updates populated desktop views. It does not implement AWS connections, production authentication, external notifications or durable server workflows.

## Decisions and their purpose

| View | Research finding applied | Implementation |
| --- | --- | --- |
| Cost Explorer | Reports are scoped questions; graph and table must agree | Account/service/region filters, grouped daily series, actual/prior/dollar/percent comparisons, sorting by increase or spend, daily evidence, reusable saved scopes and CSV export |
| Network flows | A Sankey is useful for a network attribution investigation, not generic cost decoration | Source → destination category → destination. Cost/GB weighting, node/band selection, filters, matching table, evidence detail and CSV. Fixed Oct 1–24 observation window |
| Anomalies | Cost contributors do not prove operational causes | Investigation queue, comparison window, observed impact, explicit status and route to network evidence or scoped Cost Explorer |
| Recommendations | Approval does not equal deployment or measured savings | Account filters, stage tabs, requested prerequisites, evidence-gated approval, recorded implementation note and separate waiting-for-measurement stage |
| Budgets | Limits need scope, owner and forecast variance | Accountable owner, forecast dollar variance, scoped cost investigation and an explicit warning that account/client limits overlap. No external alerts claimed |
| Reports | A client review should support the next conversation | Financial position, largest changes, pending decisions with owners, outcomes and assumptions. Review export includes comparisons, recommendations, measurement evidence and activity |
| Audit log | Decisions need client-specific history | Client-scoped events, reconciled implementation/measurement examples, reasons, timestamps and exports. Browser-local records are not described as immutable |
| Portfolio | Arbitrary scores obscure why work matters | Ordered by forecast overrun, observed dollar impact and pending decisions, with visible reasons. No score or invented health percentage |
| Users & access | Capabilities and data scope are different | Role explanation, client-scope editor, single-client restrictions for client roles and consultant-only preview access. No production authorization claim |
| Settings | Data coverage is part of normal product trust | Inventory derived from report records, explicit demo IDs, cost basis/completeness and billing-versus-flow evidence. Preferences are saved locally; external delivery is not implied |

## Network evidence contract

The fictional flow records total 59,400 decimal GB at an assumed effective $0.045/GB NAT processing rate: $2,673. The comparison is 40,000 GB / $1,800, yielding the $873 increase shown on the homepage. Other VPC charges are $1,262, so the full VPC billing total is $3,935. The Sankey does not represent NAT hourly charges, internet transfer fees, cross-region fees or an actual log ingestion integration. It is not a claim that $873 is recoverable savings.

Three source workloads feed two destination categories and three destinations. Every stage conserves the selected cost or GB total. Selecting a band or node narrows matching table rows; the overall filter controls define the diagram scope. S3 endpoint routing is a question to investigate, not an automatically prescribed optimization.

## Verification

- 26 tests pass across six suites. Added contracts for chart/table reconciliation under grouping and scope, Sankey conservation at all stages, NAT subset costs, modeled-source availability, explicit portfolio reasons and review export contents.
- TypeScript and the Next.js production build pass.
- All ten workspace routes returned HTTP 200 with the expected page heading during local route checks.
- Browser automation was attempted, but the tool returned “Local browser use is disabled in Work settings.” No screenshot review or interactive click-through pass was completed for these changes. This limitation is distinct from the earlier homepage QA.
- Responsive refinements, empty/error states and a full accessibility audit remain deferred. User edits stay in local browser storage.

## Research basis

Uses the existing competitive analysis, Vantage feature notes and public-screen workflow atlas in this checkout: `competitive-analysis-2026-10-26.md`, `vantage-features/notes-2026-10-26.md`, and `flows/flow-notes.json`. No new market claims or new authenticated competitor-product testing were introduced in this implementation pass.
