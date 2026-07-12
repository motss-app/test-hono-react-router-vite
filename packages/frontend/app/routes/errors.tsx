import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft, IconCircleInfo, IconHome, IconTriangleExclamation } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import { errorScenarios } from '../utils/error-scenarios.ts';
import type { Route } from './+types/errors.ts';
import {
  toneStyles as allToneStyles,
  ctaPrimary,
  ctaSecondary,
  hero,
  heroActions,
  heroBody,
  heroCopy,
  heroInner,
  heroLead,
  heroMedia,
  heroOverlay,
  page,
  routesInner,
  routesIntro,
  routesIntroSpacer,
  routesList,
  routesTitle,
  rowBody,
  rowCode,
  rowCodeCritical,
  rowCodeRuntime,
  rowCodeWarning,
  rowContent,
  rowDetail,
  rowDetailText,
  rowLink,
  rowPanel,
  rowRow,
  rowTitle,
  sectionSpacer,
  statusLabel,
  title,
  titleAccent,
} from './errors.css.ts';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_errors_title(),
    },
    {
      content: m.meta_errors_desc(),
      name: 'description',
    },
  ];
}

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/errors-hero-dark.svg',
    '/assets/errors-hero-light.svg',
  ]);

export default function ErrorsDemo(): JSX.Element {
  return (
    <main className={page}>
      <section className={hero}>
        <div
          aria-hidden="true"
          className={heroMedia}
        />
        <div
          aria-hidden="true"
          className={heroOverlay}
        />

        <div className={heroInner}>
          <div className={heroCopy}>
            <p className={statusLabel}>Error handling</p>

            <Text
              as="h1"
              className={title}
            >
              Error routes
              <span className={titleAccent}>Responses and runtime failures</span>
            </Text>

            <Text
              as="p"
              className={heroLead}
            >
              A static index for the failure paths the app can intentionally trigger.
            </Text>

            <p className={heroBody}>
              Use this page to jump into thrown response errors, runtime exceptions, and the route
              boundaries that present them. The hub itself is prerendered; each case underneath is a
              live server-rendered incident surface.
            </p>

            <div className={heroActions}>
              <Link
                className={ctaPrimary}
                to="/errors/404"
              >
                <IconTriangleExclamation className={iconStyles.base} />
                <span>Trigger a 404</span>
              </Link>

              <Link
                className={ctaSecondary}
                to="/"
              >
                <IconHome className={iconStyles.base} />
                <span>Back home</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className={routesInner}>
          <Text
            as="h2"
            className={routesTitle}
          >
            Choose a failure path.
          </Text>

          <p className={routesIntro}>
            Every route below demonstrates a different way the app can fail and how the route-level
            boundary reshapes that failure into something inspectable.
          </p>

          <div className={routesList}>
            {errorScenarios.map(scenario => {
              const toneStyles = allToneStyles[scenario.tone];

              return (
                <div
                  className={rowRow}
                  key={scenario.code}
                >
                  <div className={rowPanel}>
                    <span className={`${rowCode} ${toneStyles.code}`}>
                      {scenario.code === 'runtime' ? 'ERR' : scenario.code}
                    </span>

                    <div className={rowContent}>
                      <Text
                        as="h3"
                        className={rowTitle}
                      >
                        {scenario.label}
                      </Text>
                      <p className={rowBody}>{scenario.summary}</p>
                    </div>

                    <div className={rowDetail}>
                      <p className={rowDetailText}>{scenario.detail}</p>
                      <Link
                        className={`${rowLink} ${toneStyles.link}`}
                        to={`/errors/${scenario.code}`}
                      >
                        <span>Open case</span>
                        <IconArrowLeft
                          className={iconStyles.base}
                          style={{
                            transform: 'rotate(180deg)',
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={sectionSpacer}>
            <Text
              as="h2"
              className={routesTitle}
            >
              What to notice.
            </Text>

            <p className={routesIntro}>
              The interesting split is between the static entry page, the dynamic route loader, and
              the boundary that formats both response errors and thrown exceptions.
            </p>

            <div className={routesList}>
              <div className={rowRow}>
                <div className={rowPanel}>
                  <span className={rowCodeWarning}>01</span>

                  <div className={rowContent}>
                    <Text
                      as="h3"
                      className={rowTitle}
                    >
                      Static hub
                    </Text>
                    <p className={rowBody}>
                      <code>/errors</code> is safe to prerender because it never throws.
                    </p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>
                      It works as a navigational map into the error cases rather than an error
                      screen itself.
                    </p>
                  </div>
                </div>
              </div>

              <div className={rowRow}>
                <div className={rowPanel}>
                  <span className={rowCodeCritical}>02</span>

                  <div className={rowContent}>
                    <Text
                      as="h3"
                      className={rowTitle}
                    >
                      Dynamic incident routes
                    </Text>
                    <p className={rowBody}>
                      <code>/errors/:code</code> throws from the loader to simulate real failures.
                    </p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>
                      That makes the page useful for seeing how SSR, status codes, and response
                      headers behave when a route does not resolve normally.
                    </p>
                  </div>
                </div>
              </div>

              <div className={rowRow}>
                <div className={rowPanel}>
                  <span className={rowCodeRuntime}>03</span>

                  <div className={rowContent}>
                    <Text
                      as="h3"
                      className={rowTitle}
                    >
                      Boundary formatting
                    </Text>
                    <p className={rowBody}>
                      The route boundary catches the failure and turns it into the final visual
                      surface.
                    </p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>
                      That means the page you see for <code>404</code>, <code>500</code>, or{' '}
                      <code>runtime</code> is intentionally designed by the route, not by a browser
                      fallback.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className={routesIntroSpacer}>
              <IconCircleInfo className={iconStyles.base} /> Start with <code>/errors/404</code> or{' '}
              <code>/errors/runtime</code> to compare a thrown response with a thrown JavaScript
              error.
            </p>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
