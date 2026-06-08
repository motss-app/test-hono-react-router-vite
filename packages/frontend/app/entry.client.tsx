import {
  identify as amplitudeIdentifyFn,
  init as amplitudeInit,
  Identify,
} from '@amplitude/analytics-browser';
import { elementTimingIntegration } from '@sentry/browser';
import {
  addIntegration,
  captureMessage,
  flush,
  init,
  logger,
  reactRouterTracingIntegration,
  setTag,
  startInactiveSpan,
  startSpan,
} from '@sentry/react-router/cloudflare';
import { StrictMode, startTransition, useEffect } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import './polyfills/request-idle-callback.ts';

import { logSentryEnvSnapshot } from '../../../vite-utils/sentry-env-log.ts';
import {
  createAmplitudeOptions,
  createAmplitudeUserPropertyMap,
  getAmplitudeApiKey,
} from './monitoring/amplitude.ts';
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
const tracing = reactRouterTracingIntegration({
  useInstrumentationAPI: true,
});

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

// Amplitude is browser-only and must initialize exactly once per page load. The flag on the
// global is preserved across HMR module reloads so dev refreshes don't double-init the SDK.
const amplitudeGlobal = globalThis as typeof globalThis & {
  __amplitudeInitialized__?: boolean;
};

if (!amplitudeGlobal.__amplitudeInitialized__) {
  amplitudeGlobal.__amplitudeInitialized__ = true;

  const amplitudeApiKey = getAmplitudeApiKey(
    (globalThis as Record<string, string | undefined>).__AMPLITUDE_API_KEY__
    ?? import.meta.env.VITE_AMPLITUDE_API_KEY
  );

  if (amplitudeApiKey) {
    const amplitudeOptions = createAmplitudeOptions(import.meta.env.MODE);

    // `init` boots Analytics with autocapture: page views, sessions, element interactions,
    // network capture, web vitals, frustration interactions, attribution, etc.
    // It returns a Promise but the SDK queues calls until init resolves, so we can fire identify
    // immediately afterwards without awaiting.
    amplitudeInit(amplitudeApiKey, amplitudeOptions);

    const amplitudeIdentify = new Identify();
    const amplitudeUserProperties = createAmplitudeUserPropertyMap({
      mode: import.meta.env.MODE,
      release: import.meta.env.SENTRY_RELEASE,
    });

    for (const [propertyName, propertyValue] of Object.entries(amplitudeUserProperties)) {
      amplitudeIdentify.set(propertyName, propertyValue as boolean | number | string | string[]);
    }

    amplitudeIdentifyFn(amplitudeIdentify);

    if (isDevSentryMode) {
      console.info('[entry.client] Amplitude initialized', {
        apiKey: `${amplitudeApiKey.slice(0, 6)}…`,
        autocapture: amplitudeOptions.autocapture,
        userProperties: amplitudeUserProperties,
      });
    }
  }
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
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/extra-error-data.ts').then(
                mod => mod.extraErrorDataIntegration
              ),
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/context-lines.ts').then(
                mod => mod.contextLinesIntegration
              ),
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/view-hierarchy.ts').then(
                mod => mod.viewHierarchyIntegration
              ),
          },
          {
            enabled: true,
            loader: () =>
              import('./monitoring/lazy-browser-integrations/browser-profiling.ts').then(
                mod => mod.browserProfilingIntegration
              ),
          },
          // {
          //   // Don't load the Replay integration in development when we're sending
          //   // envelopes to the local Spotlight sidecar — Spotlight's envelope parser
          //   // can choke on replay recordings. Only enable Replay outside of
          //   // development mode.
          //   enabled: !isDevSentryMode,
          //   loader: () => import('@sentry/browser').then(mod => mod.replayIntegration),
          // },
        ].filter(n => n.enabled);

        const loaderPromises = lazyBrowserIntegrations.map(({ loader }) => loader());
        const integrations = await Promise.all(loaderPromises);

        const loadedIntegrations = integrations.map(integration => {
          console.info('[entry.client] Lazy-loaded Sentry browser integration', integration.name);
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
