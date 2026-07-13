import type { JSX } from 'react';
import { isRouteErrorResponse } from 'react-router';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconCircleInfo, IconHome } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import {
  type ErrorScenario,
  getErrorScenario,
  getErrorScenarioByStatus,
} from '../utils/error-scenarios.ts';
import type { Route } from './+types/errors.$code.ts';
import { toneStyles as allToneStyles, s } from './errors.$code.css.ts';

const serverErrorStatusCode = 500;
const unknownErrorStatusCode = 404;
const unknownErrorStatusText = 'Unknown Error Code';
const noStoreCacheControl = 'no-store';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_error_code_title(),
    },
    {
      content: m.meta_error_code_desc(),
      name: 'description',
    },
  ];
}

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/error-code-hero-dark.svg',
    '/assets/error-code-hero-light.svg',
    '/assets/runtime-error-hero-dark.svg',
    '/assets/runtime-error-hero-light.svg',
  ]);

function getRouteCodeParam(params: Record<string, string | undefined>): string | undefined {
  return (
    params as {
      code?: string;
    }
  ).code;
}

function throwRouteResponse(
  start: number,
  status: number,
  statusText: string,
  message = statusText
): never {
  throw new Response(message, {
    headers: {
      'X-Route-Timing': (performance.now() - start).toFixed(2),
    },
    status,
    statusText,
  });
}

export function loader({ params }: Route.LoaderArgs) {
  const start = performance.now();
  const routeCode = getRouteCodeParam(params);
  const scenario = getErrorScenario(routeCode);

  if (scenario?.kind === 'response' && scenario.status && scenario.statusText) {
    return throwRouteResponse(start, scenario.status, scenario.statusText);
  }

  if (routeCode === 'runtime') {
    throw new Error(`Runtime error for code: ${routeCode}`);
  }

  return throwRouteResponse(
    start,
    unknownErrorStatusCode,
    unknownErrorStatusText,
    `Unknown error code: ${routeCode}`
  );
}

export function headers({ loaderHeaders, parentHeaders }: Route.HeadersArgs): Headers {
  const timing = loaderHeaders.get('X-Route-Timing') || '0';
  const newTiming = `error-code-loader;dur=${timing};desc="Error Code Route Loader"`;

  parentHeaders.set('Cache-Control', noStoreCacheControl);
  parentHeaders.append('Server-Timing', newTiming);

  return parentHeaders;
}

