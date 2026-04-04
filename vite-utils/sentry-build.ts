import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import type { SentryVitePluginOptions } from '@sentry/vite-plugin';

import { readRequiredEnv } from './get-required-env.ts';

type RuntimeMode = 'canary' | 'development' | 'production' | string;

interface SentryVitePluginUploadOptions {
  createRelease?: boolean;
  dist: string;
  filesToDeleteAfterUpload: string | string[];
  finalizeRelease?: boolean;
  uploadLegacySourcemaps: string | string[];
  useModernDebugIdUpload?: boolean;
}

interface SharedBuildOptions {
  authToken: string;
  org: string;
  project: string;
  release: {
    dist: string;
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

function createSharedBuildOptions(mode: RuntimeMode, dist: string): SharedBuildOptions | null {
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
      dist,
      name: readRequiredEnv('SENTRY_RELEASE', {
        source: 'vite-utils/sentry-build.ts',
      }),
    },
    telemetry: true,
  } satisfies SharedBuildOptions;
}

export function createSentryBuildOptions(
  mode: RuntimeMode,
  dist: string
): SentryReactRouterBuildOptions | null {
  const sharedBuildOptions = createSharedBuildOptions(mode, dist);

  if (!sharedBuildOptions) {
    return null;
  }

  return {
    ...sharedBuildOptions,
    reactComponentAnnotation: {
      enabled: true,
    },
    unstable_sentryVitePluginOptions: {
      release: {
        dist,
      },
    },
  };
}

export function createSentryVitePluginOptions(
  mode: RuntimeMode,
  options: SentryVitePluginUploadOptions
): SentryVitePluginOptions | null {
  const sharedBuildOptions = createSharedBuildOptions(mode, options.dist);

  if (!sharedBuildOptions) {
    return null;
  }

  const createRelease = options.createRelease ?? true;
  const finalizeRelease = options.finalizeRelease ?? true;
  const filesToDeleteAfterUpload = options.filesToDeleteAfterUpload;
  const uploadLegacySourcemaps = options.uploadLegacySourcemaps;
  const useModernDebugIdUpload = options.useModernDebugIdUpload ?? false;

  return {
    ...sharedBuildOptions,
    release: {
      ...sharedBuildOptions.release,
      create: createRelease,
      finalize: finalizeRelease,
      inject: false,
      ...(uploadLegacySourcemaps
        ? {
            uploadLegacySourcemaps,
          }
        : {}),
    },
    sourcemaps: useModernDebugIdUpload
      ? {
          assets: uploadLegacySourcemaps,
          filesToDeleteAfterUpload,
        }
      : {
          disable: true,
          filesToDeleteAfterUpload,
        },
  };
}
