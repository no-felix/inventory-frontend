import { useEffect, useState } from 'react';

/**
 * Chart colors that work in both light and dark modes.
 * These are carefully chosen to be visible and distinguishable.
 */
export const CHART_COLORS = {
  light: [
    '#e76e50', // Coral/Orange
    '#2a9d90', // Teal
    '#274754', // Dark Blue-Gray
    '#e8c468', // Gold
    '#f4a462', // Peach
  ],
  dark: [
    '#6366f1', // Indigo
    '#22c55e', // Green
    '#f8fafc', // White
    '#eab308', // Yellow
    '#f97316', // Orange
  ],
};

/**
 * Primary chart color for single-series charts
 */
export const PRIMARY_CHART_COLOR = {
  light: '#2563eb', // Blue
  dark: '#60a5fa', // Light Blue
};

/**
 * Hook to get theme-aware chart colors
 */
export function useChartColors() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  return {
    colors: isDark ? CHART_COLORS.dark : CHART_COLORS.light,
    primary: isDark ? PRIMARY_CHART_COLOR.dark : PRIMARY_CHART_COLOR.light,
    isDark,
  };
}

/**
 * Get a color from the chart palette by index
 */
export function getChartColor(index: number, isDark: boolean): string {
  const colors = isDark ? CHART_COLORS.dark : CHART_COLORS.light;
  return colors[index % colors.length];
}
