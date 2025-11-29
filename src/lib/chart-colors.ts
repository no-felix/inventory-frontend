import { useEffect, useState } from 'react';

/**
 * Modern, clean chart colors inspired by shadcn/ui design system.
 * These colors are carefully balanced for both light and dark modes,
 * ensuring accessibility and visual harmony.
 */
export const CHART_COLORS = {
  light: [
    '#2563eb', // Blue - Primary, trustworthy
    '#16a34a', // Green - Success, growth  
    '#9333ea', // Purple - Premium, creative
    '#ea580c', // Orange - Energy, attention
    '#0891b2', // Cyan - Fresh, modern
  ],
  dark: [
    '#3b82f6', // Blue - Softer for dark mode
    '#22c55e', // Green - Vibrant
    '#a855f7', // Purple - Bright
    '#f97316', // Orange - Warm
    '#06b6d4', // Cyan - Cool
  ],
};

/**
 * Primary chart color for single-series charts (Area, Line, single Bar)
 */
export const PRIMARY_CHART_COLOR = {
  light: '#2563eb', // Blue-600
  dark: '#3b82f6',  // Blue-500
};

/**
 * Semantic colors for status indicators
 */
export const STATUS_COLORS = {
  light: {
    success: '#16a34a',    // Green-600
    warning: '#d97706',    // Amber-600
    danger: '#dc2626',     // Red-600
    info: '#2563eb',       // Blue-600
    muted: '#6b7280',      // Gray-500
  },
  dark: {
    success: '#22c55e',    // Green-500
    warning: '#f59e0b',    // Amber-500
    danger: '#ef4444',     // Red-500
    info: '#3b82f6',       // Blue-500
    muted: '#9ca3af',      // Gray-400
  },
};

/**
 * Progress/severity colors for indicators like low stock
 */
export const SEVERITY_COLORS = {
  light: {
    critical: '#dc2626',   // Red-600
    warning: '#d97706',    // Amber-600
    good: '#16a34a',       // Green-600
  },
  dark: {
    critical: '#ef4444',   // Red-500
    warning: '#f59e0b',    // Amber-500
    good: '#22c55e',       // Green-500
  },
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
    status: isDark ? STATUS_COLORS.dark : STATUS_COLORS.light,
    severity: isDark ? SEVERITY_COLORS.dark : SEVERITY_COLORS.light,
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
