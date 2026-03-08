import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { data, Link } from 'react-router';

// import { getHonoContext } from '../context.ts';
import { HonoContext } from '../router-context.ts';
import { tokens } from '../styles/tokens.stylex.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import type { Route } from './+types/ssr.ts';

// Constants
const SIMULATION_DELAY_MS = 5;

const s = create({
  backLink: {
    color: {
      ':hover': '#1e40af', // hover:text-blue-800
      '@media (prefers-color-scheme: dark)': {
        ':hover': '#93c5fd', // hover:text-blue-300
        default: '#60a5fa', // text-blue-400
      },
      default: '#2563eb', // text-blue-600
    },
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  backLinkWrapper: {
    marginTop: tokens.spacing8,
  },
  cardAmber: {
    backgroundColor: '#fef3c7', // bg-amber-100
    borderColor: '#fde68a', // border-amber-200
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    color: '#0f172a', // text-slate-900 (for readability on amber)
    marginBottom: '1.5rem', // mb-6
    padding: '1.5rem', // p-6
  },
  cardIndigo: {
    backgroundColor: '#eef2ff', // bg-indigo-50
    borderColor: '#6366f1', // border-indigo-500
    borderRadius: '0.5rem', // rounded-lg
    borderStyle: 'solid',
    borderWidth: '1px',
    color: '#0f172a', // text-slate-900
    marginBottom: '1.5rem', // mb-6
    padding: '1.5rem', // p-6
  },
  dataRow: {
    color: '#334155', // text-slate-700
    marginBottom: tokens.spacing2,
  },
  footer: {
    color: {
      '@media (prefers-color-scheme: dark)': '#94a3b8', // text-slate-400
      default: '#64748b', // text-slate-500
    },
    fontSize: '0.875rem', // text-sm
    marginTop: tokens.spacing8,
  },
  footerPara: {
    marginBottom: tokens.spacing4,
  },
  h1: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#94a3b8', // text-slate-400
    },
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: '1.5rem', // mb-6
  },
  h2: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#94a3b8', // text-slate-400
    },
    fontSize: '1.5rem', // text-2xl
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacing4,
  },
  h2Card: {
    color: '#64748b', // text-slate-500
  },
  infoText: {
    color: '#475569', // text-slate-600
    fontSize: '0.875rem', // text-sm
    marginTop: tokens.spacing4,
  },
  list: {
    color: {
      '@media (prefers-color-scheme: dark)': '#cbd5e1', // text-slate-300
      default: '#475569', // text-slate-600
    },
    listStylePosition: 'inside',
    listStyleType: 'disc',
    marginBottom: tokens.spacing2,
    marginTop: tokens.spacing2,
  },
  p: {
    color: {
      '@media (prefers-color-scheme: dark)': '#94a3b8', // text-slate-400
      default: '#475569', // text-slate-600
    },
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
  },
  page: {
    fontFamily: tokens.fontSans,
    minHeight: '100vh',
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

      <h1 {...props(s.h1)}>SSR Page (Server-Side Rendered)</h1>
      <p {...props(s.p)}>
        This page is rendered on the server for every request. Not pre-rendered (SSG), not
        client-only (CSR).
      </p>

      <div {...props(s.cardAmber)}>
        <h2 {...props(s.h2, s.h2Card)}>Server Data:</h2>
        <p {...props(s.dataRow)}>
          <strong>Timestamp:</strong> {loaderData.timestamp}
        </p>
        <p {...props(s.dataRow)}>
          <strong>Render Time:</strong> {loaderData.renderTime}ms
        </p>
        <p {...props(s.dataRow)}>
          <strong>Your User Agent:</strong> {loaderData.userAgent}
        </p>
        <p {...props(s.dataRow)}>
          <strong>Message:</strong> {loaderData.message}
        </p>
      </div>

      {loaderData.honoVars ? (
        <div {...props(s.cardIndigo)}>
          <h2 {...props(s.h2, s.h2Card)}>Data from Hono Context (via RouterContextProvider)</h2>
          <p {...props(s.dataRow)}>
            <strong>Request URL:</strong> {loaderData.honoVars.meta.requestUrl}
          </p>
          {loaderData.honoVars.meta.requestId ? (
            <p {...props(s.dataRow)}>
              <strong>Hono Meta Request ID:</strong> {loaderData.honoVars.meta.requestId}
            </p>
          ) : null}
          <p {...props(s.infoText)}>
            ℹ️ This data was passed directly via the Hono context object (`c`) to the React Router
            loader through `RouterContextProvider`.
          </p>
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
