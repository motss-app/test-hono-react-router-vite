import { loadEnv } from 'vite';

export function loadConfigEnvironment(mode: string): void {
  const loadedEnvironment = loadEnv(mode, Deno.cwd(), '');

  for (const [key, value] of Object.entries(loadedEnvironment)) {
    if (Deno.env.get(key) === undefined) {
      Deno.env.set(key, value);
    }
  }
}
