---
name: reversa-highcharts-visualizer
description: Creates interactive data visualizations with Highcharts.js, generating standalone HTML with animated, responsive, and accessible charts from inline, CSV, or JSON data. Use with "chart", "graph", "dashboard", "highcharts", "data visualization" (lines, bars, pie, heatmap, treemap, sankey, gantt).
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: charts-renderer
---

# Highcharts Visualizer

Creates professional data visualizations using Highcharts.js. Always generates **standalone HTML** (single, self-contained file) with interactive, animated, responsive and accessible charts.

## Workflow

### 1. Receive the Data

Data can come from:

- **Inline in the conversation** → User pastes data, table, list of values
- **CSV/JSON sent** → Analyze the content using `view_file` and inject the data directly into the generated HTML. Never create Python scripts.
- **Excel spreadsheet** → Extract the data from the tables and inject them into the HTML. Don't use Python.
- **Sample data** → When the user wants to explore a chart type without real data
- **Data URL** → Use `web_fetch` to fetch remote data

### 2. Analyze the Data

Before generating the chart, understand the nature of the data:

- **Dimensions**: how many series? How many categories? Temporal or categorical?
- **Scale**: range of values, outliers, distribution
- **Relationships**: comparison, composition, distribution, trend, correlation
- **Volume**: few points (<100), medium (100-10K), large (>10K — use boost module)

Analyze the data internally after reading and inject the tags via string. Don't create intermediate Python programs.

### 3. Choose the Chart Type

Consult `references/CHART_CATALOG.md` for the complete catalog of 40+ chart types, with guidance on when to use each one.

**Quick decision rule:**

| Objective | Recommended types |
|----------|-------------------|
| Trend over time | line, area, spline, areaspline |
| Comparison between categories | column, bar, lollipop, bullet |
| Composition / proportion | pie, donut, stacked column, stacked area, treemap, sunburst |
| Distribution | histogram, box plot, scatter, bell curve |
| Correlation | scatter, bubble, heatmap |
| Flow / process | sankey, dependency wheel, network graph |
| Hierarchy | treemap, sunburst, organization chart |
| Geographic | map (Highcharts Maps module) |
| Financial / timeline | stock chart (candlestick, OHLC, flags) |
| Progress / KPI | gauge, solid gauge, activity gauge |
| Project / planning | gantt chart |
| Funnel / conversion | funnel, pyramid |

If the user did not specify the type, suggest 2-3 options that best represent the data.

### 4. Generate the Code

Consult `references/HIGHCHARTS_PATTERNS.md` for tested code patterns.

**Fundamental rules:**

1. **Standalone HTML**: single `.html` file. When run by the Reversa Docs Team, Highcharts comes from `assets/vendor/` (downloaded by the Publisher via `vendor-pins.yaml`). When run in isolation, accept CDN as a fallback but the preferred path is local.
2. **Pinned version**: `highcharts@11.4.8`. Core and modules must be the same version.
3. **Modules on demand**: only include extra scripts when necessary (see modules table).
4. **Accessibility always**: always include `assets/vendor/highcharts-accessibility.js`.
5. **Exporting always**: always include `assets/vendor/highcharts-exporting.js`.
6. **Responsive**: the chart must adapt to the container/viewport.
7. **Consistent theme**: apply cohesive colors and professional typography.
8. **Animation**: enable entrance animations and smooth transitions.
9. **Rich tooltips**: formatted tooltips, with units and context.
10. **Large data**: for >10K points, include `modules/boost.js` (must be added to `vendor-pins.yaml`).
11. **No `fetch()` for local files**: data comes from `window.RV_DATA.metrics` (or `window.RV_DATA.timeline`), loaded by `assets/js/data.js`.

**Modules needed by chart type (preference: local path in `assets/vendor/`):**

| Resource | Local (when run by Docs team) | CDN fallback |
|---------|--------------------------------------|--------------|
| Core (mandatory) | `assets/vendor/highcharts.js` | `https://code.highcharts.com/11.4.8/highcharts.js` |
| Accessibility (mandatory) | `assets/vendor/highcharts-accessibility.js` | `.../11.4.8/modules/accessibility.js` |
| Exporting (mandatory) | `assets/vendor/highcharts-exporting.js` | `.../11.4.8/modules/exporting.js` |
| Treemap | `assets/vendor/highcharts-treemap.js` | `.../11.4.8/modules/treemap.js` |
| Sankey | `assets/vendor/highcharts-sankey.js` | `.../11.4.8/modules/sankey.js` |
| Timeline | `assets/vendor/highcharts-timeline.js` | `.../11.4.8/modules/timeline.js` |
| Others (Sunburst, Heatmap, Funnel, etc) | add to `vendor-pins.yaml` before using | `.../11.4.8/modules/<module>.js` |
| Stock (candlestick, OHLC) | add to `vendor-pins.yaml` before using | `.../stock/11.4.8/highstock.js` |
| Maps | add to `vendor-pins.yaml` before using | `.../maps/11.4.8/highmaps.js` |
| Gantt | add to `vendor-pins.yaml` before using | `.../gantt/11.4.8/highcharts-gantt.js` |

> If a page needs a module that **is not yet** in `vendor-pins.yaml`, the correct path is:
> 1. Ask the Publisher to add the pin (commit on that skill or open an issue), with primary URL + fallbacks.
> 2. Only then use the module.
> Pointing directly to CDN in the final pages breaks the "works via `file://` without internet" invariant.

All CDNs (fallback) in the format: `https://code.highcharts.com/11.4.8/{path}`.

### 5. Save and Deliver

Save the generated HTML directly in the destination folder using `write_to_file`. Always generate the pure HTML file with all the data processed and injected into the `<script>` variables. Don't use Python snippets.

## Quality guidelines

- **Professional aesthetics**: cohesive colors (use Highcharts palettes or custom), clean typography, adequate spacing
- **Formatted data**: numbers with thousands separators, localized dates, units on axes
- **Clear legends**: descriptive series names, position that doesn't obstruct the data
- **Rich interactivity**: hover highlights, contextual tooltips, zoom when applicable
- **Dark mode**: when appropriate, offer dark version with `backgroundColor: '#1a1a2e'`
- **Multiple charts**: for dashboards, organize in a responsive CSS grid
- **Commented code**: comments in English explaining each section

## Error handling

Consult `references/ERRORS.md` for error scenarios and solutions.
