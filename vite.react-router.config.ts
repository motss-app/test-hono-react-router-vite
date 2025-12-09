import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';

export default defineConfig(({ mode }) => ({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    tailwindcss(),
    headersCopyPlugin({
      dest: 'build/client/_headers',
      headersDir: 'headers',
      mode,
    }),
  ],
}));
