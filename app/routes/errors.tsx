import { Link } from 'react-router';
import type { Route } from "./+types/errors";

// This is now just a demo/index page that doesn't throw errors
// No loader needed - this page is prerendered at build time
export default function ErrorsDemo() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Error Handling Demo</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Click any link to trigger different types of errors via SSR and see how they're handled.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {[
          { code: '404', label: '404 Not Found', desc: 'Resource doesn\'t exist' },
          { code: '401', label: '401 Unauthorized', desc: 'Login required' },
          { code: '403', label: '403 Forbidden', desc: 'No permission' },
          { code: '500', label: '500 Server Error', desc: 'Server crashed' },
          { code: '502', label: '502 Bad Gateway', desc: 'Invalid response' },
          { code: '503', label: '503 Unavailable', desc: 'Service down' },
          { code: 'runtime', label: 'Runtime Error', desc: 'JavaScript error' },
        ].map(({ code, label, desc }) => (
          <Link
            key={code}
            to={`/errors/${code}`}
            style={{
              display: 'block',
              padding: '1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{label}</div>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>{desc}</div>
          </Link>
        ))}
      </div>

      <div style={{
        border: '1px solid #ffc107',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '2rem',
      }}>
        <h3 style={{ marginTop: 0 }}>💡 How Error Handling Works</h3>
        <ul style={{ marginBottom: 0 }}>
          <li><strong>This page (/errors):</strong> Prerendered at build time as static HTML</li>
          <li><strong>Error routes (/errors/:code):</strong> Server-rendered dynamically on each request</li>
          <li><strong>Error boundaries:</strong> Catch and display errors from loaders</li>
          <li><strong>404 errors:</strong> Caught by the catch-all route</li>
          <li><strong>Runtime errors:</strong> Caught by React error boundaries</li>
        </ul>
      </div>

      <div style={{
        borderRadius: '8px',
        padding: '1rem',
      }}>
        <h3 style={{ marginTop: 0 }}>🎯 URL Structure</h3>
        <ul style={{ marginBottom: 0, fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <li><code>/errors</code> - This demo page (prerendered)</li>
          <li><code>/errors/404</code> - Dynamic error page (SSR)</li>
          <li><code>/errors/500</code> - Dynamic error page (SSR)</li>
          <li><code>/errors/runtime</code> - Dynamic error page (SSR)</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: '#0066cc' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
