import type { Config } from '@react-router/dev/config';

export default {
  prerender(): string[] {
    return [
      '/',
      '/about',
      '/errors',
      '/hono-rpc',
    ];
  },
  ssr: true,
} satisfies Config;
