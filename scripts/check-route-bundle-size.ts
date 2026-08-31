#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Compare current route bundle sizes against a baseline.
 *
 * Exit code 1 if any route exceeds the budget (default 10%).
 * Outputs a markdown comment suitable for GitHub PR comments.
 *
 * Usage:
 *   deno run -A scripts/check-route-bundle-size.ts <current.json> --baseline <baseline.json> [--budget 10] [--output <file>]
 */

const BUDGET_DEFAULT = 10;

// ---------------------------------------------------------------------------
// Parse args
// ---------------------------------------------------------------------------
const args = Deno.args;
let currentPath = '';
let baselinePath = '';
let budget = BUDGET_DEFAULT;
let outputPath = '';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (!arg) continue;
  if (arg === '--baseline' && args[i + 1]) {
    baselinePath = args[++i] ?? '';
  } else if (arg === '--budget' && args[i + 1]) {
    budget = Number.parseFloat(args[++i] ?? String(BUDGET_DEFAULT));
  } else if (arg === '--output' && args[i + 1]) {
    outputPath = args[++i] ?? '';
  } else if (!arg.startsWith('--') && !currentPath) {
    currentPath = arg;
  }
}

if (!currentPath || !baselinePath) {
  console.error(
    'Usage: check-route-bundle-size.ts <current.json> --baseline <baseline.json> [--budget 10] [--output <file>]'
  );
  Deno.exit(1);
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
interface RouteSize {
  gzipBytes: number;
  ownGzipBytes: number;
  ownRawBytes: number;
  rawBytes: number;
  route: string;
}

interface BundleSizeReport {
  entry: {
    gzipBytes: number;
    rawBytes: number;
  };
  rootLayout: {
    gzipBytes: number;
    rawBytes: number;
  };
  routes: RouteSize[];
}

const current = JSON.parse(await Deno.readTextFile(currentPath)) as BundleSizeReport;
const baseline = JSON.parse(await Deno.readTextFile(baselinePath)) as BundleSizeReport;

// ---------------------------------------------------------------------------
// Compare
// ---------------------------------------------------------------------------
interface RouteDiff {
  budgetPct: number;
  changePct: number;
  currentGzip: number;
  baselineGzip: number;
  route: string;
  status: 'ok' | 'warn' | 'fail';
}

const baselineMap = new Map<string, RouteSize>();
for (const r of baseline.routes) {
  baselineMap.set(r.route, r);
}

const diffs: RouteDiff[] = [];
const warnings: RouteDiff[] = [];
const failures: RouteDiff[] = [];

for (const r of current.routes) {
  const base = baselineMap.get(r.route);
  if (!base) {
    // New route — no baseline to compare against
    diffs.push({
      baselineGzip: 0,
      budgetPct: 0,
      changePct: 0,
      currentGzip: r.gzipBytes,
      route: r.route,
      status: 'ok',
    });
    continue;
  }

  const changePct =
    base.gzipBytes > 0 ? ((r.gzipBytes - base.gzipBytes) / base.gzipBytes) * 100 : 0;

  let status: 'ok' | 'warn' | 'fail' = 'ok';
  if (changePct > budget) {
    status = 'fail';
    failures.push({
      baselineGzip: base.gzipBytes,
      budgetPct: budget,
      changePct,
      currentGzip: r.gzipBytes,
      route: r.route,
      status,
    });
  } else if (changePct > budget * 0.75) {
    status = 'warn';
    warnings.push({
      baselineGzip: base.gzipBytes,
      budgetPct: budget,
      changePct,
      currentGzip: r.gzipBytes,
      route: r.route,
      status,
    });
  }

  diffs.push({
    baselineGzip: base.gzipBytes,
    budgetPct: budget,
    changePct,
    currentGzip: r.gzipBytes,
    route: r.route,
    status,
  });
}

// Also compare entry and rootLayout
const entryChangePct =
  baseline.entry.gzipBytes > 0
    ? ((current.entry.gzipBytes - baseline.entry.gzipBytes) / baseline.entry.gzipBytes) * 100
    : 0;
const rootChangePct =
  baseline.rootLayout.gzipBytes > 0
    ? ((current.rootLayout.gzipBytes - baseline.rootLayout.gzipBytes) /
        baseline.rootLayout.gzipBytes) *
      100
    : 0;

// ---------------------------------------------------------------------------
// Generate markdown comment
// ---------------------------------------------------------------------------
function fmtKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function fmtPct(pct: number): string {
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(1)}%`;
}

function statusIcon(status: 'ok' | 'warn' | 'fail'): string {
  return status === 'fail' ? '❌' : status === 'warn' ? '⚠️' : '✅';
}

const lines: string[] = [];
lines.push('<!-- route-bundle-size-comment -->');
lines.push('');

if (failures.length > 0) {
  lines.push('## ❌ Route Bundle Size Budget Exceeded');
  lines.push('');
  lines.push(`**Budget:** ${budget}% increase per route (gzip).`);
  lines.push('');
} else if (warnings.length > 0) {
  lines.push('## ⚠️ Route Bundle Size Warning');
  lines.push('');
  lines.push(`**Budget:** ${budget}% increase per route (gzip). Approaching limit.`);
  lines.push('');
} else {
  lines.push('## ✅ Route Bundle Size Check Passed');
  lines.push('');
  lines.push(`All routes within ${budget}% budget.`);
  lines.push('');
}

// Entry & root layout
lines.push('### Shared Baseline');
lines.push('');
lines.push('| Component | Baseline | Current | Change |');
lines.push('|-----------|----------|---------|--------|');
lines.push(
  `| Entry bootstrap | ${fmtKb(baseline.entry.gzipBytes)} | ${fmtKb(current.entry.gzipBytes)} | ${fmtPct(entryChangePct)} |`
);
lines.push(
  `| Root layout | ${fmtKb(baseline.rootLayout.gzipBytes)} | ${fmtKb(current.rootLayout.gzipBytes)} | ${fmtPct(rootChangePct)} |`
);
lines.push('');

// Per-route table
lines.push('### Per-Route (gzip)');
lines.push('');
lines.push('| Route | Baseline | Current | Change | Status |');
lines.push('|-------|----------|---------|--------|--------|');
for (const d of diffs) {
  lines.push(
    `| \`${d.route}\` | ${fmtKb(d.baselineGzip)} | ${fmtKb(d.currentGzip)} | ${fmtPct(d.changePct)} | ${statusIcon(d.status)} |`
  );
}
lines.push('');

if (failures.length > 0) {
  lines.push('### Failed Routes');
  lines.push('');
  for (const f of failures) {
    lines.push(`- **\`${f.route}\`**: ${fmtPct(f.changePct)} (budget: ${budget}%)`);
  }
  lines.push('');
  lines.push('To fix: reduce JS bundle size for the failing routes, or bump the baseline:');
  lines.push('```bash');
  lines.push('deno task route-bundle-size --json > route-bundle-size-baseline.json');
  lines.push('```');
  lines.push('');
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const markdown = lines.join('\n');

if (outputPath) {
  await Deno.writeTextFile(outputPath, markdown);
  console.info(`Comment written to ${outputPath}`);
} else {
  console.info(markdown);
}

// Exit with error if any failures
if (failures.length > 0) {
  Deno.exit(1);
}
