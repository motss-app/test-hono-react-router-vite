/**
 * Pulls translations from i18nexus and writes them to messages/{locale}.json
 * for Paraglide to compile.
 *
 * Usage:
 *   deno run -A scripts/pull-translations.ts
 *
 * Requires I18NEXUS_API_KEY environment variable.
 */

const API_KEY = Deno.env.get('I18NEXUS_API_KEY');

if (!API_KEY) {
  console.error('Error: I18NEXUS_API_KEY is not set in environment');
  Deno.exit(1);
}

const BASE_URL = 'https://api.i18nexus.com/project_resources';

interface Language {
  full_code: string;
  language_code: string;
  country_code: string | null;
  base_language: boolean;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${url}?api_key=${API_KEY}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function pullTranslations(): Promise<void> {
  console.log('Pulling translations from i18nexus...');

  // Fetch project languages
  const languagesResponse = await fetchJson<{
    collection: Language[];
  }>(`${BASE_URL}/languages.json`);
  const languages = languagesResponse.collection;

  console.log(
    `Found ${languages.length} languages:`,
    languages.map(l => l.full_code)
  );

  // Fetch all translations at once
  const translationsResponse = await fetchJson<
    Record<string, Record<string, Record<string, string>>>
  >(`${BASE_URL}/translations.json`);

  // Write each language to its own file
  for (const lang of languages) {
    const langCode = lang.full_code;

    if (langCode in translationsResponse) {
      // i18nexus may return namespaced translations; flatten if single namespace
      const langTranslations = translationsResponse[langCode];
      if (!langTranslations) continue;

      const namespaces = Object.keys(langTranslations);

      let flatTranslations: Record<string, string>;

      if (namespaces.length === 1) {
        // Single namespace: use directly
        flatTranslations = langTranslations[namespaces[0]!] ?? {};
      } else {
        // Multiple namespaces: flatten with dots
        flatTranslations = {};
        for (const ns of namespaces) {
          const nsTranslations = langTranslations[ns] ?? {};
          for (const [key, value] of Object.entries(nsTranslations)) {
            flatTranslations[ns === 'default' ? key : `${ns}.${key}`] = value;
          }
        }
      }

      const outputPath = new URL(`../messages/${langCode}.json`, import.meta.url);
      await Deno.writeTextFile(outputPath, JSON.stringify(flatTranslations, null, 2) + '\n');
      console.log(
        `Written: messages/${langCode}.json (${Object.keys(flatTranslations).length} keys)`
      );
    }
  }

  console.log('Done! Paraglide will recompile on next build/dev.');
}

await pullTranslations();
