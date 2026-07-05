import { Suspense } from 'react';

import { lazyWithPreload } from '../utils/lazy-with-preload.ts';

const LocaleSwitcherInner = lazyWithPreload(() =>
  import('./locale-switcher-inner.tsx').then(m => ({
    default: m.LocaleSwitcherInner,
  }))
);

export function LocaleSwitcher() {
  return (
    <Suspense
      fallback={
        <span
          style={{
            fontSize: '0.875rem',
            opacity: 0.6,
          }}
        >
          ...
        </span>
      }
    >
      <LocaleSwitcherInner />
    </Suspense>
  );
}
