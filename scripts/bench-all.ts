#!/usr/bin/env -S deno run -A
import process from 'node:process';

import { clearPorts } from './dev-ports.ts';

interface BenchmarkResult {
  route: string;
  method: string;
  rps: number;
  p75: number;
  p95: number;
  p99: number;
  avgLatency: number;
  totalRequests: number;
  successRate: number;
  bytesPerSec: number;
}

interface BenchmarkRun {
  timestamp: string;
  gitCommit: string;
  config: {
    baseUrl: string;
    concurrency: number;
    duration: string;
    warmupDuration: string;
  };
  results: BenchmarkResult[];
}

interface OhaOutput {
  summary: {
    successRate: number;
    total: number;
    slowest: number | null;
    fastest: number | null;
    average: number | null;
    requestsPerSec: number;
    totalData: number;
    sizePerRequest: number | null;
    sizePerSec: number;
  };
  latencyPercentiles: {
    p10: number | null;
    p25: number | null;
    p50: number | null;
    p75: number | null;
    p90: number | null;
    p95: number | null;
    p99: number | null;
    p99_9: number | null;
    p99_99: number | null;
  };
  statusCodeDistribution: Record<string, number>;
  errorDistribution: Record<string, number>;
}

interface RouteDef {
  name: string;
  path: string;
  method?: string;
}

function elapsed(start: number): string {
  const s = ((performance.now() - start) / 1000).toFixed(1);
  return `${s}s`;
}

