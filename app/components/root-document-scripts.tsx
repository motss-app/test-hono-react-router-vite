import type { JSX } from 'react';
import { Scripts, ScrollRestoration } from 'react-router';

import { CloudflareAnalytics } from './cloudflare-analytics.tsx';

interface RootDocumentScriptsProps {
  cspNonce?: string | undefined;
}

export function RootDocumentScripts({ cspNonce }: RootDocumentScriptsProps): JSX.Element {
  return (
    <>
      <ScrollRestoration nonce={cspNonce} />
      <Scripts nonce={cspNonce} />
      {import.meta.env.PROD ? <CloudflareAnalytics /> : null}
    </>
  );
}
