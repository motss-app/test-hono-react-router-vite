import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { themeConditions, tokens } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/errors.$code.ts';

const s = create({
  code: {
    backgroundColor: {
      [themeConditions.prefersDarkMode]: '#334155', // bg-slate-700
      [themeConditions.dataThemeDark]: '#334155', // bg-slate-700
      default: '#e2e8f0', // bg-slate-200
    },
    borderRadius: '0.25rem', // rounded
    fontFamily: 'monospace',
    padding: '0.125rem 0.25rem', // px-1 py-0.5
  },
  h1: {
    fontSize: '3.75rem', // text-6xl
    fontWeight: tokens.fontWeightBold,
    lineHeight: 1,
    margin: 0,
  },
  h2: {
    color: {
      [themeConditions.prefersDarkMode]: '#ffffff', // text-white
      [themeConditions.dataThemeDark]: '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: '1.5rem', // text-2xl
    fontWeight: tokens.fontWeightSemibold,
    marginTop: tokens.spacing4,
  },
  h3: {
    color: {
      [themeConditions.prefersDarkMode]: '#ffffff', // text-white
      [themeConditions.dataThemeDark]: '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: '1.17em',
    fontWeight: tokens.fontWeightBold,
    marginTop: 0,
  },
  infoBox: {
    backgroundColor: {
      [themeConditions.prefersDarkMode]: '#1e293b', // bg-slate-800
      [themeConditions.dataThemeDark]: '#1e293b', // bg-slate-800
      default: '#f8fafc', // bg-slate-50
    },
    borderRadius: '0.5rem', // rounded-lg
    marginTop: tokens.spacing8,
    padding: tokens.spacing16,
    textAlign: 'left',
  },
  link: {
    color: {
      ':hover': '#1e40af', // hover:text-blue-800
      [themeConditions.prefersDarkMode]: {
        ':hover': '#93c5fd', // hover:text-blue-300
        default: '#60a5fa', // text-blue-400
      },
      [themeConditions.dataThemeDark]: {
        ':hover': '#93c5fd', // hover:text-blue-300
        default: '#60a5fa', // text-blue-400
      },
      default: '#2563eb', // text-blue-600
    },
    marginLeft: tokens.spacing4,
    marginRight: tokens.spacing4,
    textDecoration: 'none',
  },
  links: {
    marginTop: tokens.spacing8,
  },
  p: {
    color: {
      [themeConditions.prefersDarkMode]: '#cbd5e1', // text-slate-300
      [themeConditions.dataThemeDark]: '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    marginBottom: tokens.spacing4,
  },
  page: {
    margin: '0 auto',
    maxWidth: '48rem', // max-w-3xl
    padding: tokens.spacing8,
    textAlign: 'center',
  },
  ul: {
    color: {
      [themeConditions.prefersDarkMode]: '#cbd5e1', // text-slate-300
      [themeConditions.dataThemeDark]: '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    listStyleType: 'disc',
    marginBottom: 0,
    paddingLeft: '1.5rem',
  },
});

const statusColors = create({
  amber: {
    color: {
      [themeConditions.prefersDarkMode]: '#fbbf24', // text-amber-400
      [themeConditions.dataThemeDark]: '#fbbf24', // text-amber-400
      default: '#d97706', // text-amber-600
    },
  },
  red: {
    color: {
      [themeConditions.prefersDarkMode]: '#f87171', // text-red-400
      [themeConditions.dataThemeDark]: '#f87171', // text-red-400
      default: '#dc2626', // text-red-600
    },
  },
});

// This route handles individual error codes via URL params
// Example: /errors/404, /errors/500, etc.
export function loader({ params }: Route.LoaderArgs) {
  // ... existing loader logic wrapped in try-catch if needed, but here we just throw Response or Error
  // We keep it as is, just copy logic
  const start = performance.now();
  const { code } = params;

  // Simulate different error types based on URL param
  switch (code) {
    case '404':
      throw new Response('Not Found', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 404,
        statusText: 'Not Found',
      });

    case '401':
      throw new Response('Unauthorized', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 401,
        statusText: 'Unauthorized',
      });

    case '403':
      throw new Response('Forbidden', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 403,
        statusText: 'Forbidden',
      });

    case '500':
      throw new Response('Internal Server Error', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 500,
        statusText: 'Internal Server Error',
      });

    case '502':
      throw new Response('Bad Gateway', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 502,
        statusText: 'Bad Gateway',
      });

    case '503':
      throw new Response('Service Unavailable', {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 503,
        statusText: 'Service Unavailable',
      });

    case 'runtime':
      // Simulate a runtime error
      throw new Error(`Runtime error for code: ${code}`);

    default:
      // Invalid error code - show 404
      throw new Response(`Unknown error code: ${code}`, {
        headers: {
          'X-Route-Timing': (performance.now() - start).toFixed(2),
        },
        status: 404,
        statusText: 'Unknown Error Code',
      });
  }
}

export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const timing = loaderHeaders.get('X-Route-Timing') || '0';
  const newTiming = `error-code-loader;dur=${timing};desc="Error Code Route Loader"`;

  parentHeaders.append('Server-Timing', newTiming);

  return parentHeaders;
}

export default function ErrorCode({ params }: Route.ComponentProps): JSX.Element {
  return (
    <div {...props(s.page)}>
      <h1 {...props(s.h1)}>Error {params.code}</h1>
      <p {...props(s.p)}>This page should trigger an error.</p>
      <Link
        to="/errors"
        {...props(s.link)}
      >
        ← Back to Error Demo
      </Link>
    </div>
  );
}

// ErrorBoundary to catch and display the errors thrown by the loader
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  const serverErrorStatusCode = 500;

  let statusCode = serverErrorStatusCode;
  let statusText = 'Internal Server Error';
  let message = 'An unexpected error occurred';
  let isResponseError = false;

  // Check if error is a Response-like object (ErrorResponseImpl from React Router)
  // We check for 'status' and 'statusText' specifically
  if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
    statusCode = Number(error.status || -1);
    statusText = String(error.statusText || '<empty>');
    isResponseError = true;
  } else if (error instanceof Error) {
    message = error.message;
    statusText = 'Runtime Error';
  }

  const isServerError = statusCode >= serverErrorStatusCode;

  return (
    <div {...props(s.page)}>
      <div {...props(s.links)}>
        <Link
          to="/errors"
          {...props(s.link)}
        >
          ← Back to Error Demo
        </Link>
        |
        <Link
          to="/"
          {...props(s.link)}
        >
          Go Home
        </Link>
      </div>

      <h1 {...props(s.h1, isServerError ? statusColors.red : statusColors.amber)}>{statusCode}</h1>
      <h2 {...props(s.h2)}>{statusText}</h2>
      <p {...props(s.p)}>{message}</p>

      <div {...props(s.infoBox)}>
        <h3 {...props(s.h3)}>ℹ️ About this error:</h3>
        <ul {...props(s.ul)}>
          <li>
            <strong>Status:</strong> {statusCode}
          </li>
          <li>
            <strong>Type:</strong> {isResponseError ? 'HTTP Response Error' : 'Runtime Error'}
          </li>
          <li>
            <strong>Caught by:</strong> Route ErrorBoundary in{' '}
            <code {...props(s.code)}>errors.$code.tsx</code>
          </li>
          <li>
            <strong>SSR:</strong> This page was server-rendered with the error
          </li>
        </ul>
      </div>
    </div>
  );
}
