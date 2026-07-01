#!/usr/bin/env -S deno run -A

function fmtMs(s: number): string {
  if (s < 1) return `${(s * 1000).toFixed(2)}µs`;
  if (s < 1000) return `${s.toFixed(2)}ms`;
  return `${(s / 1000).toFixed(2)}s`;
}

function parseLatency(s: string): number {
  const v = s.trim();
  if (v.endsWith('ms')) return parseFloat(v);
  if (v.endsWith('s')) return parseFloat(v) * 1000;
  return parseFloat(v);
}

interface Row {
  route: string;
  rps: number;
  p75: number;
  p95: number;
  p99: number;
  avg: number;
}

function parseBenchOutput(text: string): Row[] {
  const rows: Row[] = [];
  const idx = text.indexOf('BENCHMARK RESULTS');
  if (idx === -1) return rows;
  for (const line of text.slice(idx).split('\n')) {
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 8) continue;
    const route = parts[1];
    if (!route || route === 'Route' || route.startsWith('─')) continue;
    const rps = Number(parts[2]!.replace(/,/g, ''));
    if (Number.isNaN(rps)) continue;
    rows.push({
      avg: parseLatency(parts[6]!),
      p75: parseLatency(parts[3]!),
      p95: parseLatency(parts[4]!),
      p99: parseLatency(parts[5]!),
      route,
      rps,
    });
  }
  return rows;
}

function parseBaselineMd(text: string): Row[] {
  const rows: Row[] = [];
  let inSection = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      inSection = line.includes('BFF Direct')
        ? 'BFF'
        : line.includes('FE Direct')
          ? 'FE'
          : line.includes('SSR Direct')
            ? 'SSR'
            : '';
    }
    if (!line.startsWith('|') || line.includes('---') || line.includes('Route')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 8) continue;
    const routeName = parts[1]!;
    if (!routeName || routeName === 'Route' || routeName.startsWith('#')) continue;
    const rpsVal = Number(parts[2]!.replace(/,/g, ''));
    if (Number.isNaN(rpsVal)) continue;
    const prefix =
      inSection === 'BFF'
        ? 'BFF Direct'
        : inSection === 'FE'
          ? 'FE Direct'
          : inSection === 'SSR'
            ? 'SSR Direct'
            : 'Unknown';
    rows.push({
      avg: parseLatency(parts[6]!),
      p75: parseLatency(parts[3]!),
      p95: parseLatency(parts[4]!),
      p99: parseLatency(parts[5]!),
      route: `${prefix} (${routeName})`,
      rps: rpsVal,
    });
  }
  return rows;
}

function renderBaselineRows(rows: Row[]): string {
  const lines: string[] = [];
  lines.push('| Route       | RPS    | p75       | p95       | p99       | Avg       |');
  lines.push('|-------------|--------|-----------|-----------|-----------|-----------|');
  for (const r of rows) {
    lines.push(
      `| ${r.route.padEnd(11)} | ${String(r.rps).padStart(6)} | ${fmtMs(r.p75).padStart(9)} | ${fmtMs(r.p95).padStart(9)} | ${fmtMs(r.p99).padStart(9)} | ${fmtMs(r.avg).padStart(9)} |`
    );
  }
  return lines.join('\n');
}

function warnIcon(pct: number, invert: boolean): string {
  // invert=true means lower is better (RPS), invert=false means higher is worse (latency)
  const regression = invert ? -pct : pct;
  return regression >= 10 && regression <= 25 ? ' ⚠️' : '';
}

function renderComparison(current: Row[], baseline: Row[]): string {
  const bmap = new Map(
    baseline.map(r => [
      r.route,
      r,
    ])
  );
  const hasBaseline = bmap.size > 0;
  const lines: string[] = [];
  lines.push('<!-- benchmark-comment -->');
  lines.push('## Benchmark Comparison');
  lines.push('');
  lines.push(
    '| Route          | Baseline RPS | Current RPS | Δ RPS   | Baseline p99 | Current p99 | Δ p99   |'
  );
  lines.push(
    '|----------------|-------------|-------------|---------|-------------|-------------|---------|'
  );
  let hasRegression = false;
  for (const c of current) {
    const b = bmap.get(c.route);
    if (b) {
      const rpsDelta = (((c.rps - b.rps) / b.rps) * 100).toFixed(1);
      const p99Delta = (((c.p99 - b.p99) / b.p99) * 100).toFixed(1);
      const rpsNum = Number(rpsDelta);
      const p99Num = Number(p99Delta);
      const rpsStr = rpsNum >= 0 ? `+${rpsDelta}%` : `${rpsDelta}%`;
      const p99Str = p99Num <= 0 ? `${p99Delta}%` : `+${p99Delta}%`;
      if (rpsNum < -15 || p99Num > 15) hasRegression = true;
      const rpsIcon = warnIcon(rpsNum, true);
      const p99Icon = warnIcon(p99Num, false);
      lines.push(
        `| ${c.route.padEnd(14)} | ${String(b.rps).padStart(11)} | ${String(c.rps).padStart(11)} | ${rpsStr.padStart(7)}${rpsIcon} | ${fmtMs(b.p99).padStart(11)} | ${fmtMs(c.p99).padStart(11)} | ${p99Str.padStart(7)}${p99Icon} |`
      );
    } else {
      lines.push(
        `| ${c.route.padEnd(14)} | ${'—'.padStart(11)} | ${String(c.rps).padStart(11)} | ${'—'.padStart(7)} | ${'—'.padStart(11)} | ${fmtMs(c.p99).padStart(11)} | ${'—'.padStart(7)} |`
      );
    }
  }
  if (hasRegression) {
    lines.push('');
    lines.push(
      '> ⚠ **Performance regression detected.** Some routes show >15% drop in RPS or increase in p99.'
    );
  }
  if (!hasBaseline) {
    lines.push('');
    lines.push(
      '> ℹ No baseline data available on `main` yet. This is the first benchmark comparison — current values will become the baseline after merge.'
    );
  }
  lines.push('');
  lines.push('### System');
  lines.push('');
  lines.push(...getSystemInfo());
  return lines.join('\n');
}

