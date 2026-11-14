# Human and AI Feature Graphs

Interactive views of the fixed 5,046-document, 132-feature original research corpus, connected to the rebuilt relational-graph stylometry explorer developed alongside the AIJ manuscript.

## Open the graphs

- [Overview](https://m0333ism-dev.github.io/Features-Graph-Map/)
- [AI-generated profiles](https://m0333ism-dev.github.io/Features-Graph-Map/ai_features_lines.html)
- [Human-written profiles](https://m0333ism-dev.github.io/Features-Graph-Map/human_features_lines.html)
- [Rebuilt interaction explorer](https://m0333ism-dev.github.io/relational-graph-stylometry/)
- [Separate RAID explorer](https://m0333ism-dev.github.io/relational-graph-stylometry/raid/)

## November 2026 viewer update

The existing AI/Human URLs now open a viewer with:

- Six-genre filtering and side-by-side group comparison on common axes.
- All 132 features, named subsets, or a custom feature selection.
- Feature medians with 25th–75th percentile bands.
- Optional individual profiles drawing every eligible document, without subsampling.
- An explicit option to collapse repeated full-feature vectors within each class and genre.
- Measurement notes, corpus counts, and a warning for the small papers cohort.

The default summary shows marginal feature distributions, not a joint configuration or a document. Individual profiles connect heterogeneous features in their supplied order. They are not time series or causal graphs.

The earlier files are preserved unchanged at [legacy/ai_features_lines.html](legacy/ai_features_lines.html) and [legacy/human_features_lines.html](legacy/human_features_lines.html).

## Data and reproducibility

The viewer reads the already-public numeric payload from research commit `9c0f9368368bcce058d9c4baf80a614d3709cdbb`:

`https://raw.githubusercontent.com/m0333ism-dev/relational-graph-stylometry/9c0f9368368bcce058d9c4baf80a614d3709cdbb/site/data/original-tuples.json`

- Payload SHA-256: `3b2badc59fb8bb20e2e8f8e0167de85869226af61a793f7aab99beb28f4ce36d`
- Source CSV SHA-256: `5068c83649471c0ac2daff34841c5ab6622eb13c49547875b750a95c745a2ff4`
- Rows: 5,046; Human: 2,523; AI: 2,523.
- Five genres: 500 documents per class; papers: 23 per class.
- Scaling: supplied full-corpus feature minimum and maximum, shared across classes and genres. Genre and duplicate filters do not refit it.
- Constant features map to zero; `dep_cop_ratio` is constant in this corpus.
- Quantiles: linear interpolation at `(n - 1) * q`.

The browser verifies the payload checksum before drawing. The fixed payload is approximately 9.7 MB; it is fetched separately rather than embedding all numeric data and the plotting library in every page. The plotting library is the existing public Plotly 3.7.0 distribution served by the research portal. Both network resources are needed for interactive plots; written explanations and links remain readable without JavaScript.

No corpus, fitted estimator, formula, or research result was regenerated for this viewer update. The original-corpus plots are exploratory and are not a deployable detector. The RAID study has separate discovery/development/frozen-evaluation roles and does not independently validate the original-corpus formulas. The manuscript and private research files are not included.

## Files

- `index.html`: overview and links to the research explorers.
- `ai_features_lines.html`, `human_features_lines.html`: class-specific entry pages.
- `graphs.js`, `graphs.css`: shared rendering and presentation.
- `legacy/`: preserved original graph pages.
- `.nojekyll`: static GitHub Pages hosting.

## Attribution

Muhammad Ismail. Human and AI Feature Graphs. GitHub, 2026. Visual graph materials remain licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The Plotly distribution retains its original licence notice.
