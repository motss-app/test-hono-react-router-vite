import settings from '../../project.inlang/settings.json' with { type: 'json' };

/**
 * Reads the locales array directly from the Inlang project settings,
 * which is the single source of truth for supported locales.
 */
export const locales: readonly string[] = settings.locales;
export type Locale = (typeof settings.locales)[number];

const LABELS: Record<string, string> = {
  'en-US': 'English (US)',
  'ja-JP': '日本語',
  'zh-TW': '繁體中文',
};

export const labels: Record<Locale, string> = Object.fromEntries(
  locales.map(l => [l, LABELS[l] ?? l]),
) as Record<Locale, string>;

export function urlPatterns(): {
  localized: [string, string][];
  pattern: string;
}[] {
  return [
    {
      localized: locales.map(l => [l, `/${l}`]),
      pattern: '/',
    },
    {
      localized: locales.map(l => [l, `/${l}/:path(.*)?`]),
      pattern: '/:path(.*)?',
    },
  ];
}
