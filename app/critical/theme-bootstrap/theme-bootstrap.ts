import { init } from './mod.ts';

export function ThemeBootstrap(): null {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    init();

    // biome-ignore lint/suspicious/noConsole: Logging theme bootstrap initialization for debugging purposes
    console.info('Theme bootstrap initialized');
  }

  return null;
}
