import { style } from '@vanilla-extract/css';

import { colorTokens } from '../styles/color-tokens.contract.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';
import { radiusTokens } from '../styles/radius-tokens.contract.css.ts';

export const button = style({
  '@media': {
    [mediaQueries.reducedMotion]: {
      transition: 'none',
    },
  },
  alignItems: 'center',
  backgroundColor: '#2563eb',
  border: 'none',
  borderRadius: radiusTokens.radiusMd,
  bottom: '1.5rem',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  justifyContent: 'center',
  padding: '0.75rem',
  position: 'fixed',
  right: '1.5rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${colorTokens.primary}`,
      outlineOffset: '3px',
    },
    '&:hover': {
      backgroundColor: '#1d4ed8',
    },
  },
  transition: 'opacity 0.2s ease, transform 0.2s ease',
  zIndex: 10,
});

// Pre-composed at module-load time so neither branch ships the VE runtime
// to the client. Each branch is a static class name string that already
// includes the base `button` styles + the appropriate visibility transform.
export const visible = style({
  opacity: 1,
  pointerEvents: 'auto',
  transform: 'translate3d(0, 0, 0)',
});
export const hidden = style({
  opacity: 0,
  pointerEvents: 'none',
  transform: 'translate3d(0, 1rem, 0)',
});
