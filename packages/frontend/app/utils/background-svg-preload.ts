const svgMimeType = 'image/svg+xml';
const darkThemeMediaQuery = '(prefers-color-scheme: dark)';
const lightThemeMediaQuery = '(prefers-color-scheme: light)';

function getThemeVariantMedia(href: string): string | undefined {
  if (href.endsWith('-dark.svg')) {
    return darkThemeMediaQuery;
  }

  if (href.endsWith('-light.svg')) {
    return lightThemeMediaQuery;
  }

  return undefined;
}

/**
 * Theme and error-state artwork are chosen in the browser, so callers can pass
 * every possible SVG variant for the current route. Dark and light variants are
 * gated with a matching color-scheme media query so the browser does not eagerly
 * preload both theme assets on the same request.
 */
export function createBackgroundSvgPreloadLinks(hrefs: readonly string[]) {
  return Array.from(new Set(hrefs)).map(href => {
    const media = getThemeVariantMedia(href);

    return {
      ...(media && {
        media,
      }),
      as: 'image' as const,
      href,
      rel: 'preload' as const,
      type: svgMimeType,
    };
  });
}
