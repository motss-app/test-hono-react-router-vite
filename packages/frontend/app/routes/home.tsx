import { ParaglideMessage } from '@inlang/paraglide-js-react';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { LocaleSwitcher } from '../components/locale-switcher.tsx';
import { Text } from '../components/text.tsx';
import * as m from '../paraglide/messages.js';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/home.ts';
import * as c from './home.css.ts';

// Must be a function — m.*() calls resolve locale at call time, so they
// cannot live at module scope where Paraglide locale isn't set yet.
function getRoutes() {
  return [
    {
      description: m.route_about_description(),
      number: '01',
      path: '/about',
      title: m.route_about_title(),
      to: '/about',
    },
    {
      description: m.route_holy_grail_description(),
      number: '02',
      path: '/holy-grail',
      title: m.route_holy_grail_title(),
      to: '/holy-grail',
    },
    {
      description: m.route_ssr_description(),
      number: '03',
      path: '/ssr',
      title: m.route_ssr_title(),
      to: '/ssr',
    },
    {
      description: m.route_hono_rpc_description(),
      number: '04',
      path: '/hono-rpc',
      title: m.route_hono_rpc_title(),
      to: '/hono-rpc',
    },
    {
      description: m.route_errors_description(),
      number: '05',
      path: '/errors',
      title: m.route_errors_title(),
      to: '/errors',
    },
  ];
}

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/home-hero-dark.svg',
    '/assets/home-hero-light.svg',
  ]);

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: 'React Router + Hono Demo',
    },
    {
      content: 'A full-stack React Router and Hono demo for SSR, RPC, and error handling.',
      name: 'description',
    },
  ];
}

export default function Home(): JSX.Element {
  return (
    <main className={c.page}>
      <section className={c.hero}>
        <div
          aria-hidden="true"
          className={c.heroMedia}
        />
        <div
          aria-hidden="true"
          className={c.heroOverlay}
        />

        <div className={c.heroInner}>
          <div className={c.heroCopy}>
            <h1 className={c.title}>
              <ParaglideMessage
                inputs={{}}
                markup={{
                  accent: ({ children }) => <span className={c.titleAccent}>{children}</span>,
                }}
                message={m.home_title}
              />
            </h1>

            <Text
              as="p"
              className={c.heroLead}
            >
              {m.hero_lead()}
            </Text>

            <p className={c.heroBody}>{m.hero_body()}</p>

            <div className={c.heroActions}>
              <Link
                className={c.ctaPrimary}
                to="/about"
              >
                {m.hero_cta_overview()}
              </Link>
              <Link
                className={c.ctaSecondary}
                to="/hono-rpc"
              >
                {m.hero_cta_rpc()}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={c.routesSection}>
        <div className={c.routesInner}>
          <Text
            as="h2"
            className={c.routesTitle}
          >
            {m.routes_section_title()}
          </Text>

          <p className={c.routesIntro}>{m.routes_section_intro()}</p>

          <div className={c.routesList}>
            {getRoutes().map(route => (
              <div
                className={c.routeRow}
                key={route.to}
              >
                <Link
                  className={c.routeLink}
                  to={route.to}
                >
                  <span className={c.routeNumber}>{route.number}</span>

                  <div className={c.routeTitleBlock}>
                    <Text
                      as="h3"
                      className={c.routeTitle}
                    >
                      {route.title}
                    </Text>
                    <span className={c.routePath}>{route.path}</span>
                  </div>

                  <p className={c.routeDescription}>{route.description}</p>

                  <span className={c.routeAction}>{m.route_open_action()}</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className={c.footer}>
        <div className={c.footerInner}>
          <LocaleSwitcher />
          <p className={c.footerNote}>React Router + Hono Demo</p>
        </div>
      </footer>
    </main>
  );
}
