import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      cloudflare({
        ...(isDev
          ? {
              auxiliaryWorkers: [
                {
                  configPath: '../bff/wrangler.jsonc',
                },
              ],
            }
          : {}),
        configPath: './wrangler.jsonc',
      }),
    ],
    server: {
      port: 8787,
      strictPort: true,
    },
  };
});
