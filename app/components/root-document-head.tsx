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
      <Meta />

      <style nonce={cspNonce}>{criticalCss}</style>

      {/* External bootstrap keeps theme initialization early without adding another inline script. */}
      <link
        as="script"
        href={themeBootstrapSrc}
        rel="preload"
      />
      <script src={themeBootstrapSrc} />
      <Links />

      {import.meta.env.DEV ? (
        <>
          {/* Reference: https://stylexjs.com/docs/api/configuration/unplugin#vite */}
          <link
            href="/virtual:stylex.css"
            rel="stylesheet"
          />
          <script
            src="/@id/virtual:stylex:runtime"
            type="module"
          />
        </>
      ) : null}
    </>
  );
}
