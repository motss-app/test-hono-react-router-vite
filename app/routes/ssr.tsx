import type { Route } from "./+types/ssr";
import { data } from "react-router";
import { getHonoContext } from '../context';

// This loader makes this page SSR - it runs on EVERY request
export async function loader({ request }: Route.LoaderArgs) {
  const startTime = performance.now();

  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, 100));

  // Fetch dynamic data on every request
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // Access data from Hono context via AsyncLocalStorage
  const honoContext = getHonoContext();

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  // Return response with custom header using data() for proper type inference
  return data({
    timestamp,
    userAgent,
    message: 'This page is rendered on the server on EVERY request!',
    renderTime: duration,
    // Include data from Hono context
    honoData: honoContext,
    serverRegion: honoContext?.serverRegion || 'unknown',
  }, {
    headers: {
      'X-Render-Time': duration,
    },
  });
}

// Add Server-Timing header using the custom header we set
export function headers({
  loaderHeaders,
  parentHeaders,
}: Route.HeadersArgs) {
  const renderTime = loaderHeaders.get('X-Render-Time') || '-1';
  const existing = parentHeaders.get('Server-Timing') || '';
  const newTiming = `ssr-loader;dur=${renderTime};desc="SSR Route Loader"`;

  parentHeaders.set(
    'Server-Timing',
    existing ? `${existing}, ${newTiming}` : newTiming
  );

  return parentHeaders;
}

export default function SSRPage({ loaderData }: Route.ComponentProps) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>SSR Page (Server-Side Rendered)</h1>
      <p style={{ color: '#666' }}>
        This page is rendered on the server for every request. Not pre-rendered (SSG), not client-only (CSR).
      </p>

      <div style={{
        borderColor: 'currentColor',
        borderRadius: '8px',
        borderWidth: '1px',
        marginBlockStart: '1rem',
        marginBlockEnd: '1rem',
        padding: '1rem',
      }}>
        <h2>Server Data:</h2>
        <p><strong>Timestamp:</strong> {loaderData.timestamp}</p>
        <p><strong>Render Time:</strong> {loaderData.renderTime}ms</p>
        <p><strong>Your User Agent:</strong> {loaderData.userAgent}</p>
        <p><strong>Message:</strong> {loaderData.message}</p>
      </div>

      {loaderData.honoData && (
        <div style={{
          borderColor: '#10b981',
          borderRadius: '8px',
          borderWidth: '1px',
          marginBlockEnd: '1rem',
          padding: '1rem',
        }}>
          <h2>Data from Hono Middleware:</h2>
          <p><strong>Server Region:</strong> {loaderData.serverRegion}</p>
          <p><strong>Server Timestamp:</strong> {loaderData.honoData.serverTimestamp}</p>
          <p><strong>Computed Value:</strong> {loaderData.honoData.computedValue}</p>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
            ℹ️ This data was computed in Hono middleware and passed to React Router via Hono's Context Storage (AsyncLocalStorage)
          </p>
        </div>
      )}

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
        <p>💡 Refresh this page - the timestamp will update because it's rendered on the server each time!</p>
        <p>⏱️ Check the <strong>Network tab → Response Headers → Server-Timing</strong> to see server render time</p>
        <p>🔄 This is different from:</p>
        <ul>
          <li><strong>SSG (/, /about):</strong> Pre-rendered at build time, served as static HTML</li>
          <li><strong>CSR:</strong> Rendered on the client with JavaScript</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a href="/" style={{ color: '#0066cc' }}>← Back to Home</a>
      </div>
    </div>
  );
}
