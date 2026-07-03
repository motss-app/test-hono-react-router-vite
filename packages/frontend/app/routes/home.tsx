import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/home.ts';
import * as c from './home.css.ts';

const routes = [
  {
    description: 'Project overview, stack notes, and the migration decisions behind the app.',
    number: '01',
    path: '/about',
    title: 'About',
    to: '/about',
  },
  {
    description: 'Header, main, and footer arranged in the classic holy grail app shell.',
    number: '02',
    path: '/holy-grail',
    title: 'Holy Grail Layout',
    to: '/holy-grail',
  },
  {
    description: 'Request-time rendering with timing data and server-owned state on the page.',
    number: '03',
    path: '/ssr',
    title: 'SSR Page',
    to: '/ssr',
  },
  {
    description: 'Typed client and server calls flowing through Hono without extra ceremony.',
    number: '04',
    path: '/hono-rpc',
    title: 'Hono RPC Demo',
    to: '/hono-rpc',
  },
  {
    description:
      'Error routes and boundary behavior for failure states, status codes, and recovery.',
    number: '05',
    path: '/errors',
    title: 'Error Handling Demo',
    to: '/errors',
  },
] as const;

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
            <Text
              as="h1"
              className={c.title}
            >
              React Router
              <span className={c.titleAccent}>&amp; Hono</span>
            </Text>

            <Text
              as="p"
              className={c.heroLead}
            >
              Render, route, and recover with a compact full-stack demo.
            </Text>

            <p className={c.heroBody}>
              Five routes keep SSR, RPC, layout, boundaries, and architecture legible without
              turning the homepage into a dashboard.
            </p>

            <div className={c.heroActions}>
              <Link
                className={c.ctaPrimary}
                to="/about"
              >
                Read the overview
              </Link>
              <Link
                className={c.ctaSecondary}
                to="/hono-rpc"
              >
                Open the RPC flow
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
            Start with one route. The rest stays in view.
          </Text>

          <p className={c.routesIntro}>
            Each entry isolates one concern so you can inspect the stack in pieces instead of
            decoding everything at once.
          </p>

          <div className={c.routesList}>
            {routes.map(route => (
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

                  <span className={c.routeAction}>Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
