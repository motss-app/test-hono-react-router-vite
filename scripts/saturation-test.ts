#!/usr/bin/env -S deno run -A

/**
 * Saturation test: runs k6 at incrementing CCU levels and reports
 * RPS + latency at each level so you can see exactly where the server
 * saturates.
 *
 * Usage: deno run -A scripts/saturation-test.ts [max_ccu] [step]
 */

const BASE_URL = Deno.env.get('BASE_URL') ?? 'http://127.0.0.1:9999';
const MAX_CCU = parseInt(Deno.args[0] ?? Deno.env.get('MAX_CCU') ?? '500');
const STEP = parseInt(Deno.args[1] ?? Deno.env.get('STEP') ?? '50');
const STEADY_S = parseInt(Deno.env.get('STEADY_S') ?? '10');
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

for (let ccu = STEP; ccu <= MAX_CCU; ccu += STEP) {
  const script = `
import http from 'k6/http';
import { check } from 'k6';

export var options = {
  stages: [
    { duration: '3s', target: ${ccu} },
    { duration: '${STEADY_S}s', target: ${ccu} },
    { duration: '3s', target: 0 },
  ],
};

export default function () {
  var res = http.get('${BASE_URL}/');
  check(res, { 'status 200': function (r) { return r.status === 200; } });
}
`;

  const tmpFile = `/tmp/sat-${ccu}.js`;
  await Deno.writeTextFile(tmpFile, script);

  const cmd = new Deno.Command(K6, {
    args: ['run', tmpFile],
    stdout: 'piped',
    stderr: 'piped',
  });

  const output = await cmd.output();
  const stdout = new TextDecoder().decode(output.stdout);
  const stderr = new TextDecoder().decode(output.stderr);
  const combined = stdout + stderr;

  // Parse k6 summary JSON from stderr (k6 writes summary to stderr)
  const jsonMatch = combined.match(/\{[\s\S]*"metrics"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[0]);
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
    } catch {
      // k6 output parsing failed
    }
  }

  await Deno.remove(tmpFile);
}

// Print results table
console.log('');
console.log('=== SATURATION TEST RESULTS ===');
console.log('');
console.log('CCU   RPS     p50       p95       p99       failures');
console.log('───── ─────── ───────── ───────── ───────── ────────');

let prevRps = 0;
for (const r of results) {
  const rpsDelta = prevRps > 0 ? ((r.rps - prevRps) / prevRps * 100).toFixed(0) : '';
  const rpsStr = rpsDelta ? `${r.rps} (${rpsDelta}%)` : `${r.rps}`;
  console.log(
    `${String(r.ccu).padEnd(5)} ${rpsStr.padEnd(8)} ${fmtMs(r.p50).padEnd(10)} ${fmtMs(r.p95).padEnd(10)} ${fmtMs(r.p99).padEnd(10)} ${r.failRate}%`
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

  const lastResult = results[results.length - 1];
  const rpsDropped = lastResult.rps < maxRps * 0.9;

  console.log('');
  if (rpsDropped) {
    console.log(`⚠ RPS peaked at ${maxRps} (${saturationCcu} CCU) then dropped.`);
    console.log(`  Max safe CCU: ${saturationCcu}`);
  } else if (lastResult.p95 > 200) {
    console.log(`⚠ p95 > 200ms at ${lastResult.ccu} CCU (${lastResult.p95}ms).`);
    console.log(`  Max safe CCU: ${results.find(r => r.p95 > 200)?.ccu ?? 'unknown'}`);
  } else {
    console.log(`✓ Server handled ${MAX_CCU} CCU without saturation.`);
    console.log(`  Max safe CCU: ${MAX_CCU}+`);
  }
}

console.log('');

function fmtMs(v: number): string {
  if (v < 1) return `${(v * 1000).toFixed(0)}µs`;
  if (v < 1000) return `${v.toFixed(1)}ms`;
  return `${(v / 1000).toFixed(2)}s`;
}
