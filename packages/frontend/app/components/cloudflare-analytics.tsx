import type { JSX } from 'react';

const cloudflareAnalyticsToken = '07a4c014e5d04f2bb2e0df2e3b0eb061';
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
