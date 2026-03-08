import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { tokens } from '../styles/tokens.stylex.ts';

const s = create({
  backLinkWrapper: {
    marginTop: tokens.spacing8,
  },
  card: {
    backgroundColor: {
      ':hover': '#f9fafb', // hover:bg-gray-50
      '@media (prefers-color-scheme: dark)': {
        ':hover': '#334155', // hover:bg-slate-700
        default: '#1e293b', // bg-slate-800
      },
      default: '#ffffff', // bg-white
    },
    borderColor: {
      ':hover': '#9ca3af', // hover:border-gray-400
      default: '#d1d5db', // border-gray-300
    },
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    display: 'block',
    padding: tokens.spacing4,
    textDecoration: 'none',
    transition: 'all 0.2s', // transition-all duration-200
  },
  cardTitle: {
    color: {
      '@media (prefers-color-scheme: dark)': '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing2,
  },
  code: {
    fontSize: '1.5rem', // text-2xl
    marginRight: tokens.spacing2,
  },
  desc: {
    fontSize: '0.875rem', // text-sm
  },
  grid: {
    display: 'grid',
    gap: '1.5rem', // gap-6
    gridTemplateColumns: {
      '@media (min-width: 768px)': 'repeat(2, 1fr)', // md:grid-cols-2
      '@media (min-width: 1024px)': 'repeat(3, 1fr)', // lg:grid-cols-3
      default: '1fr',
    },
    marginBottom: '3rem', // mb-12
  },
  h1: {
    color: {
      '@media (prefers-color-scheme: dark)': '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: '1.5rem', // mb-6
  },
  h3: {
    // h3 mt-0 text-slate-900 dark:text-white
    color: {
      '@media (prefers-color-scheme: dark)': '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: '1.17em',
    fontWeight: tokens.fontWeightBold,
    marginTop: '0',
  },
  infoBox: {
    backgroundColor: '#78350f', // bg-amber-900
    borderColor: '#f59e0b', // border-amber-500
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: tokens.spacing8,
    padding: tokens.spacing4,
  },
  inlineCode: {
    backgroundColor: {
      '@media (prefers-color-scheme: dark)': '#334155', // bg-slate-700
      default: '#e2e8f0', // bg-slate-200
    },
    borderRadius: '0.25rem', // rounded
    padding: '0.125rem 0.25rem', // px-1 py-0.5
  },
  link: {
    color: {
      ':hover': '#1e40af', // hover:text-blue-800
      '@media (prefers-color-scheme: dark)': {
        ':hover': '#93c5fd', // hover:text-blue-300
        default: '#60a5fa', // text-blue-400
      },
      default: '#2563eb', // text-blue-600
    },
    transition: tokens.transitionColors,
  },
  p: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    marginBottom: tokens.spacing8,
  },
  page: {
    fontFamily: "'Inter', sans-serif",
    margin: '0 auto',
    maxWidth: '48rem', // max-w-3xl
    padding: tokens.spacing8,
  },
  ul: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    listStyleType: 'disc',
    marginBottom: '0',
    paddingLeft: '1.5rem', // default user agent padding usually, but checking `list-disc` implicit?
  },
  urlBox: {
    backgroundColor: {
      '@media (prefers-color-scheme: dark)': '#1e293b', // bg-slate-800
      default: '#f8fafc', // bg-slate-50
    },
    borderRadius: '0.5rem', // rounded-lg
    marginBottom: tokens.spacing8,
    padding: tokens.spacing4,
  },
  urlList: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    fontFamily: 'monospace', // font-mono
    fontSize: '0.875rem', // text-sm
    listStyleType: 'disc',
    marginBottom: '0',
    paddingLeft: '1.5rem',
  },
});

