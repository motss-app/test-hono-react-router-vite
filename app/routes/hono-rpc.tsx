import { create, props } from '@stylexjs/stylex';
import { hc } from 'hono/client';
import type { JSX, ReactNode } from 'react';
import { Link, useRevalidator } from 'react-router';

import type { ApiAppType } from '../apis/mod.ts';
import { Skeleton } from '../components/skeleton.tsx';
import { Text } from '../components/Text.tsx';
import { themeConditions, tokens } from '../styles/tokens.stylex.ts';
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
    marginBlockEnd: tokens.spacing2,
    marginBlockStart: tokens.spacing2,
  },
  apiInfoCard: {
    backgroundColor: '#312e81',
    borderColor: '#6366f1',
    borderRadius: tokens.borderRadiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    marginBottom: tokens.spacing4,
    padding: tokens.spacing4,
  },
  apiText: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.slate200,
      [themeConditions.dataThemeDark]: tokens.slate200,
      default: tokens.slate700,
    },
    marginBottom: tokens.spacing2,
  },
  backLinkContainer: {
    margin: `${tokens.spacing4} 0`,
  },
  button: {
    border: 'none',
    borderRadius: tokens.borderRadiusLg,
    fontWeight: tokens.fontWeightMedium,
    outline: 'none',
    padding: '0.75rem 1rem',
    transition: tokens.transitionColors,
    width: '100%',
  },
  buttonActive: {
    backgroundColor: {
      ':hover': '#1e3a8a',
      default: tokens.infoHover,
    },
    color: tokens.white,
    cursor: 'pointer',
  },
  buttonLoading: {
    backgroundColor: tokens.slate500,
    color: tokens.slate100,
    cursor: 'not-allowed',
  },
  codeBlock: {
    backgroundColor: {
      [themeConditions.prefersDarkMode]: '#3730a3',
      [themeConditions.dataThemeDark]: '#3730a3',
      default: '#e0e7ff',
    },
    borderColor: {
      [themeConditions.prefersDarkMode]: '#818cf8',
      [themeConditions.dataThemeDark]: '#818cf8',
      default: '#6366f1',
    },
    borderRadius: tokens.borderRadius,
    borderStyle: 'solid',
    borderWidth: '1px',
    fontFamily: 'monospace',
    fontSize: tokens.fontSizeSm,
    padding: '0.25rem 0.5rem',
  },
  errorBox: {
    backgroundColor: {
      [themeConditions.prefersDarkMode]: '#7f1d1d',
      [themeConditions.dataThemeDark]: '#7f1d1d',
      default: '#fef2f2',
    },
    borderColor: {
      [themeConditions.prefersDarkMode]: tokens.error,
      [themeConditions.dataThemeDark]: tokens.error,
      default: '#ef4444',
    },
    borderRadius: tokens.borderRadiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.prefersDarkMode]: '#fca5a5',
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: '#b91c1c',
    },
    marginBottom: tokens.spacing4,
    padding: tokens.spacing4,
  },
  h1: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.white,
      [themeConditions.dataThemeDark]: tokens.white,
      default: tokens.slate900,
    },
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing6,
  },
  h2: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.white,
      [themeConditions.dataThemeDark]: tokens.white,
      default: tokens.slate900,
    },
    fontSize: tokens.fontSize2xl,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacing4,
  },
  infoContainer: {
    color: tokens.slate500,
    fontSize: tokens.fontSizeSm,
  },
  infoPara: {
    marginBottom: tokens.spacing4,
  },
  infoText: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.slate300,
      [themeConditions.dataThemeDark]: tokens.slate300,
      default: tokens.slate600,
    },
    fontSize: tokens.fontSizeSm,
    marginTop: tokens.spacing4,
  },
  link: {
    ':hover': {
      color: tokens.infoHover,
    },
    color: {
      [themeConditions.prefersDarkMode]: '#60a5fa',
      [themeConditions.dataThemeDark]: '#60a5fa',
      default: tokens.info,
    },
    textDecoration: 'underline',
    transition: tokens.transitionColors,
  },
  list: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.slate300,
      [themeConditions.dataThemeDark]: tokens.slate300,
      default: tokens.slate600,
    },
    listStylePosition: 'inside',
    listStyleType: 'disc',
    marginBottom: tokens.spacing2,
    marginTop: tokens.spacing2,
  },
  p: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.slate300,
      [themeConditions.dataThemeDark]: tokens.slate300,
      default: tokens.slate600,
    },
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
  },
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing2,
    padding: tokens.spacing8,
  },
  refreshPara: {
    marginTop: tokens.spacing4,
  },
  responseCard: {
    backgroundColor: '#14532d',
    borderColor: {
      [themeConditions.prefersDarkMode]: '#4ade80',
      [themeConditions.dataThemeDark]: '#4ade80',
      default: '#22c55e',
    },
    borderRadius: tokens.borderRadiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    padding: tokens.spacing4,
  },
  retryLink: {
    color: {
      ':hover': {
        [themeConditions.prefersDarkMode]: tokens.white,
        [themeConditions.dataThemeDark]: tokens.white,
        default: tokens.slate900,
      },
    },
    textDecoration: 'underline',
  },
  row: {
    color: {
      [themeConditions.prefersDarkMode]: tokens.slate200,
      [themeConditions.dataThemeDark]: tokens.slate200,
      default: tokens.slate700,
    },
    marginBottom: tokens.spacing2,
  },
  rowLoading: {
    alignItems: 'center',
    display: 'flex',
  },
  skeletonAction: {
    borderRadius: tokens.borderRadiusLg,
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
