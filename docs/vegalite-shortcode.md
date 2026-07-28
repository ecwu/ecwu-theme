# Vega-Lite shortcode

Use the `vegalite` shortcode to render a Vega-Lite JSON specification in a
content page:

```go-html-template
{{</* vegalite
  caption="A small example"
  label="Bar chart showing values for categories A through C"
*/>}}
{
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "width": "container",
  "data": {
    "values": [
      {"category": "A", "value": 28},
      {"category": "B", "value": 55},
      {"category": "C", "value": 43}
    ]
  },
  "mark": {"type": "bar", "tooltip": true},
  "encoding": {
    "x": {"field": "category", "type": "nominal", "axis": {"labelAngle": 0}},
    "y": {"field": "value", "type": "quantitative"}
  }
}
{{</* /vegalite */>}}
```

The JSON is validated when Hugo builds the site. Set `"width": "container"` in
the specification when the chart should follow the width of its content
column.

## Parameters

- `caption`: optional Markdown caption below the chart.
- `label`: optional accessible label for the chart container.
- `renderer`: `svg` (default) or `canvas`.
- `actions`: `true` to show Vega-Embed's export and source menu; the default is
  `false`.
- `theme`: optional
  [Vega-Embed theme](https://github.com/vega/vega-themes#vega-themes). Without
  this parameter, the chart automatically follows the site's light or dark
  theme and redraws when the visitor changes it.
- `layout`: the theme's layout width, such as `body`, `page`, or `screen-right`;
  the default is `body`, matching the main article column.
- `class`: additional CSS classes for the figure.

Data can be embedded under `data.values`, as above, or loaded from a URL that
the browser can access:

```json
"data": {"url": "/data/measurements.csv"}
```

Vega, Vega-Lite, and Vega-Embed are loaded from jsDelivr only on pages that use
the shortcode. Their versions are pinned in
`layouts/partials/head/vegalite.html`.
