import { style } from '@vanilla-extract/css';

export const logo = style({
  flexShrink: 0,
  height: '1.5rem',
  objectFit: 'contain',
  width: '1.75rem',
});
export const small = style({
  height: '20px',
  width: '20px',
});
export const light = style({
  selectors: {
    ':root[data-theme="dark"] &': {
      display: 'none',
    },
  },
});
export const dark = style({
  display: 'none',
  selectors: {
    ':root[data-theme="dark"] &': {
      display: 'block',
    },
  },
});
