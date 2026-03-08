import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { data, Link } from 'react-router';

import { Text } from '../components/Text.tsx';
import { HonoContext } from '../router-context.ts';
import { tokens } from '../styles/tokens.stylex.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import type { Route } from './+types/ssr.ts';

const SIMULATION_DELAY_MS = 5;

const s = create({
  backLink: {
    ':hover': {
      color: tokens.infoHover,
    },
    color: {
      '@media (prefers-color-scheme: dark)': '#60a5fa',
      default: tokens.info,
    },
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  backLinkWrapper: {
    marginTop: tokens.spacing8,
  },
  cardAmber: {
    backgroundColor: '#fef3c7',
    borderColor: tokens.amber200,
    borderRadius: tokens.borderRadiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    color: tokens.slate900,
    marginBottom: tokens.spacing6,
    padding: tokens.spacing6,
  },
  cardIndigo: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
    borderRadius: tokens.borderRadiusLg,
    borderStyle: 'solid',
    borderWidth: '1px',
    color: tokens.slate900,
    marginBottom: tokens.spacing6,
    padding: tokens.spacing6,
  },
  dataRow: {
    color: tokens.slate700,
    marginBottom: tokens.spacing2,
  },
  footer: {
    color: {
      '@media (prefers-color-scheme: dark)': tokens.slate400,
      default: tokens.slate500,
    },
    fontSize: tokens.fontSizeSm,
    marginTop: tokens.spacing8,
  },
  footerPara: {
    marginBottom: tokens.spacing4,
  },
  h1: {
    color: {
      '@media (prefers-color-scheme: dark)': tokens.slate300,
      default: tokens.slate400,
    },
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing6,
  },
  h2: {
    color: {
      '@media (prefers-color-scheme: dark)': tokens.slate300,
      default: tokens.slate400,
    },
    fontSize: tokens.fontSize2xl,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacing4,
  },
  h2Card: {
    color: tokens.slate500,
  },
  infoText: {
    color: tokens.slate600,
    fontSize: tokens.fontSizeSm,
    marginTop: tokens.spacing4,
  },
  list: {
    color: {
      '@media (prefers-color-scheme: dark)': tokens.slate300,
      default: tokens.slate600,
    },
    listStylePosition: 'inside',
    listStyleType: 'disc',
    marginBottom: tokens.spacing2,
    marginTop: tokens.spacing2,
  },
  p: {
    color: {
      '@media (prefers-color-scheme: dark)': tokens.slate400,
      default: tokens.slate600,
    },
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
  },
  page: {
    padding: tokens.spacing8,
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
