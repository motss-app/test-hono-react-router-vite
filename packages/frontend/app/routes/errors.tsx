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
            <p className={statusLabel}>{m.errors_hero_status_label()}</p>

            <Text
              as="h1"
              className={title}
            >
              {m.errors_hero_title()}
              <span className={titleAccent}>{m.errors_hero_title_accent()}</span>
            </Text>

            <Text
              as="p"
              className={heroLead}
            >
              {m.errors_hero_lead()}
            </Text>

            <p className={heroBody}>{m.errors_hero_body()}</p>

            <div className={heroActions}>
              <Link
                className={ctaPrimary}
                to="/errors/404"
              >
                <IconTriangleExclamation className={iconStyles.base} />
                <span>{m.errors_cta_trigger_404()}</span>
              </Link>

              <Link
                className={ctaSecondary}
                to="/"
              >
                <IconHome className={iconStyles.base} />
                <span>{m.errors_cta_back_home()}</span>
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
            {m.errors_section_title_choose()}
          </Text>

          <p className={routesIntro}>{m.errors_section_intro_choose()}</p>

          <div className={routesList}>
            {errorScenarios.map(scenario => {
              const toneStyles = allToneStyles[scenario.tone];
              const translated = scenarioTranslations[scenario.code];

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
                        {translated?.label ?? scenario.label}
                      </Text>
                      <p className={rowBody}>{translated?.summary ?? scenario.summary}</p>
                    </div>

                    <div className={rowDetail}>
                      <p className={rowDetailText}>{translated?.detail ?? scenario.detail}</p>
                      <Link
                        className={`${rowLink} ${toneStyles.link}`}
                        to={`/errors/${scenario.code}`}
                      >
                        <span>{m.errors_open_case()}</span>
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
              {m.errors_section_title_notice()}
            </Text>

            <p className={routesIntro}>{m.errors_section_intro_notice()}</p>

            <div className={routesList}>
              <div className={rowRow}>
                <div className={rowPanel}>
                  <span className={rowCodeWarning}>01</span>

                  <div className={rowContent}>
                    <Text
                      as="h3"
                      className={rowTitle}
                    >
                      {m.errors_notice_1_title()}
                    </Text>
                    <p className={rowBody}>
                      <code>/errors</code> {m.errors_notice_1_body()}
                    </p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>{m.errors_notice_1_detail()}</p>
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
                      {m.errors_notice_2_title()}
                    </Text>
                    <p className={rowBody}>
                      <code>/errors/:code</code> {m.errors_notice_2_body()}
                    </p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>{m.errors_notice_2_detail()}</p>
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
                      {m.errors_notice_3_title()}
                    </Text>
                    <p className={rowBody}>{m.errors_notice_3_body()}</p>
                  </div>

                  <div className={rowDetail}>
                    <p className={rowDetailText}>{m.errors_notice_3_detail()}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className={routesIntroSpacer}>
              <IconCircleInfo className={iconStyles.base} /> {m.errors_spacer_intro()}
            </p>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
