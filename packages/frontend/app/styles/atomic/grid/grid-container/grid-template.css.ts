import { style } from '@vanilla-extract/css';

export const gridCols1 = style({
  gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
});
export const gridCols2 = style({
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
});
export const gridCols3 = style({
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
});
export const gridCols4 = style({
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
});
export const gridCols5 = style({
  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
});
export const gridCols6 = style({
  gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
});
export const gridColsNone = style({
  gridTemplateColumns: 'none',
});
