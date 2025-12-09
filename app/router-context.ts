import type { RouterContext } from 'react-router';

import type { HonoEnv } from './types/hono.types.ts';

/**
 * HonoContext is a React Router-specific context key.
 * We define it as a plain object matching the RouterContext interface
 * to avoid confusion with React's createContext.
 */
export const HonoContext: RouterContext<HonoEnv['Variables'] | undefined> = {
  defaultValue: undefined,
};