const colors = create({
  amber500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#fcd34d',
      default: '#f59e0b',
    },
  },
  // Amber
  amber600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#fbbf24',
      default: '#d97706',
    },
  },
  blue500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#93c5fd',
      default: '#3b82f6',
    },
  },
  // Blue
  blue600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#60a5fa',
      default: '#2563eb',
    },
  },
  gray500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#d1d5db',
      default: '#6b7280',
    },
  },
  // Gray
  gray600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#9ca3af',
      default: '#4b5563',
    },
  },
  green500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#86efac',
      default: '#22c55e',
    },
  },
  // Green
  green600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#4ade80',
      default: '#16a34a',
    },
  },
  pink500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#fbcfe8',
      default: '#ec4899',
    },
  },
  // Pink
  pink600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#f472b6',
      default: '#db2777',
    },
  },
  purple500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#d8b4fe',
      default: '#a855f7',
    },
  },
  // Purple
  purple600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#c084fc',
      default: '#9333ea',
    },
  },
  red500: {
    color: {
      '@media (prefers-color-scheme: dark)': '#fca5a5',
      default: '#ef4444',
    },
  },
  // Red
  red600: {
    color: {
      '@media (prefers-color-scheme: dark)': '#f87171',
      default: '#dc2626',
    },
  },
});

type ColorKey = keyof typeof colors;

// This is now just a demo/index page that doesn't throw errors
// No loader needed - this page is prerendered at build time
export default function ErrorsDemo(): JSX.Element {
  return (
    <div {...props(s.page)}>
      <div {...props(s.backLinkWrapper)}>
        <Link
          to="/"
          {...props(s.link)}
        >
          ← Back to Home
        </Link>
      </div>

      <h1 {...props(s.h1)}>Error Handling Demo</h1>
      <p {...props(s.p)}>
        Click any link to trigger different types of errors via SSR and see how they're handled.
      </p>

      <div {...props(s.grid)}>
        {[
          {
            code: '404',
            codeColor: 'blue600',
            desc: "Resource doesn't exist",
            descColor: 'blue500',
            label: 'Not Found',
          },
          {
            code: '401',
            codeColor: 'amber600',
            desc: 'Login required',
            descColor: 'amber500',
            label: 'Unauthorized',
          },
          {
            code: '403',
            codeColor: 'red600',
            desc: 'No permission',
            descColor: 'red500',
            label: 'Forbidden',
          },
          {
            code: '500',
            codeColor: 'purple600',
            desc: 'Server crashed',
            descColor: 'purple500',
            label: 'Server Error',
          },
          {
            code: '502',
            codeColor: 'pink600',
            desc: 'Invalid response',
            descColor: 'pink500',
            label: 'Bad Gateway',
          },
          {
            code: '503',
            codeColor: 'gray600',
            desc: 'Service down',
            descColor: 'gray500',
            label: 'Unavailable',
          },
          {
            code: 'runtime',
            codeColor: 'green600',
            desc: 'JavaScript error',
            descColor: 'green500',
            label: 'Runtime Error',
          },
        ].map(({ code, label, desc, codeColor, descColor }) => (
          <Link
            key={code}
            to={`/errors/${code}`}
            {...props(s.card)}
          >
            <div {...props(s.cardTitle)}>
              <span {...props(s.code, colors[codeColor as ColorKey])}>{code}</span>
              {label}
            </div>
            <div {...props(s.desc, colors[descColor as ColorKey])}>{desc}</div>
          </Link>
        ))}
      </div>

      <div {...props(s.infoBox)}>
        <h3 {...props(s.h3)}>💡 How Error Handling Works</h3>
        <ul {...props(s.ul)}>
          <li>
            <strong>This page (/errors):</strong> Prerendered at build time as static HTML
          </li>
          <li>
            <strong>Error routes (/errors/:code):</strong> Server-rendered dynamically on each
            request
          </li>
          <li>
            <strong>Error boundaries:</strong> Catch and display errors from loaders
          </li>
          <li>
            <strong>404 errors:</strong> Caught by the catch-all route
          </li>
          <li>
            <strong>Runtime errors:</strong> Caught by React error boundaries
          </li>
        </ul>
      </div>

      <div {...props(s.urlBox)}>
        <h3 {...props(s.h3)}>🎯 URL Structure</h3>
        <ul {...props(s.urlList)}>
          <li>
            <code {...props(s.inlineCode)}>/errors</code> - This demo page (prerendered)
          </li>
          <li>
            <code {...props(s.inlineCode)}>/errors/404</code> - Dynamic error page (SSR)
          </li>
          <li>
            <code {...props(s.inlineCode)}>/errors/500</code> - Dynamic error page (SSR)
          </li>
          <li>
            <code {...props(s.inlineCode)}>/errors/runtime</code> - Dynamic error page (SSR)
          </li>
        </ul>
      </div>
    </div>
  );
}
