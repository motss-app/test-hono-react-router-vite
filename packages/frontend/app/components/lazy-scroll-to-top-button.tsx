import { lazy } from 'react';

/**
 * Lazy-loaded scroll-to-top button.
 *
 * The dynamic import() tells Vite to split this into a separate chunk.
 * The chunk (JS + CSS) is only fetched when `LazyScrollToTopButton` is
 * first rendered — not during the initial page load.
 */
export const LazyScrollToTopButton = lazy(() =>
  import('./scroll-to-top-button.tsx' /* chunkName: 'scroll-to-top-button' */).then(mod => ({
    default: mod.ScrollToTopButton,
  }))
);
