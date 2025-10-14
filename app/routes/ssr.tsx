import type { JSX } from 'react';
import { data, Link } from 'react-router';

import { getHonoContext } from '../context.ts';
import type { Route } from './+types/ssr.ts';

// Constants
const SIMULATION_DELAY_MS = 100;

// This loader makes this page SSR - it runs on EVERY request
export async function loader({ request }: Route.LoaderArgs) {
  const startTime = performance.now();

  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, SIMULATION_DELAY_MS));

  // Fetch dynamic data on every request
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  // Access data from Hono context via AsyncLocalStorage
  const honoContext = getHonoContext();

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  // Return response with custom header using data() for proper type inference
  return data(
    {
      // Include data from Hono context
      honoData: honoContext,
      message: 'This page is rendered on the server on EVERY request!',
      renderTime: duration,
      timestamp,
      userAgent,
    },
    {
      headers: {
        'X-Render-Time': duration,
      },
    }
  );
}

// Add Server-Timing header using the custom header we set
export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const renderTime = loaderHeaders.get('X-Render-Time') || '-1';
  const newTiming = `ssr-loader;dur=${renderTime};desc="SSR Route Loader"`;

  parentHeaders.append('Server-Timing', newTiming);

  return parentHeaders;
}

export default function SsrPage({ loaderData }: Route.ComponentProps): JSX.Element {
  return (
    <div className="p-8 min-h-screen">
      <div className="mt-8">
        <Link
          className="text-blue-600 hover:text-blue-800 transition-colors"
          to="/"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-slate-400">SSR Page (Server-Side Rendered)</h1>
      <p className="text-xl mb-8 text-slate-600">
        This page is rendered on the server for every request. Not pre-rendered (SSG), not
        client-only (CSR).
      </p>

      <div className="border border-amber-200 bg-amber-100 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-slate-400">Server Data:</h2>
        <p className="mb-2 text-slate-700">
          <strong>Timestamp:</strong> {loaderData.timestamp}
        </p>
        <p className="mb-2 text-slate-700">
          <strong>Render Time:</strong> {loaderData.renderTime}ms
        </p>
        <p className="mb-2 text-slate-700">
          <strong>Your User Agent:</strong> {loaderData.userAgent}
        </p>
        <p className="mb-4 text-slate-700">
          <strong>Message:</strong> {loaderData.message}
        </p>
      </div>

      {loaderData.honoData && (
        <div className="border border-green-500 bg-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-slate-400">Data from Hono Middleware:</h2>
          <p className="mb-2 text-slate-700">
            <strong>Server Timestamp:</strong> {loaderData.honoData.serverTimestamp}
          </p>
          <p className="mb-2 text-slate-700">
            <strong>Computed Value:</strong> {loaderData.honoData.computedValue}
          </p>
          <p className="text-slate-600 text-sm mt-4">
            ℹ️ This data was computed in Hono middleware and passed to React Router via Hono's
            Context Storage (AsyncLocalStorage)
          </p>
        </div>
      )}

      <div className="text-slate-500 text-sm mt-8">
        <p className="mb-4">
          💡 Refresh this page - the timestamp will update because it's rendered on the server each
          time!
        </p>
        <p className="mb-4">
          ⏱️ Check the <strong>Network tab → Response Headers → Server-Timing</strong> to see server
          render time
        </p>
        <p className="mb-4">🔄 This is different from:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-600">
          <li>
            <strong>SSG (/, /about):</strong> Pre-rendered at build time, served as static HTML
          </li>
          <li>
            <strong>CSR:</strong> Rendered on the client with JavaScript
          </li>
        </ul>
      </div>
    </div>
  );
}
