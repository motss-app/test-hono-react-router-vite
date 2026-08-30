import { defineConfig } from 'vite-plus';

/**
 * Root Vite+ config. App Vite configs live in `packages/frontend/*`; this file
 * only carries Vite+ tooling settings (staged-file checks for commit hooks).
 */
export default defineConfig({
  staged: {
    '**/*.{js,jsx,ts,tsx,json}': 'deno run -P=lint npm:@biomejs/biome check --write',
  },
});
