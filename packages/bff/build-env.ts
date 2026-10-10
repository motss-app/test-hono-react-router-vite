import { readRequiredEnv } from '../../vite-utils/get-required-env.ts';
import { getEnv } from '../../vite-utils/runtime-env.ts';

const localSentryRelease = 'local';

export function getBffSentryRelease(): string {
  if (getEnv('DEPLOYMENT_BUILD') === 'true') {
    return readRequiredEnv('SENTRY_RELEASE', {
      source: 'packages/bff/vite.config.ts',
    });
  }

  return getEnv('SENTRY_RELEASE') ?? localSentryRelease;
}
