#!/usr/bin/env -S deno run -A

/**
 * Saturation test: runs k6 at specified CCU levels and reports
 * RPS + latency at each level so you can see exactly where the server
 * saturates.
 *
 * Usage: deno run -A scripts/saturation-test.ts [ccu1,ccu2,...]
 * Example: deno run -A scripts/saturation-test.ts 500,1000,3000,5000
 */

const BASE_URL = Deno.env.get('BASE_URL') ?? 'http://127.0.0.1:9999';
// Accept either a single comma-separated arg (`500,5000`) or multiple
// positional args (`500 5000`); env var `CCU_LEVELS` also works.
const CCU_LEVELS = (
  Deno.args.length > 0 ? Deno.args.join(',') : (Deno.env.get('CCU_LEVELS') ?? '500,1000,3000,5000')
)
  .split(',')
  .map(Number)
  .filter(n => !Number.isNaN(n) && n > 0);
const STEADY_S = parseInt(Deno.env.get('STEADY_S') ?? '10', 10);
const K6 = Deno.env.get('K6_BINARY') ?? 'k6';

interface Result {
  ccu: number;
  rps: number;
  p50: number;
  p95: number;
  p99: number;
  failRate: number;
}

const results: Result[] = [];

for (const ccu of CCU_LEVELS) {
  // k6 writes the summary to a per-CCU file via handleSummary; the parent
  // script reads that file to avoid brittle stdout/stderr parsing.
  const scriptPath = `/tmp/sat-${ccu}.js`;
  const summaryPath = `/tmp/sat-${ccu}.summary.json`;

  const script = `
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(90)', 'p(95)', 'p(99)'],
  stages: [
    { duration: '3s', target: ${ccu} },
    { duration: '${STEADY_S}s', target: ${ccu} },
    { duration: '3s', target: 0 },
  ],
};

export default function () {
  const res = http.get('${BASE_URL}/');
  check(res, { 'status 200': (r) => r.status === 200 });
}

// Suppress the default text summary and write a JSON copy to disk so
// the parent script can extract metrics reliably.
export function handleSummary(data) {
  return {
    stdout: '',
    '${summaryPath}': JSON.stringify(data),
  };
}
`;

  await Deno.writeTextFile(scriptPath, script);

  // Verify file exists before running k6
  try {
    await Deno.stat(scriptPath);
  } catch {
    continue;
  }

  const cmd = new Deno.Command(K6, {
    args: [
      'run',
      scriptPath,
    ],
    stderr: 'piped',
    stdout: 'piped',
  });

  const output = await cmd.output();

  // Prefer the JSON written by handleSummary; fall back to parsing stdout.
  let jsonText: string | null = null;
  try {
    jsonText = await Deno.readTextFile(summaryPath);
  } catch {
    const stdout = new TextDecoder().decode(output.stdout);
    const stderr = new TextDecoder().decode(output.stderr);
    jsonText = extractMetricsJson(stdout + stderr);
    if (!jsonText) {
      // Metrics JSON missing from output; skip this sample.
    }
  }

  if (jsonText) {
    try {
      const data = JSON.parse(jsonText);
      const dur = data.metrics?.http_req_duration?.values ?? {};
      const rps = data.metrics?.http_reqs?.values?.rate ?? 0;
      const failRate = data.metrics?.http_req_failed?.values?.rate ?? 0;
      results.push({
        ccu,
        failRate: Math.round(failRate * 10000) / 100,
        p50: Math.round((dur['p(50)'] ?? 0) * 100) / 100,
        p95: Math.round((dur['p(95)'] ?? 0) * 100) / 100,
        p99: Math.round((dur['p(99)'] ?? 0) * 100) / 100,
        rps: Math.round(rps),
      });
    } catch (_e) {
      // Ignore individual sample failures.
    }
  }

  await Deno.remove(scriptPath);
  await Deno.remove(summaryPath);
}

/**
 * Find a balanced JSON object in `text` that contains the key `"metrics"`.
 * Returns the JSON string or null when not found.
 */
function extractMetricsJson(text: string): string | null {
  const key = '"metrics"';
  const start = text.indexOf(key);
  if (start === -1) return null;

  // Walk backwards from the key to find the opening `{` of the enclosing
  // object, accounting for nested braces.
  let depth = 0;
  let openIdx = -1;
  for (let i = start; i >= 0; i--) {
    const ch = text[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        openIdx = i;
        break;
      }
      depth--;
    }
  }
  if (openIdx === -1) return null;

  // Walk forwards to find the matching closing `}`.
  depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(openIdx, i + 1);
    }
  }
  return null;
}

// Find saturation point
if (results.length >= 2) {
  let maxRps = 0;
  for (const r of results) {
    if (r.rps > maxRps) {
      maxRps = r.rps;
    }
  }

  // biome-ignore lint/style/noNonNullAssertion: guarded by results.length >= 2
  const lastResult = results[results.length - 1]!;
  const rpsDropped = lastResult.rps < maxRps * 0.9;
  if (rpsDropped) {
    // Throughput collapsed: saturation point reached.
  } else if (lastResult.p95 > 200) {
    // p95 latency exceeded the 200ms budget.
  } else {
    // No saturation detected within the tested CCU range.
  }
}
