import process from 'node:process';

/**
 * Helpers for reading process state in Vite config and plugin code.
 *
 * Importing `process` from `node:process` keeps these helpers usable from
 * config files that run outside a bundler, where a bare `process` global is
 * not guaranteed.
 *
 * @param name - Environment variable name.
 * @returns The value, or `undefined` when unset.
 */
export function getEnv(name: string): string | undefined {
  return process.env[name];
}

/**
 * Sets an environment variable.
 *
 * @param name - Environment variable name.
 * @param value - Value to assign.
 */
export function setEnv(name: string, value: string): void {
  process.env[name] = value;
}

/**
 * Returns the current working directory.
 */
export function getRuntimeCwd(): string {
  return process.cwd();
}

/**
 * Writes text to stderr.
 *
 * @param text - Text to write. A trailing newline is not added automatically.
 */
export function writeStderr(text: string): void {
  process.stderr.write(text);
}
