import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';

const localSentryRelease = 'local';

export function getBffSentryRelease(): string {
  if (Deno.env.get('DEPLOYMENT_BUILD') === 'true') {
    return readRequiredEnv('SENTRY_RELEASE', {
      source: 'packages/bff/vite.config.ts',
    });
  }

  return Deno.env.get('SENTRY_RELEASE') ?? localSentryRelease;
}
