import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/home.ts';
import { s } from './home.css.ts';

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
    <main className={s.page}>
      <section className={s.hero}>
        <div
          aria-hidden="true"
          className={s.heroMedia}
        />
        <div
          aria-hidden="true"
          className={s.heroOverlay}
        />

        <div className={s.heroInner}>
          <div className={s.heroCopy}>
            <Text
              as="h1"
              className={s.title}
            >
              React Router
              <span className={s.titleAccent}>&amp; Hono</span>
            </Text>

            <Text
              as="p"
              className={s.heroLead}
            >
              Render, route, and recover with a compact full-stack demo.
            </Text>

            <p className={s.heroBody}>
              Five routes keep SSR, RPC, layout, boundaries, and architecture legible without
              turning the homepage into a dashboard.
            </p>

            <div className={s.heroActions}>
              <Link
                className={s.ctaPrimary}
                to="/about"
              >
                Read the overview
              </Link>
              <Link
                className={s.ctaSecondary}
                to="/hono-rpc"
              >
                Open the RPC flow
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={s.routesSection}>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            Start with one route. The rest stays in view.
          </Text>

          <p className={s.routesIntro}>
            Each entry isolates one concern so you can inspect the stack in pieces instead of
            decoding everything at once.
          </p>

          <div className={s.routesList}>
            {routes.map(route => (
              <div
                className={s.routeRow}
                key={route.to}
              >
                <Link
                  className={s.routeLink}
                  to={route.to}
                >
                  <span className={s.routeNumber}>{route.number}</span>

                  <div className={s.routeTitleBlock}>
                    <Text
                      as="h3"
                      className={s.routeTitle}
                    >
                      {route.title}
                    </Text>
                    <span className={s.routePath}>{route.path}</span>
                  </div>

                  <p className={s.routeDescription}>{route.description}</p>

                  <span className={s.routeAction}>Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
