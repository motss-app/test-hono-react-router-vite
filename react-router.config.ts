import type { Config } from "@react-router/dev/config";

export default {
  prerender() {
    return [
      '/',
      '/about',
      '/errors',
    ];
  },
  ssr: true,
} satisfies Config;
