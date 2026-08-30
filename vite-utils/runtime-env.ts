import process from 'node:process';

/**
 * Runtime-agnostic helpers for Vite config and plugin code.
 *
 * These helpers import `process` from `node:process` so they work under
 * both Deno and Node.js without relying on a bare `process` global.
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
