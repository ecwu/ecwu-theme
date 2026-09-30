# ecwu-theme
A theme made using Tailwind CSS

# Build

```
npx @tailwindcss/cli -i themes/ecwu-theme/assets/css/styles.scss -o themes/ecwu-theme/assets/css/style.css --watch
```

This command will continuously build the css file by monitoring changes for scss and html template files

## DGX Spark benchmark charts

The theme bundles the benchmark renderer, styles, and Chart.js dependency.
Set `charts: true` in page front matter to load them. Chart markup and JSON/CSV
results belong to the page bundle; see [the chart contract](docs/dgx-spark-charts.md).

# License

MIT
