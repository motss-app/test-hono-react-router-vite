const EXTENSION_REGEX = /\.(tsx|ts|jsx|js)$/;

export function discoverStaticRoutes(): string[] {
  const routesDir = './app/routes';
  const routes: string[] = [];

  try {
    /**
     * Note: Deno.readDirSync is synchronous and should only be used during build time (prerendering).
     * Do not use this in runtime request handlers to avoid blocking the event loop.
     */
    for (const entry of Deno.readDirSync(routesDir)) {
      // Skip directories, hidden files, and dynamic routes (containing '$' or '[')
      if (
        entry.isFile &&
        !entry.name.startsWith('_') &&
        !entry.name.startsWith('.') &&
        !entry.name.includes('$') &&
        !entry.name.includes('[')
      ) {
        // Convert filename to path: "about.tsx" -> "/about"
        const name = entry.name.replace(EXTENSION_REGEX, '');
        const path = name === 'index' ? '/' : `/${name}`;

        // Exclude specific routes that should always be SSR (dynamic)
        if (path !== '/ssr') {
          routes.push(path);
        }
      }
    }
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Build script logging
    console.warn('Warning: Could not auto-discover routes.', error);
  }

  return routes;
}
