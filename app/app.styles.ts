import { create } from '@stylexjs/stylex';

const vendorPrefixFontSmoothing = {
  mozOsxFontSmoothing: '-moz-osx-font-smoothing',
  webkitFontSmoothing: '-webkit-font-smoothing',
} as const;

export const globalStyles = create({
  body: {
    backgroundColor: {
      '@media (prefers-color-scheme: dark)': '#0f172a',
      default: '#fff',
    },
    fontFamily: "'Inter', sans-serif",
    height: '100%',
    [vendorPrefixFontSmoothing.mozOsxFontSmoothing]: 'grayscale',
    margin: 0,
    [vendorPrefixFontSmoothing.webkitFontSmoothing]: 'antialiased',
  },
  global: {
    boxSizing: 'border-box',
    margin: 0,
    padding: 0,
  },
});

export const errorStyles = create({
  container: {
    backgroundColor: '#0f172a',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    maxWidth: '42rem',
    padding: '2rem',
    textAlign: 'center',
    width: '100%',
  },
  details: {
    color: '#e2e8f0',
    fontSize: '1.25rem',
    marginBottom: '2rem',
  },
  icon: {
    fontSize: '3.75rem',
    marginBottom: '1rem',
  },
  iconClientError: {
    color: '#ea580c',
  },
  iconServerError: {
    color: '#f87171',
  },
  link: {
    alignItems: 'center',
    backgroundColor: '#60a5fa',
    borderRadius: '0.5rem',
    color: 'white',
    display: 'inline-flex',
    fontWeight: 600,
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    textDecoration: 'none',
  },
  main: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem',
  },
  stackDetails: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: '0.125rem',
    marginBottom: '2rem',
    padding: '1rem',
    textAlign: 'left',
  },
  stackPre: {
    backgroundColor: '#1e293b',
    borderRadius: '0.25rem',
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    overflow: 'auto',
    padding: '1rem',
  },
  stackSummary: {
    alignItems: 'center',
    color: '#e2e8f0',
    cursor: 'pointer',
    display: 'flex',
    fontWeight: 600,
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  titleClientError: {
    color: '#ea580c',
  },
  titleServerError: {
    color: '#f87171',
  },
});
