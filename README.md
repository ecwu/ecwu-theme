# ecwu-theme
A theme made using Tailwind CSS

# Build

```
npx @tailwindcss/cli -i themes/ecwu-theme/assets/css/styles.scss -o themes/ecwu-theme/assets/css/style.css --watch
```

This command will continuously build the css file by monitoring changes for scss and html template files

## Chart.js

The theme bundles the shared Chart.js dependency. Set `charts: true` in page
front matter to load it. Post-specific rendering code, styles, markup, and data
belong to the consuming site; see [Chart.js integration](docs/chartjs.md).

# License

MIT
