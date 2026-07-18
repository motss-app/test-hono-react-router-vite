/**
 * Pulls translations from i18nexus and writes them to messages/{locale}.json
 * for Paraglide to compile.
 *
 * - Skips the base language (en-US) — source strings are maintained locally
 *   and pushed to i18nexus via the push script.
 * - Skips target language files that already exist locally — to preserve
 *   high-quality human translations already in the repo.
 * - Only writes files for new languages that don't exist locally yet.
 *
 * Usage:
 *   deno run -A scripts/pull-translations.ts          # normal mode
 *   deno run -A scripts/pull-translations.ts --force  # overwrite existing files
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

  // Fetch project metadata to identify base language
  const projectResponse = await fetchJson<{
    language: string;
  }>(`${BASE_URL}/project.json`);
  const baseLanguage = projectResponse.language;
  console.log(`Base language: ${baseLanguage} (will be skipped — maintained locally)`);

  // Fetch project languages
  const languagesResponse = await fetchJson<{
    collection: Language[];
  }>(`${BASE_URL}/languages.json`);
  const languages = languagesResponse.collection;

  const targetLanguages = languages.filter(l => !l.base_language);
  console.log(
    `Found ${targetLanguages.length} target languages:`,
    targetLanguages.map(l => l.full_code)
  );

  // Fetch all translations at once
  const translationsResponse = await fetchJson<
    Record<string, Record<string, Record<string, string>>>
  >(`${BASE_URL}/translations.json`);

  const forceOverwrite = Deno.args.includes('--force');
  if (forceOverwrite) {
    console.log('  --force flag detected: will overwrite existing translation files');
  }

  let writtenCount = 0;
  let skippedCount = 0;

  // Write only non-base languages
  for (const lang of languages) {
    const langCode = lang.full_code;

    // Skip base language — source strings are maintained locally
    if (lang.base_language) {
      console.log(`  Skipped: ${langCode} (base language)`);
      skippedCount++;
      continue;
    }

    // Skip existing files unless --force is used (preserve human translations)
    const messagesDir = new URL('../messages/', import.meta.url);
    const existingFilePath = new URL(`${langCode}.json`, messagesDir);
    try {
      const existingInfo = await Deno.stat(existingFilePath);
      if (existingInfo.isFile && !forceOverwrite) {
        console.log(`  Skipped: ${langCode} (file exists — use --force to overwrite)`);
        skippedCount++;
        continue;
      }
    } catch {
      // File doesn't exist — proceed to write
    }

    if (langCode in translationsResponse) {
      const langTranslations = translationsResponse[langCode];
      if (!langTranslations) {
        console.log(`  Skipped: ${langCode} (no translations data)`);
        skippedCount++;
        continue;
      }

      const namespaces = Object.keys(langTranslations);

      let flatTranslations: Record<string, string>;

      if (namespaces.length === 1) {
        flatTranslations = langTranslations[namespaces[0]!] ?? {};
      } else {
        flatTranslations = {};
        for (const ns of namespaces) {
          const nsTranslations = langTranslations[ns] ?? {};
          for (const [key, value] of Object.entries(nsTranslations)) {
            flatTranslations[ns === 'default' ? key : `${ns}.${key}`] = value;
          }
        }
      }

      const keyCount = Object.keys(flatTranslations).length;

      // Skip empty translations to avoid clobbering existing files
      if (keyCount === 0) {
        console.log(`  Skipped: ${langCode} (empty translations — keeping existing file)`);
        skippedCount++;
        continue;
      }

      const outputPath = new URL(`../messages/${langCode}.json`, import.meta.url);
      await Deno.writeTextFile(outputPath, JSON.stringify(flatTranslations, null, 2) + '\n');
      console.log(`  Written: messages/${langCode}.json (${keyCount} keys)`);
      writtenCount++;
    }
  }

  console.log(
    `Done! ${writtenCount} file(s) written, ${skippedCount} skipped. Paraglide will recompile on next build/dev.`
  );
}

await pullTranslations();
