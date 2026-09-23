import { defineConfig } from 'vite-plus';

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'app/**/*.unit.test.ts',
    ],
    name: 'frontend-unit',
    pool: 'threads',
  },
});
