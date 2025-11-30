import type { Fetcher } from '@cloudflare/workers-types';

export interface HonoEnv {
  Bindings: {
    ASSETS: Fetcher;
  };
  Variables: {
    honoData: {
      serverTimestamp: string;
      computedValue: string;
    };
  };
}
