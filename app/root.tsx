import './app.css';

import type { JSX, PropsWithChildren } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';

export const links: Route.LinksFunction = () => [
  {
    href: 'https://fonts.googleapis.com',
    rel: 'preconnect',
  },
  {
    crossOrigin: 'anonymous',
    href: 'https://fonts.gstatic.com',
    rel: 'preconnect',
  },
  {
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    rel: 'stylesheet',
  },
];

export function Layout({ children }: PropsWithChildren): JSX.Element {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width, initial-scale=1"
          name="viewport"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App(): JSX.Element {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
  // HTTP status code constants
  const httpNotFound = 404;
  const httpUnauthorized = 401;
  const httpForbidden = 403;
  const httpInternalServerError = 500;
  const httpBadGateway = 502;
  const httpServiceUnavailable = 503;
  const httpVersionNotSupported = 505;
  const serverErrorThreshold = 500;

  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;
  let statusCode = httpInternalServerError;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;

    // Handle different HTTP status codes
    switch (error.status) {
      case httpNotFound:
        message = '404 - Not Found';
        details = 'The requested page could not be found.';
        break;
      case httpUnauthorized:
        message = '401 - Unauthorized';
        details = 'You need to be logged in to access this page.';
        break;
      case httpForbidden:
        message = '403 - Forbidden';
        details = "You don't have permission to access this resource.";
        break;
      case httpInternalServerError:
        message = '500 - Internal Server Error';
        details = 'Something went wrong on our end. Please try again later.';
        break;
      case httpBadGateway:
        message = '502 - Bad Gateway';
        details = 'The server received an invalid response. Please try again.';
        break;
      case httpServiceUnavailable:
        message = '503 - Service Unavailable';
        details = 'The service is temporarily unavailable. Please try again later.';
        break;
      case httpVersionNotSupported:
        message = '505 - HTTP Version Not Supported';
        details = 'The HTTP version used is not supported by this server.';
        break;
      default:
        message = `${error.status} - Error`;
        details = error.statusText || error.data?.message || details;
    }
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    // Development mode: show detailed error info
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <div
        style={{
          margin: '0 auto',
          maxWidth: '600px',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            color: statusCode >= serverErrorThreshold ? '#dc2626' : '#f59e0b',
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
          }}
        >
          {message}
        </h1>
        <p
          style={{
            color: '#666',
            fontSize: '1.125rem',
            marginBottom: '2rem',
          }}
        >
          {details}
        </p>

        {stack && (
          <details
            style={{
              background: '#f5f5f5',
              borderRadius: '8px',
              marginTop: '2rem',
              padding: '1rem',
              textAlign: 'left',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                fontWeight: 'bold',
                marginBottom: '1rem',
              }}
            >
              Stack Trace (Development Only)
            </summary>
            <pre
              style={{
                background: '#1e1e1e',
                borderRadius: '4px',
                color: '#d4d4d4',
                fontSize: '0.875rem',
                overflow: 'auto',
                padding: '1rem',
              }}
            >
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <div
          style={{
            marginTop: '2rem',
          }}
        >
          <a
            href="/"
            style={{
              background: '#0066cc',
              borderRadius: '8px',
              color: 'white',
              display: 'inline-block',
              fontWeight: '500',
              padding: '0.75rem 1.5rem',
              textDecoration: 'none',
            }}
          >
            ← Go back home
          </a>
        </div>
      </div>
    </main>
  );
}
