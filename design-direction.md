# CloudLens visual direction

Agreed with the owner on 25 October 2026. This direction supplements the PRD; it does not change product behavior or scope.

## Reference file

Figma: https://www.figma.com/design/L2rtizEUpABtAXHgCjgUdd/Cloud-Lens
Page: Design exploration. Re-query node IDs before subsequent sessions.

## Owner decisions

- Firecrawl (called Firefly in conversation): use its visual color theme, structural line pattern, icon treatment, and layout approach.
- Cloudflare account overview: adopt grouped KPI panels, paired metric cells, shared category headers, and integrated sparklines rather than a repetitive collection of standalone KPI cards.
- Cloudflare Workers overview: use visual relationships and concise visual summaries to make complex information understandable.
- 1Password Reports: use custom illustrations appropriate to different CTA cards.
- Pace: CTAs must have depth through inner shadows; inspect and adapt its primary button treatment.
- Tabler Outline is the chosen UI icon library, replacing Phosphor following owner review. Navigation and inline icons are 16 px. Icon-only control specimens are square, 40 by 40 px. Sidebar icons sit directly beside labels, without individual boxes. Official Tabler SVG assets and their MIT license are saved in design/icons/tabler.

## Interpretation for CloudLens

- Light neutral canvas, white/light surfaces, dark neutral text, orange primary accent, and pale peach selected states. Firecrawl references are raster screenshots, so exact palette, font, and spacing tokens remain to be established; do not present visual estimates as source tokens.
- Thin, low-contrast horizontal and vertical rules define the page structure. Small intersection marks and sparse technical dot/line textures provide identity. Preserve legibility around charts, tables, and explanations.
- Simple outline icons for navigation and actions; small patterned/pixel-style motifs for feature entry points. Keep optical size and stroke weight consistent.
- KPI groups should reflect meaningful product categories, such as Spend and forecast, Savings, and Attention. Each can contain related metric cells, context, and a small appropriate trend. Do not give every metric the same chart by default.
- Use visual relationships where supported by facts, such as an anomaly's service/account/region contributors, or recommendation decision history. Do not imply that a cost-driver graphic is a verified infrastructure dependency map.
- Custom illustrations belong on report choices, onboarding prompts, and useful empty states. Use a coherent family with shared proportions, line treatment, palette, and lighting. Routine table actions and every KPI do not need illustrations.
- Keep status colors distinct and labelled: orange is the brand accent, not a universal severity or success indicator. Show estimated, verified, and simulated figures honestly.
- Retain role-specific content and the PRD's accessibility, responsiveness, and centralized token requirements.

## Measured Pace primary CTA reference

These are verified editable Figma properties, not screenshot estimates:

- Solid fill: #FF5A00.
- Border: 1 px linear gradient, approximately #FF7C35 to #E55100.
- Inner shadow: rgba(255,255,255,0.25), x=0, y=4 px, blur=8.3 px, spread=0.
- Rectangular button corner radius: 12 px.
- Deposit button: 110 by 36 px, padding 6 px vertical / 12 px horizontal.
- Convert button: 328 by 40 px, padding 8 px vertical / 16 px horizontal.
- Label: Inter Medium, 16 px.

The white inner shadow acts as an inset highlight. Adapt this effect to the selected Firecrawl-inspired orange and validate label contrast; these reference measurements are a starting point, not finalized CloudLens tokens. Include hover, focus, pressed, loading, and disabled states when creating the component system.

## Next design work

Theme study 01 is created in the existing Design exploration page, below the references, within the section CloudLens / Mini design system / 01. Board: https://www.figma.com/design/L2rtizEUpABtAXHgCjgUdd/Cloud-Lens?node-id=2-1626

The study includes 53 local variables, eight text styles, six primary-button state variants, official Phosphor vectors, input/select/navigation specimens, grouped KPIs, a recommendation row and three original editable vector illustrations. Geist is the proposed interface typeface, with Geist Mono for technical identifiers. Tokens are saved in design/theme-study.tokens.json. Main button label contrast is 4.65:1; key text and status pairs were also checked. The component examples use illustrative simulated data and are not a functional or final product screen.

The study awaits owner review before its values are treated as locked. After feedback, extend the component system and create product screens.