// Args: [bench-output-path] [--baseline baseline.md] [--output comment.md]

const args = Deno.args;
if (args.length === 0) {
  console.error(
    'Usage: update-baseline.ts <bench-output.txt> [--baseline baseline.md] [--output comment.md]'
  );
  Deno.exit(1);
}

function getSystemInfo(): string[] {
  const lines: string[] = [];
  lines.push(`- **OS**: ${Deno.build.os} ${Deno.build.arch}`);
  lines.push(`- **Deno**: ${Deno.version.deno}`);
  lines.push(`- **CPUs**: ${navigator.hardwareConcurrency} logical cores`);
  if (Deno.env.get('CI') === 'true') {
    lines.push(
      `- **Runner**: ${Deno.env.get('RUNNER_NAME') ?? Deno.env.get('RUNNER_OS') ?? 'GitHub Actions'}`
    );
    lines.push(`- **Runner label**: ${Deno.env.get('RUNNER_LABEL') ?? 'unknown'}`);
  } else {
    try {
      const release = Deno.osRelease();
      lines.push(`- **Kernel**: ${release}`);
    } catch {
      // ignore
    }
  }
  return lines;
}

const benchOutputPath = args[0]!;
const baselineFlagIdx = args.indexOf('--baseline');
const baselinePath = baselineFlagIdx !== -1 ? args[baselineFlagIdx + 1] : undefined;
const outputFlagIdx = args.indexOf('--output');
const outputPath = outputFlagIdx !== -1 ? args[outputFlagIdx + 1] : undefined;

const benchText = await Deno.readTextFile(benchOutputPath);
const currentRows = parseBenchOutput(benchText);

const bffRows = currentRows.filter(r => r.route.startsWith('BFF Direct'));
const feRows = currentRows.filter(r => r.route.startsWith('FE Direct'));
const ssrRows = currentRows.filter(r => r.route.startsWith('SSR Direct'));

// Write new baseline MD
const today = new Date().toISOString().split('T')[0];
const baselineLines: string[] = [];
baselineLines.push('# Benchmark Baseline');
baselineLines.push('');
baselineLines.push(`Last updated: <!-- updated -->${today}<!-- /updated -->`);
baselineLines.push('');
baselineLines.push('## System');
baselineLines.push('');
baselineLines.push(...getSystemInfo());
baselineLines.push('');
baselineLines.push(
  'Only direct servers (bypassing workerd) are benchmarked. Gateway routes are excluded because workerd dev mode is too noisy for regression detection.'
);
baselineLines.push('');
baselineLines.push('## BFF Direct (`http://127.0.0.1:3001`)');
baselineLines.push('');
baselineLines.push(renderBaselineRows(bffRows));
baselineLines.push('');
if (feRows.length > 0) {
  baselineLines.push('## FE Direct (`http://127.0.0.1:5174`) — Prerendered HTML');
  baselineLines.push('');
  baselineLines.push(renderBaselineRows(feRows));
  baselineLines.push('');
}
baselineLines.push('## SSR Direct (`http://127.0.0.1:5175`)');
baselineLines.push('');
baselineLines.push(renderBaselineRows(ssrRows));
baselineLines.push('');

await Deno.writeTextFile('docs/benchmark-baseline.md', baselineLines.join('\n'));

// Compare if baseline file provided
if (baselinePath) {
  const baselineText = await Deno.readTextFile(baselinePath);
  const baselineRows = parseBaselineMd(baselineText);
  const comparison = renderComparison(currentRows, baselineRows);
  if (outputPath) {
    await Deno.writeTextFile(outputPath, comparison);
  } else {
    console.log(comparison);
  }
}
