import { type InlineConfig, build as viteBuild } from 'vite';

import { THEME_BOOTSTRAP_OUT_FILE } from './constants.ts';
import type { BuildArtifact } from './types.ts';
import { getThemeBootstrapEntryPoint } from './utils.ts';

type ViteBuildOutput = Extract<
  Awaited<ReturnType<typeof viteBuild>>,
  {
    output: unknown;
  }
>;
type ViteOutputChunk = Extract<
  ViteBuildOutput['output'][number],
  {
    type: 'chunk';
  }
>;

async function buildThemeBootstrapCode(rootDir: string): Promise<{
  code: string;
  src: string;
}> {
  const result = await viteBuild({
    build: {
      emptyOutDir: false,
      lib: {
        entry: getThemeBootstrapEntryPoint(rootDir),
        fileName: () => THEME_BOOTSTRAP_OUT_FILE,
        formats: [
          'iife',
        ],
        name: 'ThemeBootstrap',
      },
      minify: true,
      rolldownOptions: {
        output: {
          entryFileNames: 'assets/theme-bootstrap-[hash].js',
        },
      },
      sourcemap: true,
      target: 'es2024',
      write: false,
    } satisfies NonNullable<InlineConfig['build']>,
    configFile: false,
    logLevel: 'silent',
    publicDir: false,
    root: rootDir,
  });

  const resultList = Array.isArray(result)
    ? result
    : [
        result,
      ];
  const outputChunk = resultList
    .filter(
      (item): item is ViteBuildOutput =>
        Boolean(item) && typeof item === 'object' && 'output' in item
    )
    .flatMap(item => item.output)
    .find((item): item is ViteOutputChunk => item.type === 'chunk');

  if (outputChunk) {
    return {
      code: outputChunk.code,
      src: `/${outputChunk.fileName}`,
    };
  }

  throw new Error('Unable to find the built theme bootstrap JavaScript chunk.');
}

export async function buildThemeBootstrap(rootDir: string = Deno.cwd()): Promise<BuildArtifact> {
  const { code, src } = await buildThemeBootstrapCode(rootDir);

  return {
    code,
    src,
  };
}
