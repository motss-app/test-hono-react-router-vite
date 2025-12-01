import { hc } from 'hono/client';
import type { JSX } from 'react';
import { Link, useRevalidator } from 'react-router';

import type { ApiAppType } from '../apis/mod.ts';
import { Skeleton } from '../components/skeleton.tsx';
import type { Route } from './+types/hono-rpc.ts';

// Define the expected response type
interface HelloResponse {
  message: string;
  timestamp: string;
  server: string;
}

// Create properly typed RPC client with correct base URL
const client = hc<ApiAppType>('/api');

function meta(): Route.MetaDescriptors {
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

// Use loader for SSG/SSR data fetching
async function loader(): Promise<HelloResponse> {
  // During build time (SSG), we can't make HTTP requests to our own API
  // because the server isn't running. We should import the logic directly
  // or mock the data.
  if (import.meta.env.SSR && !import.meta.env.VITE_DENO_DEPLOYMENT_ID) {
    // Mock data for build time
    // We return empty strings to signal the component to render a Skeleton UI
    // instead of "Build Time" text. This prevents a flash of content.
    return {
      message: '',
      server: '',
      timestamp: '',
    };
  }

  // Use Hono RPC client properly
  const res = await client.rpc.hello.$get();

  if (res.ok) {
    return await res.json();
  }

  throw new Error(`HTTP error! status: ${res.status}`);
}

// Client loader runs on the browser.
// We set hydrate=true to force it to run on initial load, replacing the SSG mock data.
async function clientLoader(): Promise<HelloResponse> {
  const res = await client.rpc.hello.$get();

  if (res.ok) {
    return await res.json();
  }

  throw new Error(`HTTP error! status: ${res.status}`);
}

clientLoader.hydrate = true;

interface RpcResponseRowProps {
  className?: string;
  isLoading: boolean;
  label: string;
  value: string;
}

function RpcResponseRow({ className, isLoading, label, value }: RpcResponseRowProps): JSX.Element {
  return (
    <p
      className={`mb-2 text-slate-700 dark:text-slate-200 ${isLoading ? 'flex items-center' : ''}`}
    >
      <strong>{label}:&nbsp;</strong>
      <Skeleton
        className={className}
        isLoading={isLoading}
      >
        {value}
      </Skeleton>
    </p>
  );
}

function HonoRpcDemo({ loaderData }: Route.ComponentProps): JSX.Element {
  const { revalidate, state } = useRevalidator();
  // Show loading state if revalidating OR if we have the empty SSG mock data
  const isPreRendered = !loaderData.message;
  const isLoading = state === 'loading' || isPreRendered;
  const response = loaderData;

  const buttonText = isPreRendered
    ? 'Loading...'
    : {
        idle: 'Refresh RPC Data',
        loading: 'Refreshing...',
      }[state];

  return (
    <div className="font-sans p-8 min-h-screen space-y-24">
      <div className="my-4">
        <Link
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
          to="/"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">Hono RPC Demo</h1>
      <p className="text-xl mb-8 text-slate-600 dark:text-slate-300">
        Simple demo of calling a Hono endpoint from React Router using clientLoader.
      </p>

      <div className="border border-solid rounded-lg p-4 my-24">
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-slate-500 cursor-not-allowed text-slate-100'
              : 'bg-blue-800 hover:bg-blue-900 cursor-pointer text-white'
          }`}
          disabled={isLoading}
          onClick={revalidate}
          type="button"
        >
          {buttonText}
        </button>
      </div>

      <div className="border border-green-500 bg-green-900 dark:border-green-400 rounded-lg p-16">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
          RPC Response:
        </h2>
        <RpcResponseRow
          className="w-[10ch]"
          isLoading={isLoading}
          label="Message"
          value={response.message}
        />
        <RpcResponseRow
          className="w-[12ch]"
          isLoading={isLoading}
          label="Server"
          value={response.server}
        />
        <RpcResponseRow
          className="w-[24ch]"
          isLoading={isLoading}
          label="Timestamp"
          value={response.timestamp}
        />
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-4">
          ℹ️ This data was fetched using Hono RPC client (loader for initial, client for refresh)
        </p>
      </div>

      <div className="border border-indigo-500 bg-indigo-900 rounded-lg p-4 mb-4">
        <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white">
          API Information:
        </h2>
        <p className="mb-2 text-slate-700 dark:text-slate-200">
          <strong>Endpoint:</strong>{' '}
          <code className="border border-indigo-500 bg-indigo-100 dark:bg-indigo-800 dark:border-indigo-400 px-2 py-1 rounded text-sm">
            GET /api/rpc/hello
          </code>
        </p>
        <p className="mb-2 text-slate-700 dark:text-slate-200">
          <strong>Implementation:</strong>{' '}
          <code className="border border-indigo-500 bg-indigo-100 dark:bg-indigo-800 dark:border-indigo-400 px-2 py-1 rounded text-sm">
            app/apis/mod.ts
          </code>
        </p>
        <p className="text-slate-600 dark:text-slate-300">
          <strong>Description:</strong> Returns a greeting message with server timestamp
        </p>
      </div>

      <div className="text-slate-500 dark:text-slate-400 text-sm mt-8">
        <p className="mb-4">💡 This page demonstrates:</p>
        <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
          <li>
            <strong>Prerendered:</strong> Page structure is built at build time
          </li>
          <li>
            <strong>loader:</strong> RPC data is fetched at build time (SSG) or request time (SSR)
          </li>
          <li>
            <strong>Client Refresh:</strong> RPC data can be re-fetched after hydration
          </li>
          <li>
            <strong>Hono RPC:</strong> Type-safe API calls using hc() client
          </li>
        </ul>
        <p className="mt-4">🔄 Click "Refresh RPC Data" to fetch new data without page reload!</p>
      </div>
    </div>
  );
}

function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div className="font-sans p-8 min-h-screen">
      <div className="my-4">
        <Link
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
          to="/"
        >
          ← Back to Home
        </Link>
      </div>
      <div className="border border-red-500 bg-red-50 dark:bg-red-900 dark:border-red-400 rounded-lg p-4 mb-4 text-red-700 dark:text-red-300">
        <strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
      </div>
      <p className="text-slate-600 dark:text-slate-300">
        <a
          className="underline hover:text-slate-900 dark:hover:text-white"
          href="/hono-rpc"
        >
          Try reloading the page
        </a>
      </p>
    </div>
  );
}

export { clientLoader, ErrorBoundary, loader, meta };
export default HonoRpcDemo;
