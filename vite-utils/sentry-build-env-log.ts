import { getEnv } from './runtime-env.ts';
import { logSentryEnvSnapshot } from './sentry-env-log.ts';

export function createBuildSentryEnvSnapshot(
  source: string,
  mode: string
): Record<string, unknown> {
  const port = getEnv('PORT');
  const sentryAuthToken = getEnv('SENTRY_AUTH_TOKEN');
  const sentryDsn = getEnv('SENTRY_DSN');
  const sentryRelease = getEnv('SENTRY_RELEASE');
  const viteSentryDsn = getEnv('VITE_SENTRY_DSN');

  return logSentryEnvSnapshot({
    deploymentBuild: getEnv('DEPLOYMENT_BUILD') === 'true',
    mode,
    phase: 'build',
    source,
    values: {
      port,
      sentryAuthToken,
      sentryDsn,
      sentryRelease,
      viteSentryDsn,
    },
  });
}
