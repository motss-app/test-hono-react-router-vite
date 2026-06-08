import type { Fetcher } from '@cloudflare/workers-types';

export interface HonoEnv {
  Bindings: {
    AMPLITUDE_API_KEY?: string;
    ASSETS: Fetcher;
    SENTRY_DSN?: string;
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
