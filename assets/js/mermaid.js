function css(name) {
  return "rgb(" + getComputedStyle(document.documentElement).getPropertyValue(name) + ")";
}

function getFontFamily() {
  return getComputedStyle(document.documentElement).getPropertyValue('--default-font-family').trim() || 
         getComputedStyle(document.documentElement).getPropertyValue('--font-sans').trim() ||
         'ui-sans-serif, system-ui, sans-serif';
}

function initMermaidLight() {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      background: css("--color-neutral"),
      primaryColor: css("--color-primary-200"),
      secondaryColor: css("--color-secondary-200"),
      tertiaryColor: css("--color-neutral-100"),
      primaryBorderColor: css("--color-primary-400"),
      secondaryBorderColor: css("--color-secondary-400"),
      tertiaryBorderColor: css("--color-neutral-400"),
      lineColor: css("--color-neutral-600"),
      fontFamily: getFontFamily(),
      fontSize: "16px",
    },
  });
}

function initMermaidDark() {
  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    themeVariables: {
      fontFamily: getFontFamily(),
      fontSize: "16px",
    },
  });
}

// Initialize mermaid when this script loads (deferred, runs after DOM is ready)
if (typeof window.updateMermaidTheme === 'function') {
  window.updateMermaidTheme();
}