import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

export default defineConfig({
  test: {
    browser: {
      api: {
        host: '127.0.0.1',
      },
      enabled: true,
      headless: true,
      instances: [
        {
          browser: 'chromium',
          clearMocks: true,
          experimental: {
            fsModuleCache: true,
            nodeLoader: true,
            openTelemetry: {
              enabled: true,
            },
            preParse: true,
            viteModuleRunner: true,
          },
          mockReset: true,
        },
      ],
      provider: playwright(),
    },
    include: [
      'app/**/*.browser.test.ts',
    ],
    name: 'frontend-browser',
  },
});
