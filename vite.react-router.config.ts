import { reactRouter } from '@react-router/dev/vite';
import unoCss from 'unocss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    unoCss({
      configFile: './unocss.config.ts',
    }),
  ],
});
