import type { JSX } from 'react';
import { Outlet } from 'react-router';

import type { Route } from './+types/page-layout.ts';

/**
 * Shared layout for pages that follow the hero + centered content pattern.
 * Holy grail and catch-all 404 stay outside this group.
 *
 * Uses standard RR7 exports only:
 *  - headers() for shared cache control
 *  - handle for <html> attributes (no dedicated RR export exists)
 */
export const handle = {
  htmlAttrs: {} as Record<string, string>,
};

export function headers({ parentHeaders }: Route.HeadersArgs): Headers {
  parentHeaders.set('Cache-Control', 'public, max-age=900, s-maxage=3600');
  return parentHeaders;
}

export default function PageLayout(): JSX.Element {
  return <Outlet />;
}
