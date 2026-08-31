#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Print per-route JS bundle sizes (raw + gzip) for React Router v7 routes.
 *
 * Reads the React Router manifest from the build output, measures file sizes
 * both raw and gzip-compressed, and displays a table per route.
 *
 * Usage:
 *   deno task route-bundle-size
 *   deno run -A scripts/route-bundle-size.ts [--json]
 */

const buildDir = new URL('../build/client', import.meta.url).pathname;
const assetsDir = new URL('../build/client/assets', import.meta.url).pathname;

// ---------------------------------------------------------------------------
// 1. Find the manifest file
// ---------------------------------------------------------------------------
const manifestPattern = /^manifest-[a-f0-9]+\.js$/;
let manifestPath: string | null = null;

for await (const entry of Deno.readDir(assetsDir)) {
  if (manifestPattern.test(entry.name)) {
    manifestPath = `${assetsDir}/${entry.name}`;
    break;
  }
}

if (!manifestPath) {
  console.error('No React Router manifest found in build/client/assets/');
  Deno.exit(1);
}

const raw = await Deno.readTextFile(manifestPath);

// Extract the JSON object from the `window.__reactRouterManifest=...` wrapper
const jsonStart = raw.indexOf('{');
const jsonEnd = raw.lastIndexOf('}');
const manifest = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as {
  entry: {
    module: string;
    imports: string[];
  };
  routes: Record<
    string,
    {
      id: string;
      parentId?: string;
      module: string;
      imports: string[];
    }
  >;
};

// ---------------------------------------------------------------------------
// 2. Resolve file sizes (raw + gzip)
// ---------------------------------------------------------------------------
async function gzipSize(data: ArrayBuffer): Promise<number> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();
  const writePromise = writer.write(data).then(() => writer.close());
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
  }
  await writePromise;
  return total;
}

async function fileSizeWithGzip(filePath: string): Promise<{
  gzip: number;
  raw: number;
}> {
  try {
    const data = await Deno.readFile(filePath);
    const rawBytes = data.byteLength;
    const buf = new ArrayBuffer(rawBytes);
    new Uint8Array(buf).set(data);
    const gzip = await gzipSize(buf);
    return {
      gzip,
      raw: rawBytes,
    };
  } catch {
    return {
      gzip: 0,
      raw: 0,
    };
  }
}

const sizeCache = new Map<
  string,
  {
    gzip: number;
    raw: number;
  }
>();

async function resolveSizes(paths: string[]): Promise<void> {
  await Promise.all(
    paths.map(async p => {
      if (sizeCache.has(p)) return;
      const abs = `${buildDir}/${p.replace(/^\//, '')}`;
      sizeCache.set(p, await fileSizeWithGzip(abs));
    })
  );
}

// Collect all unique JS paths from entry + routes
const allJsPaths = new Set<string>();
allJsPaths.add(manifest.entry.module);
for (const imp of manifest.entry.imports) {
  allJsPaths.add(imp);
}

for (const route of Object.values(manifest.routes)) {
  allJsPaths.add(route.module);
  for (const imp of route.imports) {
    allJsPaths.add(imp);
  }
}

await resolveSizes([
  ...allJsPaths,
]);

// ---------------------------------------------------------------------------
// 3. Calculate per-route JS bytes
// ---------------------------------------------------------------------------

function routeJsFiles(routeId: string): Set<string> {
  const route = manifest.routes[routeId];
  if (!route) return new Set();
  const files = new Set<string>();
  files.add(route.module);
  for (const imp of route.imports) {
    files.add(imp);
  }
  return files;
}

function sumSize(files: Set<string>, kind: 'gzip' | 'raw'): number {
  let total = 0;
  for (const f of files) {
    total += sizeCache.get(f)?.[kind] ?? 0;
  }
  return total;
}

function fmt(bytes: number): string {
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
}

function fmtPair(rawBytes: number, gzipBytes: number): string {
  return `${fmt(rawBytes)} / ${fmt(gzipBytes)}`;
}

// Entry bootstrap files (always loaded before any route)
const entryFiles = new Set<string>();
entryFiles.add(manifest.entry.module);
for (const imp of manifest.entry.imports) {
  entryFiles.add(imp);
}
const entryRaw = sumSize(entryFiles, 'raw');
const entryGzip = sumSize(entryFiles, 'gzip');

// Root layout files
const rootFiles = routeJsFiles('root');

// Root-only: files root layout adds on top of entry (same for every route)
const rootOnlyFiles = new Set(
  [
    ...rootFiles,
  ].filter(f => !entryFiles.has(f))
);

interface RouteEntry {
  routeId: string;
  path: string;
  isRoot: boolean;
  /** Total deduplicated bytes for cold visit (entry ∪ root ∪ route) */
  unionFiles: Set<string>;
  /** Bytes unique to this route — not in entry or root */
  routeOnlyFiles: Set<string>;
}

const entries: RouteEntry[] = [];

for (const route of Object.values(manifest.routes)) {
  const routeFiles = routeJsFiles(route.id);
  const union = new Set([
    ...entryFiles,
    ...rootFiles,
    ...routeFiles,
  ]);
  // Route-only: files unique to this route (not in entry, not in root)
  const routeOnly = new Set(
    [
      ...routeFiles,
    ].filter(f => !entryFiles.has(f) && !rootFiles.has(f))
  );
  entries.push({
    isRoot: route.id === 'root',
    path: route.id === 'root' ? '[root]' : route.id.replace('routes/', '/'),
    routeId: route.id,
    routeOnlyFiles: routeOnly,
    unionFiles: union,
  });
}

