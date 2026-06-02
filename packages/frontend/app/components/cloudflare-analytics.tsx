import type { JSX } from 'react';

const cloudflareAnalyticsToken = '540aa2cadd1d40f694fedfa962f23965';
const cloudflareAnalyticsSrc = 'https://static.cloudflareinsights.com/beacon.min.js';

export function CloudflareAnalytics(): JSX.Element {
  return (
    <script
      data-cf-beacon={`{"token":"${cloudflareAnalyticsToken}"}`}
      defer
      src={cloudflareAnalyticsSrc}
    />
  );
}
