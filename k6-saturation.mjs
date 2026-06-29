import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

var BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:9999';
var MAX_CCU = parseInt(__ENV.MAX_CCU || '600');
var STEP = parseInt(__ENV.STEP || '50');
var STEADY_S = parseInt(__ENV.STEADY_S || '15');

var reqs = new Counter('reqs');
var latency = new Trend('latency', true);

var stages = [];
for (var ccu = STEP; ccu <= MAX_CCU; ccu += STEP) {
  stages.push({ duration: '5s', target: ccu });
  stages.push({ duration: STEADY_S + 's', target: ccu });
}
stages.push({ duration: '5s', target: 0 });

export var options = {
  stages: stages,
  thresholds: {
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  var res = http.get(BASE_URL + '/');
  check(res, { 'status 200': function (r) { return r.status === 200; } });
  reqs.add(1);
  if (res.status === 200) {
    latency.add(res.timings.waiting);
  }
}

export function handleSummary(data) {
  var m = data.metrics;
  var durationS = (data.state && data.state.testRunDurationMs ? data.state.testRunDurationMs : 1) / 1000;
  var totalReqs = m.http_reqs && m.http_reqs.values ? m.http_reqs.values.count || 0 : 0;
  var rps = durationS > 0 ? totalReqs / durationS : 0;
  var p75 = m.latency && m.latency.values ? m.latency.values['p(75)'] || 0 : 0;
  var p95 = m.latency && m.latency.values ? m.latency.values['p(95)'] || 0 : 0;
  var p99 = m.latency && m.latency.values ? m.latency.values['p(99)'] || 0 : 0;
  var failRate = m.http_req_failed && m.http_req_failed.values ? m.http_req_failed.values.rate || 0 : 0;
  var avgVus = m.vus && m.vus.values ? m.vus.values.avg || 0 : 0;
  var maxVus = m.vus && m.vus.values ? m.vus.values.max || 0 : 0;

  var summary = {
    max_ccu: MAX_CCU,
    steady_s: STEADY_S,
    total_reqs: totalReqs,
    rps: Math.round(rps * 100) / 100,
    p75: Math.round(p75 * 100) / 100,
    p95: Math.round(p95 * 100) / 100,
    p99: Math.round(p99 * 100) / 100,
    fail_rate: Math.round(failRate * 10000) / 100,
    avg_vus: Math.round(avgVus),
    max_vus: Math.round(maxVus),
  };

  var lines = [];
  lines.push('');
  lines.push('=== SATURATION TEST RESULTS ===');
  lines.push('');
  lines.push('Metric           Value');
  lines.push('─────────────────────────────');
  lines.push('Max CCU target   ' + MAX_CCU);
  lines.push('Steady duration  ' + STEADY_S + 's per level');
  lines.push('Total requests   ' + totalReqs);
  lines.push('Overall RPS      ' + summary.rps);
  lines.push('Avg VUs          ' + summary.avg_vus);
  lines.push('Max VUs          ' + summary.max_vus);
  lines.push('');
  lines.push('Latency (waiting time):');
  lines.push('  p75             ' + summary.p75 + 'ms');
  lines.push('  p95             ' + summary.p95 + 'ms');
  lines.push('  p99             ' + summary.p99 + 'ms');
  lines.push('');
  lines.push('Failure rate      ' + summary.fail_rate + '%');
  lines.push('');

  if (summary.p95 > 100) {
    lines.push('⚠ p95 > 100ms — server is saturated at this CCU level.');
  } else if (summary.p95 > 50) {
    lines.push('⚠ p95 > 50ms — server is approaching saturation.');
  } else {
    lines.push('✓ p95 < 50ms — server handled ' + MAX_CCU + ' CCU without saturation.');
  }
  lines.push('');
  lines.push('Recommendation: Use CCU levels where p95 stays under 50ms for load tests.');
  lines.push('');

  return {
    stdout: lines.join('\n'),
  };
}
