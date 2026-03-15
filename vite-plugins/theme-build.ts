/** biome-ignore-all lint/correctness/noNodejsModules: This is a vite plugin. */
import path from 'node:path';
import process from 'node:process';
import { build, type Plugin, type ViteDevServer } from 'vite';

async function runBuild(): Promise<void> {
  const entry = path.resolve('app/critical/theme-bootstrap/mod.ts');
  const outDir = path.resolve('build/theme-bootstrap');

  await build({
    build: {
      emptyOutDir: false,
      lib: {
        entry,
        name: 'themeBootstrap',
      },
      outDir,
      rolldownOptions: {
        output: {
          entryFileNames: 'theme-bootstrap.[hash].js',
        },
      },
    },
  });

  // biome-ignore lint/suspicious/noConsole: Logging theme bootstrap build completion for debugging purposes
  console.info('[info] Theme bootstrap build completed');
}

export function themeBuildPlugin(): Plugin {
  // biome-ignore lint/complexity/useLiteralKeys: Using environment variable keys directly for clarity in this context.
  const isDev = process.env['NODE_ENV'] === 'development';

  return {
    async buildStart(): Promise<void> {
      if (!isDev) {
        await runBuild();
      }
    },
    async configureServer(server: ViteDevServer): Promise<void> {
      if (isDev) {
        await runBuild();

        server.watcher.add('app/critical/theme-bootstrap/mod.ts');
        server.watcher.on('change', async file => {
          if (file.endsWith('theme-bootstrap/mod.ts')) {
            await runBuild();

            server.ws.send({
              type: 'full-reload',
            });
          }
        });
      }
    },
    enforce: 'pre',
    name: 'theme-build',
  };
}
