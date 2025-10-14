import type { JSX } from 'react';
import { Link } from 'react-router';

import type { Route } from './+types/errors.$code.ts';

// This route handles individual error codes via URL params
// Example: /errors/404, /errors/500, etc.
export function loader({ params }: Route.LoaderArgs) {
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
  const existing = parentHeaders.get('Server-Timing') || '';
  const newTiming = `error-code-loader;dur=${timing};desc="Error Code Route Loader"`;

  parentHeaders.set('Server-Timing', existing ? `${existing}, ${newTiming}` : newTiming);

  return parentHeaders;
}

// This component won't actually render because the loader always throws
// But it's here for completeness
export default function ErrorCode({ params }: Route.ComponentProps): JSX.Element {
  return (
    <div className="error-page">
      <h1>Error {params.code}</h1>
      <p>This page should trigger an error.</p>
      <Link to="/errors">← Back to Error Demo</Link>
    </div>
  );
}

// ErrorBoundary to catch and display the errors thrown by the loader
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  const serverErrorStatusCode = 500;

  let statusCode = serverErrorStatusCode;
  let statusText = 'Internal Server Error';
  let message = 'An unexpected error occurred';

  // Check if error is a Response-like object (ErrorResponseImpl from React Router)
  if (error && typeof error === 'object' && 'status' in error && 'statusText' in error) {
    statusCode = Number(error.status || -1);
    statusText = String(error.statusText || '<empty>');
  } else if (error instanceof Error) {
    message = error.message;
    statusText = 'Runtime Error';
  }

  return (
    <div className="font-sans mx-auto max-w-3xl p-8 text-center min-h-screen">
      <div className="mt-8">
        <Link
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 no-underline mr-4"
          to="/errors"
        >
          ← Back to Error Demo
        </Link>
        |
        <Link
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 no-underline ml-4"
          to="/"
        >
          Go Home
        </Link>
      </div>

      <h1
        className={`text-6xl m-0 ${
          statusCode >= serverErrorStatusCode
            ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400'
        }`}
      >
        {statusCode}
      </h1>
      <h2 className="mt-4 text-slate-900 dark:text-white">{statusText}</h2>
      <p className="text-slate-600 dark:text-slate-300">{message}</p>

      <div className="rounded-lg mt-8 p-16 text-left bg-slate-50 dark:bg-slate-800">
        <h3 className="mt-0 text-slate-900 dark:text-white">ℹ️ About this error:</h3>
        <ul className="mb-0 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Status:</strong> {statusCode}
          </li>
          <li>
            <strong>Type:</strong>{' '}
            {error instanceof Response ? 'HTTP Response Error' : 'Runtime Error'}
          </li>
          <li>
            <strong>Caught by:</strong> Route ErrorBoundary in{' '}
            <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
              errors.$code.tsx
            </code>
          </li>
          <li>
            <strong>SSR:</strong> This page was server-rendered with the error
          </li>
        </ul>
      </div>
    </div>
  );
}
