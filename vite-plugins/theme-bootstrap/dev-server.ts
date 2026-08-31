import path from 'node:path';
import type { ViteDevServer } from 'vite';

import { buildThemeBootstrap } from './bundle.ts';
import {
  DEV_THEME_BOOTSTRAP_REQUEST_PATH,
  HTTP_STATUS_OK,
  HTTP_STATUS_SERVICE_UNAVAILABLE,
  THEME_BOOTSTRAP_DEBOUNCE_MS,
} from './constants.ts';
import type { ThemeBuildServerState } from './types.ts';
import { toErrorMessage } from './utils.ts';

// Serve the theme bootstrap as a standalone dev asset because it lives outside Vite's module graph.
// When its entry file changes, rebuild the in-memory script and force a full reload so the browser reruns it.
export async function configureThemeBuildServer(
  server: ViteDevServer,
  state: ThemeBuildServerState,
  rootDir: string,
  themeBootstrapEntryPoint: string
): Promise<void> {
  try {
    state.devCode = (await buildThemeBootstrap(rootDir, themeBootstrapEntryPoint)).code;
  } catch (error) {
    server.config.logger.error(`vite:theme-bootstrap: ${toErrorMessage(error)}`);
  }

  server.middlewares.use((request, response, next) => {
    const requestUrl = request.url;

    if (!requestUrl) {
      next();

      return;
    }

    if (new URL(requestUrl, 'http://localhost').pathname !== DEV_THEME_BOOTSTRAP_REQUEST_PATH) {
      next();

      return;
    }

    if (!state.devCode) {
      response.statusCode = HTTP_STATUS_SERVICE_UNAVAILABLE;
      response.setHeader('Cache-Control', 'no-store');
      response.end('// Theme bootstrap is not ready yet.');

      return;
    }

    response.statusCode = HTTP_STATUS_OK;
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    response.end(state.devCode);
  });

  server.watcher.add(themeBootstrapEntryPoint);
  server.watcher.on('change', file => {
    if (path.resolve(file) !== themeBootstrapEntryPoint) {
      return;
    }

    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    state.debounceTimer = setTimeout(async () => {
      try {
        state.devCode = (await buildThemeBootstrap(rootDir, themeBootstrapEntryPoint)).code;
        server.ws.send({
          type: 'full-reload',
        });
      } catch (error) {
        server.config.logger.error(`vite:theme-bootstrap: ${toErrorMessage(error)}`);
      }
    }, THEME_BOOTSTRAP_DEBOUNCE_MS);
  });
}
