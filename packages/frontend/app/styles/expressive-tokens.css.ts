import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css';

export const expressiveTokens = createThemeContract({
  color: {
    errorContainer: null,
    onErrorContainer: null,
    onPrimary: null,
    onPrimaryContainer: null,
    onSecondaryContainer: null,
    onSurface: null,
    onSurfaceVariant: null,
    onTertiaryContainer: null,
    outline: null,
    primary: null,
    primaryContainer: null,
    primaryHover: null,
    secondaryContainer: null,
    surface: null,
    surfaceContainer: null,
    surfaceRaised: null,
    tertiaryContainer: null,
  },
  elevation: {
    raised: null,
  },
  motion: {
    duration: null,
    easing: null,
    entrance: null,
  },
  shape: {
    extraLarge: null,
    full: null,
    large: null,
    medium: null,
    small: null,
  },
  space: {
    extraLarge: null,
    large: null,
    medium: null,
    pageFooterGap: null,
    section: null,
    small: null,
  },
  type: {
    body: null,
    display: null,
    headline: null,
    label: null,
    title: null,
  },
});

const foundations = {
  motion: {
    duration: '180ms',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    entrance: '650ms',
  },
  shape: {
    extraLarge: '2rem',
    full: '999px',
    large: '1.5rem',
    medium: '1rem',
    small: '0.75rem',
  },
  space: {
    extraLarge: '2rem',
    large: '1.5rem',
    medium: '1rem',
    pageFooterGap: '64px',
    section: 'clamp(2rem, 4vw, 3.5rem)',
    small: '0.5rem',
  },
  type: {
    body: '1rem',
    display: 'clamp(2.5rem, 4.6vw, 4.5rem)',
    headline: 'clamp(1.5rem, 2vw, 2rem)',
    label: '0.875rem',
    title: '1.125rem',
  },
};

createGlobalTheme(':root', expressiveTokens, {
  ...foundations,
  color: {
    errorContainer: '#ffe3eb',
    onErrorContainer: '#a51d48',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#4e238b',
    onSecondaryContainer: '#843d09',
    onSurface: '#21182e',
    onSurfaceVariant: '#60566d',
    onTertiaryContainer: '#006474',
    outline: '#d9d0e6',
    primary: '#7135d3',
    primaryContainer: '#ece0ff',
    primaryHover: '#5c24b5',
    secondaryContainer: '#ffead9',
    surface: '#fcf9ff',
    surfaceContainer: '#f2edfa',
    surfaceRaised: '#ffffff',
    tertiaryContainer: '#d9f5fa',
  },
  elevation: {
    raised: '0 4px 16px rgb(53 26 83 / 0.07)',
  },
});

createGlobalTheme(':root[data-theme="dark"]', expressiveTokens, {
  ...foundations,
  color: {
    errorContainer: '#40212e',
    onErrorContainer: '#ffadc3',
    onPrimary: '#34115e',
    onPrimaryContainer: '#dfc7ff',
    onSecondaryContainer: '#ffbd8b',
    onSurface: '#f1eafa',
    onSurfaceVariant: '#c2b9d0',
    onTertiaryContainer: '#87deeb',
    outline: '#464058',
    primary: '#cfadff',
    primaryContainer: '#33224f',
    primaryHover: '#dfc9ff',
    secondaryContainer: '#38291f',
    surface: '#10121c',
    surfaceContainer: '#1b1c2c',
    surfaceRaised: '#232337',
    tertiaryContainer: '#12313d',
  },
  elevation: {
    raised: '0 4px 20px rgb(0 0 0 / 0.16)',
  },
});
