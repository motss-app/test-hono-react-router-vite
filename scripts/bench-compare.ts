#!/usr/bin/env -S deno run -A

/**
 * Benchmark comparison script.
 *
 * Runs benchmarks, compares against baseline, and outputs results.
 * Used by the GitHub Actions workflow to detect performance regressions.
 *
 * Exit codes:
 *   0 - No regression (improvement or tie)
 *   1 - Regression detected
 *   2 - Script error
 */

interface BenchmarkResult {
  route: string;
  rps: number;
  p75: number;
  p95: number;
  p99: number;
  avgLatency: number;
  totalRequests: number;
  successRate: number;
  bytesPerSec: number;
}

interface ComparisonResult {
  route: string;
  baseline: BenchmarkResult;
  current: BenchmarkResult;
  rpsDelta: number;
  p99Delta: number;
  isRegression: boolean;
}

interface Summary {
  status: 'improvement' | 'regression' | 'tie';
  regressions: ComparisonResult[];
  improvements: ComparisonResult[];
  unchanged: ComparisonResult[];
  timestamp: string;
  commitSha: string;
}

const REGRESSION_THRESHOLD = 10;
const TIE_THRESHOLD = 5;

function parseMarkdownTable(text: string): BenchmarkResult[] {
  const results: BenchmarkResult[] = [];
  for (const line of text.split('\n')) {
    const match = line.match(
      /^\|\s*([^|]+)\s*\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/
    );
    if (match?.[1] && match[2] && match[5]) {
      const route = match[1].trim();
      const rps = parseInt(match[2], 10);
      const p99 = parseLatency(match[5].trim());
      if (route && !Number.isNaN(rps) && !Number.isNaN(p99)) {
        results.push({
          avgLatency: 0,
          bytesPerSec: 0,
          p75: 0,
          p95: 0,
          p99,
          route,
          rps,
          successRate: 1,
          totalRequests: 0,
        });
      }
    }
  }
  return results;
}

function parseLatency(value: string): number {
  const match = value.match(/([\d.]+)(ms|s|µs)/);
  if (!(match?.[1] && match[2])) return 0;
  const num = parseFloat(match[1]);
  if (match[2] === 'ms') return num;
  if (match[2] === 's') return num * 1000;
  if (match[2] === 'µs') return num / 1000;
  return 0;
}

async function loadBaseline(path: string): Promise<BenchmarkResult[]> {
  try {
    return parseMarkdownTable(await Deno.readTextFile(path));
  } catch {
    return [];
  }
}

function compareResults(
  baseline: BenchmarkResult[],
  current: BenchmarkResult[]
): ComparisonResult[] {
  const baselineMap = new Map(
    baseline.map(r => [
      r.route,
      r,
    ])
  );
  const comparisons: ComparisonResult[] = [];
  for (const curr of current) {
    const base = baselineMap.get(curr.route);
    if (!base) continue;
    const rpsDelta = base.rps > 0 ? ((curr.rps - base.rps) / base.rps) * 100 : 0;
    const p99Delta = base.p99 > 0 ? ((curr.p99 - base.p99) / base.p99) * 100 : 0;
    const isRegression = rpsDelta < -REGRESSION_THRESHOLD || p99Delta > REGRESSION_THRESHOLD;
    comparisons.push({
      baseline: base,
      current: curr,
      isRegression,
      p99Delta,
      route: curr.route,
      rpsDelta,
    });
  }
  return comparisons;
}

function formatDelta(delta: number, inverse = false): string {
  const d = inverse ? -delta : delta;
  return `${d > 0 ? '+' : ''}${d.toFixed(1)}%`;
}

function generateReportTable(
  title: string,
  rows: ComparisonResult[],
  columns: 'full' | 'short'
): string {
  const lines: string[] = [
    `### ${title}`,
    '',
  ];
  if (columns === 'full') {
    lines.push(
      '| Route | Baseline RPS | Current RPS | RPS Delta | Baseline p99 | Current p99 | p99 Delta |'
    );
    lines.push(
      '|-------|-------------|-------------|-----------|--------------|-------------|-----------|'
    );
    for (const r of rows) {
      lines.push(
        `| ${r.route} | ${r.baseline.rps.toFixed(0)} | ${r.current.rps.toFixed(0)} | ${formatDelta(r.rpsDelta, true)} | ${r.baseline.p99.toFixed(1)}ms | ${r.current.p99.toFixed(1)}ms | ${formatDelta(r.p99Delta)} |`
      );
    }
  } else {
    lines.push('| Route | RPS | p99 |');
    lines.push('|-------|-----|-----|');
    for (const r of rows) {
      lines.push(`| ${r.route} | ${r.current.rps.toFixed(0)} | ${r.current.p99.toFixed(1)}ms |`);
    }
  }
  lines.push('');
  return lines.join('\n');
}

