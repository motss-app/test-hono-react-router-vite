import { type JSX, useId } from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import { IconBolt, IconCode, IconDesktop } from '../components/expressive.icons.ts';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import {
  PagePreferences,
  SiteBrand,
  SiteNavigation,
  SkipToContent,
} from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import { TechnologyLogo } from '../components/technology-logo.tsx';
import * as m from '../paraglide/messages.js';
import type { Route } from './+types/about.ts';
import * as s from './about.css.ts';

function getStackGroups() {
  return [
    {
      items: [
        {
          brand: 'react',
          name: 'React 19',
          role: m.about_role_react(),
        },
        {
          brand: 'typescript',
          name: 'TypeScript',
          role: m.about_role_typescript(),
        },
        {
          brand: 'base-ui',
          name: 'Base UI',
          role: m.about_role_baseui(),
        },
        {
          brand: 'vanilla-extract',
          name: 'Vanilla Extract',
          role: m.about_role_styles(),
        },
        {
          brand: 'inlang',
          name: 'inlang',
          role: m.about_role_inlang(),
        },
        {
          brand: 'iconify',
          name: 'Iconify',
          role: m.about_role_iconify(),
        },
        {
          brand: 'font-awesome',
          name: 'Font Awesome 7',
          role: m.about_role_fontawesome(),
        },
      ],
      title: m.about_group_interface(),
    },
    {
      items: [
        {
          brand: 'react-router',
          name: 'React Router 8',
          role: m.about_role_router(),
        },
        {
          brand: 'hono',
          name: 'Hono',
          role: m.about_role_hono(),
        },
      ],
      title: m.about_group_routing(),
    },
    {
      items: [
        {
          brand: 'cloudflare-workers',
          name: 'Cloudflare Workers',
          role: m.about_role_workers(),
        },
        {
          brand: 'webassembly',
          name: 'WebAssembly',
          role: m.about_role_webassembly(),
        },
        {
          brand: 'rust',
          name: 'Rust',
          role: m.about_role_rust(),
        },
      ],
      title: m.about_group_execution(),
    },
    {
      items: [
        {
          brand: 'vite',
          name: 'Vite',
          role: m.about_role_vite(),
        },
        {
          brand: 'nodejs',
          name: 'Node.js',
          role: m.about_role_node(),
        },
      ],
      title: m.about_group_tooling(),
    },
  ] as const;
}

function StackGroup({ title, items }: ReturnType<typeof getStackGroups>[number]) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={s.stackGroup}
    >
      <h3
        className={s.groupTitle}
        id={titleId}
      >
        {title}
      </h3>
      <dl className={s.stackRows}>
        {items.map(({ brand, name, role }) => (
          <div
            className={s.stackRow}
            key={name}
          >
            <dt className={s.technologyName}>
              <TechnologyLogo
                brand={brand}
                size="small"
              />
              <span>{name}</span>
            </dt>
            <dd className={s.technologyRole}>{role}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function getDesignChoices() {
  return [
    {
      description: m.about_choice_iteration_desc(),
      Icon: IconBolt,
      title: m.about_choice_iteration(),
    },
    {
      description: m.about_choice_types_desc(),
      Icon: IconCode,
      title: m.about_choice_types(),
    },
    {
      description: m.about_choice_responsive_desc(),
      Icon: IconDesktop,
      title: m.about_choice_responsive(),
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/about-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: m.meta_about_title(),
    },
    {
      content: m.meta_about_desc(),
      name: 'description',
    },
  ];
}

function AboutHeader() {
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
              label: m.route_about_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/about" />
    </header>
  );
}

function AboutFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

export default function About(): JSX.Element {
  const mainId = useId();
  const stackId = useId();
  const choicesId = useId();

  return (
    <div className={`${s.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/about" />
      </aside>
      <div className={s.workspace}>
        <AboutHeader />
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
                {m.about_title()} <span className={s.titleAccent}>{m.about_title_accent()}</span>
              </h1>
              <p className={s.introSummary}>{m.about_hero_lead()}</p>
              <p className={s.lead}>{m.about_hero_body()}</p>
            </header>

            <section
              aria-labelledby={stackId}
              className={s.section}
            >
              <h2
                className={s.sectionTitle}
                id={stackId}
              >
                {m.about_stack_roles_title()}
              </h2>
              <div className={s.stackGroups}>
                {getStackGroups().map(group => (
                  <StackGroup
                    {...group}
                    key={group.title}
                  />
                ))}
              </div>
            </section>

            <section
              aria-labelledby={choicesId}
              className={s.section}
            >
              <h2
                className={s.sectionTitle}
                id={choicesId}
              >
                {m.about_choices_title()}
              </h2>
              <ul className={s.choices}>
                {getDesignChoices().map(({ Icon, title, description }) => (
                  <li
                    className={s.choice}
                    key={title}
                  >
                    <Icon
                      aria-hidden="true"
                      className={s.choiceIcon}
                    />
                    <div>
                      <h3 className={s.choiceTitle}>{title}</h3>
                      <p className={s.choiceDescription}>{description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
        <AboutFooter />
      </div>
    </div>
  );
}
