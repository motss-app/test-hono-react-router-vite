import { reactRouter } from '@react-router/dev/vite';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';
import { themeBuildPlugin } from './vite-plugins/theme-bootstrap/plugin.ts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    build: {
      cssCodeSplit: false,
    },
    plugins: isDev
      ? []
      : [
          themeBuildPlugin(),
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