// Sort: root first, then alphabetically
entries.sort((a, b) => {
  if (a.isRoot) return -1;
  if (b.isRoot) return 1;
  return a.routeId.localeCompare(b.routeId);
});

// ---------------------------------------------------------------------------
// 4. Print the output
// ---------------------------------------------------------------------------

const jsonOutput = Deno.args.includes('--json');

if (jsonOutput) {
  const nonRoot = entries.filter(e => !e.isRoot);
  const routeData = nonRoot.map(e => {
    const totalRaw = sumSize(e.unionFiles, 'raw');
    const totalGzip = sumSize(e.unionFiles, 'gzip');
    const ownRaw = sumSize(e.routeOnlyFiles, 'raw');
    const ownGzip = sumSize(e.routeOnlyFiles, 'gzip');
    return {
      gzipBytes: totalGzip,
      ownGzipBytes: ownGzip,
      ownRawBytes: ownRaw,
      rawBytes: totalRaw,
      route: e.path,
    };
  });

  const rootRaw = sumSize(rootOnlyFiles, 'raw');
  const rootGzip = sumSize(rootOnlyFiles, 'gzip');

  if (nonRoot.length > 0) {
    const maxEntry = nonRoot.reduce(
      (m, e) => (sumSize(e.unionFiles, 'raw') > sumSize(m.unionFiles, 'raw') ? e : m),
      // biome-ignore lint/style/noNonNullAssertion: guarded by nonRoot.length > 0
      nonRoot[0]!
    );
    const minEntry = nonRoot.reduce(
      (m, e) => (sumSize(e.unionFiles, 'raw') < sumSize(m.unionFiles, 'raw') ? e : m),
      // biome-ignore lint/style/noNonNullAssertion: guarded by nonRoot.length > 0
      nonRoot[0]!
    );

    console.info(
      JSON.stringify(
        {
          entry: {
            gzipBytes: entryGzip,
            rawBytes: entryRaw,
          },
          rootLayout: {
            gzipBytes: rootGzip,
            rawBytes: rootRaw,
          },
          routes: routeData,
          summary: {
            maxRoute: maxEntry.path,
            maxRouteRawBytes: sumSize(maxEntry.unionFiles, 'raw'),
            minRoute: minEntry.path,
            minRouteRawBytes: sumSize(minEntry.unionFiles, 'raw'),
          },
        },
        null,
        2
      )
    );
  } else {
    console.info(
      JSON.stringify(
        {
          entry: {
            gzipBytes: entryGzip,
            rawBytes: entryRaw,
          },
          rootLayout: {
            gzipBytes: rootGzip,
            rawBytes: rootRaw,
          },
          routes: routeData,
        },
        null,
        2
      )
    );
  }
} else {
  // Pre-compute formatted pairs to measure actual data widths (exclude root)
  const nonRootEntries = entries.filter(e => !e.isRoot);
  const formattedPairs = nonRootEntries.map(e => ({
    own: fmtPair(sumSize(e.routeOnlyFiles, 'raw'), sumSize(e.routeOnlyFiles, 'gzip')),
    path: e.path,
    total: fmtPair(sumSize(e.unionFiles, 'raw'), sumSize(e.unionFiles, 'gzip')),
  }));

  const routeColWidth = Math.max('Route'.length, ...formattedPairs.map(f => f.path.length));
  const totalColWidth = Math.max(
    'First Load JS'.length,
    ...formattedPairs.map(f => f.total.length)
  );
  const ownColWidth = Math.max('Route-only JS'.length, ...formattedPairs.map(f => f.own.length));

  console.info('');
  console.info(
    `  ${'Route'.padEnd(routeColWidth)}  ${'First Load JS'.padStart(totalColWidth)}  ${'Route-only JS'.padStart(ownColWidth)}`
  );
  console.info(
    `  ${'─'.repeat(routeColWidth)}  ${'─'.repeat(totalColWidth)}  ${'─'.repeat(ownColWidth)}`
  );

  for (const fp of formattedPairs) {
    console.info(
      `  ${fp.path.padEnd(routeColWidth)}  ${fp.total.padStart(totalColWidth)}  ${fp.own.padStart(ownColWidth)}`
    );
  }

  console.info(
    `  ${'─'.repeat(routeColWidth)}  ${'─'.repeat(totalColWidth)}  ${'─'.repeat(ownColWidth)}`
  );

  const rootRaw = sumSize(rootOnlyFiles, 'raw');
  const rootGzip = sumSize(rootOnlyFiles, 'gzip');

  console.info('');
  console.info('  Breakdown:');
  console.info(
    `    Entry bootstrap (always loaded):  ${fmtPair(entryRaw, entryGzip)} (raw / gzip)`
  );
  console.info(`    Root layout (adds to entry):      ${fmtPair(rootRaw, rootGzip)} (raw / gzip)`);
  console.info(`    Route-only JS:                    Chunks unique to this route`);
  console.info('');
  console.info('  First Load JS = Entry + Root layout + Route-only JS');
  console.info('');
  console.info('  Raw  = uncompressed file size');
  console.info('  Gzip = compressed transfer size (what the browser receives)');
  console.info('');
}
