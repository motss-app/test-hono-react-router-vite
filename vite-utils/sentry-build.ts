import type { SentryReactRouterBuildOptions } from '@sentry/react-router';
import type { SentryVitePluginOptions } from '@sentry/vite-plugin';

import { readRequiredEnv } from './get-required-env.ts';

type RuntimeMode = 'canary' | 'development' | 'production' | string;

interface LegacySourcemapUploadOptions {
  createRelease?: boolean;
  filesToDeleteAfterUpload: string | string[];
  finalizeRelease?: boolean;
  uploadLegacySourcemaps: string | string[];
}

const sentryOrganization = 'ipohjs';
const sentryProject = 'hono-react-router-vite';

function isDeploymentBuild(): boolean {
  return Deno.env.get('DEPLOYMENT_BUILD') === 'true';
}

function isDevelopmentSentryMode(mode: RuntimeMode): boolean {
  return mode === 'development';
}

function createSharedBuildOptions(mode: RuntimeMode) {
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
