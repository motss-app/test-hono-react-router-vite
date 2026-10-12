import { type JSX, useCallback, useId } from 'react';
import { data, useRevalidator } from 'react-router';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import {
  PagePreferences,
  SiteBrand,
  SiteNavigation,
  SkipToContent,
} from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import * as m from '../paraglide/messages.js';
import { HonoContext } from '../router-context.ts';
import type { HonoEnv } from '../types/hono.types.ts';
import type { Route } from './+types/ssr.ts';
import { s } from './ssr.css.ts';
import { IconChevronDown, IconCode, IconRotateRight, IconServer } from './ssr.icons.ts';

const noStoreCacheControl = 'no-store';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_ssr_title(),
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/ssr-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

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
  const mainId = useId();
  const responseId = useId();
  const contextId = useId();
  const verifyId = useId();
  const revalidator = useRevalidator();
  const requesting = revalidator.state === 'loading';
  const requestAgain = useCallback(async () => {
    if (!requesting) {
      await revalidator.revalidate();
    }
  }, [
    requesting,
    revalidator.revalidate,
  ]);
  const responseRows = [
    {
      label: m.ssr_label_timestamp(),
      value: <time dateTime={loaderData.timestamp}>{loaderData.timestamp}</time>,
      volatile: true,
    },
    {
      label: m.ssr_label_render_time(),
      value: `${loaderData.renderTime} ms`,
      volatile: true,
    },
    {
      label: m.ssr_label_user_agent(),
      value: loaderData.userAgent,
    },
    {
      label: m.ssr_label_message(),
      value: loaderData.message,
    },
  ];
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
  ];

  return (
    <div className={`${s.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/ssr" />
      </aside>
      <div className={s.workspace}>
        <SsrHeader />
        <main
          className={s.page}
          id={mainId}
          tabIndex={-1}
        >
          <div
            aria-hidden="true"
            className={s.artwork}
          />
          <div className={s.content}>
            <header className={s.intro}>
              <h1 className={s.title}>
                <span className={s.titleAccent}>{m.ssr_title()}</span>
              </h1>
              <p className={s.lead}>{m.ssr_hero_lead()}</p>
              <p className={s.body}>{m.ssr_hero_body()}</p>
            </header>

            <section
              aria-labelledby={responseId}
              className={s.response}
            >
              <div className={s.responseHeading}>
                <h2
                  className={s.sectionTitle}
                  id={responseId}
                >
                  {m.ssr_live_response_title()}
                </h2>
                <span
                  className={s.status}
                  role="status"
                >
                  <IconServer aria-hidden="true" />
                  {requesting ? m.ssr_requesting() : m.ssr_server_rendered()}
                </span>
              </div>
              <p className={s.body}>{m.ssr_live_response_desc()}</p>
              <div className={s.responsePanel}>
                <dl
                  aria-busy={requesting}
                  className={s.dataList}
                >
                  {responseRows.map(row => (
                    <div
                      className={s.dataRow}
                      key={row.label}
                    >
                      <dt className={s.dataLabel}>{row.label}</dt>
                      <dd
                        className={`${s.dataValue} ${row.volatile ? s.machineValue : ''}`}
                        data-vrt-volatile={row.volatile ? '' : undefined}
                      >
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div className={s.responseActions}>
                  <button
                    aria-disabled={requesting}
                    className={s.requestButton}
                    onClick={requestAgain}
                    type="button"
                  >
                    <IconRotateRight aria-hidden="true" />
                    {m.ssr_new_request()}
                  </button>
                </div>
                <details className={s.jsonDisclosure}>
                  <summary className={s.jsonSummary}>
                    <IconCode aria-hidden="true" />
                    {m.ssr_view_json()}
                    <IconChevronDown aria-hidden="true" />
                  </summary>
                  <pre className={s.json}>
                    <code>{JSON.stringify(loaderData, null, 2)}</code>
                  </pre>
                </details>
              </div>
            </section>

            {loaderData.honoVars ? (
              <section
                aria-labelledby={contextId}
                className={s.context}
              >
                <h2
                  className={s.sectionTitle}
                  id={contextId}
                >
                  {m.ssr_hono_context_title()}
                </h2>
                <p className={s.body}>{m.ssr_hono_context_desc()}</p>
                <dl className={s.contextData}>
                  <div className={s.dataRow}>
                    <dt className={s.dataLabel}>{m.ssr_label_request_url()}</dt>
                    <dd className={s.dataValue}>{loaderData.honoVars.meta.requestUrl}</dd>
                  </div>
                  {loaderData.honoVars.meta.requestId ? (
                    <div className={s.dataRow}>
                      <dt className={s.dataLabel}>{m.ssr_label_request_id()}</dt>
                      <dd
                        className={`${s.dataValue} ${s.machineValue}`}
                        data-vrt-volatile=""
                      >
                        {loaderData.honoVars.meta.requestId}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            ) : null}

            <section
              aria-labelledby={verifyId}
              className={s.verify}
            >
              <h2
                className={s.sectionTitle}
                id={verifyId}
              >
                {m.ssr_verify_title()}
              </h2>
              <p className={s.body}>{m.ssr_verify_desc()}</p>
              <ol className={s.steps}>
                {verificationRows.map(row => (
                  <li
                    className={s.step}
                    key={row.label}
                  >
                    <h3 className={s.stepTitle}>{row.label}</h3>
                    <p className={s.body}>{row.value}</p>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>
        <SsrFooter />
      </div>
    </div>
  );
}

function SsrFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function SsrHeader() {
  return (
    <header className={chrome.header}>
      <div className={chrome.mobileBrand}>
        <SiteBrand />
      </div>
      <div className={chrome.breadcrumbSlot}>
        <Breadcrumbs
          items={[
            {
              label: m.holy_grail_nav_home(),
              to: '/',
            },
            {
              label: m.route_ssr_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/ssr" />
    </header>
  );
}
