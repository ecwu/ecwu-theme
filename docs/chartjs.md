# Chart.js integration

Set `charts: true` in page front matter to load the theme's bundled Chart.js
library. The dependency and its license live in `static/vendor/chartjs/`.
The theme loads it through `head/charts.html` and `head/chartjs.html`.

Keep post-specific styles, rendering scripts, HTML, and data in the consuming
site's assets or article page bundles. To add a renderer, override
`layouts/partials/head/charts.html` in the site and call
`{{ partial "head/chartjs.html" . }}` before adding its scripts. Use `defer`
for renderer scripts so they execute after the deferred Chart.js dependency.
Gate post-specific assets with their own page parameters so other posts using
Chart.js do not load an unrelated renderer.
