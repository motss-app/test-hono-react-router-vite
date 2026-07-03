import { style } from '@vanilla-extract/css';

export const button = style({});

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
