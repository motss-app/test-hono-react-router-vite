import {
  addIntegration,
  captureMessage,
  consoleLoggingIntegration,
  flush,
  init,
  logger,
  reactRouterTracingIntegration,
  setTag,
} from '@sentry/react-router';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

import {
  applyAppSessionIdToSpan,
  appSessionIdTagName,
  getBrowserAppSessionId,
} from './monitoring/app-session.ts';
import {
  createBrowserSentryOptions,
  getSpotlightSidecarUrl,
  isDevelopmentSentryMode,
} from './monitoring/sentry.ts';
import {
  createSpotlightBrowserTransport,
  type SpotlightBrowserTransportOptions,
} from './monitoring/sentry-spotlight-browser.ts';

const isDevSentryMode = isDevelopmentSentryMode(import.meta.env.MODE);
const spotlightSidecarUrl = getSpotlightSidecarUrl(import.meta.env.VITE_SENTRY_SPOTLIGHT);
// Get the current app session ID for tagging Sentry events
const appSessionId = getBrowserAppSessionId();
const browserWindow = window as Window & {
  __appEntryClientLoadedAt__?: string;
};

const tracing = reactRouterTracingIntegration({
  useInstrumentationAPI: true,
});

init({
  ...createBrowserSentryOptions(import.meta.env.MODE, import.meta.env.VITE_SENTRY_DSN),
  beforeSendSpan: span => applyAppSessionIdToSpan(span, appSessionId),
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
    {
      enabled: isDevSentryMode,
      integration: () =>
        consoleLoggingIntegration({
          levels: [
            'log',
            'info',
            'warn',
            'error',
            'debug',
          ],
        }),
    },
    {
      enabled: true,
      integration: () => tracing,
    },
  ]
    .filter(n => n.enabled)
    .map(n => n.integration),
  ...(isDevSentryMode
    ? {
        transport: (options: SpotlightBrowserTransportOptions) =>
          createSpotlightBrowserTransport(options, spotlightSidecarUrl),
      }
    : {}),
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
    sidecarUrl: spotlightSidecarUrl,
  });
  logger.info('Sentry Spotlight browser logging enabled', {
    appSessionId,
    initializedAt,
    runtime: 'browser',
    sidecarUrl: spotlightSidecarUrl,
  });
  captureMessage('entry.client initialized', {
    level: 'info',
  });
  flush(2000);
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter
        unstable_instrumentations={[
          tracing.clientInstrumentation,
        ]}
      />
    </StrictMode>
  );
});

function loadOptionalBrowserIntegrationsDeferred(): void {
  const load = async () => {
    try {
      const lazyLoadedSentry = await import('@sentry/react-router');
      addIntegration(lazyLoadedSentry.browserProfilingIntegration());
      // Don't load the Replay integration in development when we're sending
      // envelopes to the local Spotlight sidecar — Spotlight's envelope parser
      // can choke on replay recordings. Only enable Replay outside of
      // development mode.
      if (!isDevSentryMode) {
        addIntegration(lazyLoadedSentry.replayIntegration());
      }
    } catch (error) {
      console.error('[entry.client] Failed to lazy-load optional Sentry integrations', error);
    }
  };

  if (globalThis.requestIdleCallback) {
    globalThis.requestIdleCallback(load);
  } else {
    globalThis.setTimeout(load, 0);
  }
}
loadOptionalBrowserIntegrationsDeferred();
