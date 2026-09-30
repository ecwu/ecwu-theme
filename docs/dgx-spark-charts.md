# DGX Spark benchmark charts

Enable `charts: true` in page front matter. The theme's `head/charts.html`
partial loads `assets/css/charts.css`, the bundled Chart.js library under
`static/vendor/chartjs/`, and `assets/js/charts.js` in order.

Place chart HTML and benchmark JSON/CSV in the article's page bundle, and
include HTML with the theme's `include-html` shortcode. Chart containers use
the `spark-benchmark` class and `data-spark-chart="A"` for context-length
benchmarks or `data-spark-chart="B"` for prefix-cache benchmarks. The first
container supplies `data-chart-source`, a JSON URL relative to the page.
All chart containers on that page use this data source.

This renderer expects the DGX experiment schema and the predefined Qwen model
identities in `charts.js`; it is specific to these benchmark charts. Keep
experiment results and data preparation scripts in the consuming site's
repository. The theme owns rendering code and its vendored dependency.
