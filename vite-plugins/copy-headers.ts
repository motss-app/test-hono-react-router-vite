import { dirname, resolve } from '@std/path';
import type { Plugin } from 'vite';

function fileExists(path: string): boolean {
  try {
    Deno.statSync(path);
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false;
    }
    throw error;
  }
}

interface HeadersCopyPluginOptions {
  dest: string;
  headersDir: string;
  mode: string;
}

export function headersCopyPlugin(options: HeadersCopyPluginOptions): Plugin {
  const headersDir = resolve(Deno.cwd(), options.headersDir);
  const destPath = resolve(Deno.cwd(), options.dest);
  const mode = options.mode;

  return {
    apply: 'build',
    name: 'vite:copy-headers',
    writeBundle(): void {
      const src = resolve(headersDir, `_headers.${mode}`);

      if (!fileExists(src)) {
        this.error(`Unable to find headers for mode '${mode}' (looked for ${src})`);
      }

      Deno.mkdirSync(dirname(destPath), {
        recursive: true,
      });

      Deno.copyFileSync(src, destPath);

      this.info(`Copied headers from ${src} to ${destPath}`);
    },
  };
}
