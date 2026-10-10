import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRootDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));

/**
 * Absolute path to an executable that the workspace root installs into
 * `node_modules/.bin`.
 *
 * Scripts run through `pnpm` get that directory on `PATH` automatically, but
 * they are also invoked directly with `node scripts/...`, where the shell has
 * no `node_modules/.bin` to search. Resolving the absolute path keeps both
 * entry points working, and `spawn` avoids the shell shim layer entirely.
 */
export function localBinPath(name: string): string {
  const binPath = join(repoRootDir, 'node_modules', '.bin', name);

  if (!existsSync(binPath)) {
    throw new Error(`Expected ${name} to be installed at ${binPath}, but it is missing.`);
  }

  return binPath;
}
