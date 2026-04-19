import type { CloudflareOptions } from '@sentry/cloudflare';
import type { DenoOptions } from '@sentry/deno';

export const sentrySpotlightSidecarDefaultUrl = 'http://localhost:8969/stream';
export const sentryOrigin = 'https://sentry.io';
const tracesSampleRate = 1.0;
const profileSessionSampleRate = 1.0;
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

function getSentryDist(mode: RuntimeMode): string | undefined {
  return mode === 'canary' || mode === 'production' ? mode : undefined;
}

function getRequiredRuntimeRelease(mode: RuntimeMode, release?: string): string | undefined {
  if (isDevelopmentSentryMode(mode)) {
    return;
  }

  if (release) {
    return release;
  }

  throw new Error(`SENTRY_RELEASE must be defined for ${mode} mode.`);
}

function getDsnOrigin(dsn?: string): string | undefined {
  if (!dsn) {
    return;
  }

  try {
    return new URL(dsn).origin;
  } catch {
    return;
  }
}

export function getSpotlightSidecarUrl(spotlight?: string): string {
  return spotlight && spotlight !== '1' ? spotlight : sentrySpotlightSidecarDefaultUrl;
}

export function getSentryConnectSrc(dsn?: string): string[] {
  const sentryOrigin = getDsnOrigin(dsn);

  return sentryOrigin
    ? [
        sentryOrigin,
      ]
    : [];
}

function createBaseOptions(mode: RuntimeMode, dsn?: string) {
  return {
    ...(dsn
      ? {
          dsn,
        }
      : {}),
    debug: isDevelopmentSentryMode(mode),
    dist: getSentryDist(mode),
    enableLogs: true,
    environment: getSentryEnvironment(mode),
    sendDefaultPii: true,
    tracesSampleRate,
  };
}

export function createBrowserSentryOptions(mode: RuntimeMode, dsn?: string, release?: string) {
  const runtimeRelease = getRequiredRuntimeRelease(mode, release);

  return {
    ...createBaseOptions(mode, dsn),
    ...(runtimeRelease
      ? {
          release: runtimeRelease,
        }
      : {}),
    enableRpcTracePropagation: true,
    profileLifecycle: 'trace',
    profileSessionSampleRate,
    replaysOnErrorSampleRate,
    replaysSessionSampleRate,
    tracePropagationTargets: sentryTracePropagationTargets,
  };
}

export function createDenoSentryOptions(mode: RuntimeMode, dsn?: string): DenoOptions {
  const release = getRequiredRuntimeRelease(mode, Deno.env.get('SENTRY_RELEASE') ?? undefined);

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
  const runtimeRelease = getRequiredRuntimeRelease(mode, release);

  return {
    ...createBaseOptions(mode, dsn),
    ...(runtimeRelease
      ? {
          release: runtimeRelease,
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
