import { keyframes, style } from '@vanilla-extract/css';

const pulse = keyframes({
  '0%': {
    opacity: 1,
  },
  '50%': {
    opacity: 0.5,
  },
  '100%': {
    opacity: 1,
  },
});

export const skeletonStyles = {
  base: style({
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: pulse,
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    backgroundColor: 'rgba(212, 212, 212, 0.25)',
    borderRadius: '0.5rem',
    display: 'inline-block',
    lineHeight: '1.5rem',
    verticalAlign: 'middle',
  }),
};
