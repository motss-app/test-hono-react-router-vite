import '@fontsource-variable/open-sans/wght.css';

import openSansLatinWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2';
import openSansMathWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-math-wght-normal.woff2';
import openSansSymbolsWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-symbols-wght-normal.woff2';
import { captureException } from '@sentry/react-router/cloudflare';
import type { JSX, PropsWithChildren } from 'react';
import type { MiddlewareFunction } from 'react-router';
import { isRouteErrorResponse, Link, Outlet, useRouteLoaderData } from 'react-router';

import type { Route } from './+types/root.ts';
import { errorStyles } from './app.css.ts';
import { RootDocumentHead } from './components/root-document-head.tsx';
import { RootDocumentScripts } from './components/root-document-scripts.tsx';
import { ScrollToTopButtonShell } from './components/scroll-to-top-button-shell.tsx';
import { IconArrowLeft, IconBug, IconExclamationTriangle } from './icons.ts';
import { getLocale } from './paraglide/runtime.js';
import { paraglideMiddleware } from './paraglide/server.js';
import { csp } from './utils/csp.ts';

export const links: Route.LinksFunction = () => [
  {
    as: 'font',
    crossOrigin: 'anonymous',
    href: openSansLatinWghtNormalWoff2,
    rel: 'preload',
    type: 'font/woff2',
  },
  {
    as: 'font',
    crossOrigin: 'anonymous',
    href: openSansSymbolsWghtNormalWoff2,
    rel: 'preload',
    type: 'font/woff2',
  },
  {
    as: 'font',
    crossOrigin: 'anonymous',
    href: openSansMathWghtNormalWoff2,
    rel: 'preload',
    type: 'font/woff2',
  },
];

export function loader({ request }: Route.LoaderArgs) {
  return {
    cspNonce: csp.getNonce(request),
  };
}

export function shouldRevalidate(): boolean {
  return false;
}

export const middleware: MiddlewareFunction[] = [
  (ctx, next) => paraglideMiddleware(ctx.request, () => next()),
];

export function Layout({ children }: PropsWithChildren): JSX.Element {
  const rootLoaderData = useRouteLoaderData<typeof loader>('root');
  const cspNonce = rootLoaderData?.cspNonce ?? undefined;

  return (
    <html
      lang={getLocale()}
      suppressHydrationWarning
    >
      <head>
        <RootDocumentHead cspNonce={cspNonce} />
      </head>
      <body>
        {children}
        <RootDocumentScripts cspNonce={cspNonce} />
      </body>
    </html>
  );
}

export default function RootApp(): JSX.Element {
  return (
    <>
      <Outlet />
      <ScrollToTopButtonShell />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps): JSX.Element {
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
  } else if (error && error instanceof Error) {
    if (typeof window !== 'undefined') {
      captureException(error);
    }

    if (import.meta.env.DEV) {
      details = error.message;
      stack = error.stack;
    }
  }

  return (
    <main className={errorStyles.main}>
      <div className={errorStyles.container}>
        <div
          className={`${errorStyles.icon} ${
            statusCode >= serverErrorThreshold
              ? errorStyles.iconServerError
              : errorStyles.iconClientError
          }`}
        >
          <IconExclamationTriangle />
        </div>

        <h1
          className={`${errorStyles.title} ${
            statusCode >= serverErrorThreshold
              ? errorStyles.titleServerError
              : errorStyles.titleClientError
          }`}
        >
          {message}
        </h1>

        <p className={errorStyles.details}>{details}</p>

        {stack && (
          <details className={errorStyles.stackDetails}>
            <summary className={errorStyles.stackSummary}>
              <IconBug />
              <span>Stack Trace (Development Only)</span>
            </summary>
            <pre className={errorStyles.stackPre}>
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <Link
          className={errorStyles.link}
          to="/"
        >
          <IconArrowLeft />
          <span>Go back home</span>
        </Link>
      </div>
    </main>
  );
}
