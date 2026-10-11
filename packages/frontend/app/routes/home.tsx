import { ParaglideMessage } from '@inlang/paraglide-js-react';
import type { JSX } from 'react';
import { useId } from 'react';

import {
  IconArrowRight,
  IconBolt,
  IconCode,
  IconFlask,
  IconTriangleExclamation,
} from '../components/expressive.icons.ts';
import { ExpressivePageShell } from '../components/expressive-page-shell.tsx';
import { Link } from '../components/Link.tsx';
import * as m from '../paraglide/messages.js';
import type { Route } from './+types/home.ts';
import * as c from './home.css.ts';

/** Resolve translated content at render time, after the locale is set. */
function getDemos() {
  return [
    {
      description: m.route_ssr_description(),
      Icon: IconBolt,
      title: m.route_ssr_title(),
      to: '/ssr',
      tone: c.rendering,
    },
    {
      description: m.route_hono_rpc_description(),
      Icon: IconCode,
      title: m.route_hono_rpc_title(),
      to: '/hono-rpc',
      tone: c.rpc,
    },
    {
      description: m.route_labs_description(),
      Icon: IconFlask,
      title: m.route_labs_title(),
      to: '/labs',
      tone: c.labs,
    },
    {
      description: m.route_errors_description(),
      Icon: IconTriangleExclamation,
      title: m.route_errors_title(),
      to: '/errors',
      tone: c.errors,
    },
  ];
}

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/home-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: m.meta_home_title(),
    },
    {
      content: m.meta_home_desc(),
      name: 'description',
    },
  ];
}

export default function Home(): JSX.Element {
  const mainId = useId();
  const titleId = useId();
  const demosId = useId();
  return (
    <ExpressivePageShell
      activePath="/"
      mainId={mainId}
    >
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
          <section
            aria-labelledby={titleId}
            className={c.hero}
          >
            <p className={c.eyebrow}>{m.home_brand_caption()}</p>
            <h1
              className={c.title}
              id={titleId}
            >
              <ParaglideMessage
                inputs={{}}
                markup={{
                  accent: ({ children }) => <span className={c.titleAccent}>{children}</span>,
                }}
                message={m.home_title}
              />
            </h1>
            <p className={c.heroLead}>{m.hero_lead()}</p>
            <div className={c.heroActions}>
              <Link
                className={c.ctaPrimary}
                to="/about"
              >
                {m.hero_cta_overview()}
                <IconArrowRight aria-hidden="true" />
              </Link>
              <a
                className={c.ctaSecondary}
                href="https://github.com/motss-app/test-hono-react-router-vite"
              >
                {m.home_view_source()}
              </a>
            </div>
          </section>
          <section
            aria-labelledby={demosId}
            className={c.demos}
          >
            <div className={c.sectionHeading}>
              <h2
                className={c.sectionTitle}
                id={demosId}
              >
                {m.home_explore_demos()}
              </h2>
              <span className={c.sectionNote}>{m.home_demo_count()}</span>
            </div>
            <div className={c.demoGrid}>
              {getDemos().map(({ to, title, description, Icon, tone }) => (
                <Link
                  className={`${c.demoCard} ${tone}`}
                  key={to}
                  to={to}
                >
                  <span className={c.demoIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <h3 className={c.demoTitle}>{title}</h3>
                  <p className={c.demoDescription}>{description}</p>
                  <span className={c.demoAction}>
                    {m.home_open_demo()}
                    <IconArrowRight aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <footer className={c.footer}>
            <p className={c.poweredLabel}>{m.home_powered_by()}</p>
            <ul
              aria-label={m.home_powered_by()}
              className={c.technologies}
            >
              <li>
                <img
                  alt=""
                  src="/assets/logos/hono.svg"
                />
                <span>Hono</span>
              </li>
              <li>
                <img
                  alt=""
                  className={c.lightLogo}
                  src="/assets/logos/react-router-light.svg"
                />
                <img
                  alt=""
                  className={c.darkLogo}
                  src="/assets/logos/react-router-dark.svg"
                />
                <span>React Router</span>
              </li>
              <li>
                <img
                  alt=""
                  className={c.lightLogo}
                  src="/assets/logos/vite-light.svg"
                />
                <img
                  alt=""
                  className={c.darkLogo}
                  src="/assets/logos/vite-dark.svg"
                />
                <span>Vite</span>
              </li>
              <li>
                <img
                  alt=""
                  src="/assets/logos/webassembly.svg"
                />
                <span>WebAssembly</span>
              </li>
            </ul>
          </footer>
        </div>
      </main>
    </ExpressivePageShell>
  );
}
