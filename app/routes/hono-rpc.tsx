import { create, props } from '@stylexjs/stylex';
import { hc } from 'hono/client';
import type { JSX, ReactNode } from 'react';
import { Link, useRevalidator } from 'react-router';

import type { ApiAppType } from '../apis/mod.ts';
import { Skeleton } from '../components/skeleton.tsx';
import { Text } from '../components/Text.tsx';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
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
    marginBlockEnd: '0.5rem',
    marginBlockStart: '0.5rem',
  },
  apiInfoCard: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#312e81',
      default: '#eef2ff',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: '#a5b4fc',
      default: '#6366f1',
    },
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: '1rem',
    padding: '1rem',
  },
  apiText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate800,
    },
    marginBottom: '0.5rem',
  },
  backLinkContainer: {
    margin: '1rem 0',
  },
  button: {
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: fontWeightTokens.fontWeightMedium,
    outline: 'none',
    padding: '0.75rem 1rem',
    transition: 'color 0.15s ease-in-out',
    width: '100%',
  },
  buttonActive: {
    backgroundColor: {
      ':hover': '#1e3a8a',
      default: colorTokens.infoHover,
    },
    color: colorTokens.white,
    cursor: 'pointer',
  },
  buttonLoading: {
    backgroundColor: colorTokens.slate500,
    color: colorTokens.slate100,
    cursor: 'not-allowed',
  },
  codeBlock: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#3730a3',
      default: '#e0e7ff',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: '#818cf8',
      default: '#6366f1',
    },
    borderRadius: '0.25rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    padding: '0.25rem 0.5rem',
  },
  errorBox: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#7f1d1d',
      default: '#fef2f2',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.error,
      default: '#ef4444',
    },
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#b91c1c',
    },
    marginBottom: '1rem',
    padding: '1rem',
  },
  h1: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '2.25rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1.5rem',
  },
  h2: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.5rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    marginBottom: '1rem',
  },
  infoContainer: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.875rem',
  },
  infoPara: {
    marginBottom: '1rem',
  },
  infoText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    fontSize: '0.875rem',
    marginTop: '1rem',
  },
  link: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#bfdbfe',
        default: colorTokens.infoHover,
      },
    },
    color: {
      [themeConditions.dataThemeDark]: '#93c5fd',
      default: colorTokens.info,
    },
    textDecoration: 'underline',
    transition: 'color 0.15s ease-in-out',
  },
  list: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    listStylePosition: 'inside',
    listStyleType: 'disc',
    marginBottom: '0.5rem',
    marginTop: '0.5rem',
  },
  p: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    fontSize: '1.25rem',
    marginBottom: '2rem',
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '2rem',
  },
  refreshPara: {
    marginTop: '1rem',
  },
  responseCard: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#14532d',
      default: '#ecfdf5',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: '#4ade80',
      default: '#22c55e',
    },
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: '1rem',
  },
  retryLink: {
    color: {
      ':hover': {
        [themeConditions.dataThemeDark]: colorTokens.white,
        default: colorTokens.slate900,
      },
    },
    textDecoration: 'underline',
  },
  row: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    marginBottom: '0.5rem',
  },
  rowLoading: {
    alignItems: 'center',
    display: 'flex',
  },
  skeletonAction: {
    borderRadius: '0.5rem',
    height: '7.5rem',
    width: '100%',
  },
});

interface RpcResponseRowProps {
  className?: string;
  isLoading: boolean;
  label: string;
  styles?: Readonly<{
    [key: string]: string | number;
  }>;
  value: string;
}

function RpcResponseRow({ isLoading, label, styles, value }: RpcResponseRowProps): JSX.Element {
  return (
    <Text {...props(s.row, isLoading && s.rowLoading)}>
      <strong>{label}:&nbsp;</strong>
      <Skeleton
        isLoading={isLoading}
        styles={styles}
      >
        {value}
      </Skeleton>
    </Text>
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

      <Text
        as="h1"
        {...props(s.h1)}
      >
        Hono RPC Demo
      </Text>
      <Text {...props(s.p)}>
        Simple demo of calling a Hono endpoint from React Router using clientLoader.
      </Text>

      <div {...props(s.actionContainer)}>{action}</div>

      <div {...props(s.responseCard)}>
        <Text
          as="h2"
          {...props(s.h2)}
        >
          RPC Response:
        </Text>
        <RpcResponseRow
          isLoading={isLoading}
          label="Message"
          styles={{
            width: '10ch',
          }}
          value={response.message}
        />
        <RpcResponseRow
          isLoading={isLoading}
          label="Server"
          styles={{
            width: '12ch',
          }}
          value={response.server}
        />
        <RpcResponseRow
          isLoading={isLoading}
          label="Timestamp"
          styles={{
            width: '24ch',
          }}
          value={response.timestamp}
        />
        <Text {...props(s.infoText)}>
          ℹ️ This data was fetched using Hono RPC client (loader for initial, client for refresh)
        </Text>
      </div>

      <div {...props(s.apiInfoCard)}>
        <Text
          as="h2"
          {...props(s.h2)}
        >
          API Information:
        </Text>
        <Text {...props(s.apiText)}>
          <strong>Endpoint:</strong> <code {...props(s.codeBlock)}>GET /api/rpc/hello</code>
        </Text>
        <Text {...props(s.apiText)}>
          <strong>Implementation:</strong> <code {...props(s.codeBlock)}>app/apis/mod.ts</code>
        </Text>
        <Text {...props(s.apiText)}>
          <strong>Description:</strong> Returns a greeting message with server timestamp
        </Text>
      </div>

      <div {...props(s.infoContainer)}>
        <Text {...props(s.infoPara)}>💡 This page demonstrates:</Text>
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
        <Text {...props(s.refreshPara)}>
          🔄 Click "Refresh RPC Data" to fetch new data without page reload!
        </Text>
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
          {...props(s.skeletonAction)}
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
      <Text {...props(s.infoText)}>
        <a
          href="/hono-rpc"
          {...props(s.retryLink)}
        >
          Try reloading the page
        </a>
      </Text>
    </div>
  );
}

export { clientLoader, ErrorBoundary, HydrateFallback, loader, meta };
export default HonoRpcDemo;
