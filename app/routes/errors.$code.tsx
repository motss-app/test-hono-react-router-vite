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

  if (error instanceof Response) {
    statusCode = error.status;
    statusText = error.statusText || `${statusCode} Error`;
  } else if (error instanceof Error) {
    message = error.message;
    statusText = 'Runtime Error';
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui',
        margin: '0 auto',
        maxWidth: '600px',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          color: statusCode >= serverErrorStatusCode ? '#dc2626' : '#f59e0b',
          fontSize: '4rem',
          margin: '0',
        }}
      >
        {statusCode}
      </h1>
      <h2
        style={{
          marginTop: '1rem',
        }}
      >
        {statusText}
      </h2>
      <p
        style={{
          color: '#666',
        }}
      >
        {message}
      </p>

      <div
        style={{
          borderRadius: '8px',
          marginTop: '2rem',
          padding: '1rem',
          textAlign: 'left',
        }}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          ℹ️ About this error:
        </h3>
        <ul
          style={{
            marginBottom: 0,
          }}
        >
          <li>
            <strong>Status:</strong> {statusCode}
          </li>
          <li>
            <strong>Type:</strong>{' '}
            {error instanceof Response ? 'HTTP Response Error' : 'Runtime Error'}
          </li>
          <li>
            <strong>Caught by:</strong> Route ErrorBoundary in <code>errors.$code.tsx</code>
          </li>
          <li>
            <strong>SSR:</strong> This page was server-rendered with the error
          </li>
        </ul>
      </div>

      <div
        style={{
          marginTop: '2rem',
        }}
      >
        <Link
          style={{
            color: '#0066cc',
            textDecoration: 'none',
          }}
          to="/errors"
        >
          ← Back to Error Demo
        </Link>
        |
        <Link
          style={{
            color: '#0066cc',
            textDecoration: 'none',
          }}
          to="/"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
