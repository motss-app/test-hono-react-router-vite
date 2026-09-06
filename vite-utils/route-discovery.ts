import appRoutes from '../packages/frontend/app/routes.ts';

const ssrOnlyPaths = new Set([
  '/hono-rpc',
  '/ssr',
]);

interface RouteNode {
  children?: readonly RouteNode[];
  path?: string;
}

function toUrlPath(path: string): string {
  return path === '' ? '/' : `/${path.replace(/^\//, '')}`;
}

function removeOptionalLocale(path: string | undefined): string | undefined {
  return path?.replace(/^:locale\?/, '');
}

function isDynamicRoutePath(path: string): boolean {
  return path.includes(':') || path.includes('*');
}

function getStaticPaths(routes: readonly RouteNode[]): string[] {
  return [
    ...new Set(
      routes.flatMap(route => {
        const childPaths = getStaticPaths(route.children ?? []);
        const routePath = removeOptionalLocale(route.path);

        if (routePath === undefined || isDynamicRoutePath(routePath)) {
          return childPaths;
        }

        const staticPath = toUrlPath(routePath);

        return !ssrOnlyPaths.has(staticPath)
          ? [
              staticPath,
              ...childPaths,
            ]
          : childPaths;
      })
    ),
  ];
}

export function discoverPrerenderRoutes(): string[] {
  return getStaticPaths(appRoutes as readonly RouteNode[]);
}
