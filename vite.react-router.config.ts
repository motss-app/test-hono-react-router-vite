import { reactRouter } from '@react-router/dev/vite';
import stylex from '@stylexjs/unplugin';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

import { headersCopyPlugin } from './vite-plugins/copy-headers.ts';

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: isDev
      ? []
      : [
          stylex.vite({
            treeshakeCompensation: true,
            useCSSLayers: true,
          }),
          reactRouter(),
          tsconfigPaths(),
          headersCopyPlugin({
            dest: 'build/client/_headers',
            headersDir: 'headers',
            mode,
          }),
        ],
  };
});
