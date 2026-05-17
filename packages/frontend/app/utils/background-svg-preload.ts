const svgMimeType = 'image/svg+xml';

/**
 * Theme and error-state artwork are chosen in the browser, so callers can pass
 * every possible SVG variant for the current route.
 */
export function createBackgroundSvgPreloadLinks(hrefs: readonly string[]) {
  return Array.from(new Set(hrefs)).map(href => ({
    as: 'image' as const,
    href,
    rel: 'preload' as const,
    type: svgMimeType,
  }));
}
