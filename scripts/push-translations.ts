/**
 * Pushes local source strings to i18nexus.
 *
 * Reads messages/en-US.json (the source-of-truth for base language strings),
 * diffs against i18nexus, and pushes any new or updated strings.
 *
 * Usage:
 *   deno run -A scripts/push-translations.ts           # push new/updated strings
 *   deno run -A scripts/push-translations.ts --dry-run # show what would change
 *
 * Requires I18NEXUS_API_KEY and I18NEXUS_PERSONAL_ACCESS_TOKEN environment
 * variables.
 */

const API_KEY = Deno.env.get('I18NEXUS_API_KEY');
const PAT = Deno.env.get('I18NEXUS_PERSONAL_ACCESS_TOKEN');

if (!API_KEY) {
  console.error('Error: I18NEXUS_API_KEY is not set in environment');
  Deno.exit(1);
}

if (!PAT) {
  console.error('Error: I18NEXUS_PERSONAL_ACCESS_TOKEN is not set in environment');
  Deno.exit(1);
}

const BASE_URL = 'https://api.i18nexus.com/project_resources';
const NAMESPACE = 'default';

interface ProjectMeta {
  language: string;
  use_namespaces: boolean;
  namespaces: string[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(`${url}?api_key=${API_KEY}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function apiPost<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${url}?api_key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PAT}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API POST ${url} failed (${response.status}): ${text}`);
  }

  return response.json() as Promise<TResponse>;
}

async function pushTranslations(): Promise<void> {
  console.log('Pushing source strings to i18nexus...');

  // Fetch project metadata
  const project = await fetchJson<ProjectMeta>(`${BASE_URL}/project.json`);
  const baseLanguage = project.language;
  console.log(`Base language: ${baseLanguage}`);

  // Read local source strings
  const sourcePath = new URL(`../messages/${baseLanguage}.json`, import.meta.url);
  const sourceText = await Deno.readTextFile(sourcePath);
  const localStrings: Record<string, string> = JSON.parse(sourceText);
  const localKeys = Object.keys(localStrings);
  console.log(`Local source strings: ${localKeys.length} keys`);

  if (localKeys.length === 0) {
    console.error(`Error: messages/${baseLanguage}.json is empty — aborting`);
    Deno.exit(1);
  }

  // Fetch existing strings from i18nexus
  const existingTranslations = await fetchJson<Record<string, string>>(
    `${BASE_URL}/translations/${baseLanguage}/${NAMESPACE}.json`
  );

  const existingKeys = Object.keys(existingTranslations);
  console.log(`i18nexus strings: ${existingKeys.length} keys`);

  // Find new and modified strings
  const newStrings: Array<{
    key: string;
    value: string;
    description: string;
  }> = [];
  const updatedStrings: Array<{
    key: string;
    value: string;
  }> = [];

  for (const key of localKeys) {
    const value = localStrings[key]!;

    if (!(key in existingTranslations)) {
      // New string — needs to be created
      newStrings.push({
        key,
        value,
        description: `UI string for "${key}"`,
      });
    } else if (existingTranslations[key] !== value) {
      // Existing string with different value — needs update
      updatedStrings.push({
        key,
        value,
      });
    }
  }

  console.log(`New strings to create: ${newStrings.length}`);
  console.log(`Updated strings to patch: ${updatedStrings.length}`);

  // Dry-run mode — show what would change without making any API calls
  const dryRun = Deno.args.includes('--dry-run');
  if (dryRun) {
    if (newStrings.length > 0) {
      console.log('  New strings (would be created):');
      for (const s of newStrings.slice(0, 10)) {
        console.log(`    ${s.key}: ${s.value}`);
      }
      if (newStrings.length > 10) {
        console.log(`    ... and ${newStrings.length - 10} more`);
      }
    }
    if (updatedStrings.length > 0) {
      console.log('  Updated strings (would be patched):');
      for (const s of updatedStrings) {
        console.log(`    ${s.key}: "${existingTranslations[s.key]}" → "${s.value}"`);
      }
    }
    if (newStrings.length === 0 && updatedStrings.length === 0) {
      console.log('  Nothing to push — local and remote are in sync.');
    }
    return;
  }

  let createdCount = 0;
  let updatedCount = 0;

  // Push new strings in batches of up to 25 (to respect plan limits)
  if (newStrings.length > 0) {
    const batchSize = 25;
    for (let i = 0; i < newStrings.length; i += batchSize) {
      const batch = newStrings.slice(i, i + batchSize);
      console.log(`  Creating batch ${Math.floor(i / batchSize) + 1}...`);
      try {
        const result = await apiPost<
          {
            namespace: string;
            base_strings: Array<{
              key: string;
              value: string;
              description: string;
            }>;
          },
          {
            base_strings_invalid_values: Array<unknown>;
          }
        >(`${BASE_URL}/base_strings/bulk_create.json`, {
          namespace: NAMESPACE,
          base_strings: batch,
        });
        createdCount += batch.length - result.base_strings_invalid_values.length;
        if (result.base_strings_invalid_values.length > 0) {
          console.warn(`    ${result.base_strings_invalid_values.length} invalid values skipped`);
        }
      } catch (error) {
        console.error(`    Batch failed:`, error instanceof Error ? error.message : String(error));
        // If plan limit hit, stop creating
        if (error instanceof Error && error.message.includes('string limit')) {
          console.warn('    Plan string limit reached — stopping creation');
          break;
        }
      }
    }
  }

  // Update modified strings one at a time via the API
  if (updatedStrings.length > 0) {
    console.log(`  Updating ${updatedStrings.length} string(s)...`);
    for (const { key, value } of updatedStrings) {
      try {
        const response = await fetch(`${BASE_URL}/base_strings.json?api_key=${API_KEY}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PAT}`,
          },
          body: JSON.stringify({
            id: {
              key,
              namespace: NAMESPACE,
            },
            value,
            reset_confirmed: true,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.warn(`    Failed to update "${key}": ${response.status} ${text}`);
        } else {
          updatedCount++;
        }
      } catch (error) {
        console.warn(
          `    Failed to update "${key}":`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  console.log(`Done! Created ${createdCount} new string(s), updated ${updatedCount} string(s).`);

  if (newStrings.length > 0 || updatedStrings.length > 0) {
    console.log(
      'Note: i18nexus translates new strings asynchronously. Run the pull script later to fetch translations.'
    );
  }
}

await pushTranslations();
