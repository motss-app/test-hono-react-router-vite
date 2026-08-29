// @ts-check
import { defineConfig } from '@inlang/paraglide-js';
import settings from './settings.json' with { type: 'json' };

const locales: string[] = settings.locales;

export default defineConfig({
  strategy: ['url', 'cookie', 'preferredLanguage', 'baseLocale'],
  urlPatterns: [
    {
      localized: locales.map(l => [l, `/${l}`]),
      pattern: '/',
    },
    {
      localized: locales.map(l => [l, `/${l}/:path(.*)?`]),
      pattern: '/:path(.*)?',
    },
  ],
});
