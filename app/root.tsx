import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;
  let statusCode = 500;

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;

    // Handle different HTTP status codes
    switch (error.status) {
      case 404:
        message = "404 - Not Found";
        details = "The requested page could not be found.";
        break;
      case 401:
        message = "401 - Unauthorized";
        details = "You need to be logged in to access this page.";
        break;
      case 403:
        message = "403 - Forbidden";
        details = "You don't have permission to access this resource.";
        break;
      case 500:
        message = "500 - Internal Server Error";
        details = "Something went wrong on our end. Please try again later.";
        break;
      case 502:
        message = "502 - Bad Gateway";
        details = "The server received an invalid response. Please try again.";
        break;
      case 503:
        message = "503 - Service Unavailable";
        details = "The service is temporarily unavailable. Please try again later.";
        break;
      case 505:
        message = "505 - HTTP Version Not Supported";
        details = "The HTTP version used is not supported by this server.";
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
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: statusCode >= 500 ? '#dc2626' : '#f59e0b',
        }}>
          {message}
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#666',
          marginBottom: '2rem',
        }}>
          {details}
        </p>

        {stack && (
          <details style={{
            marginTop: '2rem',
            textAlign: 'left',
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '8px',
          }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
              Stack Trace (Development Only)
            </summary>
            <pre style={{
              overflow: 'auto',
              fontSize: '0.875rem',
              background: '#1e1e1e',
              color: '#d4d4d4',
              padding: '1rem',
              borderRadius: '4px',
            }}>
              <code>{stack}</code>
            </pre>
          </details>
        )}

        <div style={{ marginTop: '2rem' }}>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '0.75rem 1.5rem',
              background: '#0066cc',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
            }}
          >
            ← Go back home
          </a>
        </div>
      </div>
    </main>
  );
}
