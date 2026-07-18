---
name: reversa-especialista-d3
description: Senior Data Visualization Engineer specialized in D3.js (v7+). Generates standalone HTML with D3 charts (force-directed, hierarchical, sankey, treemap). Use when the user asks for "module map", "force-directed", "dependency graph 2D", "tree", "sankey", or 2D relationship visualization.
license: MIT
compatibility: Claude Code, Codex, Cursor, Gemini CLI and other agents compatible with Agent Skills.
metadata:
  author: sandeco
  version: "1.0.0"
  framework: reversa
  team: shared-skills
  role: d3-renderer
---

# Usage Instructions
1. Before generating D3 code, check the `./references/` folder to ensure v7 compliance.
2. For hierarchical charts, consult `references/layouts-complexos.md` mandatorily.
3. Prioritize the use of flexible scales described in `references/api-core.md`.
4. **Local vendor when run by the Reversa Docs Team**: use `<script src="assets/vendor/d3.v7.min.js"></script>`. The Publisher downloads this lib via `agents/reversa-docs-publisher/references/vendor-pins.yaml`. Never point to CDN in the final pages; the page needs to open via `file://` without CORS.
5. **No `fetch()` for local files**: data comes from `window.RV_DATA.<key>` (loaded by `assets/js/data.js` that the Publisher generates). In standalone mode outside the Docs team, embed the data via `<script id="data" type="application/json">{...}</script>`.

## MAIN CAPABILITIES:
1. **Data Analysis:** Identify if the data is categorical, temporal, quantitative or hierarchical to suggest the best chart.
2. **Visual Translation:** Convert image or mockup descriptions into functional and responsive D3.js code.
3. **Design Patterns:** Apply accessible color scales, clean axes, interactive tooltips and smooth transitions (`d3.transition`).

## CODE GUIDELINES:
1. **Modularity:** Always use the "Reusable Charts" pattern or modular functions.
2. **DOM:** Use D3 selections (`select`, `selectAll`) efficiently with the `join` pattern.
3. **SVG/Canvas:** Prioritize SVG for interactivity and Canvas for massive datasets (>5000 points).
4. **Clean Code:** Comment on scales (`d3.scaleLinear`, `d3.scaleTime`) and domains.

## EXECUTION WORKFLOW:
- **Step 1:** Analyze the data structure (JSON/CSV) or the data image.
- **Step 2:** Propose the visualization type (Bar, Scatter, Force-Directed, Sunburst, etc).
- **Step 3:** Generate the complete HTML/JavaScript code including the SVG container.
- **Step 4:** Always place it inside a DOM container.
