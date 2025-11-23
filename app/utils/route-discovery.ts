const EXTENSION_REGEX = /\.(tsx|ts|jsx|js)$/;

export function discoverStaticRoutes(options: { exclude?: string[] } = {}): string[] {
  const routesDir = './app/routes';
  const routes: string[] = [];
  const { exclude = [] } = options;

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Recursive directory scanning
  function scan(currentDir: string, urlPrefix: string): void {
    for (const entry of Deno.readDirSync(currentDir)) {
      // Skip hidden files/dirs
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
        continue;
      }

      // Skip dynamic routes (containing '$' or '[')
      if (entry.name.includes('$') || entry.name.includes('[')) {
        continue;
      }

      if (entry.isDirectory) {
        // Recurse into subdirectory
        scan(`${currentDir}/${entry.name}`, `${urlPrefix}/${entry.name}`);
      } else if (entry.isFile) {
        // Convert filename to path: "about.tsx" -> "/about"
        const name = entry.name.replace(EXTENSION_REGEX, '');

        // Construct the route path
        let path = urlPrefix;
        if (name !== 'index') {
          path = `${urlPrefix}/${name}`;
        }

        // Ensure root path is "/" instead of empty string
        if (path === '') {
          path = '/';
        }

        // Exclude specific routes based on options
        if (!exclude.includes(path)) {
          routes.push(path);
        }
      }
    }
  }

  /**
   * Note: Deno.readDirSync is synchronous and should only be used during build time (prerendering).
   * Do not use this in runtime request handlers to avoid blocking the event loop.
   */
  try {
    scan(routesDir, '');
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Build script logging
    console.error(`Error: Failed to scan routes directory: ${routesDir}`);
    throw error;
  }

  return routes;
}
