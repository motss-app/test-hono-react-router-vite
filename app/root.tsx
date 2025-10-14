import 'virtual:uno.css';

import './app.css';

import type { JSX, PropsWithChildren } from 'react';
import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root.ts';

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
    <html
      className="dark"
      lang="en"
    >
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
    <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-2xl w-full dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
        <div
          className={`i-fa:exclamation-triangle text-6xl mb-6 ${
            statusCode >= serverErrorThreshold ? 'text-red-600' : 'text-yellow-600'
          }`}
        />

        <h1
          className={`text-4xl font-bold mb-4 ${
            statusCode >= serverErrorThreshold ? 'text-red-600' : 'text-yellow-600'
          }`}
        >
          {message}
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">{details}</p>

        {stack && (
          <details className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 mb-8 text-left">
            <summary className="cursor-pointer font-semibold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
              <div className="i-fa:bug text-red-600" />
              <span>Stack Trace (Development Only)</span>
            </summary>
            <pre className="bg-slate-800 text-slate-200 rounded p-4 overflow-auto text-sm font-mono">
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <Link
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          to="/"
        >
          <div className="i-fa:arrow-left" />
          <span>Go back home</span>
        </Link>
      </div>
    </main>
  );
}
