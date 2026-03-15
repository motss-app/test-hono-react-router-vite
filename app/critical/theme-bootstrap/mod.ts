/**
 * Theme bootstrap script.
 *
 * This script runs before React hydration to:
 * 1. Read saved theme preference from localStorage
 * 2. Set data-theme attribute on <html> based on:
 *    - Saved preference (if exists)
 *    - System preference (prefers-color-scheme)
 * 3. Listen for system color scheme changes
 * 4. Listen for data-theme attribute changes (e.g., from JS)
 * 5. Persist theme changes to localStorage
 */

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'theme';

function getSystemTheme(): Theme {
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getSavedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage may be unavailable
  }
  return null;
}

function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage may be unavailable
  }
}

export function init(): void {
  // Initialize theme immediately (before DOMContentLoaded)
  const savedTheme: Theme | null = getSavedTheme();
  const initialTheme: Theme = savedTheme ?? getSystemTheme();

  applyTheme(initialTheme);

  // Listen for system color scheme changes
  globalThis
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event: MediaQueryListEvent): void => {
      const systemTheme: Theme = event.matches ? 'dark' : 'light';
      // Only update if no saved preference (follow system)
      if (!getSavedTheme()) {
        applyTheme(systemTheme);
      }
    });
}
