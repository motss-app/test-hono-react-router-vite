import { getContext } from 'hono/context-storage';

import type { HonoEnv } from './types/hono.types.ts';

/**
 * Export getter for React Router loaders to access Hono context
 * NOTE: Prefer using `context.get(HonoContext)` in loaders/actions where possible.
 * This implementation uses AsyncLocalStorage which has a slight performance overhead
 * compared to direct dependency injection via RouterContextProvider.
 */
export function getHonoContext(): HonoEnv['Variables']['honoData'] | undefined {
  try {
    const context = getContext<HonoEnv>();
    return context.var.honoData;
  } catch {
    // Context not available (e.g., during build or prerendering)
    return;
  }
}
