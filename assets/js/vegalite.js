(function () {
  "use strict";

  if (window.__ecwuVegaLiteInitialized) {
    return;
  }
  window.__ecwuVegaLiteInitialized = true;

  const chartStates = new WeakMap();

  function deepMerge(base, override) {
    const output = { ...base };

    Object.entries(override || {}).forEach(function ([key, value]) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        output[key] &&
        typeof output[key] === "object" &&
        !Array.isArray(output[key])
      ) {
        output[key] = deepMerge(output[key], value);
      } else {
        output[key] = value;
      }
    });

    return output;
  }

  function getThemeConfig() {
    const isDark = document.documentElement.classList.contains("dark");
    const article = document.querySelector("article");
    const fontFamily = article
      ? getComputedStyle(article).fontFamily
      : getComputedStyle(document.body).fontFamily;
    const colors = isDark
      ? {
          foreground: "#e4e4e7",
          muted: "#a1a1aa",
          grid: "#3f3f46",
          domain: "#71717a",
        }
      : {
          foreground: "#27272a",
          muted: "#52525b",
          grid: "#e4e4e7",
          domain: "#a1a1aa",
        };

    return {
      isDark,
      config: {
        background: "transparent",
        font: fontFamily,
        axis: {
          domainColor: colors.domain,
          gridColor: colors.grid,
          gridOpacity: isDark ? 0.5 : 0.7,
          labelColor: colors.muted,
          labelFont: fontFamily,
          tickColor: colors.domain,
          titleColor: colors.foreground,
          titleFont: fontFamily,
        },
        header: {
          labelColor: colors.muted,
          labelFont: fontFamily,
          titleColor: colors.foreground,
          titleFont: fontFamily,
        },
        legend: {
          labelColor: colors.muted,
          labelFont: fontFamily,
          titleColor: colors.foreground,
          titleFont: fontFamily,
        },
        text: {
          color: colors.foreground,
          font: fontFamily,
        },
        title: {
          color: colors.foreground,
          font: fontFamily,
          subtitleColor: colors.muted,
          subtitleFont: fontFamily,
        },
        view: {
          continuousHeight: 300,
          continuousWidth: 400,
          stroke: null,
        },
      },
    };
  }

  function showError(chart, error) {
    chart.classList.add("vegalite-chart-error");
    chart.textContent = "The chart could not be rendered.";
    console.error("Unable to render Vega-Lite chart:", error);
  }

  async function renderChart(chart) {
    const state = chartStates.get(chart);
    const generation = state.generation + 1;
    state.generation = generation;

    if (state.result) {
      state.result.finalize();
      state.result = null;
    }

    chart.classList.remove("vegalite-chart-error");
    delete chart.dataset.rendered;
    chart.replaceChildren();

    const theme = getThemeConfig();
    const spec = JSON.parse(JSON.stringify(state.spec));
    const options = { ...state.options };

    if (!options.theme) {
      spec.config = deepMerge(theme.config, spec.config || {});
      options.tooltip = { theme: theme.isDark ? "dark" : "light" };
    }

    try {
      const result = await window.vegaEmbed(chart, spec, options);

      if (state.generation !== generation) {
        result.finalize();
        return;
      }

      state.result = result;
      chart.dataset.rendered = "true";
    } catch (error) {
      if (state.generation === generation) {
        showError(chart, error);
      }
    }
  }

  function initializeChart(chart) {
    try {
      const specElement = document.getElementById(chart.dataset.specId);
      chartStates.set(chart, {
        generation: 0,
        options: JSON.parse(chart.dataset.options),
        result: null,
        spec: JSON.parse(specElement.textContent),
      });
      renderChart(chart);
    } catch (error) {
      showError(chart, error);
    }
  }

  function initializeCharts() {
    document.querySelectorAll("[data-vegalite]").forEach(initializeChart);

    let themeUpdateQueued = false;
    const themeObserver = new MutationObserver(function () {
      if (themeUpdateQueued) {
        return;
      }

      themeUpdateQueued = true;
      queueMicrotask(function () {
        themeUpdateQueued = false;
        document.querySelectorAll("[data-vegalite]").forEach(renderChart);
      });
    });

    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCharts, {
      once: true,
    });
  } else {
    initializeCharts();
  }
})();
