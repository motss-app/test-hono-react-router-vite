import type { CSSProperties } from '@vanilla-extract/css';

export const sm = (styles: CSSProperties) => ({
  '@media': {
    '(min-width: 640px)': styles,
  },
});

export const md = (styles: CSSProperties) => ({
  '@media': {
    '(min-width: 768px)': styles,
  },
});

export const lg = (styles: CSSProperties) => ({
  '@media': {
    '(min-width: 1024px)': styles,
  },
});

export const xl = (styles: CSSProperties) => ({
  '@media': {
    '(min-width: 1280px)': styles,
  },
});

export const xxl = (styles: CSSProperties) => ({
  '@media': {
    '(min-width: 1536px)': styles,
  },
});

export const reducedMotion = (styles: CSSProperties) => ({
  '@media': {
    '(prefers-reduced-motion: reduce)': styles,
  },
});
