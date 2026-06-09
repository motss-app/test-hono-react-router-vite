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
    if (isNaN(rps)) continue;
    rows.push({
      route,
      rps,
      p75: parseLatency(parts[3]!),
      p95: parseLatency(parts[4]!),
      p99: parseLatency(parts[5]!),
      avg: parseLatency(parts[6]!),
    });
  }
  return rows;
}

function parseBaselineMd(text: string): Row[] {
  const rows: Row[] = [];
  let inSection = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      inSection = line.includes('BFF Direct') ? 'BFF' : line.includes('SSR Direct') ? 'SSR' : '';
    }
    if (!line.startsWith('|') || line.includes('---') || line.includes('Route')) continue;
    const parts = line.split('|').map(s => s.trim());
    if (parts.length < 8) continue;
    const routeName = parts[1]!;
    if (!routeName || routeName === 'Route' || routeName.startsWith('#')) continue;
    const rpsVal = Number(parts[2]!.replace(/,/g, ''));
    if (isNaN(rpsVal)) continue;
    const prefix = inSection === 'BFF' ? 'BFF Direct' : inSection === 'SSR' ? 'SSR Direct' : 'Unknown';
    rows.push({
      route: `${prefix} (${routeName})`,
      rps: rpsVal,
      p75: parseLatency(parts[3]!),
      p95: parseLatency(parts[4]!),
      p99: parseLatency(parts[5]!),
      avg: parseLatency(parts[6]!),
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

function renderComparison(current: Row[], baseline: Row[]): string {
  const bmap = new Map(baseline.map(r => [r.route, r]));
  const lines: string[] = [];
  lines.push('## Benchmark Comparison');
  lines.push('');
  lines.push('| Route          | Baseline RPS | Current RPS | Δ RPS   | Baseline p99 | Current p99 | Δ p99   |');
  lines.push('|----------------|-------------|-------------|---------|-------------|-------------|---------|');
  let hasRegression = false;
  for (const c of current) {
    const b = bmap.get(c.route);
    if (!b) continue;
    const rpsDelta = ((c.rps - b.rps) / b.rps * 100).toFixed(1);
    const p99Delta = ((c.p99 - b.p99) / b.p99 * 100).toFixed(1);
    const rpsStr = Number(rpsDelta) >= 0 ? `+${rpsDelta}%` : `${rpsDelta}%`;
    const p99Str = Number(p99Delta) <= 0 ? `${p99Delta}%` : `+${p99Delta}%`;
    if (Number(rpsDelta) < -15 || Number(p99Delta) > 15) hasRegression = true;
    lines.push(
      `| ${c.route.padEnd(14)} | ${String(b.rps).padStart(11)} | ${String(c.rps).padStart(11)} | ${rpsStr.padStart(7)} | ${fmtMs(b.p99).padStart(11)} | ${fmtMs(c.p99).padStart(11)} | ${p99Str.padStart(7)} |`
    );
  }
  if (hasRegression) {
    lines.push('');
    lines.push('> ⚠ **Performance regression detected.** Some routes show >15% drop in RPS or increase in p99.');
  }
  return lines.join('\n');
}

// Args: [bench-output-path] [--baseline baseline.md] [--output comment.md]

const args = Deno.args;
if (args.length === 0) {
  console.error('Usage: update-baseline.ts <bench-output.txt> [--baseline baseline.md] [--output comment.md]');
  Deno.exit(1);
}

const benchOutputPath = args[0]!;
const baselineFlagIdx = args.indexOf('--baseline');
const baselinePath = baselineFlagIdx !== -1 ? args[baselineFlagIdx + 1] : undefined;
const outputFlagIdx = args.indexOf('--output');
const outputPath = outputFlagIdx !== -1 ? args[outputFlagIdx + 1] : undefined;

const benchText = await Deno.readTextFile(benchOutputPath);
const currentRows = parseBenchOutput(benchText);

const bffRows = currentRows.filter(r => r.route.startsWith('BFF Direct'));
const ssrRows = currentRows.filter(r => r.route.startsWith('SSR Direct'));

// Write new baseline MD
const today = new Date().toISOString().split('T')[0];
const baselineLines: string[] = [];
baselineLines.push('# Benchmark Baseline');
baselineLines.push('');
baselineLines.push(`Last updated: <!-- updated -->${today}<!-- /updated -->`);
baselineLines.push('');
baselineLines.push('Only direct servers (bypassing workerd) are benchmarked. Gateway routes are excluded because workerd dev mode is too noisy for regression detection.');
baselineLines.push('');
baselineLines.push('## BFF Direct (`http://127.0.0.1:3001`)');
baselineLines.push('');
baselineLines.push(renderBaselineRows(bffRows));
baselineLines.push('');
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
