import { themeBootstrapSrc } from 'virtual:theme-bootstrap';
import type { JSX } from 'react';
import { Links, Meta } from 'react-router';

import criticalCss from '../critical/app.css?raw';

interface RootDocumentHeadProps {
  cspNonce?: string | undefined;
}

export function RootDocumentHead({ cspNonce }: RootDocumentHeadProps): JSX.Element {
  return (
    <>
      <meta charSet="utf-8" />
      <meta
        content="width=device-width, initial-scale=1"
        name="viewport"
      />
      <meta
        content="light dark"
        name="color-scheme"
      />
      <Meta />

      <style nonce={cspNonce}>{criticalCss}</style>

      {/* External bootstrap keeps theme initialization early without adding another inline script. */}
      <link
        as="script"
        href={themeBootstrapSrc}
        rel="preload"
      />
      <Links />
      {/* biome-ignore lint/performance/noSyncScripts: theme bootstrap must run before paint to avoid FOUC */}
      <script src={themeBootstrapSrc} />
    </>
  );
}
