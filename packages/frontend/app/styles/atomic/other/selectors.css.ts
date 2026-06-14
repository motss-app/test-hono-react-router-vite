import type { CSSProperties } from '@vanilla-extract/css';

export const dark = (styles: CSSProperties) => ({
  selectors: {
    ':root[data-theme="dark"] &': styles,
  },
});

export const darkHover = (styles: CSSProperties) => ({
  selectors: {
    ':root[data-theme="dark"] &:hover': styles,
  },
});

export const hover = (styles: CSSProperties) => ({
  selectors: {
    '&:hover': styles,
  },
});