function formatLatency(ms: number | null): string {
  if (ms === null || ms === undefined) return 'N/A';
  if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(3)}s`;
}

function formatRps(rps: number): string {
  return `${rps.toFixed(0).padStart(7)}`;
}

function formatPercent(pct: number): string {
  return `${(pct * 100).toFixed(1)}%`;
}

function getConfig() {
  const baseUrl = Deno.env.get('BENCH_BASE_URL') ?? 'http://localhost:8787';
  const concurrency = Number(Deno.env.get('BENCH_CONCURRENCY') ?? 100);
  const duration = Deno.env.get('BENCH_DURATION') ?? '15s';
  const warmupDuration = Deno.env.get('BENCH_WARMUP') ?? '3s';
  const noSave = Deno.env.get('BENCH_NO_SAVE') === '1';
  const noCompare = Deno.env.get('BENCH_NO_COMPARE') === '1';
  const regressionThreshold = Number(Deno.env.get('BENCH_REGRESSION_PCT') ?? 10);
  return {
    baseUrl,
    concurrency,
    duration,
    warmupDuration,
    noSave,
    noCompare,
    regressionThreshold,
  };
}

function outputDir(): string {
  return Deno.env.get('BENCH_OUTPUT_DIR') ?? 'output';
}

function resultFilePath(dir: string): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return `${dir}/bench-${ts}.json`;
}

async function saveResults(run: BenchmarkRun, dir: string): Promise<string> {
  try {
    await Deno.mkdir(dir, { recursive: true });
  } catch {
    /* exists */
  }
  const path = resultFilePath(dir);
  const data = new TextEncoder().encode(JSON.stringify(run, null, 2) + '\n');
  await Deno.writeFile(path, data);
  return path;
}

async function loadLatestResults(dir: string): Promise<BenchmarkRun | null> {
  try {
    const entries: Deno.DirEntry[] = [];
    for await (const e of Deno.readDir(dir)) {
      if (e.isFile && e.name.startsWith('bench-') && e.name.endsWith('.json')) {
        entries.push(e);
      }
    }
    if (entries.length === 0) return null;
    entries.sort((a, b) => b.name.localeCompare(a.name));
    const data = await Deno.readFile(`${dir}/${entries[0]!.name}`);
    return JSON.parse(new TextDecoder().decode(data)) as BenchmarkRun;
  } catch {
    return null;
  }
}

function getGitCommit(): string {
  try {
    const cmd = new Deno.Command('git', {
      args: ['rev-parse', '--short', 'HEAD'],
      stdout: 'piped',
      stderr: 'null',
    });
    const { stdout } = cmd.outputSync();
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return 'unknown';
  }
}

function computeRegression(previous: BenchmarkResult, current: BenchmarkResult, thresholdPct: number): string | null {
  const rpsChange = ((current.rps - previous.rps) / previous.rps) * 100;
  const p99Change = previous.p99 > 0 ? ((current.p99 - previous.p99) / previous.p99) * 100 : 0;
  const issues: string[] = [];
  if (rpsChange < -thresholdPct) {
    issues.push(`RPS ${rpsChange.toFixed(1)}% (threshold: ${thresholdPct}%)`);
  }
  if (p99Change > thresholdPct) {
    issues.push(`p99 +${p99Change.toFixed(1)}% (threshold: ${thresholdPct}%)`);
  }
  return issues.length > 0 ? issues.join(', ') : null;
}

function printComparison(current: BenchmarkRun, previous: BenchmarkRun, thresholdPct: number): BenchmarkResult[] {
  const regressed: BenchmarkResult[] = [];
  const prevMap = new Map<string, BenchmarkResult>();
  for (const r of previous.results) {
    prevMap.set(r.route, r);
  }

  console.log('\n Performance Regression Check');
  console.log('─'.repeat(78));
  console.log(`  Previous: ${previous.timestamp} (${previous.gitCommit})`);
  console.log(`  Current:  ${current.timestamp} (${current.gitCommit})`);
  console.log(`  Threshold: ${thresholdPct}% change in RPS or p99`);
  console.log('─'.repeat(78));

  let hasIssues = false;
  for (const cur of current.results) {
    const prev = prevMap.get(cur.route);
    if (!prev) {
      console.log(`  ${cur.route.padEnd(18)} NEW (no previous data)`);
      continue;
    }

    const rpsDelta = ((cur.rps - prev.rps) / prev.rps * 100).toFixed(1);
    const p99Delta = prev.p99 > 0
      ? ((cur.p99 - prev.p99) / prev.p99 * 100).toFixed(1)
      : 'N/A';

    const issue = computeRegression(prev, cur, thresholdPct);
    if (issue) {
      hasIssues = true;
      regressed.push(cur);
      console.log(`  ${'⚠'.padEnd(2)} ${cur.route.padEnd(18)} RPS: ${rpsDelta}%  p99: ${p99Delta}%  — ${issue}`);
    } else {
      console.log(`  ${'✓'.padEnd(2)} ${cur.route.padEnd(18)} RPS: ${rpsDelta}%  p99: ${p99Delta}%`);
    }
  }

  console.log('─'.repeat(78));

  if (hasIssues) {
    console.log(`  ⚠  ${regressed.length} route(s) exceeded the ${thresholdPct}% threshold`);
    for (const r of regressed) {
      console.log(`     - ${r.route} (RPS: ${r.rps.toFixed(0)}, p99: ${formatLatency(r.p99)})`);
    }
  } else {
    console.log('  ✓ No regressions detected');
  }
  console.log('');

  return regressed;
}

const ROUTES: RouteDef[] = [
  {
    name: 'Health (gateway)',
    path: '/healthz',
  },
  {
    name: 'Health (BFF)',
    path: '/api/healthz',
  },
  {
    name: 'Home',
    path: '/',
  },
  {
    name: 'About',
    path: '/about',
  },
  {
    name: 'Holy Grail',
    path: '/holy-grail',
  },
  {
    name: 'SSR',
    path: '/ssr',
  },
  {
    name: 'Hono RPC',
    path: '/hono-rpc',
  },
  {
    name: 'Errors Index',
    path: '/errors',
  },
  {
    name: 'Error 404',
    path: '/errors/404',
  },
  {
    name: 'API RPC Hello',
    path: '/api/rpc/hello',
  },
  {
    name: 'API Test',
    path: '/api/test',
  },
];

function getOhaPath(): string {
  const fromEnv = Deno.env.get('OHA_BINARY');
  if (fromEnv) return fromEnv;
  const candidates = [
    'oha',
    '/opt/homebrew/bin/oha',
    '/usr/local/bin/oha',
  ];
  for (const c of candidates) {
    try {
      Deno.statSync(c);
      return c;
    } catch {
      // not found at this path
    }
  }
  return 'oha';
}

async function runOha(url: string, duration: string, concurrency: number): Promise<OhaOutput> {
  const ohaBin = getOhaPath();
  const cmd = new Deno.Command(ohaBin, {
    args: [
      '-z',
      duration,
      '-c',
      String(concurrency),
      '--no-tui',
      '--output-format',
      'json',
      '--disable-keepalive',
      url,
    ],
    stderr: 'piped',
    stdout: 'piped',
  });

  const { code, stdout, stderr } = await cmd.output();

  if (code !== 0) {
    const errText = new TextDecoder().decode(stderr).trim();
    throw new Error(`oha exited with code ${code}: ${errText}`);
  }

  const text = new TextDecoder().decode(stdout);
  return JSON.parse(text) as OhaOutput;
}

async function waitForServer(url: string, timeoutMs?: number): Promise<void> {
  const deadline = Date.now() + (timeoutMs ?? 30_000);
  while (Date.now() < deadline) {
    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(2_000),
      });
      if (resp.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Server at ${url} not ready within ${timeoutMs}ms`);
}

