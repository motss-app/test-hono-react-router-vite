import { globalStyle, style } from '@vanilla-extract/css';

import { expressiveTokens as t } from '../styles/expressive-tokens.css.ts';

export const shell = style({
  '@media': {
    '(min-width: 1000px)': {
      gridTemplateColumns: '232px minmax(0, 1fr)',
    },
  },
  backgroundColor: t.color.surface,
  color: t.color.onSurface,
  display: 'grid',
  minHeight: '100svh',
});

globalStyle(`${shell} svg`, {
  flexShrink: 0,
  height: '1em',
  width: '1em',
});
export const skipLink = style({
  backgroundColor: t.color.primary,
  borderRadius: t.shape.small,
  color: t.color.onPrimary,
  insetBlockStart: t.space.small,
  insetInlineStart: t.space.small,
  padding: t.space.medium,
  position: 'fixed',
  selectors: {
    '&:focus': {
      transform: 'translateY(0)',
    },
  },
  transform: 'translateY(-150%)',
  zIndex: 100,
});
export const sidebar = style({
  '@media': {
    '(min-width: 1000px)': {
      backgroundColor: t.color.surfaceContainer,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: t.space.extraLarge,
      height: '100svh',
      overflowY: 'auto',
      padding: '2rem 1rem',
      position: 'sticky',
      top: 0,
    },
  },
  display: 'none',
});
export const brand = style({
  alignItems: 'center',
  color: t.color.onSurface,
  display: 'flex',
  fontSize: '1.25rem',
  fontWeight: 750,
  gap: '0.625rem',
  lineHeight: 1.2,
  padding: '0.5rem',
  textDecoration: 'none',
});
export const brandMark = style({
  background: 'conic-gradient(from 35deg, #70e5eb, #6472ff, #873bdf, #ff77b5, #ffc17b, #70e5eb)',
  borderRadius: t.shape.full,
  boxShadow: 'inset 0 1px 3px rgb(255 255 255 / 0.4)',
  flexShrink: 0,
  height: '1.875rem',
  width: '1.875rem',
});
export const brandCaption = style({
  '@media': {
    '(max-width: 999px)': {
      display: 'none',
    },
  },
  color: t.color.onSurfaceVariant,
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 500,
  marginTop: '0.25rem',
});
export const navigation = style({
  display: 'grid',
  gap: '0.375rem',
});
export const navIcon = style({
  flexShrink: 0,
  fontSize: '1rem',
});
export const navLink = style({
  alignItems: 'center',
  borderRadius: t.shape.full,
  boxSizing: 'border-box',
  color: t.color.onSurfaceVariant,
  display: 'flex',
  fontSize: t.type.label,
  fontWeight: 600,
  gap: '0.75rem',
  minHeight: '48px',
  padding: '0.625rem 1rem',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '2px',
    },
    '&:hover': {
      backgroundColor: t.color.surfaceRaised,
      color: t.color.primary,
      textDecoration: 'none',
    },
    '&[aria-current="page"]': {
      backgroundColor: t.color.primaryContainer,
      color: t.color.onPrimaryContainer,
    },
  },
  textDecoration: 'none',
  transition: `background-color ${t.motion.duration} ${t.motion.easing}, color ${t.motion.duration} ${t.motion.easing}`,
});
export const workspace = style({
  minWidth: 0,
});
export const header = style({
  '@media': {
    '(max-width: 599px)': {
      minHeight: '72px',
      padding: '0.75rem 1rem',
    },
  },
  alignItems: 'center',
  boxSizing: 'border-box',
  display: 'flex',
  flexWrap: 'wrap',
  gap: t.space.small,
  justifyContent: 'space-between',
  minHeight: '80px',
  padding: '1rem clamp(1rem, 3.5vw, 3rem)',
  position: 'relative',
  zIndex: 5,
});
export const pageLabel = style({
  '@media': {
    '(max-width: 999px)': {
      display: 'none',
    },
  },
  color: t.color.onSurfaceVariant,
  fontSize: t.type.label,
  fontWeight: 600,
});
export const mobileBrand = style({
  '@media': {
    '(min-width: 1000px)': {
      display: 'none',
    },
  },
});
export const controls = style({
  alignItems: 'center',
  display: 'flex',
  flexShrink: 0,
  flexWrap: 'wrap',
  gap: t.space.small,
  justifyContent: 'flex-end',
  marginInlineStart: 'auto',
  maxWidth: '100%',
});
export const iconButton = style({
  alignItems: 'center',
  backgroundColor: t.color.surfaceContainer,
  border: 0,
  borderRadius: t.shape.full,
  boxSizing: 'border-box',
  color: t.color.onSurface,
  cursor: 'pointer',
  display: 'inline-flex',
  flexShrink: 0,
  fontSize: '1.125rem',
  height: '44px',
  justifyContent: 'center',
  listStyle: 'none',
  selectors: {
    '&:focus-visible': {
      outline: `3px solid ${t.color.primary}`,
      outlineOffset: '3px',
    },
    '&:hover': {
      backgroundColor: t.color.primaryContainer,
      color: t.color.onPrimaryContainer,
    },
  },
  transition: `background-color ${t.motion.duration} ${t.motion.easing}`,
  width: '44px',
});
export const mobileMenu = style({
  '@media': {
    '(min-width: 1000px)': {
      display: 'none',
    },
  },
});
export const mobileMenuPanel = style({
  backgroundColor: t.color.surfaceRaised,
  border: `1px solid ${t.color.outline}`,
  borderRadius: t.shape.large,
  boxShadow: t.elevation.raised,
  insetBlockStart: 'calc(100% - 0.25rem)',
  insetInline: t.space.medium,
  padding: t.space.medium,
  position: 'absolute',
  zIndex: 10,
});
globalStyle(`${iconButton}::-webkit-details-marker`, {
  display: 'none',
});
globalStyle(`${controls} .locale-switcher-trigger`, {
  backgroundColor: t.color.surfaceRaised,
  borderColor: t.color.outline,
  borderRadius: t.shape.full,
  boxSizing: 'border-box',
  color: t.color.onSurface,
  flexShrink: 0,
  maxWidth: '100%',
  minHeight: '44px',
  padding: '0.5rem 0.75rem',
  whiteSpace: 'normal',
});
globalStyle(`${controls} .locale-switcher-trigger > span:first-child`, {
  minWidth: 0,
});
globalStyle(`${navLink} > span`, {
  minWidth: 0,
  overflowWrap: 'anywhere',
});
globalStyle(`${controls} .locale-switcher-trigger > span:last-child`, {
  flexShrink: 0,
});
globalStyle(`${controls} .locale-switcher-trigger:hover`, {
  backgroundColor: t.color.primaryContainer,
  borderColor: t.color.primary,
});
globalStyle(`${controls} .locale-switcher-fallback`, {
  alignItems: 'center',
  display: 'inline-flex',
  justifyContent: 'center',
  minHeight: '44px',
  minWidth: '80px',
});
globalStyle(`${brand}:focus-visible`, {
  borderRadius: t.shape.small,
  outline: `3px solid ${t.color.primary}`,
  outlineOffset: '3px',
});
globalStyle(`${shell} *`, {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none !important',
      scrollBehavior: 'auto',
      transition: 'none !important',
    },
  },
});
