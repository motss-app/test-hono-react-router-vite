import type { CloudflareOptions } from '@sentry/cloudflare';
import type { DenoOptions } from '@sentry/deno';
import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import type { SentryVitePluginOptions } from '@sentry/vite-plugin';

import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';

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

interface LegacySourcemapUploadOptions {
  filesToDeleteAfterUpload: string | string[];
  createRelease?: boolean;
  finalizeRelease?: boolean;
  uploadLegacySourcemaps: string | string[];
}

export function getSentryEnvironment(mode: RuntimeMode): string {
  return mode === 'canary' || mode === 'production' ? mode : 'development';
}

export function isDevelopmentSentryMode(mode: RuntimeMode): boolean {
  return mode === 'development';
}

function isDeploymentBuild(): boolean {
  return Deno.env.get('DEPLOYMENT_BUILD') === 'true';
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
    enableLogs: true,
    environment: getSentryEnvironment(mode),
    sendDefaultPii: true,
    tracesSampleRate,
  };
}

function createSharedBuildOptions(mode: RuntimeMode) {
  if (isDevelopmentSentryMode(mode) || !isDeploymentBuild()) {
    return null;
  }

  return {
    authToken: readRequiredEnv('SENTRY_AUTH_TOKEN', {
      source: 'app/monitoring/sentry.ts',
    }),
    org: sentryOrganization,
    project: sentryProject,
    release: {
      name: readRequiredEnv('SENTRY_RELEASE', {
        source: 'app/monitoring/sentry.ts',
      }),
    },
    telemetry: true,
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
    profilesSampleRate,
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

export function createSentryBuildOptions(mode: RuntimeMode): SentryReactRouterBuildOptions | null {
  const sharedBuildOptions = createSharedBuildOptions(mode);

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

export function createSentryVitePluginOptions(
  mode: RuntimeMode,
  options: LegacySourcemapUploadOptions
): SentryVitePluginOptions | null {
  const sharedBuildOptions = createSharedBuildOptions(mode);

  if (!sharedBuildOptions) {
    return null;
  }

  const {
    createRelease = true,
    finalizeRelease = true,
    filesToDeleteAfterUpload,
    uploadLegacySourcemaps,
  } = options;

  return {
    ...sharedBuildOptions,
    release: {
      ...sharedBuildOptions.release,
      create: createRelease,
      finalize: finalizeRelease,
      inject: false,
      uploadLegacySourcemaps,
    },
    sourcemaps: {
      disable: true,
      filesToDeleteAfterUpload,
    },
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
