import type { JSX } from 'react';
import { Scripts, ScrollRestoration } from 'react-router';

interface RootDocumentScriptsProps {
  cspNonce?: string | undefined;
}

const cloudflareAnalyticsToken = '07a4c014e5d04f2bb2e0df2e3b0eb061';
const cloudflareAnalyticsSrc = 'https://static.cloudflareinsights.com/beacon.min.js';

export function RootDocumentScripts({ cspNonce }: RootDocumentScriptsProps): JSX.Element {
  return (
    <>
      <ScrollRestoration nonce={cspNonce} />
      <Scripts nonce={cspNonce} />
      {import.meta.env.PROD ? (
        <script
          data-cf-beacon={`{"token":"${cloudflareAnalyticsToken}"}`}
          defer
          src={cloudflareAnalyticsSrc}
        />
      ) : null}
    </>
  );
}
