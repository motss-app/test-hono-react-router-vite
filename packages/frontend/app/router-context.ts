import type { RouterContext } from 'react-router';

import type { HonoEnv } from './types/hono.types.ts';

/**
 * Use a well-known symbol so the context key is shared across bundles.
 * Cloudflare deploys separate server/worker bundles; Symbol.for keeps a single
 * identity so RouterContextProvider lookups succeed in both builds.
 */
export const HonoContext = Symbol.for('hono.context') as unknown as RouterContext<
  HonoEnv['Variables']
>;
