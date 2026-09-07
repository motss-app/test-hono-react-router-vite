import { type JSX, Suspense } from 'react';

import { labels } from '../../locales.ts';
import { getLocale } from '../paraglide/runtime.js';
import { lazyWithPreload } from '../utils/lazy-with-preload.ts';

const LocaleSwitcherInner = lazyWithPreload(() =>
  import('./locale-switcher-inner.tsx').then(m => ({
    default: m.LocaleSwitcherInner,
  }))
);

function LocaleSwitcherSkeleton(): JSX.Element {
  const currentLocale = getLocale();
  const label = labels[currentLocale] ?? currentLocale;

  return (
    <button
      className="locale-switcher-trigger locale-switcher-skeleton"
      disabled
      type="button"
    >
      <span className="locale-switcher-skeleton-label">{label}</span>
      <span className="locale-switcher-skeleton-icon" />
    </button>
  );
}

export function LocaleSwitcher(): JSX.Element {
  return (
    <Suspense fallback={<LocaleSwitcherSkeleton />}>
      <LocaleSwitcherInner />
    </Suspense>
  );
}
