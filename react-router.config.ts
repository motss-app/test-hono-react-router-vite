import type { Config } from '@react-router/dev/config';

import frontendReactRouterConfig from './packages/frontend/react-router.config.ts';

const config = {
  ...frontendReactRouterConfig,
} satisfies Config;

export default config;
