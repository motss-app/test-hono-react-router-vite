import { style } from '@vanilla-extract/css';

import { opacity0, opacity100 } from '../styles/atomic/layout/display-visibility/opacity.css.ts';
import {
  pointerEventsAuto,
  pointerEventsNone,
} from '../styles/atomic/layout/display-visibility/pointer-events.css.ts';
import { transformCenter, transformDown100 } from '../styles/atomic/other/transform.css.ts';
import { colorTokens } from '../styles/color-tokens.contract.css.ts';

export const button = style([
  // Inlined `s.fixed` and `s.z10` to avoid importing the shared atomic barrel,
  // and `colorTokens` now imports directly from the contract file to avoid
  // pulling `global-themes.css.ts` into the lazy chunk's `__vite__mapDeps`.
  {
    position: 'fixed',
    zIndex: '10',
  },
  {
    alignItems: 'center',
    backgroundColor: colorTokens.primary,
    border: 'none',
    borderRadius: '9999px',
    bottom: '1.5rem',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    color: colorTokens.white,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    padding: '0.75rem',
    right: '1.5rem',
    selectors: {
      ':root[data-theme="dark"] &': {
        backgroundColor: colorTokens.info,
      },
      ':root[data-theme="dark"] &:hover': {
        backgroundColor: colorTokens.infoHover,
      },
      '&:hover': {
        backgroundColor: colorTokens.primaryHover,
      },
    },
    transition: 'opacity 0.2s ease, transform 0.2s ease',
  },
]);

// Pre-composed at module-load time so neither branch ships the VE runtime
// to the client. Each branch is a static class name string that already
// includes the base `button` styles + the appropriate visibility transform.
export const visible = style([button, opacity100, pointerEventsAuto, transformCenter]);
export const hidden = style([button, opacity0, pointerEventsNone, transformDown100]);
