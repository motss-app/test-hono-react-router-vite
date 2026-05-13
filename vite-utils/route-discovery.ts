const EXTENSION_REGEX = /\.(tsx|ts|jsx|js)$/;
const prerenderExcludedRoutes = [
  '/errors/:code',
  '/home',
  '/hono-rpc',
  '/ssr',
];

function discoverStaticRoutes(options?: { exclude?: string[]; rootDir?: string }): string[] {
  const normalizedOptions = options ?? {};
  const rootDir = normalizedOptions.rootDir ?? Deno.cwd();
  const routesDir = `${rootDir}/packages/frontend/app/routes`;
  const routes: string[] = [];
  const { exclude = [] } = normalizedOptions;

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Recursive directory scanning
  function scan(currentDir: string, urlPrefix: string): void {
    for (const entry of Deno.readDirSync(currentDir)) {
      // Skip hidden files/dirs
      if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
        continue;
      }

      // Skip dynamic routes (containing '$' or '['). These are SSR-only and should not be pre-rendered.
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

export function discoverPrerenderRoutes(options?: { rootDir?: string }): string[] {
  const { rootDir } = options ?? {};
  const routes = discoverStaticRoutes({
    exclude: prerenderExcludedRoutes,
    ...(rootDir === undefined ? {} : { rootDir }),
  });

  // Explicitly add the index route since discoverStaticRoutes relies on file names
  // and doesn't know that home.tsx is mapped to /
  if (!routes.includes('/')) {
    routes.push('/');
  }

  return routes;
}
