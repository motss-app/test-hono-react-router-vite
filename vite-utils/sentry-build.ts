import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import type { SentryVitePluginOptions } from '@sentry/vite-plugin';

import { readRequiredEnv } from './get-required-env.ts';

type RuntimeMode = 'canary' | 'development' | 'production' | string;

interface LegacySourcemapUploadOptions {
  createRelease?: boolean;
  dist: string;
  filesToDeleteAfterUpload: string | string[];
  finalizeRelease?: boolean;
  uploadLegacySourcemaps: string | string[];
}

interface SharedBuildOptions {
  authToken: string;
  dist?: string;
  org: string;
  project: string;
  release: {
    name: string;
  };
  telemetry: boolean;
}

const sentryOrganization = 'ipohjs';
const sentryProject = 'hono-react-router-vite';

function isDeploymentBuild(): boolean {
  return Deno.env.get('DEPLOYMENT_BUILD') === 'true';
}

function isDevelopmentSentryMode(mode: RuntimeMode): boolean {
  return mode === 'development';
}

function createSharedBuildOptions(mode: RuntimeMode): SharedBuildOptions | null {
  if (isDevelopmentSentryMode(mode) || !isDeploymentBuild()) {
    return null;
  }

  return {
    authToken: readRequiredEnv('SENTRY_AUTH_TOKEN', {
      source: 'vite-utils/sentry-build.ts',
    }),
    org: sentryOrganization,
    project: sentryProject,
    release: {
      name: readRequiredEnv('SENTRY_RELEASE', {
        source: 'vite-utils/sentry-build.ts',
      }),
    },
    telemetry: true,
  } satisfies SharedBuildOptions;
}

export function createSentryBuildOptions(mode: RuntimeMode): SentryReactRouterBuildOptions | null {
  const sharedBuildOptions = createSharedBuildOptions(mode);

  if (!sharedBuildOptions) {
    return null;
  }

  const { dist, ...buildOptions } = sharedBuildOptions;

  return {
    ...buildOptions,
    ...(dist
      ? {
          unstable_sentryVitePluginOptions: {
            release: {
              dist,
            },
          },
        }
      : {}),
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

  const { dist, ...buildOptions } = sharedBuildOptions;

  const {
    createRelease = true,
    finalizeRelease = true,
    filesToDeleteAfterUpload,
    uploadLegacySourcemaps,
  } = options;

  return {
    ...buildOptions,
    release: {
      ...buildOptions.release,
      ...(dist
        ? {
            dist,
          }
        : {}),
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
