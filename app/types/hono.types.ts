import type { Fetcher } from '@cloudflare/workers-types';

export interface HonoEnv {
  Bindings: {
    ASSETS: Fetcher;
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
