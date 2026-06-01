import '@fontsource-variable/open-sans/wght.css';

import openSansLatinWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-latin-wght-normal.woff2';
import openSansMathWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-math-wght-normal.woff2';
import openSansSymbolsWghtNormalWoff2 from '@fontsource-variable/open-sans/files/open-sans-symbols-wght-normal.woff2';
import { captureException } from '@sentry/react-router/cloudflare';
import { props } from '@stylexjs/stylex';
import type { JSX, PropsWithChildren } from 'react';
import { isRouteErrorResponse, Link, Outlet, useRouteLoaderData } from 'react-router';

import type { Route } from './+types/root.ts';
import { errorStyles, globalStyles } from './app.styles.ts';
import { RootDocumentHead } from './components/root-document-head.tsx';
import { RootDocumentScripts } from './components/root-document-scripts.tsx';
import { IconArrowLeft, IconBug, IconExclamationTriangle } from './icons.ts';
import { iconStyles } from './styles/icon.stylex.ts';
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

export function Layout({ children }: PropsWithChildren): JSX.Element {
  const rootLoaderData = useRouteLoaderData<typeof loader>('root');
  const cspNonce = rootLoaderData?.cspNonce ?? undefined;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      {...props(globalStyles.html)}
    >
      <head>
        <RootDocumentHead cspNonce={cspNonce} />
      </head>
      <body {...props(globalStyles.body)}>
        {children}
        <RootDocumentScripts cspNonce={cspNonce} />
      </body>
    </html>
  );
}

export default function RootApp(): JSX.Element {
  return <Outlet />;
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
    <main {...props(errorStyles.main)}>
      <div {...props(errorStyles.container)}>
        <div
          {...props(
            errorStyles.icon,
            statusCode >= serverErrorThreshold
              ? errorStyles.iconServerError
              : errorStyles.iconClientError
          )}
        >
          <IconExclamationTriangle {...props(iconStyles.base)} />
        </div>

        <h1
          {...props(
            errorStyles.title,
            statusCode >= serverErrorThreshold
              ? errorStyles.titleServerError
              : errorStyles.titleClientError
          )}
        >
          {message}
        </h1>

        <p {...props(errorStyles.details)}>{details}</p>

        {stack && (
          <details {...props(errorStyles.stackDetails)}>
            <summary {...props(errorStyles.stackSummary)}>
              <IconBug {...props(iconStyles.base, errorStyles.iconBug)} />
              <span>Stack Trace (Development Only)</span>
            </summary>
            <pre {...props(errorStyles.stackPre)}>
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <Link
          to="/"
          {...props(errorStyles.link)}
        >
          <IconArrowLeft {...props(iconStyles.base)} />
          <span>Go back home</span>
        </Link>
      </div>
    </main>
  );
}
