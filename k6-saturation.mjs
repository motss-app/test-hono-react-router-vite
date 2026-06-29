import http from 'k6/http';
import { check } from 'k6';
import { Counter } from 'k6/metrics';

var BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:9999';
var MAX_CCU = parseInt(__ENV.MAX_CCU || '600');
var STEP = parseInt(__ENV.STEP || '50');
var STEADY_S = parseInt(__ENV.STEADY_S || '15');

var reqs = new Counter('reqs');

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
}

export function handleSummary(data) {
  var m = data.metrics;
  var durationS = (data.state && data.state.testRunDurationMs ? data.state.testRunDurationMs : 1) / 1000;
  var totalReqs = m.http_reqs && m.http_reqs.values ? m.http_reqs.values.count || 0 : 0;
  var rps = durationS > 0 ? totalReqs / durationS : 0;

  // Use k6's built-in http_req_duration which is more reliable than custom Trend
  var dur = m.http_req_duration && m.http_req_duration.values ? m.http_req_duration.values : {};
  var p50 = dur['p(50)'] || 0;
  var p75 = dur['p(75)'] || 0;
  var p90 = dur['p(90)'] || 0;
  var p95 = dur['p(95)'] || 0;
  var p99 = dur['p(99)'] || 0;
  var avg = dur.avg || 0;
  var max = dur.max || 0;

  var failRate = m.http_req_failed && m.http_req_failed.values ? m.http_req_failed.values.rate || 0 : 0;
  var maxVus = m.vus && m.vus.values ? m.vus.values.max || 0 : 0;

  var lines = [];
  lines.push('');
  lines.push('=== SATURATION TEST RESULTS ===');
  lines.push('');
  lines.push('CCU target      ' + MAX_CCU);
  lines.push('Steady duration ' + STEADY_S + 's per level');
  lines.push('Total requests  ' + totalReqs);
  lines.push('Duration        ' + Math.round(durationS) + 's');
  lines.push('Max VUs         ' + maxVus);
  lines.push('');
  lines.push('Throughput      ' + Math.round(rps) + ' req/s');
  lines.push('');
  lines.push('Latency (http_req_duration):');
  lines.push('  avg           ' + fmtMs(avg));
  lines.push('  p50           ' + fmtMs(p50));
  lines.push('  p75           ' + fmtMs(p75));
  lines.push('  p90           ' + fmtMs(p90));
  lines.push('  p95           ' + fmtMs(p95));
  lines.push('  p99           ' + fmtMs(p99));
  lines.push('  max           ' + fmtMs(max));
  lines.push('');
  lines.push('Failure rate    ' + (failRate * 100).toFixed(2) + '%');
  lines.push('');

  return {
    stdout: lines.join('\n'),
  };
}

function fmtMs(v) {
  if (v < 1) return (v * 1000).toFixed(0) + 'µs';
  if (v < 1000) return v.toFixed(2) + 'ms';
  return (v / 1000).toFixed(2) + 's';
}
