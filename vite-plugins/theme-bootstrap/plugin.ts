import type { Plugin, ViteDevServer } from 'vite';

import { buildThemeBootstrap } from './bundle.ts';
import {
  DEV_THEME_BOOTSTRAP_REQUEST_PATH,
  RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID,
  VIRTUAL_THEME_BOOTSTRAP_ID,
} from './constants.ts';
import { configureThemeBuildServer } from './dev-server.ts';
import type { BuildArtifact, ThemeBuildServerState } from './types.ts';

interface ThemeBuildPluginOptions {
  rootDir?: string;
}

function loadModule(id: string, src: string): string | null {
  if (id !== RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID) {
    return null;
  }

  const srcStr = JSON.stringify(src);

  return `export const themeBootstrapSrc = ${srcStr};`;
}

const resolveId = ((id: string): string | null => {
  if (id === VIRTUAL_THEME_BOOTSTRAP_ID) {
    return RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID;
  }

  return id;
}) satisfies Plugin['resolveId'];

export function themeBuildPlugin(options: ThemeBuildPluginOptions = {}): Plugin[] {
  const rootDir = options.rootDir ?? Deno.cwd();
  let buildArtifact: BuildArtifact | undefined;
  const serverState: ThemeBuildServerState = {
    debounceTimer: undefined,
    devCode: undefined,
  };

  return [
    {
      apply: 'serve',
      async configureServer(server: ViteDevServer): Promise<void> {
        await configureThemeBuildServer(server, serverState, rootDir);
      },
      load(id: string): string | null {
        return loadModule(id, DEV_THEME_BOOTSTRAP_REQUEST_PATH);
      },
      name: 'vite:theme-bootstrap:serve',
      resolveId,
    },
    {
      apply: 'build',
      async buildStart(): Promise<void> {
        buildArtifact ??= await buildThemeBootstrap(rootDir);

        if (this.environment.name === 'client') {
          this.emitFile({
            fileName: buildArtifact.src.slice(1),
            source: buildArtifact.code,
            type: 'asset',
          });
        }
      },
      load(id: string): string | null {
        if (buildArtifact) {
          return loadModule(id, buildArtifact.src);
        }

        return null;
      },
      name: 'vite:theme-bootstrap:build',
      resolveId,
    },
  ];
}
