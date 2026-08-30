#!/usr/bin/env -S deno run -A

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
  baseUrl?: string;
}

function getConfig() {
  const baseUrl = Deno.env.get('BENCH_BASE_URL') ?? 'http://127.0.0.1:8787';
  const concurrency = Number(Deno.env.get('BENCH_CONCURRENCY') ?? 128);
  const duration = Deno.env.get('BENCH_DURATION') ?? '20s';
  const warmupDuration = Deno.env.get('BENCH_WARMUP') ?? '3s';
  return {
    baseUrl,
    concurrency,
    duration,
    warmupDuration,
  };
}

const BFF_DIRECT_URL = 'http://127.0.0.1:3001';
const FE_DIRECT_URL = 'http://127.0.0.1:5174';
const SSR_DIRECT_URL = 'http://127.0.0.1:5175';

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
  // Direct BFF routes (bypass CF Worker)
  {
    baseUrl: BFF_DIRECT_URL,
    name: 'BFF Direct (healthz)',
    path: '/api/healthz',
  },
  {
    baseUrl: BFF_DIRECT_URL,
    name: 'BFF Direct (rpc)',
    path: '/api/rpc/hello',
  },
  {
    baseUrl: BFF_DIRECT_URL,
    name: 'BFF Direct (test)',
    path: '/api/test',
  },
  // Direct FE routes (production build, bypass CF Worker)
  {
    baseUrl: FE_DIRECT_URL,
    name: 'FE Direct (home)',
    path: '/',
  },
  {
    baseUrl: FE_DIRECT_URL,
    name: 'FE Direct (about)',
    path: '/about',
  },
  {
    baseUrl: FE_DIRECT_URL,
    name: 'FE Direct (holy-grail)',
    path: '/holy-grail',
  },
  {
    baseUrl: FE_DIRECT_URL,
    name: 'FE Direct (errors)',
    path: '/errors',
  },
  // Direct SSR routes (production SSR build, bypass CF Worker)
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (home)',
    path: '/',
  },
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (about)',
    path: '/about',
  },
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (holy-grail)',
    path: '/holy-grail',
  },
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (errors)',
    path: '/errors',
  },
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (ssr)',
    path: '/ssr',
  },
  {
    baseUrl: SSR_DIRECT_URL,
    name: 'SSR Direct (hono-rpc)',
    path: '/hono-rpc',
  },
];

