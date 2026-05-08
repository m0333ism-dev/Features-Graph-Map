# Style Scalpel Feature Graph Map

This repository hosts the interactive feature-profile graphs for the **Style Scalpel** stylometric detector project.

The graphs visualize normalized line profiles for **132 stylometric features**, separated into AI-generated and human-written samples.

## Open the graphs

Main page:

https://m0333ism-dev.github.io/Features-Graph-Map/

Direct graph pages:

- AI feature graph: https://m0333ism-dev.github.io/Features-Graph-Map/ai_features_lines.html
- Human feature graph: https://m0333ism-dev.github.io/Features-Graph-Map/human_features_lines.html

## Repository contents

- `index.html` — landing page for opening the graph files
- `ai_features_lines.html` — interactive normalized feature-line graph for AI-generated samples
- `human_features_lines.html` — interactive normalized feature-line graph for human-written samples
- `map_report.txt` — short technical summary of the generated graphs
- `.nojekyll` — prevents GitHub Pages from processing the files through Jekyll

## Data summary

The graphs are based on the PG 132-feature stylometric feature set.

Summary:

- Numeric features plotted: 132
- Normalization: min-max normalization to `[0, 1]`
- Human samples: 2,523
- AI samples: 2,523
- Constant/all-NaN feature handled: `dep_cop_ratio` was set to `0.0`

The normalization was applied per feature across all samples, so the graph is meant for visual comparison of feature-profile shape, not for reading raw feature values.

## Main Style Scalpel project

The main detector repository is available here:

https://github.com/m0333ism-dev/Style-Scalpel

## Purpose

This repository is for research visualization. It shows how the AI and human sample groups behave across the 132-feature stylometric space.

It is not a standalone detector and should not be used by itself to judge whether a specific text is AI-generated or human-written.

## Note

These graphs are exploratory visual materials connected to the Style Scalpel project. They are intended to support interpretation, comparison, and research presentation.

## License

The visual graph materials in this repository are licensed under the **Creative Commons Attribution 4.0 International License (CC BY 4.0)**.

You may share and adapt the graphs, provided appropriate credit is given to the Style Scalpel project.

Suggested attribution:

> Muhammad Ismail. *Style Scalpel Feature Graph Map*. GitHub, 2026. Licensed under CC BY 4.0.
