import type { JSX } from 'react';
import { isRouteErrorResponse } from 'react-router';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconCircleInfo, IconHome } from '../icons.ts';
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
      title: 'Error Case Demo',
    },
    {
      content: 'Dynamic error route demonstrating thrown responses and runtime failures.',
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

function getTone(
  errorType: string,
  scenario: ErrorScenario | undefined,
  statusCode: number
): 'critical' | 'runtime' | 'warning' {
  if (scenario) {
    return scenario.tone;
  }

  if (errorType === 'Runtime Error') {
    return 'runtime';
  }

  return statusCode >= serverErrorStatusCode ? 'critical' : 'warning';
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
  const tone = getTone(errorType, scenario, statusCode);
  const toneStyles = allToneStyles[tone];

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
            <p className={`${s.statusLabel} ${toneStyles.statusLabel}`}>Incident surface</p>

            <Text
              as="h1"
              className={s.title}
            >
              Error {statusCode}
              <span className={`${s.titleAccent} ${toneStyles.titleAccent}`}>{statusText}</span>
            </Text>

            <Text
              as="p"
              className={`${s.heroLead} ${toneStyles.heroLead}`}
            >
              {scenario?.summary ??
                'The loader intentionally failed so the route boundary could take over.'}
            </Text>

            <p className={`${s.heroBody} ${toneStyles.heroBody}`}>
              {message}.{' '}
              {scenario?.detail ??
                'This route formats both thrown responses and runtime exceptions into a consistent SSR error view.'}
            </p>

            <div className={s.heroActions}>
              <Link
                className={`${s.ctaPrimary} ${toneStyles.ctaPrimary}`}
                to="/errors"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>Back to error index</span>
              </Link>

              <Link
                className={`${s.ctaSecondary} ${toneStyles.ctaSecondary}`}
                to="/"
              >
                <IconHome className={iconStyles.base} />
                <span>Go home</span>
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
            Incident details.
          </Text>

          <p className={`${s.routesIntro} ${toneStyles.routesIntro}`}>
            This route throws in the loader, then the route-level boundary renders the final page
            you are seeing now.
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
                    Failure signal
                  </Text>
                  <p className={s.rowBody}>
                    The boundary normalized the thrown value into a readable status surface.
                  </p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>Status</dt>
                    <dd className={s.dataValue}>{statusCode}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Status text</dt>
                    <dd className={s.dataValue}>{statusText}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Error type</dt>
                    <dd className={s.dataValue}>{errorType}</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Route param</dt>
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
                    Capture path
                  </Text>
                  <p className={s.rowBody}>
                    The error starts in the route loader and finishes in the route boundary.
                  </p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>Thrown from</dt>
                    <dd className={s.dataValue}>loader() in `errors.$code.tsx`</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Rendered by</dt>
                    <dd className={s.dataValue}>ErrorBoundary in the same route file</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Delivery</dt>
                    <dd className={s.dataValue}>Server-rendered error response</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Server timing</dt>
                    <dd className={s.dataValue}>Appended through `headers()` after the throw</dd>
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
                    Guidance
                  </Text>
                  <p className={s.rowBody}>
                    Compare different routes to see how the boundary behaves across status families.
                  </p>
                </div>

                <dl className={s.dataList}>
                  <div>
                    <dt className={s.dataLabel}>Try next</dt>
                    <dd className={s.dataValue}>
                      {(routeCode ?? scenario?.code) === 'runtime'
                        ? '/errors/404'
                        : '/errors/runtime'}
                    </dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Reference route</dt>
                    <dd className={s.dataValue}>/errors</dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Scenario note</dt>
                    <dd className={s.dataValue}>
                      {scenario?.summary ?? 'This code path is not part of the curated examples.'}
                    </dd>
                  </div>
                  <div>
                    <dt className={s.dataLabel}>Message</dt>
                    <dd className={s.dataValue}>{message}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <p className={`${s.routesIntro} ${toneStyles.routesIntro}`}>
            <IconCircleInfo className={iconStyles.base} /> Thrown responses preserve their HTTP
            semantics; thrown runtime errors are still caught here, but the boundary presents them
            as an application failure.
          </p>
        </div>
      </section>
    </main>
  );
}

export function ErrorBoundary({ error, params }: Route.ErrorBoundaryProps): JSX.Element {
  const routeCode = getRouteCodeParam(params);
  let statusCode = serverErrorStatusCode;
  let statusText = 'Internal Server Error';
  let message = 'An unexpected error occurred';
  let errorType = 'Runtime Error';
  let scenario = getErrorScenario(routeCode);

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    statusText = error.statusText;
    errorType = 'HTTP Response Error';
    scenario ??= getErrorScenarioByStatus(error.status);

    if (typeof error.data === 'string' && error.data.length > 0) {
      message = error.data;
    } else {
      message = statusText;
    }
  } else if (error instanceof Error) {
    message = error.message;
    statusText = 'Runtime Error';
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
      errorType="Pending Error"
      message="This route is designed to throw before the normal component renders"
      routeCode={routeCode}
      scenario={scenario}
      statusCode={500}
      statusText="Intentional Error Route"
    />
  );
}
