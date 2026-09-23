import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        autoUpdate: true,
      },
    },
    projects: [
      'packages/*/vitest.config.*.ts',
    ],
    reporters: [
      'github-actions',
      'dot',
    ],
  },
});
