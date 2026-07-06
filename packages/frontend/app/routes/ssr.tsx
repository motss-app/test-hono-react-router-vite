import type { JSX } from 'react';
import { data } from 'react-router';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconServer } from '../icons.ts';
import { HonoContext } from '../router-context.ts';
import { iconStyles } from '../styles/icon.css.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/ssr.ts';
import { s } from './ssr.css.ts';

const noStoreCacheControl = 'no-store';

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/ssr-hero-dark.svg',
    '/assets/ssr-hero-light.svg',
  ]);

/** This loader makes this page SSR - it runs on EVERY request */
export function loader({ context, request }: Route.LoaderArgs) {
  const startTime = performance.now();

  const timestamp = new Date().toISOString();
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  const honoVars = context.get(HonoContext) as HonoEnv['Variables'] | undefined;
  const requestId = honoVars?.honoData?.meta?.requestId;

  const endTime = performance.now();
  const duration = (endTime - startTime).toFixed(2);

  return data(
    {
      honoVars: honoVars?.honoData,
      message: 'This page is rendered on the server on EVERY request!',
      renderTime: duration,
      requestId,
      timestamp,
      userAgent,
    },
    {
      headers: {
        'X-Render-Time': duration,
        ...(requestId
          ? {
              'X-Request-Id': requestId,
            }
          : {}),
      },
    }
  );
}

export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const renderTime = loaderHeaders.get('X-Render-Time') ?? '-1';

  parentHeaders.set('Cache-Control', noStoreCacheControl);
  parentHeaders.append('Server-Timing', `ssr-loader;dur=${renderTime}`);

  const requestId = loaderHeaders.get('X-Request-Id');
  if (requestId) {
    parentHeaders.set('X-Request-Id', requestId);
  }

  return parentHeaders;
}

export default function SsrPage({ loaderData }: Route.ComponentProps): JSX.Element {
  const responseRows = [
    {
      label: 'Timestamp',
      value: loaderData.timestamp,
    },
    {
      label: 'Render time',
      value: `${loaderData.renderTime}ms`,
    },
    {
      label: 'User agent',
      value: loaderData.userAgent,
    },
    {
      label: 'Message',
      value: loaderData.message,
    },
  ] as const;

  const verificationRows = [
    {
      label: 'Refresh the route',
      value:
        'The timestamp changes on every request because the loader runs server-side each time.',
    },
    {
      label: 'Inspect response headers',
      value: 'Open the Network tab and check `Server-Timing` to verify the loader duration.',
    },
    {
      label: 'Compare rendering modes',
      value:
        'Unlike `/` or `/about`, this route is not SSG. Unlike CSR-only UI, its first HTML already contains the server response.',
    },
  ] as const;

  return (
    <main className={s.page}>
      <section className={s.hero}>
        <div
          aria-hidden="true"
          className={s.heroMedia}
        />
        <div
          aria-hidden="true"
          className={s.heroOverlay}
        />

        <div className={s.heroInner}>
          <div className={s.heroCopy}>
            <Text
              as="h1"
              className={s.title}
            >
              SSR
              <span className={s.titleAccent}>Live on request</span>
            </Text>

            <Text
              as="p"
              className={s.heroLead}
            >
              This route renders on the server for every visit.
            </Text>

            <p className={s.heroBody}>
              The loader runs on each request, forwards timing metadata, and can read Hono context
              before the page reaches the browser.
            </p>

            <div className={s.heroActions}>
              <Link
                className={s.ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>Back home</span>
              </Link>
              <Link
                className={s.ctaPrimary}
                to="/hono-rpc"
              >
                <IconServer className={iconStyles.base} />
                <span>Compare with RPC</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            The current response came from the server.
          </Text>

          <p className={s.routesIntro}>
            These values are generated during the request, then serialized into the rendered HTML
            and response headers.
          </p>

          <div className={s.routesList}>
            <div className={s.rowRow}>
              <div className={s.rowPanel}>
                <span className={s.rowNumber}>01</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    Live response
                  </Text>
                  <p className={s.rowBody}>
                    Request-specific data produced by the SSR loader before the page is delivered.
                  </p>
                </div>

                <dl className={s.dataList}>
                  {responseRows.map(row => (
                    <div key={row.label}>
                      <dt className={s.dataLabel}>{row.label}</dt>
                      <dd className={s.dataValue}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {loaderData.honoVars ? (
              <div className={s.rowRow}>
                <div className={s.rowPanel}>
                  <span className={s.rowNumber}>02</span>

                  <div className={s.rowContent}>
                    <Text
                      as="h3"
                      className={s.rowTitle}
                    >
                      Hono context
                    </Text>
                    <p className={s.rowBody}>
                      Data forwarded from the Hono request context into the React Router loader
                      through `RouterContextProvider`.
                    </p>
                  </div>

                  <dl className={s.dataList}>
                    <div>
                      <dt className={s.dataLabel}>Request URL</dt>
                      <dd className={s.dataValue}>{loaderData.honoVars.meta.requestUrl}</dd>
                    </div>
                    {loaderData.honoVars.meta.requestId ? (
                      <div>
                        <dt className={s.dataLabel}>Request ID</dt>
                        <dd className={s.dataValue}>{loaderData.honoVars.meta.requestId}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            How to verify the page is really SSR.
          </Text>

          <p className={s.routesIntro}>
            The route is meant to be inspected, not just viewed. These checks make the rendering
            mode obvious.
          </p>

          <div className={s.routesList}>
            <div className={s.rowRow}>
              <div className={s.rowPanel}>
                <span className={s.rowNumber}>03</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    Verification steps
                  </Text>
                  <p className={s.rowBody}>
                    Use the browser and network tooling to confirm the response is generated at
                    request time.
                  </p>
                </div>

                <dl className={s.dataList}>
                  {verificationRows.map(row => (
                    <div key={row.label}>
                      <dt className={s.dataLabel}>{row.label}</dt>
                      <dd className={s.dataValue}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
