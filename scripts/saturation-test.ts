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
    console.error(`[ccu=${ccu}] Script file not found: ${scriptPath}`);
    continue;
  }

  const cmd = new Deno.Command(K6, {
    args: [
      'run',
      scriptPath,
    ],
    stdout: 'piped',
    stderr: 'piped',
  });

  const output = await cmd.output();
  console.error(`[ccu=${ccu}] k6 exit code: ${output.code}`);

  // Prefer the JSON written by handleSummary; fall back to parsing stdout.
  let jsonText: string | null = null;
  try {
    jsonText = await Deno.readTextFile(summaryPath);
  } catch {
    const stdout = new TextDecoder().decode(output.stdout);
    const stderr = new TextDecoder().decode(output.stderr);
    jsonText = extractMetricsJson(stdout + stderr);
    if (!jsonText) {
      console.error(`[ccu=${ccu}] No JSON metrics found in k6 output`);
      console.error(`[ccu=${ccu}] stdout (last 500 chars):`, stdout.slice(-500));
      console.error(`[ccu=${ccu}] stderr (last 500 chars):`, stderr.slice(-500));
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
        rps: Math.round(rps),
        p50: Math.round((dur['p(50)'] ?? 0) * 100) / 100,
        p95: Math.round((dur['p(95)'] ?? 0) * 100) / 100,
        p99: Math.round((dur['p(99)'] ?? 0) * 100) / 100,
        failRate: Math.round(failRate * 10000) / 100,
      });
    } catch (e) {
      console.error(`[ccu=${ccu}] Failed to parse k6 output:`, e);
      console.error(`[ccu=${ccu}] jsonText (last 500 chars):`, jsonText.slice(-500));
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

// Print results table
console.log('');
console.log('=== SATURATION TEST RESULTS ===');
console.log('');
console.log('CCU    RPS     p50       p95       p99       failures');
console.log('────── ─────── ───────── ───────── ───────── ────────');

let prevRps = 0;
for (const r of results) {
  const rpsDelta = prevRps > 0 ? (((r.rps - prevRps) / prevRps) * 100).toFixed(0) : '';
  const rpsStr = rpsDelta ? `${r.rps} (${rpsDelta}%)` : `${r.rps}`;
  console.log(
    `${String(r.ccu).padEnd(6)} ${rpsStr.padEnd(8)} ${fmtMs(r.p50).padEnd(10)} ${fmtMs(r.p95).padEnd(10)} ${fmtMs(r.p99).padEnd(10)} ${r.failRate}%`
  );
  prevRps = r.rps;
}

// Find saturation point
if (results.length >= 2) {
  let maxRps = 0;
  let saturationCcu = 0;
  for (const r of results) {
    if (r.rps > maxRps) {
      maxRps = r.rps;
      saturationCcu = r.ccu;
    }
  }

  const lastResult = results[results.length - 1]!;
  const rpsDropped = lastResult.rps < maxRps * 0.9;

  console.log('');
  if (rpsDropped) {
    console.log(`⚠ RPS peaked at ${maxRps} (${saturationCcu} CCU) then dropped.`);
  } else if (lastResult.p95 > 200) {
    console.log(`⚠ p95 > 200ms at ${lastResult.ccu} CCU (${lastResult.p95}ms).`);
  } else {
    console.log(`✓ Server handled ${CCU_LEVELS[CCU_LEVELS.length - 1]} CCU without saturation.`);
  }
}

console.log('');

function fmtMs(v: number): string {
  if (v < 1) return `${(v * 1000).toFixed(0)}µs`;
  if (v < 1000) return `${v.toFixed(1)}ms`;
  return `${(v / 1000).toFixed(2)}s`;
}
