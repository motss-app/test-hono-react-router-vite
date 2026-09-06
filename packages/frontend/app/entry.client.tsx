import { elementTimingIntegration } from '@sentry/browser';
import {
  addIntegration,
  captureMessage,
  flush,
  init,
  logger,
  reactRouterTracingIntegration,
  sentryOnError,
  setTag,
  startInactiveSpan,
  startSpan,
} from '@sentry/react-router/cloudflare';
import posthog from 'posthog-js';
import { StrictMode, startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import './polyfills/request-idle-callback.mjs';

import { logSentryEnvSnapshot } from '../../../vite-utils/sentry-env-log.ts';
import {
  applyAppSessionIdToSpan,
  appSessionIdTagName,
  getBrowserAppSessionId,
} from './monitoring/app-session.ts';
import { createBrowserSentryOptions, isDevelopmentSentryMode } from './monitoring/sentry.ts';

const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);
const browserTunnel = '/api/tunnel';
const browserDsn = import.meta.env.VITE_SENTRY_DSN;
// The browser always posts envelopes to the same-origin `/api/tunnel` endpoint first.
// In local development the BFF forwards those raw envelopes to Spotlight; deployed modes
// forward the same tunnel traffic to real Sentry ingest. That keeps browser traffic
// same-origin everywhere while preserving the local multi-worker trace story.
// Get the current app session ID for tagging Sentry events
const appSessionId = getBrowserAppSessionId();
const browserWindow = window as Window & {
  __appEntryClientLoadedAt__?: string;
};

let browserBootstrapSpanEnded = false;
let browserBootstrapSpan: ReturnType<typeof startInactiveSpan> | undefined;

function BrowserBootstrapSpanEnder(): null {
  useEffect(() => {
    if (browserBootstrapSpanEnded) {
      return;
    }

    browserBootstrapSpanEnded = true;
    browserBootstrapSpan?.end();
    browserBootstrapSpan = undefined;
  }, []);

  return null;
}

console.info(
  '[app/entry.client.tsx] Sentry env snapshot',
  logSentryEnvSnapshot({
    deploymentBuild: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    phase: 'browser',
    source: 'app/entry.client.tsx',
    values: {
      port: undefined,
      sentryAuthToken: undefined,
      sentryDsn: browserDsn,
      sentryRelease: import.meta.env.SENTRY_RELEASE,
      viteSentryDsn: import.meta.env.VITE_SENTRY_DSN,
    },
  })
);

// Keep the Framework Mode client instrumentation wiring for future React Router support.
// Sentry currently notes HydratedRouter doesn't invoke these hooks yet, but the official
// Framework Mode docs still show this setup, so we intentionally keep it here.
const tracing = reactRouterTracingIntegration();

init({
  ...createBrowserSentryOptions(import.meta.env.MODE, browserDsn, import.meta.env.SENTRY_RELEASE),
  beforeSendSpan: span => applyAppSessionIdToSpan(span, appSessionId),
  tunnel: browserTunnel,
  ...(appSessionId
    ? {
        initialScope: {
          tags: {
            [appSessionIdTagName]: appSessionId,
          },
        },
      }
    : {}),
  integrations: [
    //     'error',
    //     'debug',
    //   ],
    // }),
    tracing,
    elementTimingIntegration(),
  ],
});

// Set the app session ID tag on the active Sentry scope after initialization
if (appSessionId) {
  setTag(appSessionIdTagName, appSessionId);
}

if (isDevSentryMode) {
  const initializedAt = new Date().toISOString();

  browserWindow.__appEntryClientLoadedAt__ = initializedAt;

  console.info('[entry.client] Browser entry initialized', {
    appSessionId,
    initializedAt,
    mode: import.meta.env.MODE,
    tunnel: browserTunnel,
  });
  logger.info('Sentry browser Spotlight tunnel enabled', {
    appSessionId,
    initializedAt,
    runtime: 'browser',
    tunnel: browserTunnel,
  });
  captureMessage('entry.client initialized', {
    level: 'info',
  });

  flush(2000);
}

