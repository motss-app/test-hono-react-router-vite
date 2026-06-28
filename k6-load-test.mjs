import { check, sleep } from 'k6';
import http from 'k6/http';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Config (overridable via env) ──
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8787';
const TARGET_CCU = parseInt(__ENV.CCU) || 100;

// ── Custom metrics per page type ──
const ssgReqs = new Counter('ssg_reqs');
const ssrReqs = new Counter('ssr_reqs');
const ssgTtfb = new Trend('ssg_ttfb', true);
const ssrTtfb = new Trend('ssr_ttfb', true);
const ssgSuccess = new Rate('ssg_success_rate');
const ssrSuccess = new Rate('ssr_success_rate');

// ── Routes ──
const SSG_PAGES = [
  '/',
  '/about',
  '/holy-grail',
  '/errors',
];
const SSR_PAGES = [
  '/ssr',
  '/hono-rpc',
];

// ── Dynamic stage calculation ──
//   Phase 1: warmup gentle      (30s,        0 → 30% of target)
//   Phase 2: warmup to target   (+5 VU/s,   30% → 100% target)
//   Phase 3: steady             (~80% of total requests)
//   Phase 4: token ramp-down    (10s)
//
// Derivation for steady duration:
//   non_steady_reqs = warmup1 + warmup2 + rampdown
//   steady_reqs / (non_steady_reqs + steady_reqs) = 0.80
//   => steady_reqs = 4 × non_steady_reqs
//   => steady_duration = 4 × non_steady_reqs / TARGET_CCU

const WARMUP1_VU = Math.max(Math.round(TARGET_CCU * 0.3), 5);
const WARMUP2_VU = TARGET_CCU - WARMUP1_VU;
const WARMUP2_S = WARMUP2_VU > 0 ? Math.max(Math.ceil(WARMUP2_VU / 5), 1) : 0;

// VU-second estimates for non-steady phases (each VU ≈ 1 req/s)
const w1VUSec = (WARMUP1_VU / 2) * 30;
const w2VUSec = WARMUP2_S > 0 ? ((WARMUP1_VU + TARGET_CCU) / 2) * WARMUP2_S : 0;
const rdVUSec = (TARGET_CCU / 2) * 10;
const NON_STEADY_REQS = w1VUSec + w2VUSec + rdVUSec;
const STEADY_S = Math.ceil((4 * NON_STEADY_REQS) / TARGET_CCU);

// ── Options ──
export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(75)', 'p(90)', 'p(95)'],
  stages: [
    {
      duration: '30s',
      target: WARMUP1_VU,
    },
    {
      duration: `${WARMUP2_S}s`,
      target: TARGET_CCU,
    },
    {
      duration: `${STEADY_S}s`,
      target: TARGET_CCU,
    },
    {
      duration: '10s',
      target: 0,
    },
  ],
  thresholds: {
    http_req_failed: [
      'rate<0.05',
    ],
    ssg_success_rate: [
      'rate>0.95',
    ],
    ssg_ttfb: [
      'p(95)<2000',
    ],
    ssr_success_rate: [
      'rate>0.95',
    ],
    ssr_ttfb: [
      'p(95)<3000',
    ],
  },
};

export default function () {
  const isSsg = Math.random() < 0.5;
  const pages = isSsg ? SSG_PAGES : SSR_PAGES;
  const path = pages[Math.floor(Math.random() * pages.length)];

  const params = {
    headers: {
      Accept: 'text/html',
      'Accept-Encoding': 'gzip',
      'Connection': 'keep-alive',
      'User-Agent': 'k6-loadtest/1.0',
      'X-Load-Test': 'true',
    },
    tags: {
      page_path: path,
      page_type: isSsg ? 'ssg' : 'ssr',
    },
  };

  const res = http.get(`${BASE_URL}${path}`, params);

  check(res, {
    'status is 200': r => r.status === 200,
  });

  if (isSsg) {
    ssgReqs.add(1);
    ssgSuccess.add(res.status === 200);
    if (res.status === 200) ssgTtfb.add(res.timings.waiting);
  } else {
    ssrReqs.add(1);
    ssrSuccess.add(res.status === 200);
    if (res.status === 200) ssrTtfb.add(res.timings.waiting);
  }

  // Randomised think time: 0.5–1.5s
  sleep(0.5 + Math.random());
}

export function handleSummary(data) {
  const m = data.metrics;
  const durationS = (data.state?.testRunDurationMs ?? 1) / 1000;
  const ssgCount = m.ssg_reqs?.values?.count ?? 0;
  const ssrCount = m.ssr_reqs?.values?.count ?? 0;
  const summary = {
    avg_vus: m.vus?.values?.avg ?? 0,
    duration: data.state?.testRunDurationMs,
    errors: m.http_req_failed?.values?.rate ?? 0,
    max_vus: m.vus?.values?.max ?? 0,
    rps: m.http_reqs?.values?.rate ?? 0,
    ssg: {
      requests: ssgCount,
      rps: durationS > 0 ? round(ssgCount / durationS) : 0,
      success_rate: m.ssg_success_rate?.values?.rate ?? 0,
      ttfb: extractPercentiles(m.ssg_ttfb),
    },
    ssr: {
      requests: ssrCount,
      rps: durationS > 0 ? round(ssrCount / durationS) : 0,
      success_rate: m.ssr_success_rate?.values?.rate ?? 0,
      ttfb: extractPercentiles(m.ssr_ttfb),
    },
    total_reqs: m.http_reqs?.values?.count ?? 0,
  };

  return {
      'k6-results.json': JSON.stringify(summary, null, 2) + '\n',
    stdout: '\n' + JSON.stringify(summary, null, 2) + '\n',
  };
}

function extractPercentiles(metric) {
  if (!metric?.values) return {};
  return {
    avg: round(metric.values.avg),
    max: round(metric.values.max),
    min: round(metric.values.min),
    p75: round(metric.values['p(75)']),
    p90: round(metric.values['p(90)']),
    p95: round(metric.values['p(95)']),
  };
}

function round(v) {
  return v != null ? Math.round(v * 100) / 100 : 0;
}
