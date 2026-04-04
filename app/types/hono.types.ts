import type { Fetcher } from '@cloudflare/workers-types';

export interface HonoEnv {
  Bindings: {
    ASSETS: Fetcher;
    SENTRY_DSN?: string;
    TURNSTILE_SECRET_KEY?: string;
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