posthog.init(import.meta.env.VITE_POSTHOG_TOKEN as string, {
  // Disable feature flags (not needed)
  advanced_disable_flags: true,
  api_host: import.meta.env.VITE_POSTHOG_API_HOST as string,
  // Enable autocapture of DOM interactions (clicks, form submissions, etc.)
  autocapture: true,
  // Autocapture unhandled exceptions and unhandled promise rejections
  capture_exceptions: true,
  // Cloudflare Web Analytics is the browser-side RUM provider for these metrics.
  capture_performance: false,
  // Use 2026-05-30 defaults for modern behavior:
  // capture_pageview → 'history_change' (SPA auto-detection),
  // persistence_save_debounce_ms → 250, split_storage → true
  defaults: '2026-05-30',
  // Disable session recording (not needed)
  disable_session_recording: true,
  // Disable surveys (not needed)
  disable_surveys: true,
  // Add tracing headers so server-side events link back to frontend sessions
  tracing_headers: [
    globalThis.location.hostname,
    'localhost',
  ],
});

// Attach the app session ID to all PostHog events so client-side captures
// can be correlated with server-side events and Sentry spans.
if (appSessionId) {
  posthog.register({
    app_session_id: appSessionId,
  });
}

browserBootstrapSpan = startInactiveSpan({
  attributes: {
    'app.entry': 'app/entry.client.tsx',
    'app.phase': 'hydrate',
  },
  // This is a short child span that brackets hydration work. It is not meant to become the
  // root page transaction; the page/load transaction still comes from the browser tracing
  // integration and continues the SSR trace metadata injected by the server.
  name: 'Client bootstrap',
  op: 'ui.load',
});

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <BrowserBootstrapSpanEnder />
      {/* Keep this prop wiring for future Framework Mode support; do not remove it lightly. */}
      <HydratedRouter
        instrumentations={[
          tracing.clientInstrumentation,
        ]}
        onError={sentryOnError}
      />
    </StrictMode>
  );
});

/**
 * Lazy-load optional Sentry integrations that aren't needed for initial page load.
 */
globalThis.requestIdleCallback(async function lazyLoadBrowserIntegration() {
  try {
    await startSpan(
      {
        attributes: {
          'app.entry': 'app/entry.client.tsx',
          'app.phase': 'idle',
        },
        name: 'Lazy browser integrations',
        op: 'ui.setup',
      },
      async () => {
        const lazyBrowserIntegrations = [
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/http-client.ts').then(
                mod => mod.httpClientIntegration
              ),
            name: 'http-client',
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/extra-error-data.ts').then(
                mod => mod.extraErrorDataIntegration
              ),
            name: 'extra-error-data',
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/context-lines.ts').then(
                mod => mod.contextLinesIntegration
              ),
            name: 'context-lines',
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/view-hierarchy.ts').then(
                mod => mod.viewHierarchyIntegration
              ),
            name: 'view-hierarchy',
          },
          {
            // Don't load the browser-profiling integration in development.
            // The browser's `Profiler` API requires the document to opt in via
            // `Document-Policy: js-profiling`, but the SSR handler intentionally
            // short-circuits CSP/Document-Policy headers in dev (see
            // `isHtmlResponse` in `app/ssr-handler.ts`) so HMR and dev-only
            // scripts aren't blocked. Without the opt-in, the browser logs
            // `[Violation] Document policy violation: js-profiling is not
            // allowed in this document` and Sentry silently disables
            // profiling for the session. Skip the integration in dev instead.
            enabled: !isDevSentryMode,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/browser-profiling.ts').then(
                mod => mod.browserProfilingIntegration
              ),
            name: 'browser-profiling',
          },
          // {
          //   // Don't load the Replay integration in development when we're sending
          //   // envelopes to the local Spotlight sidecar — Spotlight's envelope parser
          //   // can choke on replay recordings. Only enable Replay outside of
          //   // development mode.
          //   enabled: !isDevSentryMode,
          //   loader: () => import('@sentry/browser').then(mod => mod.replayIntegration),
          // },
        ];

        const enabledIntegrations = lazyBrowserIntegrations.filter(n => n.enabled);

        const loaderPromises = enabledIntegrations.map(({ loader }) => loader());
        const integrations = await Promise.all(loaderPromises);

        const loadedIntegrations = integrations.map((integration, i) => {
          const name = enabledIntegrations[i]?.name ?? 'unknown';
          console.info('[entry.client] Lazy-loaded Sentry browser integration', name);
          return integration();
        });

        for (const integration of loadedIntegrations) {
          addIntegration(integration);
        }
      }
    );
  } catch (error) {
    console.error('[entry.client] Failed to lazy-load optional Sentry integrations', error);
  }
});