async function benchmarkRoute(
  route: RouteDef,
  baseUrl: string,
  duration: string,
  concurrency: number
): Promise<BenchmarkResult> {
  const url = `${baseUrl}${route.path}`;
  const result = await runOha(url, duration, concurrency);

  const l = result.latencyPercentiles;
  const s = result.summary;

  const totalRequests = Object.values(result.statusCodeDistribution).reduce((a, b) => a + b, 0);

  return {
    avgLatency: s.average ?? 0,
    bytesPerSec: s.sizePerSec,
    method: route.method ?? 'GET',
    p75: l.p75 ?? 0,
    p95: l.p95 ?? 0,
    p99: l.p99 ?? 0,
    route: route.name,
    rps: s.requestsPerSec,
    successRate: s.successRate,
    totalRequests,
  };
}

function printSeparator(length: number): void {
  console.log('─'.repeat(length));
}

function printTable(results: BenchmarkResult[], totalTime: number): void {
  const colWidths = {
    avg: 12,
    bw: 10,
    p75: 12,
    p95: 12,
    p99: 12,
    reqs: 8,
    route: 20,
    rps: 9,
    success: 8,
  };

  const header = [
    'Route'.padEnd(colWidths.route),
    'RPS'.padStart(colWidths.rps),
    'p75'.padStart(colWidths.p75),
    'p95'.padStart(colWidths.p95),
    'p99'.padStart(colWidths.p99),
    'Avg'.padStart(colWidths.avg),
    'Requests'.padStart(colWidths.reqs),
    'Success'.padStart(colWidths.success),
    'BW/s'.padStart(colWidths.bw),
  ].join(' | ');

  const totalWidth = header.length;
  printSeparator(totalWidth);
  console.log(` BENCHMARK RESULTS  (total: ${totalTime.toFixed(1)}s)`);
  printSeparator(totalWidth);
  console.log(header);
  printSeparator(totalWidth);

  for (const r of results) {
    const name =
      r.route.length > colWidths.route ? r.route.slice(0, colWidths.route - 3) + '...' : r.route;

    const bw =
      r.bytesPerSec > 1_000_000
        ? `${(r.bytesPerSec / 1_000_000).toFixed(1)} MB`
        : r.bytesPerSec > 1_000
          ? `${(r.bytesPerSec / 1_000).toFixed(0)} KB`
          : `${r.bytesPerSec.toFixed(0)} B`;

    console.log(
      [
        name.padEnd(colWidths.route),
        formatRps(r.rps).padStart(colWidths.rps),
        formatLatency(r.p75).padStart(colWidths.p75),
        formatLatency(r.p95).padStart(colWidths.p95),
        formatLatency(r.p99).padStart(colWidths.p99),
        formatLatency(r.avgLatency).padStart(colWidths.avg),
        String(r.totalRequests).padStart(colWidths.reqs),
        formatPercent(r.successRate).padStart(colWidths.success),
        bw.padStart(colWidths.bw),
      ].join(' | ')
    );
  }

  printSeparator(totalWidth);
}

function printShortSummary(results: BenchmarkResult[]): void {
  if (results.length === 0) return;

  const sortedP99 = [
    ...results,
  ].sort((a, b) => a.p99 - b.p99);
  const fast = sortedP99[0]!;
  const slow = sortedP99[sortedP99.length - 1]!;
  const bestRps = [
    ...results,
  ].sort((a, b) => b.rps - a.rps)[0]!;

  const totalReq = results.reduce((a, r) => a + r.totalRequests, 0);
  const avgRps = results.reduce((a, r) => a + r.rps, 0) / results.length;

  console.log(`\nRequests: ${totalReq.toLocaleString()} total  |  Avg RPS: ${avgRps.toFixed(0)}`);
  console.log(
    `Fastest p99: ${fast.route} (${formatLatency(fast.p99)})  |  ` +
      `Slowest p99: ${slow.route} (${formatLatency(slow.p99)})`
  );
  console.log(`Highest RPS: ${bestRps.route} (${bestRps.rps.toFixed(0)} req/s)`);
}

interface ManagedProcess {
  child: Deno.ChildProcess;
  name: string;
}

