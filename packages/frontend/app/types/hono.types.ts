import type { Fetcher } from '@cloudflare/workers-types';

export interface HonoEnv {
  Bindings: {
    ASSETS: Fetcher;
    CACHE_PURGE_SECRET?: string;
    SENTRY_DSN?: string;
    VITE_POSTHOG_API_HOST?: string;
    VITE_POSTHOG_TOKEN?: string;
  };
  Variables: {
    honoData: {
      computedValue: string;
      meta: {
        requestId: string;
        requestUrl: string;
      };
      serverTimestamp: string;
    };
  };
}
