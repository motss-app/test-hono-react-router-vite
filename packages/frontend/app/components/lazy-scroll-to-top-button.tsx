import { lazyWithPreload } from '../utils/lazy-with-preload.ts';

/**
 * Lazy-loaded scroll-to-top button with optional preload.
 *
 * The dynamic import() tells Vite to split this into a separate chunk.
 * The chunk (JS + CSS) is only fetched when `LazyScrollToTopButton` is
 * first rendered — not during the initial page load.
 *
 * Call `LazyScrollToTopButton.preload()` to start downloading early
 * (e.g., on hover).
 */
export const LazyScrollToTopButton = lazyWithPreload(() =>
  import('./scroll-to-top-button.tsx' /* chunkName: 'scroll-to-top-button' */).then(mod => ({
    default: mod.ScrollToTopButton,
  }))
);