function ErrorIncidentView({
  errorType,
  message,
  routeCode,
  scenario,
  statusCode,
  statusText,
}: {
  errorType: string;
  message: string;
  routeCode: string | undefined;
  scenario: ErrorScenario | undefined;
  statusCode: number;
  statusText: string;
}): JSX.Element {
  const defaultErrorType = m.error_code_default_error_type();

  function getTone(
    errType: string,
    errScenario: ErrorScenario | undefined,
    errStatusCode: number
  ): 'critical' | 'runtime' | 'warning' {
    if (errScenario) {
      return errScenario.tone;
    }

    if (errType === defaultErrorType) {
      return 'runtime';
    }

    return errStatusCode >= serverErrorStatusCode ? 'critical' : 'warning';
  }

  const tone = getTone(errorType, scenario, statusCode);
  const toneStyles = allToneStyles[tone];

  const scenarioTranslations: Record<
    string,
    {
      label: string;
      summary: string;
      detail: string;
    }
  > = {
    '401': {
      detail: m.error_scenario_401_detail(),
      label: m.error_scenario_401_label(),
      summary: m.error_scenario_401_summary(),
    },
    '403': {
      detail: m.error_scenario_403_detail(),
      label: m.error_scenario_403_label(),
      summary: m.error_scenario_403_summary(),
    },
    '404': {
      detail: m.error_scenario_404_detail(),
      label: m.error_scenario_404_label(),
      summary: m.error_scenario_404_summary(),
    },
    '500': {
      detail: m.error_scenario_500_detail(),
      label: m.error_scenario_500_label(),
      summary: m.error_scenario_500_summary(),
    },
    '502': {
      detail: m.error_scenario_502_detail(),
      label: m.error_scenario_502_label(),
      summary: m.error_scenario_502_summary(),
    },
    '503': {
      detail: m.error_scenario_503_detail(),
      label: m.error_scenario_503_label(),
      summary: m.error_scenario_503_summary(),
    },
    runtime: {
      detail: m.error_scenario_runtime_detail(),
      label: m.error_scenario_runtime_label(),
      summary: m.error_scenario_runtime_summary(),
    },
  };

  const translated = scenario ? scenarioTranslations[scenario.code] : undefined;

  return (
    <main className={s.page}>
      <section className={`${s.hero} ${toneStyles.hero}`}>
        <div
          aria-hidden="true"
          className={`${s.heroMedia} ${toneStyles.heroMedia}`}
        />
        <div
          aria-hidden="true"
          className={`${s.heroOverlay} ${toneStyles.heroOverlay}`}
        />

        <div className={s.heroInner}>
          <div className={s.heroCopy}>
            <p className={`${s.statusLabel} ${toneStyles.statusLabel}`}>
              {m.error_code_hero_status_label()}
            </p>

            <Text
              as="h1"
              className={s.title}
            >
              {m.error_code_hero_title_prefix()} {statusCode}
              <span className={`${s.titleAccent} ${toneStyles.titleAccent}`}>{statusText}</span>
            </Text>

            <Text
              as="p"
              className={`${s.heroLead} ${toneStyles.heroLead}`}
            >
              {translated?.summary ?? m.error_code_default_summary()}
            </Text>

            <p className={`${s.heroBody} ${toneStyles.heroBody}`}>
              {message}. {translated?.detail ?? m.error_code_default_detail()}
            </p>

            <div className={s.heroActions}>
              <Link
                className={`${s.ctaPrimary} ${toneStyles.ctaPrimary}`}
                to="/errors"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>{m.error_code_cta_back_index()}</span>
              </Link>

              <Link
                className={`${s.ctaSecondary} ${toneStyles.ctaSecondary}`}
                to="/"
              >
                <IconHome className={iconStyles.base} />
                <span>{m.error_code_cta_go_home()}</span>
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
            {m.error_code_section_title()}
          </Text>

          <p className={`${s.routesIntro} ${toneStyles.routesIntro}`}>
            {m.error_code_section_intro()}
          </p>

          <div className={`${s.routesList} ${toneStyles.routesList}`}>
            <div className={`${s.rowRow} ${toneStyles.rowRow}`}>
              <div className={s.rowPanel}>
                <span className={`${s.rowCode} ${toneStyles.rowCode}`}>01</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    {m.error_code_row_1_title()}
                  </Text>
                  <p className={s.rowBody}>{m.error_code_row_1_body()}</p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_status()}</dt>
                    <dd className={s.dataValue}>{statusCode}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_status_text()}</dt>
                    <dd className={s.dataValue}>{statusText}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_error_type()}</dt>
                    <dd className={s.dataValue}>{errorType}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_route_param()}</dt>
                    <dd className={s.dataValue}>{routeCode ?? scenario?.code ?? '<missing>'}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={`${s.rowRow} ${toneStyles.rowRow}`}>
              <div className={s.rowPanel}>
                <span className={`${s.rowCode} ${toneStyles.rowCode}`}>02</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    {m.error_code_row_2_title()}
                  </Text>
                  <p className={s.rowBody}>{m.error_code_row_2_body()}</p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_thrown_from()}</dt>
                    <dd className={s.dataValue}>{m.error_code_value_thrown_from()}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_rendered_by()}</dt>
                    <dd className={s.dataValue}>{m.error_code_value_rendered_by()}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_delivery()}</dt>
                    <dd className={s.dataValue}>{m.error_code_value_delivery()}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_server_timing()}</dt>
                    <dd className={s.dataValue}>{m.error_code_value_server_timing()}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className={`${s.rowRow} ${toneStyles.rowRow}`}>
              <div className={s.rowPanel}>
                <span className={`${s.rowCode} ${toneStyles.rowCode}`}>03</span>

                <div className={s.rowContent}>
                  <Text
                    as="h3"
                    className={s.rowTitle}
                  >
                    {m.error_code_row_3_title()}
                  </Text>
                  <p className={s.rowBody}>{m.error_code_row_3_body()}</p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_try_next()}</dt>
                    <dd className={s.dataValue}>
                      {(routeCode ?? scenario?.code) === 'runtime'
                        ? '/errors/404'
                        : '/errors/runtime'}
                    </dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_reference_route()}</dt>
                    <dd className={s.dataValue}>/errors</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_scenario_note()}</dt>
                    <dd className={s.dataValue}>
                      {translated?.summary ?? m.error_code_default_scenario_note()}
                    </dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>{m.error_code_label_message()}</dt>
                    <dd className={s.dataValue}>{message}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <p className={`${s.routesIntro} ${toneStyles.routesIntro}`}>
            <IconCircleInfo className={iconStyles.base} /> {m.error_code_footer_note()}
          </p>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps): JSX.Element {
  const routeCode = getRouteCodeParam(params);
  let statusCode = serverErrorStatusCode;
  let statusText: string = m.error_code_default_status_text();
  let message: string = m.error_code_default_message();
  let errorType: string = m.error_code_default_error_type();
  let scenario = getErrorScenario(routeCode);

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText;
    errorType = m.error_code_http_error_type();
    scenario ??= getErrorScenarioByStatus(error.status);

    if (typeof error.data === 'string' && error.data.length > 0) {
      message = error.data;
    } else {
      message = statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
    statusText = m.error_code_runtime_status_text();
  }

  return (
    <ErrorIncidentView
      errorType={errorType}
      message={message}
      routeCode={routeCode}
      scenario={scenario}
      statusCode={statusCode}
      statusText={statusText}
    />
  );
}

export default function ErrorCode({ params }: Route.ComponentProps): JSX.Element {
  const routeCode = getRouteCodeParam(params);
  const scenario = getErrorScenario(routeCode);

  return (
    <ErrorIncidentView
      errorType={m.error_code_pending_error_type()}
      message={m.error_code_pending_message()}
      routeCode={routeCode}
      scenario={scenario}
      statusCode={500}
      statusText={m.error_code_intentional_status_text()}
    />
  );
}
