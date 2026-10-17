import { type JSX, type ReactNode, useId } from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import {
  IconArrowRight,
  IconCircleXmark,
  IconCode,
  IconTriangleExclamation,
} from '../components/expressive.icons.ts';
import { Link } from '../components/Link.tsx';
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
import { errorScenarios } from '../utils/error-scenarios.ts';
import type { Route } from './+types/errors.ts';
import * as c from './errors.css.ts';

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

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/errors-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

export default function Errors(): JSX.Element {
  const mainId = useId();
  const groupId = useId();
  const scenarioTranslations: Record<
    (typeof errorScenarios)[number]['code'],
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

  const groups = [
    {
      description: m.errors_client_description(),
      Icon: IconTriangleExclamation,
      title: m.errors_client_title(),
      tone: 'warning',
    },
    {
      description: m.errors_server_description(),
      Icon: IconCircleXmark,
      title: m.errors_server_title(),
      tone: 'critical',
    },
    {
      description: m.errors_runtime_description(),
      Icon: IconCode,
      title: m.errors_runtime_title(),
      tone: 'runtime',
    },
  ] as const;
  const notices = [
    {
      body: m.errors_notice_1_body(),
      detail: m.errors_notice_1_detail(),
      title: m.errors_notice_1_title(),
    },
    {
      body: m.errors_notice_2_body(),
      detail: m.errors_notice_2_detail(),
      title: m.errors_notice_2_title(),
    },
    {
      body: m.errors_notice_3_body(),
      detail: m.errors_notice_3_detail(),
      title: m.errors_notice_3_title(),
    },
  ];
  return (
    <div className={`${c.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/errors" />
      </aside>
      <div className={c.workspace}>
        <ErrorsHeader />
        <main
          className={c.page}
          id={mainId}
          tabIndex={-1}
        >
          <div
            aria-hidden="true"
            className={c.artwork}
          />
          <div className={c.content}>
            <header className={c.intro}>
              <h1 className={c.title}>{m.errors_hero_title()}</h1>
              <p className={c.lead}>{m.errors_hero_lead()}</p>
              <p className={c.body}>{m.errors_hero_body()}</p>
            </header>
            <div className={c.groups}>
              {groups.map(({ tone, title, description, Icon }) => {
                const scenarios = errorScenarios.filter(scenario => scenario.tone === tone);
                const headingId = `${groupId}-${tone}`;
                return (
                  <section
                    aria-labelledby={headingId}
                    className={`${c.group} ${c.tones[tone]}`}
                    key={tone}
                  >
                    <header className={c.groupHeading}>
                      <span
                        aria-hidden="true"
                        className={c.groupIcon}
                      >
                        <Icon />
                      </span>
                      <div className={c.groupCopy}>
                        <h2
                          className={c.groupTitle}
                          id={headingId}
                        >
                          {title}
                        </h2>
                        <p className={c.body}>{description}</p>
                      </div>
                    </header>
                    <div className={c.groupCases}>
                      <ul className={c.caseList}>
                        {scenarios.map(scenario => {
                          const translated = scenarioTranslations[scenario.code];
                          return (
                            <li key={scenario.code}>
                              <Link
                                className={c.caseLink}
                                to={`/errors/${scenario.code}`}
                              >
                                <span className={c.caseCode}>
                                  {scenario.code === 'runtime' ? 'ERR' : scenario.code}
                                </span>
                                <div className={c.caseCopy}>
                                  <h3 className={c.caseTitle}>{translated.label}</h3>
                                  <p className={c.body}>{translated.summary}</p>
                                </div>
                                <span className={c.caseAction}>
                                  {m.errors_open_case()}
                                  <IconArrowRight aria-hidden="true" />
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                      <details className={c.details}>
                        <summary className={c.detailsToggle}>{m.errors_case_details()}</summary>
                        <dl className={c.detailList}>
                          {scenarios.map(scenario => {
                            const translated = scenarioTranslations[scenario.code];
                            return (
                              <div key={scenario.code}>
                                <dt className={c.detailTitle}>
                                  {scenario.code === 'runtime' ? 'ERR' : scenario.code} ·{' '}
                                  {translated.label}
                                </dt>
                                <dd className={c.detailBody}>
                                  <InlineCodeText>{translated.detail}</InlineCodeText>
                                </dd>
                              </div>
                            );
                          })}
                        </dl>
                      </details>
                    </div>
                  </section>
                );
              })}
            </div>
            <section
              aria-labelledby={`${groupId}-notice`}
              className={c.explanation}
            >
              <h2
                className={c.sectionTitle}
                id={`${groupId}-notice`}
              >
                {m.errors_section_title_notice()}
              </h2>
              <ol className={c.notices}>
                {notices.map((notice, index) => (
                  <li
                    className={c.notice}
                    key={notice.title}
                  >
                    <span
                      aria-hidden="true"
                      className={c.noticeNumber}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className={c.noticeTitle}>{notice.title}</h3>
                      <p className={c.body}>
                        <InlineCodeText>{`${notice.body} ${notice.detail}`}</InlineCodeText>
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </main>
        <ErrorsFooter />
      </div>
    </div>
  );
}

function InlineCodeText({ children }: { children: string }): JSX.Element {
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const match of children.matchAll(/`([^`]+)`/g)) {
    parts.push(children.slice(cursor, match.index));
    parts.push(
      <code
        className={c.inlineCode}
        key={match.index}
      >
        {match[1]}
      </code>
    );
    cursor = match.index + match[0].length;
  }
  parts.push(children.slice(cursor));
  return <>{parts}</>;
}

function ErrorsFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function ErrorsHeader() {
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
              label: m.route_errors_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/errors" />
    </header>
  );
}
