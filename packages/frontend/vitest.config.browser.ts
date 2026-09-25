import { defineConfig } from 'vite-plus';
import { playwright } from 'vite-plus/test/browser-playwright';

export default defineConfig({
  test: {
    api: {
      host: '127.0.0.1',
    },
    browser: {
      enabled: true,
      headless: true,
      instances: [
        {
          browser: 'chromium',
          clearMocks: true,
          experimental: {
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
    fsModuleCache: true,
    include: [
      'app/**/*.browser.test.ts',
    ],
    name: 'frontend-browser',
  },
});
