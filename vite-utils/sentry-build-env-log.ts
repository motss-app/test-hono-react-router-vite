import { logSentryEnvSnapshot } from './sentry-env-log.ts';

export function createBuildSentryEnvSnapshot(
  source: string,
  mode: string
): Record<string, unknown> {
  const port = Deno.env.get('PORT') ?? undefined;
  const sentryAuthToken = Deno.env.get('SENTRY_AUTH_TOKEN') ?? undefined;
  const sentryDsn = Deno.env.get('SENTRY_DSN') ?? undefined;
  const sentryRelease = Deno.env.get('SENTRY_RELEASE') ?? undefined;
  const viteSentryDsn = Deno.env.get('VITE_SENTRY_DSN') ?? undefined;

  return logSentryEnvSnapshot({
    deploymentBuild: Deno.env.get('DEPLOYMENT_BUILD') === 'true',
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