const managedProcesses: ManagedProcess[] = [];

function cleanup(signal?: Deno.Signal): void {
  signal = signal ?? 'SIGTERM';
  for (const p of managedProcesses) {
    try {
      p.child.kill(signal);
    } catch {
      /* ignore */
    }
  }
}

async function main(): Promise<void> {
  const overallStart = performance.now();
  const { baseUrl, concurrency, duration, warmupDuration, noSave, noCompare, regressionThreshold } = getConfig();

  const startServers = Deno.env.get('BENCH_NO_START') !== '1';
  const servicePort = new URL(baseUrl).port || '8787';

  if (startServers) {
    console.log(`Clearing port ${servicePort}...`);
    await clearPorts([
      Number(servicePort),
    ]);

    console.log('Building for production...');
    const build = new Deno.Command('deno', {
      args: [
        'task',
        'build',
      ],
      env: {
        ...Deno.env.toObject(),
      },
      stderr: 'inherit',
      stdout: 'inherit',
    }).spawn();

    const { code: buildCode } = await build.output();
    if (buildCode !== 0) {
      throw new Error('Build failed');
    }

    console.log(`Starting gateway preview server on port ${servicePort}...`);
    const gateway = new Deno.Command('deno', {
      args: [
        'task',
        '--cwd=packages/gateway',
        'preview',
      ],
      env: {
        ...Deno.env.toObject(),
      },
      stderr: 'inherit',
      stdout: 'inherit',
    }).spawn();
    managedProcesses.push({
      child: gateway,
      name: 'gateway',
    });
    console.log('Waiting for gateway to be ready...');
    await waitForServer(`${baseUrl}/healthz`, 60_000);
    console.log('Gateway is ready.\n');
  }

  console.log(`Benchmarking ${ROUTES.length} routes:`);
  console.log(`  Duration:   ${duration}`);
  console.log(`  Concurrency: ${concurrency}`);
  console.log(`  Warmup:     ${warmupDuration}`);
  console.log(`  Base URL:   ${baseUrl}\n`);

  if (!warmupDuration.startsWith('0')) {
    console.log('Warming up...');
    await runOha(`${baseUrl}/healthz`, warmupDuration, concurrency).catch(() => {});
    console.log('Warmup complete.\n');
  }

  const results: BenchmarkResult[] = [];

  for (const route of ROUTES) {
    const routeStart = performance.now();
    process.stdout.write(`  ${route.name.padEnd(18)} ... `);

    try {
      const result = await benchmarkRoute(route, baseUrl, duration, concurrency);
      results.push(result);
      const took = elapsed(routeStart);
      console.log(
        `RPS ${result.rps.toFixed(0).padStart(7)}  p99 ${formatLatency(result.p99)}  (${took})`
      );
    } catch (err) {
      console.log(`FAILED: ${err}`);
    }
  }

  const totalTime = (performance.now() - overallStart) / 1000;

  console.log('');
  printTable(results, totalTime);
  printShortSummary(results);

  const gitCommit = getGitCommit();
  const currentRun: BenchmarkRun = {
    timestamp: new Date().toISOString(),
    gitCommit,
    config: { baseUrl, concurrency, duration, warmupDuration },
    results,
  };

  if (!noSave) {
    const dir = outputDir();
    const savedPath = await saveResults(currentRun, dir);
    console.log(`\nResults saved to ${savedPath}`);
  }

  if (!noCompare) {
    const dir = outputDir();
    const previous = await loadLatestResults(dir);
    if (previous && previous.timestamp !== currentRun.timestamp) {
      printComparison(currentRun, previous, regressionThreshold);
    } else {
      console.log('\n No previous benchmark run found for comparison.');
    }
  }

  if (startServers) {
    cleanup('SIGTERM');
    await new Promise(r => setTimeout(r, 500));
  }

  if (results.some(r => r.successRate < 0.95)) {
    console.log('\n⚠ Some routes have success rate below 95%. Check for errors.');
    Deno.exit(1);
  }
}

if (import.meta.main) {
  const signals: Deno.Signal[] = [
    'SIGINT',
    'SIGTERM',
  ];
  for (const s of signals) {
    try {
      Deno.addSignalListener(s, () => cleanup('SIGKILL'));
    } catch {
      /* ignore */
    }
  }

  try {
    await main();
  } catch (err) {
    cleanup('SIGKILL');
    console.error(`\nBenchmark failed: ${err}`);
    Deno.exit(1);
  }
}
