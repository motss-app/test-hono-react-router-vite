import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';

const transformValues = [
  'none',
  'translate3d(0, 0, 0)',
  'translate3d(0, -0.125rem, 0)',
  'translate3d(0, -0.25rem, 0)',
  'translate3d(0, -0.5rem, 0)',
  'translate3d(0, 0.125rem, 0)',
  'translate3d(0, 0.25rem, 0)',
  'translate3d(0, 0.5rem, 0)',
  'translate3d(0, 1rem, 0)',
  'translate3d(0.35rem, 0, 0)',
  'translate3d(0.5rem, 0, 0)',
] as const;

const properties = defineProperties({
  properties: {
    opacity: ['0', '0.25', '0.5', '0.75', '1'] as const,
    pointerEvents: ['auto', 'none'] as const,
    transform: transformValues,
  },
});

export const sprinkles = createSprinkles(properties);

export type Sprinkles = Parameters<typeof sprinkles>[0];