function generateMarkdownReport(summary: Summary): string {
  const parts = [
    '## Benchmark Results',
    '',
    `**Status:** ${summary.status.toUpperCase()}`,
    `**Commit:** \`${summary.commitSha.slice(0, 8)}\``,
    `**Timestamp:** ${summary.timestamp}`,
    '',
  ];
  if (summary.regressions.length > 0)
    parts.push(generateReportTable('Regressions', summary.regressions, 'full'));
  if (summary.improvements.length > 0)
    parts.push(generateReportTable('Improvements', summary.improvements, 'full'));
  if (summary.unchanged.length > 0)
    parts.push(generateReportTable('Unchanged', summary.unchanged, 'short'));
  return parts.join('\n');
}

function generateBaselineMarkdown(results: BenchmarkResult[], commitSha: string): string {
  const lines = [
    '# Benchmark Baseline',
    '',
    `**Commit:** \`${commitSha}\``,
    `**Timestamp:** ${new Date().toISOString()}`,
    '',
    'Route | RPS | p99',
    '|------|-----|-----',
  ];
  for (const r of results) {
    const p99 =
      r.p99 < 1
        ? `${(r.p99 * 1000).toFixed(2)}µs`
        : r.p99 < 1000
          ? `${r.p99.toFixed(2)}ms`
          : `${(r.p99 / 1000).toFixed(3)}s`;
    lines.push(`| ${r.route} | ${r.rps.toFixed(0)} | ${p99} |`);
  }
  lines.push('');
  return lines.join('\n');
}

function parseArgs(): {
  baselinePath: string;
  commitSha: string;
  outputDir: string;
} {
  const args = Deno.args;
  return {
    baselinePath: args.find(a => a.startsWith('--baseline='))?.split('=')[1] ?? 'bench-baseline.md',
    commitSha: args.find(a => a.startsWith('--commit='))?.split('=')[1] ?? 'unknown',
    outputDir: args.find(a => a.startsWith('--output-dir='))?.split('=')[1] ?? '.bench-results',
  };
}

async function runBenchmark(): Promise<string> {
  const cmd = new Deno.Command('deno', {
    args: [
      'run',
      '-A',
      'scripts/bench-all.ts',
    ],
    stderr: 'piped',
    stdout: 'piped',
  });
  const { code, stdout, stderr } = await cmd.output();
  if (code !== 0) {
    Deno.exit(2);
  }
  return new TextDecoder().decode(stdout);
}

function classifyComparisons(comparisons: ComparisonResult[]): {
  regressions: ComparisonResult[];
  improvements: ComparisonResult[];
  unchanged: ComparisonResult[];
} {
  const regressions = comparisons.filter(c => c.isRegression);
  const improvements = comparisons.filter(
    c => !c.isRegression && (c.rpsDelta > TIE_THRESHOLD || c.p99Delta < -TIE_THRESHOLD)
  );
  const unchanged = comparisons.filter(
    c =>
      !c.isRegression &&
      Math.abs(c.rpsDelta) <= TIE_THRESHOLD &&
      Math.abs(c.p99Delta) <= TIE_THRESHOLD
  );
  return {
    improvements,
    regressions,
    unchanged,
  };
}

async function saveResults(
  outputDir: string,
  summary: Summary,
  current: BenchmarkResult[]
): Promise<void> {
  await Deno.mkdir(outputDir, {
    recursive: true,
  });
  await Deno.writeTextFile(`${outputDir}/benchmark-report.md`, generateMarkdownReport(summary));
  await Deno.writeTextFile(
    `${outputDir}/benchmark-results.md`,
    generateBaselineMarkdown(current, summary.commitSha)
  );
  await Deno.writeTextFile(`${outputDir}/benchmark-summary.json`, JSON.stringify(summary, null, 2));
}

function printSummary(summary: Summary): void {
  if (summary.regressions.length > 0) {
    for (const _r of summary.regressions) {
    }
  }
}

async function main(): Promise<void> {
  const { baselinePath, commitSha, outputDir } = parseArgs();
  const baseline = await loadBaseline(baselinePath);
  if (baseline.length === 0) {
    Deno.exit(2);
  }
  const output = await runBenchmark();
  const current = parseMarkdownTable(output);
  if (current.length === 0) {
    Deno.exit(2);
  }
  const comparisons = compareResults(baseline, current);
  const { regressions, improvements, unchanged } = classifyComparisons(comparisons);
  const status =
    regressions.length > 0 ? 'regression' : improvements.length > 0 ? 'improvement' : 'tie';
  const summary: Summary = {
    commitSha,
    improvements,
    regressions,
    status,
    timestamp: new Date().toISOString(),
    unchanged,
  };
  await saveResults(outputDir, summary, current);
  printSummary(summary);
  if (status === 'regression') Deno.exit(1);
}

if (import.meta.main) {
  try {
    await main();
  } catch (_err) {
    Deno.exit(2);
  }
}
