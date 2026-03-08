import { Icon } from '@iconify/react';
import { props } from '@stylexjs/stylex';
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
import { errorStyles, globalStyles } from './app.styles.ts';

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
      {...props(globalStyles.global)}
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          content="width=device-width, initial-scale=1"
          name="viewport"
        />
        <Meta />
        <Links />
        {/* body/global styles are applied via StyleX `globalStyles` */}

        {import.meta.env.DEV ? (
          <link
            href="/virtual:stylex.css"
            rel="stylesheet"
          />
        ) : (
          <link
            href="/assets/stylex.css"
            rel="stylesheet"
          />
        )}
      </head>
      <body {...props(globalStyles.body)}>
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
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
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
          <Icon icon="fa7-solid:exclamation-triangle" />
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
              <Icon
                color="#f87171"
                icon="fa7-solid:bug"
              />
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
          <Icon icon="fa7-solid:arrow-left" />
          <span>Go back home</span>
        </Link>
      </div>
    </main>
  );
}