Owner refinement: other than chip padding and icon/control proportions, the direction looks good. Status chips now use horizontal auto layout, Hug contents, 10 px left/right and 4 px top/bottom padding, replacing estimated widths. The icon specimens now use centered 16 px glyphs in 40 px square controls. The refined navigation example uses 16 px icons and 13/20 px text in 36 px rows.

A companion sidebar specimen is placed beside the foundation board: https://www.figma.com/design/L2rtizEUpABtAXHgCjgUdd/Cloud-Lens?node-id=2-2304. Sidebar width is 240 px; row width 216 px; horizontal padding 12 px; icon-label gap 8 px; row gap 4 px; active row radius 6 px. These choices follow Scout's compact navigation measurements and use Firecrawl-inspired selected styling.

Owner approved Tabler after the two-icon comparison. All 35 remaining Phosphor icons in the two CloudLens boards were replaced with official Tabler Outline vectors; the two original Tabler samples remain. Reference dashboards were not altered. Existing control geometry and semantic colors are preserved.

The active navigation item retains the peach surface and orange text/icon, with a thin neutral border and Scout's measured drop shadow: x=0, y=1.5 px, blur=2 px, spread=-1 px, near-black at 5% opacity. Saved as the reusable Figma effect style CloudLens / Navigation active and applied to both active navigation specimens.

Color consistency review: every variable-bound solid paint in the two CloudLens boards has its stored RGB synchronized to the resolved variable value while retaining the binding. Color swatches identify their fill role; their outlines use color-border-default. Added separate labelled Border/default (#E6E6E2) and Border/strong (#C9C9C3) samples. Canvas remains #FAFAF9 and Tint remains #FFF0E8; no new palette values were requested.

Owner added color-border-active = #FFE1D1 for the 1 px active navigation stroke. Both active navigation specimens now use this semantic variable, retaining color-accent-subtle fill and the Scout-inspired shadow. This supersedes the neutral border on active rows; general borders still use color-border-default.

## Application implementation — locked foundation

The owner approved locking this direction and building the complete application in Codex, beginning with two homepage versions. Source implementation is in E:/CloudLens/src. Figma remains reference material. Shared visual primitives are in src/styles/theme.css, with the design-system specimen available at /design-system. The initial delivery is a local Next.js application, not a hosted Site.

Homepage A (Analytics) emphasizes grouped KPIs, the spend trend and cost breakdown with a supporting budget/recommendation column. Homepage B (Briefing) is retained as a reference. The approved overview and populated workspace screens use the same mock provider and visual language. Production authentication/persistence remain subsequent phases, documented in README.md.

Owner selected Version A. Application entry now always uses A and removes the design-version switcher. The root header is a compact Cost overview title with client/account count as subtext; no root-level breadcrumb, industry eyebrow or separate metadata band. Utility panels use direct cost terminology rather than marketing copy. Sparklines must be based on actual time-series data; decorative savings/forecast histories have been removed.

Overview summary limit: four KPIs — month-to-date spend, month-end forecast, identified monthly savings, verified monthly savings. Cloudflare is a treatment reference, not a requirement to copy its six metrics. Use two paired groups with muted outer header bands, inset white bodies with rounded top corners, continuous cell dividers, and a bottom-aligned sparkline contained only in the actual-spend cell. Cards are approximately 150 px tall at the reviewed viewport. Anomaly and pending-decision counts belong in contextual navigation and the relevant panels below.

KPI context refinement: actual spend retains its solid daily trend. Forecast adds a dashed cumulative projection from MTD to the calculated month-end estimate using the same run rate, hidden when the forecast is unavailable. Identified savings displays an active-recommendation count. Verified savings displays its share of tracked savings (identified + implemented + verified; excluding dismissed/stale), with a progress bar and a tooltip explaining the denominator and simulated verification. All four cells reserve equal footer space; no fabricated savings history is shown.

Workspace expansion: populated primary views now cover Cost Explorer, Anomalies, Recommendations, Budgets, Reports, Audit Log, Client portfolio, Users & access and Settings. Use compact headers, purposeful summaries (at most four), scoped filters, readable tables, illustrated report templates and existing detail drawers. Real navigation replaces the old sidebar drawer shortcuts. Empty, error and other edge states on these new pages are deferred explicitly by the owner; backend workflows remain simulated.
