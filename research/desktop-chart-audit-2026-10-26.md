# Desktop chart and layout audit

Scope: populated desktop pages, not responsive refinement. Source review covered all chart SVGs, sparklines, report illustrations, shared icon rules, page headings, toolbars and table/panel spacing.

## Corrected

- Shared icon sizing now targets only Tabler SVGs using a low-specificity selector. Chart SVGs and illustrations are not treated as 16 px icons; intentional larger resource/report icons can override the base icon size.
- Grouped cost plots measure the actual content width instead of centering a fixed 880 px drawing in a wider panel. Text and line weights remain at native scale and horizontal gutters are consistent.
- Currency axes use round intervals. The current service chart uses $200 intervals rather than fractional $193.5 intervals.
- Grouped chart hit areas are bounded to the plot, focus clears on blur, duplicate date ticks are removed, and hover/focus markers align to the selected date. Legend labels stay static rather than wrapping as values are appended. Values use a separate readout above the plot.
- Sankey column positions and curve control points follow the available container width. Column labels use the same SVG coordinates as nodes. ViewBox and rendered heights match at 310 px, removing fixed-aspect-ratio centering and extra vertical space.
- Shared panel and dialog heading text can wrap instead of pushing actions outside their containers. Table alignment is consistent. Removed forced icon-size overrides that were compensating for the original catch-all selector.

## Verification

- 30 tests across seven suites pass, including round axis intervals, finite coordinates, node/label bounds at 800/1072/1464 px chart widths, filtered Sankey layouts and per-stage band conservation.
- Production build and TypeScript compilation pass.
- Homepage and all ten workspace routes return HTTP 200 with the expected heading.
- Served CSS checked for the scoped icon selector and absence of the former SVG catch-all.
- Interactive browser verification was attempted but blocked: local browser use is disabled in Work settings. Therefore these are source, geometry, build and route checks, not a completed screenshot or click-through QA pass. No new screenshot has been claimed.
