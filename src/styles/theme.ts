export const breakpoints = {
  mobile: 640,
  compact: 780,
  tablet: 1024,
  desktop: 1250,
  wide: 1600,
  shortViewport: 800,
} as const;
export const chartTheme = {
  spend: "var(--chart-1)",
  baseline: "var(--chart-baseline)",
  forecast: "var(--chart-forecast)",
  grid: "var(--chart-grid)",
  axis: "var(--chart-axis-text)",
  secondary: "var(--chart-2)",
  surface: "var(--color-bg-surface)",
} as const;
export const homeChartLayout = {
  height: 220,
  left: 48,
  right: 24,
  top: 16,
  bottom: 30,
} as const;
export const groupedChartLayout = {
  height: 250,
  left: 56,
  right: 24,
  top: 16,
  bottom: 30,
} as const;
export const networkChartLayout = {
  height: 310,
  labelWidth: 172,
  labelOffset: 24,
  barWidth: 10,
} as const;
