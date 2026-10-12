import { globalStyle, keyframes, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';
import { mediaQueries } from '../styles/media-queries.ts';

const reveal = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(10px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
});

export const s = {
  artwork: style({
    '@media': {
      [mediaQueries.maxWidth599]: {
        opacity: 0.36,
      },
    },
    backgroundImage: 'url("/assets/ssr-expressive.svg")',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
    inset: 0,
    opacity: 0.8,
    pointerEvents: 'none',
    position: 'absolute',
    zIndex: -1,
  }),
  body: style({
    color: t.color.onSurface,
    fontSize: t.type.label,
    lineHeight: 1.65,
    margin: 0,
    overflowWrap: 'anywhere',
  }),
  content: style({
    display: 'grid',
    gap: '2rem',
    marginInline: 'auto',
    maxWidth: '1120px',
    padding: `1.5rem clamp(1rem, 3.5vw, 3rem) ${t.space.pageFooterGap}`,
    position: 'relative',
  }),
  context: style({
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
  }),
  contextData: style({
    '@media': {
      [mediaQueries.minWidth768]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    borderTop: `1px solid ${t.color.outline}`,
    display: 'grid',
    gap: '1.25rem 2rem',
    margin: '0.25rem 0 0',
    paddingBlockStart: '1rem',
  }),
  dataLabel: style({
    color: t.color.onSurface,
    fontSize: t.type.label,
    fontWeight: 650,
    lineHeight: 1.5,
  }),
  dataList: style({
    '@media': {
      [mediaQueries.minWidth768]: {
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      },
    },
    display: 'grid',
    gap: '1.25rem 2rem',
    margin: 0,
    minWidth: 0,
  }),
  dataRow: style({
    display: 'grid',
    gap: '0.375rem',
    minWidth: 0,
  }),
  dataValue: style({
    color: t.color.onSurface,
    fontSize: t.type.label,
    lineHeight: 1.65,
    margin: 0,
    overflowWrap: 'anywhere',
  }),
  intro: style({
    '@media': {
      [mediaQueries.reducedMotion]: {
        animation: 'none',
      },
    },
    animation: `${reveal} ${t.motion.entrance} ${t.motion.easing} both`,
    display: 'grid',
    gap: '0.75rem',
    maxWidth: '42rem',
  }),
  json: style({
    backgroundColor: t.color.surfaceRaised,
    borderRadius: t.shape.medium,
    color: t.color.onSurface,
    fontSize: '0.8125rem',
    lineHeight: 1.6,
    margin: '0.5rem 0 0',
    minWidth: 0,
    overflowWrap: 'anywhere',
    padding: '1rem',
    whiteSpace: 'pre-wrap',
  }),
  jsonDisclosure: style({
    borderTop: `1px solid ${t.color.outline}`,
    marginBlockStart: '1.25rem',
    minWidth: 0,
    paddingBlockStart: '0.5rem',
  }),
  jsonSummary: style({
    alignItems: 'center',
    borderRadius: t.shape.small,
    color: t.color.primary,
    cursor: 'pointer',
    display: 'flex',
    fontSize: t.type.label,
    fontWeight: 650,
    gap: '0.625rem',
    minHeight: '44px',
    paddingInline: '0.375rem',
    selectors: {
      '&:focus-visible': {
        outline: `3px solid ${t.color.primary}`,
        outlineOffset: '2px',
      },
    },
  }),
  layout: style({
    '@media': {
      [mediaQueries.minWidth1000]: {
        gridTemplateColumns: '232px minmax(0, 1fr)',
      },
    },
    backgroundColor: t.color.surface,
    color: t.color.onSurface,
    display: 'grid',
    minHeight: '100svh',
  }),
  lead: style({
    color: t.color.onSurface,
    fontSize: t.type.body,
    fontWeight: 650,
    lineHeight: 1.5,
    margin: 0,
  }),
  machineValue: style({
    fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
  }),
  page: style({
    isolation: 'isolate',
    minWidth: 0,
    outline: 'none',
    overflow: 'clip',
    position: 'relative',
  }),
  requestButton: style({
    '@media': {
      [mediaQueries.reducedMotion]: {
        transition: 'none',
      },
    },
    alignItems: 'center',
    backgroundColor: t.color.primary,
    border: 0,
    borderRadius: t.shape.full,
    color: t.color.onPrimary,
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: t.type.label,
    fontWeight: 650,
    gap: '0.5rem',
    lineHeight: 1.5,
    minHeight: '44px',
    padding: '0.625rem 1.25rem',
    selectors: {
      '&:focus-visible': {
        outline: `3px solid ${t.color.primary}`,
        outlineOffset: '3px',
      },
      '&:hover:not([aria-disabled="true"])': {
        backgroundColor: t.color.primaryHover,
        transform: 'translateY(-1px)',
      },
      '&[aria-disabled="true"]': {
        cursor: 'wait',
        opacity: 0.7,
      },
    },
    transition: `background-color ${t.motion.duration} ${t.motion.easing}, transform ${t.motion.duration} ${t.motion.easing}`,
  }),
  response: style({
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
  }),
  responseActions: style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
    marginBlockStart: '1.25rem',
  }),
  responseHeading: style({
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem 1.5rem',
    justifyContent: 'space-between',
  }),
  responsePanel: style({
    backgroundColor: t.color.surfaceContainer,
    border: `1px solid ${t.color.outline}`,
    borderRadius: t.shape.large,
    minWidth: 0,
    padding: '1.25rem',
  }),
  sectionTitle: style({
    fontSize: t.type.headline,
    fontWeight: 700,
    letterSpacing: '-0.025em',
    lineHeight: 1.25,
    margin: 0,
    overflowWrap: 'anywhere',
  }),
  status: style({
    alignItems: 'center',
    backgroundColor: t.color.tertiaryContainer,
    borderRadius: t.shape.full,
    color: t.color.onTertiaryContainer,
    display: 'inline-flex',
    fontSize: t.type.label,
    fontWeight: 650,
    gap: '0.5rem',
    lineHeight: 1.5,
    padding: '0.375rem 0.75rem',
  }),
  step: style({
    paddingInlineStart: '0.375rem',
  }),
  steps: style({
    display: 'grid',
    gap: '1.25rem',
    margin: '0.25rem 0 0',
    paddingInlineStart: '1.5rem',
  }),
  stepTitle: style({
    fontSize: t.type.body,
    fontWeight: 650,
    lineHeight: 1.5,
    margin: '0 0 0.375rem',
  }),
  title: style({
    fontSize: 'clamp(2rem, 3.2vw, 3rem)',
    fontWeight: 750,
    letterSpacing: '-0.045em',
    lineHeight: 1.15,
    margin: 0,
    overflowWrap: 'anywhere',
  }),
  titleAccent: style({
    color: t.color.primary,
  }),
  verify: style({
    display: 'grid',
    gap: '0.75rem',
    minWidth: 0,
  }),
  workspace: style({
    minWidth: 0,
  }),
};

globalStyle(`:root[data-theme="dark"] ${s.artwork}`, {
  '@media': {
    [mediaQueries.maxWidth599]: {
      opacity: 0.28,
    },
  },
  opacity: 0.62,
});
globalStyle(`${s.step}::marker`, {
  color: t.color.primary,
  fontWeight: 650,
});
globalStyle(`${s.jsonSummary} > svg:last-child`, {
  '@media': {
    [mediaQueries.reducedMotion]: {
      transition: 'none',
    },
  },
  marginInlineStart: 'auto',
  transition: `transform ${t.motion.duration} ${t.motion.easing}`,
});
globalStyle(`${s.jsonDisclosure}[open] ${s.jsonSummary} > svg:last-child`, {
  transform: 'rotate(180deg)',
});
