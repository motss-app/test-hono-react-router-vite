import appRoutes from '../packages/frontend/app/routes.ts';
import { errorScenarios } from '../packages/frontend/app/utils/error-scenarios.ts';
import { locales } from '../packages/frontend/locales.ts';

const ssrOnlyPaths = [
  '/ssr',
  '/hono-rpc',
] as const;
const ssrOnlyPathSet = new Set<string>(ssrOnlyPaths);
const notFoundPath = '/not-found';

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

function isSsrRoutePath(path: string): boolean {
  return ssrOnlyPathSet.has(path) || isDynamicRoutePath(path);
}

function getStaticPaths(routes: readonly RouteNode[]): string[] {
  return [
    ...new Set(
      routes.flatMap(route => {
        const childPaths = getStaticPaths(route.children ?? []);
        const routePath = removeOptionalLocale(route.path);

        if (routePath === undefined || isSsrRoutePath(routePath)) {
          return childPaths;
        }

        const staticPath = toUrlPath(routePath);

        return [
          staticPath,
          ...childPaths,
        ];
      })
    ),
  ];
}

function expandLocalePaths(paths: readonly string[]): string[] {
  return locales.flatMap(locale => paths.map(path => `/${locale}${path === '/' ? '' : path}`));
}

export function discoverPrerenderRoutes(): string[] {
  return expandLocalePaths(getStaticPaths(appRoutes as readonly RouteNode[]));
}

export function discoverSsrRoutes(): string[] {
  return [
    ...ssrOnlyPaths,
    ...errorScenarios.map(({ code }) => `/errors/${code}`),
    notFoundPath,
  ];
}
