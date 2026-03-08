import { create, props } from '@stylexjs/stylex';
import { hc } from 'hono/client';
import type { JSX, ReactNode } from 'react';
import { Link, useRevalidator } from 'react-router';

import type { ApiAppType } from '../apis/mod.ts';
import { Skeleton } from '../components/skeleton.tsx';
import { tokens } from '../styles/tokens.stylex.ts';
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

const s = create({
  actionContainer: {
    borderColor: 'currentColor', // default border
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    margin: `${tokens.spacing24} 0`,
    padding: tokens.spacing4,
  },
  apiInfoCard: {
    backgroundColor: '#312e81', // bg-indigo-900
    borderColor: '#6366f1', // border-indigo-500
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: tokens.spacing4,
    padding: tokens.spacing4,
  },
  apiText: {
    color: {
      '@media (prefers-color-scheme: dark)': '#e2e8f0', // text-slate-200
      default: '#334155', // text-slate-700
    },
    marginBottom: tokens.spacing2,
  },
  backLinkContainer: {
    margin: `${tokens.spacing4} 0`,
  },
  button: {
    border: 'none',
    borderRadius: '0.5rem', // rounded-lg
    fontWeight: tokens.fontWeightMedium,
    outline: 'none',
    padding: '0.75rem 1rem', // py-3 px-4
    transition: tokens.transitionColors,
    width: '100%',
  },
  buttonActive: {
    backgroundColor: {
      ':hover': '#1e3a8a', // hover:bg-blue-900
      default: '#1e40af', // bg-blue-800
    },
    color: '#ffffff', // text-white
    cursor: 'pointer',
  },
  buttonLoading: {
    backgroundColor: '#64748b', // bg-slate-500
    color: '#f1f5f9', // text-slate-100
    cursor: 'not-allowed',
  },
  codeBlock: {
    backgroundColor: {
      '@media (prefers-color-scheme: dark)': '#3730a3', // dark:bg-indigo-800
      default: '#e0e7ff', // bg-indigo-100
    },
    borderColor: {
      '@media (prefers-color-scheme: dark)': '#818cf8', // dark:border-indigo-400
      default: '#6366f1', // border-indigo-500
    },
    borderRadius: '0.25rem', // rounded
    borderStyle: 'solid',
    borderWidth: '1px',
    fontFamily: 'monospace',
    fontSize: '0.875rem', // text-sm
    padding: '0.25rem 0.5rem', // px-2 py-1
  },
  errorBox: {
    backgroundColor: {
      '@media (prefers-color-scheme: dark)': '#7f1d1d', // dark:bg-red-900
      default: '#fef2f2', // bg-red-50
    },
    borderColor: {
      '@media (prefers-color-scheme: dark)': '#f87171', // dark:border-red-400
      default: '#ef4444', // border-red-500
    },
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      '@media (prefers-color-scheme: dark)': '#fca5a5', // dark:text-red-300
      default: '#b91c1c', // text-red-700
    },
    marginBottom: tokens.spacing4,
    padding: tokens.spacing4,
  },
  h1: {
    color: {
      '@media (prefers-color-scheme: dark)': '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: '1.5rem', // mb-6
  },
  h2: {
    color: {
      '@media (prefers-color-scheme: dark)': '#ffffff', // text-white
      default: '#0f172a', // text-slate-900
    },
    fontSize: '1.5rem', // text-2xl
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacing4,
  },
  infoContainer: {
    color: '#64748b', // text-slate-500
    fontSize: '0.875rem', // text-sm
    marginTop: tokens.spacing8,
  },
  infoPara: {
    marginBottom: tokens.spacing4,
  },
  infoText: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    fontSize: '0.875rem', // text-sm
    marginTop: tokens.spacing4,
  },
  link: {
    color: {
      ':hover': '#1e40af', // hover:text-blue-800
      '@media (prefers-color-scheme: dark)': {
        ':hover': '#93c5fd', // hover:text-blue-300
        default: '#60a5fa', // text-blue-400
      },
      default: '#2563eb', // text-blue-600
    },
    textDecoration: 'underline',
    transition: tokens.transitionColors,
  },
  list: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    listStylePosition: 'inside',
    listStyleType: 'disc',
    marginBottom: tokens.spacing2, // space-y-2
    marginTop: tokens.spacing2,
  },
  p: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: tokens.fontSans,
    gap: tokens.spacing24,
    minHeight: '100vh',
    padding: tokens.spacing8,
  },
  refreshPara: {
    marginTop: tokens.spacing4,
  },
  responseCard: {
    backgroundColor: {
      default: '#14532d', // bg-green-900 (Wait, original was bg-green-900? Let's check. Yes.)
      // dark mode wasn't specified for bg, so it uses same.
    },
    borderColor: {
      '@media (prefers-color-scheme: dark)': '#4ade80', // dark:border-green-400
      default: '#22c55e', // border-green-500
    },
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: tokens.spacing16,
  },
  retryLink: {
    color: {
      ':hover': {
        '@media (prefers-color-scheme: dark)': '#ffffff', // dark:hover:text-white
        default: '#0f172a', // hover:text-slate-900
      },
    },
    textDecoration: 'underline',
  },
  row: {
    color: {
      '@media (prefers-color-scheme: dark)': '#e2e8f0', // text-slate-200
      default: '#334155', // text-slate-700
    },
    marginBottom: tokens.spacing2,
  },
  rowLoading: {
    alignItems: 'center',
    display: 'flex',
  },
  skeletionAction: {
    borderRadius: '0.5rem', // rounded-lg
    height: '7.5rem', // h-30 (30 * 0.25rem = 7.5rem)
    width: '100%',
  },
});