function getOhaPath(): string {
  const fromEnv = Deno.env.get('OHA_BINARY');
  if (fromEnv) return fromEnv;
  const candidates = [
    'oha',
    '/opt/homebrew/bin/oha',
    '/usr/local/bin/oha',
    'bin/oha-linux-amd64',
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
      '--latency-correction',
      '--no-tui',
      '--output-format',
      'json',
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

function printSeparator(_length: number): void {
  // Row printing is intentionally disabled; separators only.
}

interface ColWidths {
  avg: number;
  bw: number;
  p75: number;
  p95: number;
  p99: number;
  reqs: number;
  route: number;
  rps: number;
  success: number;
}

function printTable(results: BenchmarkResult[], _totalTime: number): void {
  const w: ColWidths = {
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
    'Route'.padEnd(w.route),
    'RPS'.padStart(w.rps),
    'p75'.padStart(w.p75),
    'p95'.padStart(w.p95),
    'p99'.padStart(w.p99),
    'Avg'.padStart(w.avg),
    'Requests'.padStart(w.reqs),
    'Success'.padStart(w.success),
    'BW/s'.padStart(w.bw),
  ].join(' | ');
  const totalWidth = header.length;
  printSeparator(totalWidth);
  printSeparator(totalWidth);
  printSeparator(totalWidth);
  for (const _r of results) printSeparator(totalWidth);
}

function printShortSummary(results: BenchmarkResult[]): void {
  if (results.length === 0) return;
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

async function runBuildCommand(task: string, cwd?: string): Promise<void> {
  const args = cwd
    ? [
        'task',
        `--cwd=${cwd}`,
        task,
      ]
    : [
        'task',
        task,
      ];
  const command = new Deno.Command('deno', {
    args,
    env: {
      ...Deno.env.toObject(),
    },
    stderr: 'inherit',
    stdout: 'inherit',
  }).spawn();
  const { code } = await command.output();
  if (code !== 0) throw new Error(`Build failed: ${task}`);
}

function startStandaloneProcess(name: string, script: string, env: Record<string, string>): void {
  const child = new Deno.Command('deno', {
    args: [
      'run',
      '-A',
      script,
    ],
    env: {
      ...Deno.env.toObject(),
      ...env,
    },
    stderr: 'null',
    stdout: 'null',
  }).spawn();
  managedProcesses.push({
    child,
    name,
  });
}

function startWranglerWorker(name: string, cwd: string, port: string, inspectorPort: string): void {
  const child = new Deno.Command('deno', {
    args: [
      'run',
      '-A',
      'npm:wrangler',
      'dev',
      '--env',
      'production',
      '--port',
      port,
      '--inspector-port',
      inspectorPort,
    ],
    cwd,
    env: {
      SENTRY_RELEASE: 'local',
      ...Deno.env.toObject(),
    },
    stderr: 'null',
    stdout: 'null',
  }).spawn();
  managedProcesses.push({
    child,
    name,
  });
}

async function buildAll(): Promise<void> {
  await runBuildCommand('build');
  await runBuildCommand('build', 'packages/bff');
}

function startStandaloneServers(): void {
  startStandaloneProcess('bff-standalone', 'scripts/standalone-bff.ts', {
    HOST: '127.0.0.1',
    PORT: '3001',
  });
  startStandaloneProcess('fe-standalone', 'scripts/standalone-fe.ts', {
    FE_CLIENT_DIR: 'build/client',
    HOST: '127.0.0.1',
    PORT: '5174',
  });
  startStandaloneProcess('ssr-standalone', 'scripts/standalone-ssr.ts', {
    FE_CLIENT_DIR: 'build/client',
    HOST: '127.0.0.1',
    PORT: '5175',
  });
}

function startWranglerWorkers(servicePort: string): void {
  startWranglerWorker('bff-wrangler', 'packages/bff', '0', '9231');
  startWranglerWorker('frontend', 'packages/frontend', '5173', '9232');
  startWranglerWorker('gateway', 'packages/gateway', servicePort, '9230');
}

async function waitForAllServers(baseUrl: string): Promise<void> {
  await Promise.all([
    waitForServer(`${BFF_DIRECT_URL}/api/healthz`, 120_000),
    waitForServer('http://127.0.0.1:5173/healthz', 120_000),
    waitForServer(`${FE_DIRECT_URL}/healthz`, 120_000),
    waitForServer(`${SSR_DIRECT_URL}/healthz`, 120_000),
    waitForServer(`${baseUrl}/healthz`, 120_000),
  ]);
}

async function runWarmup(
  uniqueUrls: string[],
  concurrency: number,
  warmupDuration: string
): Promise<void> {
  if (warmupDuration.startsWith('0')) return;

  for (const u of uniqueUrls) {
    await runOha(`${u}/healthz`, warmupDuration, concurrency).catch(() => {
      // Warmup failures are non-fatal.
    });
  }
}

async function runBenchmarks(
  baseUrl: string,
  duration: string,
  concurrency: number
): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];
  const activeRoutes = Deno.env.get('DIRECT_ONLY')
    ? ROUTES.filter(r => r.baseUrl !== undefined)
    : ROUTES;

  for (const route of activeRoutes) {
    Deno.stdout.writeSync(new TextEncoder().encode(`  ${route.name.padEnd(20)} ... `));

    try {
      const routeBaseUrl = route.baseUrl ?? baseUrl;
      const result = await benchmarkRoute(route, routeBaseUrl, duration, concurrency);
      results.push(result);
    } catch (_err) {
      // Ignore individual route failures.
    }
  }

  return results;
}

async function main(): Promise<void> {
  const overallStart = performance.now();
  const { baseUrl, concurrency, duration, warmupDuration } = getConfig();
  const startServers = Deno.env.get('BENCH_NO_START') !== '1';
  const servicePort = new URL(baseUrl).port || '8787';

  if (startServers) {
    await clearPorts([
      3001,
      5173,
      5174,
      5175,
      Number(servicePort),
    ]);

    await buildAll();
    startStandaloneServers();
    startWranglerWorkers(servicePort);
    await waitForAllServers(baseUrl);
  }

  const uniqueUrls = [
    ...new Set(ROUTES.map(r => r.baseUrl ?? baseUrl)),
  ];

  await runWarmup(uniqueUrls, concurrency, warmupDuration);
  const results = await runBenchmarks(baseUrl, duration, concurrency);

  const totalTime = (performance.now() - overallStart) / 1000;
  printTable(results, totalTime);
  printShortSummary(results);

  if (startServers) {
    cleanup('SIGTERM');
    await new Promise(r => setTimeout(r, 500));
  }

  if (results.some(r => r.successRate < 0.95)) {
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
  } catch (_err) {
    cleanup('SIGKILL');
    Deno.exit(1);
  }
}
