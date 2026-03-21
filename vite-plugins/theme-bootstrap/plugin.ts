import type { Plugin, ViteDevServer } from 'vite';

import { buildThemeBootstrap } from './bundle.ts';
import {
  DEV_THEME_BOOTSTRAP_REQUEST_PATH,
  RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID,
  VIRTUAL_THEME_BOOTSTRAP_ID,
} from './constants.ts';
import { configureThemeBuildServer } from './dev-server.ts';
import type { BuildArtifact, ThemeBuildServerState } from './types.ts';

function loadModule(id: string, integrity: string, src: string): string | null {
  if (id !== RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID) {
    return null;
  }

  const integrityStr = JSON.stringify(integrity);
  const srcStr = JSON.stringify(src);

  return [
    `export const themeBootstrapIntegrity = ${integrityStr};`,
    `export const themeBootstrapSrc = ${srcStr};`,
  ].join('\n');
}

const resolveId = ((id: string): string | null => {
  if (id === VIRTUAL_THEME_BOOTSTRAP_ID) {
    return RESOLVED_VIRTUAL_THEME_BOOTSTRAP_ID;
  }

  return id;
}) satisfies Plugin['resolveId'];

export function themeBuildPlugin(): Plugin[] {
  let buildArtifact: BuildArtifact | undefined;
  const serverState: ThemeBuildServerState = {
    debounceTimer: undefined,
    devCode: undefined,
  };

  return [
    {
      apply: 'serve',
      async configureServer(server: ViteDevServer): Promise<void> {
        await configureThemeBuildServer(server, serverState);
      },
      load(id: string): string | null {
        return loadModule(id, '', DEV_THEME_BOOTSTRAP_REQUEST_PATH);
      },
      name: 'vite:theme-bootstrap:serve',
      resolveId,
    },
    {
      apply: 'build',
      async buildStart(): Promise<void> {
        buildArtifact ??= await buildThemeBootstrap();

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
          return loadModule(id, buildArtifact.integrity, buildArtifact.src);
        }

        return null;
      },
      name: 'vite:theme-bootstrap:build',
      resolveId,
    },
  ];
}
