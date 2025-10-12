import { hc } from 'hono/client';
import type { JSX } from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import type { ApiAppType } from '../apis/mod.ts';
import type { Route } from './+types/hono-rpc.ts';

// Define the expected response type
interface HelloResponse {
  message: string;
  timestamp: string;
  server: string;
}

// Create properly typed RPC client with correct base URL
const client = hc<ApiAppType>('/api');

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Hono RPC Demo',
    },
    {
      content: 'Simple Hono RPC demo',
      name: 'description',
    },
  ];
}

export async function clientLoader(): Promise<HelloResponse> {
  // Use Hono RPC client properly
  const res = await client.rpc.hello.$get();

  if (res.ok) {
    return await res.json();
  }

  throw new Error(`HTTP error! status: ${res.status}`);
}

export default function HonoRpcDemo({ loaderData }: Route.ComponentProps): JSX.Element {
  const [response, setResponse] = useState<HelloResponse>(loaderData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await client.rpc.hello.$get();

      if (res.ok) {
        const data: HelloResponse = await res.json();
        setResponse(data);
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        fontFamily: 'system-ui',
        padding: '2rem',
      }}
    >
      <nav
        style={{
          marginBottom: '1rem',
        }}
      >
        <Link
          style={{
            color: '#0066cc',
            textDecoration: 'underline',
          }}
          to="/"
        >
          ← Back to Home
        </Link>
      </nav>

      <h1>Hono RPC Demo</h1>
      <p
        style={{
          color: '#666',
        }}
      >
        Simple demo of calling a Hono endpoint from React Router using clientLoader.
      </p>

      <div
        style={{
          borderColor: 'currentColor',
          borderRadius: '8px',
          borderWidth: '1px',
          marginBlockEnd: '1rem',
          marginBlockStart: '1rem',
          padding: '1rem',
        }}
      >
        <button
          disabled={loading}
          onClick={handleRefresh}
          style={{
            backgroundColor: loading ? '#64748b' : '#1e40af',
            border: 'none',
            borderRadius: '8px',
            color: '#e2e8f0',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            padding: '0.75rem',
            width: '100%',
          }}
          type="button"
        >
          {loading ? 'Refreshing...' : 'Refresh RPC Data'}
        </button>
      </div>

      {error && (
        <div
          style={{
            borderColor: '#ef4444',
            borderRadius: '8px',
            borderWidth: '1px',
            color: '#dc2626',
            marginBlockEnd: '1rem',
            padding: '1rem',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div
          style={{
            borderColor: '#10b981',
            borderRadius: '8px',
            borderWidth: '1px',
            marginBlockEnd: '1rem',
            padding: '1rem',
          }}
        >
          <h2>RPC Response:</h2>
          <p>
            <strong>Message:</strong> {response.message}
          </p>
          <p>
            <strong>Server:</strong> {response.server}
          </p>
          <p>
            <strong>Timestamp:</strong> {response.timestamp}
          </p>
          <p
            style={{
              color: '#666',
              fontSize: '0.875rem',
              marginTop: '0.5rem',
            }}
          >
            ℹ️ This data was fetched using Hono RPC client after page hydration
          </p>
        </div>
      )}

      <div
        style={{
          borderColor: '#6366f1',
          borderRadius: '8px',
          borderWidth: '1px',
          marginBlockEnd: '1rem',
          padding: '1rem',
        }}
      >
        <h2>API Information:</h2>
        <p>
          <strong>Endpoint:</strong>{' '}
          <code
            style={{
              border: '1px solid #6366f1',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
            }}
          >
            GET /api/rpc/hello
          </code>
        </p>
        <p>
          <strong>Implementation:</strong>{' '}
          <code
            style={{
              border: '1px solid #6366f1',
              borderRadius: '4px',
              padding: '0.25rem 0.5rem',
            }}
          >
            app/apis/mod.ts
          </code>
        </p>
        <p>
          <strong>Description:</strong> Returns a greeting message with server timestamp
        </p>
      </div>

      <div
        style={{
          color: '#999',
          fontSize: '0.9rem',
          marginTop: '2rem',
        }}
      >
        <p>💡 This page demonstrates:</p>
        <ul>
          <li>
            <strong>Prerendered:</strong> Page structure is built at build time
          </li>
          <li>
            <strong>clientLoader:</strong> RPC data is fetched after hydration in the browser
          </li>
          <li>
            <strong>Hono RPC:</strong> Type-safe API calls using hc() client
          </li>
        </ul>
        <p>🔄 Click "Refresh RPC Data" to fetch new data without page reload!</p>
      </div>
    </div>
  );
}
