import { Suspense } from 'react';

import { lazyWithPreload } from '../utils/lazy-with-preload.ts';

const LocaleSwitcherInner = lazyWithPreload(() =>
  import('./locale-switcher-inner.tsx').then(m => ({
    default: m.LocaleSwitcherInner,
  }))
);

export function LocaleSwitcher() {
  return (
    <Suspense fallback={<span className="locale-switcher-fallback">...</span>}>
      <LocaleSwitcherInner />
    </Suspense>
  );
}
