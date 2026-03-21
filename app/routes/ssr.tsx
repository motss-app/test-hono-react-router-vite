import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { data, Link } from 'react-router';

import { Text } from '../components/Text.tsx';
import { HonoContext } from '../router-context.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import type { Route } from './+types/ssr.ts';

const SIMULATION_DELAY_MS = 5;

const s = create({
  backLink: {
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
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  backLinkWrapper: {
    marginTop: '2rem',
  },
  cardAmber: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#78350f',
      default: '#fef3c7',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.amber200,
      default: '#fcd34d',
    },
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    marginBottom: '1.5rem',
    padding: '1.5rem',
  },
  cardIndigo: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#312e81',
      default: '#eef2ff',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: '#818cf8',
      default: '#6366f1',
    },
    borderRadius: '0.5rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    marginBottom: '1.5rem',
    padding: '1.5rem',
  },
  dataRow: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    marginBottom: '0.5rem',
  },
  footer: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.875rem',
    marginTop: '2rem',
  },
  footerPara: {
    marginBottom: '1rem',
  },
  h1: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    fontSize: '2.25rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1.5rem',
  },
  h2: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    fontSize: '1.5rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    marginBottom: '1rem',
  },
  h2Card: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
  },
  infoText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    fontSize: '0.875rem',
    marginTop: '1rem',
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
    padding: '2rem',
  },
});

/** This loader makes this page SSR - it runs on EVERY request */
export async function loader({ context, request }: Route.LoaderArgs) {
  const startTime = performance.now();

  // Simulate some async work
  await new Promise(resolve => setTimeout(resolve, SIMULATION_DELAY_MS));

  // Fetch dynamic data on every request
  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  /**
   * Access data from Hono context via AsyncLocalStorage
   * Note: This has slight overhead compared to context.get(HonoContext)
   *
   * We cannot use ALS and Hono Context at the same time.
   * ALS comes with overhead. Hono context is just plain object.
   */
  // const honoContext = getHonoContext();

  /**
   * Access data from Hono context via loadContext (passed from handler)
   * We cast context to AppLoadContext because React Router v7 infers RouterContextProvider
   * when middleware is enabled.
   */
  const honoVars = context.get(HonoContext) as HonoEnv['Variables'] | undefined;
  const requestId = honoVars?.honoData?.meta?.requestId;

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  // Return response with custom header using data() for proper type inference
  return data(
    {
      // Include data from Hono context
      // honoContext,
      honoVars: honoVars?.honoData,
      message: 'This page is rendered on the server on EVERY request!',
      renderTime: duration,
      timestamp,
      userAgent,
    },
    {
      headers: {
        'X-Render-Time': duration,
        ...(requestId
          ? {
              'X-Request-Id': requestId,
            }
          : {}),
      },
    }
  );
}

// Add Server-Timing header using the custom header we set
export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const renderTime = loaderHeaders.get('X-Render-Time') ?? '-1';

  parentHeaders.append('Server-Timing', `ssr-loader;dur=${renderTime}`);

  // Forward X-Request-Id from loader headers to the response
  const requestId = loaderHeaders.get('X-Request-Id');
  if (requestId) {
    parentHeaders.set('X-Request-Id', requestId);
  }

  return parentHeaders;
}

export default function SsrPage({ loaderData }: Route.ComponentProps): JSX.Element {
  return (
    <div {...props(s.page)}>
      <div {...props(s.backLinkWrapper)}>
        <Link
          to="/"
          {...props(s.backLink)}
        >
          ← Back to Home
        </Link>
      </div>

      <Text
        as="h1"
        {...props(s.h1)}
      >
        SSR Page (Server-Side Rendered)
      </Text>
      <Text {...props(s.p)}>
        This page is rendered on the server for every request. Not pre-rendered (SSG), not
        client-only (CSR).
      </Text>

      <div {...props(s.cardAmber)}>
        <Text
          as="h2"
          {...props(s.h2, s.h2Card)}
        >
          Server Data:
        </Text>
        <Text {...props(s.dataRow)}>
          <strong>Timestamp:</strong> {loaderData.timestamp}
        </Text>
        <Text {...props(s.dataRow)}>
          <strong>Render Time:</strong> {loaderData.renderTime}ms
        </Text>
        <Text {...props(s.dataRow)}>
          <strong>Your User Agent:</strong> {loaderData.userAgent}
        </Text>
        <Text {...props(s.dataRow)}>
          <strong>Message:</strong> {loaderData.message}
        </Text>
      </div>

      {loaderData.honoVars ? (
        <div {...props(s.cardIndigo)}>
          <Text
            as="h2"
            {...props(s.h2, s.h2Card)}
          >
            Data from Hono Context (via RouterContextProvider)
          </Text>
          <Text {...props(s.dataRow)}>
            <strong>Request URL:</strong> {loaderData.honoVars.meta.requestUrl}
          </Text>
          {loaderData.honoVars.meta.requestId ? (
            <Text {...props(s.dataRow)}>
              <strong>Hono Meta Request ID:</strong> {loaderData.honoVars.meta.requestId}
            </Text>
          ) : null}
          <Text {...props(s.infoText)}>
            ℹ️ This data was passed directly via the Hono context object (`c`) to the React Router
            loader through `RouterContextProvider`.
          </Text>
        </div>
      ) : null}

      <div {...props(s.footer)}>
        <p {...props(s.footerPara)}>
          💡 Refresh this page - the timestamp will update because it's rendered on the server each
          time!
        </p>
        <p {...props(s.footerPara)}>
          ⏱️ Check the <strong>Network tab → Response Headers → Server-Timing</strong> to see server
          render time
        </p>
        <p {...props(s.footerPara)}>🔄 This is different from:</p>
        <ul {...props(s.list)}>
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
