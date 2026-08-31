import { loadEnv } from 'vite';

import { getEnv, getRuntimeCwd, setEnv } from './runtime-env.ts';

export function loadConfigEnvironment(mode: string, baseDir?: string): void {
  const loadedEnvironment = loadEnv(mode, baseDir ?? getRuntimeCwd(), '');

  for (const [key, value] of Object.entries(loadedEnvironment)) {
    if (getEnv(key) === undefined) {
      setEnv(key, value);
    }
  }
}
