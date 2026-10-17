import type { StyleRule } from '@vanilla-extract/css';

export function decorativeBackground(image: string) {
  return {
    isolation: 'isolate',
    position: 'relative',
    selectors: {
      ':root[data-theme="dark"] &::before': {
        opacity: 0.12,
      },
      '&::before': {
        backgroundImage: `url("${image}")`,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '100% 100%',
        content: '""',
        inset: 0,
        opacity: 0.18,
        pointerEvents: 'none',
        position: 'absolute',
        zIndex: -1,
      },
    },
  } satisfies StyleRule;
}
