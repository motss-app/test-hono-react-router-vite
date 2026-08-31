import { useInsertionEffect } from 'react';

type Theme = 'light' | 'dark';

function readThemeCookie(): Theme | null {
  try {
    const match = document.cookie.match(/(?:^|;\s*)theme=(light|dark)/);
    return match ? (match[1] as Theme) : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): Theme {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Syncs the `data-theme` attribute on `<html>` with the cookie value.
 * Runs in `useInsertionEffect` so it commits before any layout effects,
 * eliminating the flash caused by SSG pages being prerendered without
 * cookie access.
 */
export function ThemeSync(): null {
  useInsertionEffect(() => {
    const theme = readThemeCookie() ?? getSystemTheme();
    document.documentElement.setAttribute('data-theme', theme);
  });

  return null;
}