interface RpcResponseRowProps {
  className?: string; // Expecting StyleX class name string if passed, but typically props spread
  style?: Readonly<{
    [key: string]: string | number;
  }>; // Allow passing styles
  isLoading: boolean;
  label: string;
  value: string;
}

function RpcResponseRow({ style, isLoading, label, value }: RpcResponseRowProps): JSX.Element {
  return (
    <p {...props(s.row, isLoading && s.rowLoading)}>
      <strong>{label}:&nbsp;</strong>
      <Skeleton
        isLoading={isLoading}
        style={style}
      >
        {value}
      </Skeleton>
    </p>
  );
}

interface HonoRpcViewProps {
  action: ReactNode;
  isLoading: boolean;
  response: HelloResponse;
}

function HonoRpcView({ action, isLoading, response }: HonoRpcViewProps): JSX.Element {
  return (
    <div {...props(s.page)}>
      <div {...props(s.backLinkContainer)}>
        <Link
          to="/"
          {...props(s.link)}
        >
          ← Back to Home
        </Link>
      </div>

      <h1 {...props(s.h1)}>Hono RPC Demo</h1>
      <p {...props(s.p)}>
        Simple demo of calling a Hono endpoint from React Router using clientLoader.
      </p>

      <div {...props(s.actionContainer)}>{action}</div>

      <div {...props(s.responseCard)}>
        <h2 {...props(s.h2)}>RPC Response:</h2>
        <RpcResponseRow
          isLoading={isLoading}
          label="Message"
          style={{
            width: '10ch',
          }}
          value={response.message}
        />
        <RpcResponseRow
          isLoading={isLoading}
          label="Server"
          style={{
            width: '12ch',
          }}
          value={response.server}
        />
        <RpcResponseRow
          isLoading={isLoading}
          label="Timestamp"
          style={{
            width: '24ch',
          }}
          value={response.timestamp}
        />
        <p {...props(s.infoText)}>
          ℹ️ This data was fetched using Hono RPC client (loader for initial, client for refresh)
        </p>
      </div>

      <div {...props(s.apiInfoCard)}>
        <h2 {...props(s.h2)}>API Information:</h2>
        <p {...props(s.apiText)}>
          <strong>Endpoint:</strong> <code {...props(s.codeBlock)}>GET /api/rpc/hello</code>
        </p>
        <p {...props(s.apiText)}>
          <strong>Implementation:</strong> <code {...props(s.codeBlock)}>app/apis/mod.ts</code>
        </p>
        <p {...props(s.apiText)}>
          <strong>Description:</strong> Returns a greeting message with server timestamp
        </p>
      </div>

      <div {...props(s.infoContainer)}>
        <p {...props(s.infoPara)}>💡 This page demonstrates:</p>
        <ul {...props(s.list)}>
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
        <p {...props(s.refreshPara)}>
          🔄 Click "Refresh RPC Data" to fetch new data without page reload!
        </p>
      </div>
    </div>
  );
}

function HydrateFallback(): JSX.Element {
  return (
    <HonoRpcView
      action={
        <Skeleton
          isLoading
          {...props(s.skeletionAction)}
        />
      }
      isLoading
      response={{
        message: '',
        server: '',
        timestamp: '',
      }}
    />
  );
}

function HonoRpcDemo({ loaderData }: Route.ComponentProps): JSX.Element {
  const { revalidate, state } = useRevalidator();
  const isLoading = state === 'loading';
  const buttonText = isLoading ? 'Refreshing...' : 'Refresh RPC Data';

  return (
    <HonoRpcView
      action={
        <button
          disabled={isLoading}
          onClick={revalidate}
          type="button"
          {...props(s.button, isLoading ? s.buttonLoading : s.buttonActive)}
        >
          {buttonText}
        </button>
      }
      isLoading={isLoading}
      response={loaderData}
    />
  );
}

function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <div {...props(s.page)}>
      <div {...props(s.backLinkContainer)}>
        <Link
          to="/"
          {...props(s.link)}
        >
          ← Back to Home
        </Link>
      </div>
      <div {...props(s.errorBox)}>
        <strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}
      </div>
      <p {...props(s.infoText)}>
        <a
          href="/hono-rpc"
          {...props(s.retryLink)}
        >
          Try reloading the page
        </a>
      </p>
    </div>
  );
}

export { clientLoader, ErrorBoundary, HydrateFallback, loader, meta };
export default HonoRpcDemo;
