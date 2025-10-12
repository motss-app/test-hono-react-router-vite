import type { JSX } from 'react';
import { Link } from 'react-router';

// This is now just a demo/index page that doesn't throw errors
// No loader needed - this page is prerendered at build time
export default function ErrorsDemo(): JSX.Element {
  return (
    <div
      style={{
        fontFamily: 'system-ui',
        margin: '0 auto',
        maxWidth: '800px',
        padding: '2rem',
      }}
    >
      <h1>Error Handling Demo</h1>
      <p
        style={{
          color: '#666',
          marginBottom: '2rem',
        }}
      >
        Click any link to trigger different types of errors via SSR and see how they're handled.
      </p>

      <div
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          marginBottom: '2rem',
        }}
      >
        {[
          {
            code: '404',
            desc: "Resource doesn't exist",
            label: '404 Not Found',
          },
          {
            code: '401',
            desc: 'Login required',
            label: '401 Unauthorized',
          },
          {
            code: '403',
            desc: 'No permission',
            label: '403 Forbidden',
          },
          {
            code: '500',
            desc: 'Server crashed',
            label: '500 Server Error',
          },
          {
            code: '502',
            desc: 'Invalid response',
            label: '502 Bad Gateway',
          },
          {
            code: '503',
            desc: 'Service down',
            label: '503 Unavailable',
          },
          {
            code: 'runtime',
            desc: 'JavaScript error',
            label: 'Runtime Error',
          },
        ].map(({ code, label, desc }) => (
          <Link
            key={code}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              color: 'inherit',
              display: 'block',
              padding: '1rem',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            to={`/errors/${code}`}
          >
            <div
              style={{
                fontWeight: 'bold',
                marginBottom: '0.5rem',
              }}
            >
              {label}
            </div>
            <div
              style={{
                color: '#666',
                fontSize: '0.875rem',
              }}
            >
              {desc}
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          border: '1px solid #ffc107',
          borderRadius: '8px',
          marginBottom: '2rem',
          padding: '1rem',
        }}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          💡 How Error Handling Works
        </h3>
        <ul
          style={{
            marginBottom: 0,
          }}
        >
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

      <div
        style={{
          borderRadius: '8px',
          padding: '1rem',
        }}
      >
        <h3
          style={{
            marginTop: 0,
          }}
        >
          🎯 URL Structure
        </h3>
        <ul
          style={{
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            marginBottom: 0,
          }}
        >
          <li>
            <code>/errors</code> - This demo page (prerendered)
          </li>
          <li>
            <code>/errors/404</code> - Dynamic error page (SSR)
          </li>
          <li>
            <code>/errors/500</code> - Dynamic error page (SSR)
          </li>
          <li>
            <code>/errors/runtime</code> - Dynamic error page (SSR)
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
          }}
          to="/"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
