import http from 'k6/http';
import { check } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:9999';
const MAX_CCU = parseInt(__ENV.MAX_CCU || '500');
const STEP = parseInt(__ENV.STEP || '50');
const STEADY_S = parseInt(__ENV.STEADY_S || '15');

const reqs = new Counter('reqs');
const latency = new Trend('latency', true);
const success = new Counter('success');

// Build stages: ramp up in STEP increments, hold each for STEADY_S, then ramp down
const stages: { duration: string; target: number }[] = [];
for (let ccu = STEP; ccu <= MAX_CCU; ccu += STEP) {
  stages.push({ duration: '5s', target: ccu });
  stages.push({ duration: `${STEADY_S}s`, target: ccu });
}
stages.push({ duration: '5s', target: 0 });

export const options = {
  stages,
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/`);
  check(res, { 'status 200': r => r.status === 200 });
  reqs.add(1);
  if (res.status === 200) {
    latency.add(res.timings.waiting);
    success.add(1);
  }
}

export function handleSummary(data: {
  metrics: Record<string, { values: Record<string, number> }>;
  state: { testRunDurationMs: number };
}) {
  const m = data.metrics;
  const durationS = (data.state?.testRunDurationMs ?? 1) / 1000;
  const totalReqs = m.http_reqs?.values?.count ?? 0;
  const rps = durationS > 0 ? totalReqs / durationS : 0;
  const p75 = m.latency?.values?.['p(75)'] ?? 0;
  const p95 = m.latency?.values?.['p(95)'] ?? 0;
  const p99 = m.latency?.values?.['p(99)'] ?? 0;
  const failRate = m.http_req_failed?.values?.rate ?? 0;

  const summary = {
    max_ccu: MAX_CCU,
    steady_s: STEADY_S,
    total_reqs: totalReqs,
    rps: Math.round(rps * 100) / 100,
    p75: Math.round(p75 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    fail_rate: Math.round(failRate * 10000) / 100,
  };

  return {
    stdout: '\n' + JSON.stringify(summary, null, 2) + '\n',
  };
}
