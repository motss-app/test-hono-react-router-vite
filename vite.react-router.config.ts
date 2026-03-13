import { reactRouter } from '@react-router/dev/vite';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    build: {
      cssCodeSplit: false,
    },
    plugins: isDev
      ? []
      : [
          stylex.vite({
            useCSSLayers: true,
          }),
          reactRouter(),
          headersCopyPlugin({
            dest: 'build/client/_headers',
            headersDir: 'headers',
            mode,
          }),
        ],
    resolve: {
      tsconfigPaths: true,
    },
  };
});
