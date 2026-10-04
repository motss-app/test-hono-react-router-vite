/**
 * Generate VS Code Iconify aliases from the installed solid-icon exports.
 * Names follow Icon + PascalCase, such as arrow-left becoming IconArrowLeft.
 * Run deno task icons:sync after upgrading the icon package.
 */
const manifestUrl = new URL(import.meta.resolve('@iconify-react/fa7-solid/package.json'));
const manifest = JSON.parse(await Deno.readTextFile(manifestUrl)) as {
  exports: Record<
    string,
    | string
    | {
        default?: string;
      }
  >;
  name: string;
};

const aliases: Record<string, string> = {};
const collection = manifest.name.slice('@iconify-react/'.length);

for (const [subpath, target] of Object.entries(manifest.exports)) {
  if (!subpath.startsWith('./') || typeof target === 'string') {
    continue;
  }
  if (!target.default?.endsWith('.jsx')) {
    continue;
  }

  const iconName = subpath.slice(2);
  const alias = `Icon${iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')}`;

  if (Object.hasOwn(aliases, alias)) {
    throw new Error(`Duplicate alias ${alias} for ${iconName}`);
  }
  aliases[alias] = `${collection}:${iconName}`;
}

if (Object.keys(aliases).length === 0) {
  throw new Error(`No icon exports found in ${manifest.name}`);
}

/** Match Biome's natural order, comparing case and digits at each position. */
const collator = new Intl.Collator('en', {
  caseFirst: 'upper',
  numeric: true,
});

function compareAliases(left: string, right: string): number {
  const leftParts = left.match(/\d+|./g) ?? [];
  const rightParts = right.match(/\d+|./g) ?? [];

  for (let index = 0; index < Math.min(leftParts.length, rightParts.length); index++) {
    const order = collator.compare(leftParts[index] ?? '', rightParts[index] ?? '');
    if (order !== 0) {
      return order;
    }
  }
  return leftParts.length - rightParts.length;
}

const sortedAliases = Object.fromEntries(
  Object.entries(aliases).sort(([left], [right]) => compareAliases(left, right))
);
const outputUrl = new URL('../.vscode/iconify-aliases.json', import.meta.url);

await Deno.writeTextFile(outputUrl, `${JSON.stringify(sortedAliases, null, 2)}\n`);
console.log(`Generated ${Object.keys(aliases).length} aliases in .vscode/iconify-aliases.json`);
