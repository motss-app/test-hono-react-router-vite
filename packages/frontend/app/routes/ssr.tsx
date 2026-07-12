import type { JSX } from 'react';
import { data } from 'react-router';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconServer } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { HonoContext } from '../router-context.ts';
import { iconStyles } from '../styles/icon.css.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/ssr.ts';
import { s } from './ssr.css.ts';

const noStoreCacheControl = 'no-store';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'SSR Demo · React Router + Hono Demo',
    },
  ];
}

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
      message: m.ssr_loader_message(),
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
      label: m.ssr_label_timestamp(),
      value: loaderData.timestamp,
    },
    {
      label: m.ssr_label_render_time(),
      value: `${loaderData.renderTime}ms`,
    },
    {
      label: m.ssr_label_user_agent(),
      value: loaderData.userAgent,
    },
    {
      label: m.ssr_label_message(),
      value: loaderData.message,
    },
  ] as const;

  const verificationRows = [
    {
      label: m.ssr_verify_refresh_label(),
      value: m.ssr_verify_refresh_value(),
    },
    {
      label: m.ssr_verify_headers_label(),
      value: m.ssr_verify_headers_value(),
    },
    {
      label: m.ssr_verify_compare_label(),
      value: m.ssr_verify_compare_value(),
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
              <span className={s.titleAccent}>{m.ssr_title()}</span>
            </Text>

            <Text
              as="p"
              className={s.heroLead}
            >
              {m.ssr_hero_lead()}
            </Text>

            <p className={s.heroBody}>{m.ssr_hero_body()}</p>

            <div className={s.heroActions}>
              <Link
                className={s.ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>{m.ssr_cta_home()}</span>
              </Link>
              <Link
                className={s.ctaPrimary}
                to="/hono-rpc"
              >
                <IconServer className={iconStyles.base} />
                <span>{m.ssr_cta_rpc()}</span>
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
            {m.ssr_section_response_title()}
          </Text>

          <p className={s.routesIntro}>{m.ssr_section_response_intro()}</p>

          <div className={s.routesList}>
            <div className={s.rowRow}>
              <div className={s.rowPanel}>
                <span className={s.rowNumber}>01</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    {m.ssr_live_response_title()}
                  </Text>
                  <p className={s.rowBody}>{m.ssr_live_response_desc()}</p>
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
                      {m.ssr_hono_context_title()}
                    </Text>
                    <p className={s.rowBody}>{m.ssr_hono_context_desc()}</p>
                  </div>

                  <dl className={s.dataList}>
                    <div>
                      <dt className={s.dataLabel}>{m.ssr_label_request_url()}</dt>
                      <dd className={s.dataValue}>{loaderData.honoVars.meta.requestUrl}</dd>
                    </div>
                    {loaderData.honoVars.meta.requestId ? (
                      <div>
                        <dt className={s.dataLabel}>{m.ssr_label_request_id()}</dt>
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
            {m.ssr_section_verify_title()}
          </Text>

          <p className={s.routesIntro}>{m.ssr_section_verify_intro()}</p>

          <div className={s.routesList}>
            <div className={s.rowRow}>
              <div className={s.rowPanel}>
                <span className={s.rowNumber}>03</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    {m.ssr_verify_title()}
                  </Text>
                  <p className={s.rowBody}>{m.ssr_verify_desc()}</p>
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
