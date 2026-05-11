interface SentryDsnSnapshot {
  origin?: string;
  pathname?: string;
  present: boolean;
  value?: string;
}

interface SentryEnvSnapshotValues {
  port: string | undefined;
  sentryAuthToken: string | undefined;
  sentryDsn: string | undefined;
  sentryRelease: string | undefined;
  viteSentryDsn: string | undefined;
}

export interface SentryEnvSnapshot {
  deploymentBuild?: boolean;
  mode: string | undefined;
  phase: 'build' | 'browser' | 'deno' | 'ssr' | 'worker';
  source: string;
  values: SentryEnvSnapshotValues;
}

function describeDsn(dsn?: string): SentryDsnSnapshot {
  if (!dsn) {
    return {
      present: false,
    };
  }

  try {
    const url = new URL(dsn);

    return {
      origin: url.origin,
      pathname: url.pathname,
      present: true,
    };
  } catch {
    return {
      present: true,
      value: dsn,
    };
  }
}

function redactSecret(value?: string): string {
  return value ? '[redacted]' : '[missing]';
}

function createSentryEnvSnapshot(snapshot: SentryEnvSnapshot): Record<string, unknown> {
  return {
    deploymentBuild: snapshot.deploymentBuild,
    mode: snapshot.mode,
    phase: snapshot.phase,
    values: {
      PORT: snapshot.values.port ?? '[missing]',
      SENTRY_AUTH_TOKEN: redactSecret(snapshot.values.sentryAuthToken),
      SENTRY_DSN: describeDsn(snapshot.values.sentryDsn),
      SENTRY_RELEASE: snapshot.values.sentryRelease ?? '[missing]',
      VITE_SENTRY_DSN: describeDsn(snapshot.values.viteSentryDsn),
    },
  };
}

export function createBuildSentryEnvSnapshot(
  source: string,
  mode: string
): Record<string, unknown> {
  const port = Deno.env.get('PORT') ?? undefined;
  const sentryAuthToken = Deno.env.get('SENTRY_AUTH_TOKEN') ?? undefined;
  const sentryDsn = Deno.env.get('SENTRY_DSN') ?? undefined;
  const sentryRelease = Deno.env.get('SENTRY_RELEASE') ?? undefined;
  const viteSentryDsn = Deno.env.get('VITE_SENTRY_DSN') ?? undefined;

  return createSentryEnvSnapshot({
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

export function logSentryEnvSnapshot(snapshot: SentryEnvSnapshot): Record<string, unknown> {
  return createSentryEnvSnapshot(snapshot);
}
