import type { CloudflareOptions } from '@sentry/cloudflare';
import type { DenoOptions } from '@sentry/deno';
import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import type { SentryVitePluginOptions } from '@sentry/vite-plugin';

export const sentrySpotlightSidecarDefaultUrl = 'http://localhost:8969/stream';
export const sentryOrganization = 'ipohjs';
export const sentryOrigin = 'https://sentry.io';
export const sentryProject = 'hono-react-router-vite';
const tracesSampleRate = 1.0;
const profilesSampleRate = 1.0;
const replaysSessionSampleRate = 0.1;
const replaysOnErrorSampleRate = 1.0;

type RuntimeMode = 'canary' | 'development' | 'production' | string;

type SentryMetricAttributes = Record<string, boolean | number | string>;

interface RequestMetricAttributesOptions {
  method: string;
  pathname: string;
  runtime: 'browser' | 'cloudflare' | 'deno';
  statusCode?: number;
}

export function getSentryEnvironment(mode: RuntimeMode): string {
  return mode === 'canary' || mode === 'production' ? mode : 'development';
}

export function isDevelopmentSentryMode(mode: RuntimeMode): boolean {
  return mode === 'development';
}

// Toolbar removed: no-op placeholders removed.

function readEnvironmentVariable(name: string): string | undefined {
  if (typeof Deno !== 'undefined') {
    return Deno.env.get(name) ?? undefined;
  }

  return;
}

export function getSpotlightSidecarUrl(spotlight?: string): string {
  return spotlight && spotlight !== '1' ? spotlight : sentrySpotlightSidecarDefaultUrl;
}

function createReleaseOption():
  | {
      name: string;
    }
  | undefined {
  const release = readEnvironmentVariable('SENTRY_RELEASE');

  return release
    ? {
        name: release,
      }
    : undefined;
}

function createBaseOptions(mode: RuntimeMode, dsn?: string) {
  return {
    ...(dsn
      ? {
          dsn,
        }
      : {}),
    enableLogs: true,
    environment: getSentryEnvironment(mode),
    sendDefaultPii: true,
    tracesSampleRate,
  };
}

function createSharedBuildOptions() {
  const authToken = readEnvironmentVariable('SENTRY_AUTH_TOKEN');

  if (!authToken) {
    return null;
  }

  const release = createReleaseOption();

  return {
    authToken,
    org: sentryOrganization,
    project: sentryProject,
    ...(release
      ? {
          release,
        }
      : {}),
    sourcemaps: {
      filesToDeleteAfterUpload: [
        './build/**/*.map',
      ],
    },
    telemetry: true,
  };
}

export function createBrowserSentryOptions(mode: RuntimeMode, dsn?: string) {
  return {
    ...createBaseOptions(mode, dsn),
    profilesSampleRate,
    replaysOnErrorSampleRate,
    replaysSessionSampleRate,
    tracePropagationTargets: sentryTracePropagationTargets,
  };
}

export function createDenoSentryOptions(mode: RuntimeMode, dsn?: string): DenoOptions {
  const release = readEnvironmentVariable('SENTRY_RELEASE');

  return {
    ...createBaseOptions(mode, dsn),
    ...(release
      ? {
          release,
        }
      : {}),
  };
}

export function createCloudflareSentryOptions(
  mode: RuntimeMode,
  dsn?: string,
  release?: string
): CloudflareOptions {
  return {
    ...createBaseOptions(mode, dsn),
    ...(release
      ? {
          release,
        }
      : {}),
  };
}

export function createRequestMetricAttributes({
  method,
  pathname,
  runtime,
  statusCode,
}: RequestMetricAttributesOptions): SentryMetricAttributes {
  return {
    httpMethod: method,
    httpRoute: pathname,
    runtime,
    ...(statusCode === undefined
      ? {}
      : {
          httpStatusCode: statusCode,
        }),
  };
}

export function createSentryBuildOptions(): SentryReactRouterBuildOptions | null {
  const sharedBuildOptions = createSharedBuildOptions();

  if (!sharedBuildOptions) {
    return null;
  }

  return {
    ...sharedBuildOptions,
    reactComponentAnnotation: {
      enabled: true,
    },
  };
}

export function createSentryVitePluginOptions(): SentryVitePluginOptions | null {
  return createSharedBuildOptions();
}

export const sentryMetricNames = {
  browserRequestCount: 'app.browser.request',
  browserRequestDuration: 'app.browser.request.duration',
  browserRequestError: 'app.browser.request.error',
  requestCount: 'app.server.request',
  requestDuration: 'app.server.request.duration',
  requestError: 'app.server.request.error',
} as const;

export const sentryTracePropagationTargets = [
  /^\//,
];
