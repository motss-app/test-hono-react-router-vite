import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import {
  IconArrowLeft,
  IconBolt,
  IconGears,
  IconMobile,
  IconServer,
  IconShield,
} from '../icons.ts';
import { iconStyles } from '../styles/icon.css.ts';
import { createBackgroundSvgPreloadLinks } from '../utils/background-svg-preload.ts';
import type { Route } from './+types/about.ts';
import { s } from './about.css.ts';

const stackSections = [
  {
    description:
      'The interface layer keeps routing, components, styling, and iconography easy to inspect.',
    icon: IconGears,
    iconStyle: s.rowIconBlue,
    items: [
      'React 19 with TypeScript',
      'React Router 7 for routing',
      'Vanilla Extract for styling',
      'Iconify with FontAwesome 7',
    ],
    number: '01',
    title: 'Frontend',
  },
  {
    description:
      'The server side stays deliberately small so rendering and request flow are visible instead of hidden.',
    icon: IconServer,
    iconStyle: s.rowIconGreen,
    items: [
      'Hono web framework',
      'Deno-first runtime',
      'Cloudflare Workers target',
      'Typed RPC capabilities',
    ],
    number: '02',
    title: 'Runtime',
  },
] as const;

const features = [
  {
    description:
      'Vite keeps iteration tight so route, style, and server changes are quick to verify.',
    icon: IconBolt,
    iconStyle: s.featureIconAmber,
    number: '03',
    title: 'Fast development',
  },
  {
    description: 'Typed boundaries across routes, loaders, actions, and RPC keep the demo honest.',
    icon: IconShield,
    iconStyle: s.featureIconBlue,
    number: '04',
    title: 'Type safety',
  },
  {
    description: 'The layouts are built to hold together on narrow screens without turning dense.',
    icon: IconMobile,
    iconStyle: s.featureIconGreen,
    number: '05',
    title: 'Responsive by default',
  },
] as const;

const nextRoutes = [
  {
    description: 'Inspect request-time rendering and timing data on a server-owned page.',
    number: '06',
    path: '/ssr',
    title: 'SSR Page',
    to: '/ssr',
  },
  {
    description: 'Follow the typed client and server exchange through the Hono RPC demo.',
    number: '07',
    path: '/hono-rpc',
    title: 'Hono RPC Demo',
    to: '/hono-rpc',
  },
  {
    description: 'See boundaries, status codes, and recovery behavior under failure conditions.',
    number: '08',
    path: '/errors',
    title: 'Error Handling Demo',
    to: '/errors',
  },
] as const;

export const links: Route.LinksFunction = () =>
  createBackgroundSvgPreloadLinks([
    '/assets/about-hero-dark.svg',
    '/assets/about-hero-light.svg',
  ]);

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: 'About · React Router + Hono Demo',
    },
    {
      content: 'Architecture, stack, and design decisions for the React Router + Hono demo.',
      name: 'description',
    },
  ];
}

export default function About(): JSX.Element {
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
              About
              <span className={s.titleAccent}>This Project</span>
            </Text>

            <Text
              as="p"
              className={s.heroLead}
            >
              Architecture, stack, and design decisions in one place.
            </Text>

            <p className={s.heroBody}>
              This demo keeps the stack intentionally compact so React Router, Hono, Vanilla
              Extract, and typed request flows stay easy to inspect instead of disappearing behind
              abstraction.
            </p>

            <div className={s.heroActions}>
              <Link
                className={s.ctaSecondary}
                to="/"
              >
                <IconArrowLeft className={iconStyles.base} />
                <span>Back home</span>
              </Link>
              <Link
                className={s.ctaPrimary}
                to="/hono-rpc"
              >
                Open the RPC demo
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
            The stack stays small so the ideas stay visible.
          </Text>

          <p className={s.routesIntro}>
            Rather than hide the app behind heavy framework chrome, each layer is exposed clearly so
            you can read how the demo is assembled.
          </p>

          <div className={s.stackList}>
            {stackSections.map(section => {
              const Icon = section.icon;

              return (
                <div
                  className={s.rowRow}
                  key={section.title}
                >
                  <div className={s.nextLink}>
                    <span className={s.rowNumber}>{section.number}</span>

                    <div className={s.rowTitleBlock}>
                      <span
                        className={[
                          s.rowIcon,
                          section.iconStyle,
                        ].join(' ')}
                      >
                        <Icon className={`${iconStyles.base} ${s.rowIconSvg}`} />
                      </span>
                      <Text
                        as="h3"
                        className={s.rowTitle}
                      >
                        {section.title}
                      </Text>
                    </div>

                    <p className={s.rowBody}>{section.description}</p>

                    <ul className={s.stackItems}>
                      {section.items.map(item => (
                        <li
                          className={s.stackListItem}
                          key={item}
                        >
                          <span className={s.itemBullet} />
                          <span className={s.itemText}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            Three qualities shape the build.
          </Text>

          <p className={s.routesIntro}>
            The goal is not visual noise or framework gymnastics — it is a readable demo surface
            with fast iteration and clear behavior.
          </p>

          <div className={s.nextList}>
            {features.map(feature => {
              const Icon = feature.icon;

              return (
                <div
                  className={s.featureRow}
                  key={feature.title}
                >
                  <div className={s.nextLink}>
                    <span className={s.featureNumber}>{feature.number}</span>

                    <div className={s.rowTitleBlock}>
                      <span
                        className={[
                          s.featureIcon,
                          feature.iconStyle,
                        ].join(' ')}
                      >
                        <Icon className={`${iconStyles.base} ${s.featureIconSvg}`} />
                      </span>
                      <Text
                        as="h3"
                        className={s.featureTitle}
                      >
                        {feature.title}
                      </Text>
                    </div>

                    <p className={s.featureBody}>{feature.description}</p>

                    <span className={s.nextAction}>Built in →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className={s.routesInner}>
          <Text
            as="h2"
            className={s.routesTitle}
          >
            Continue through the demo routes.
          </Text>

          <p className={s.routesIntro}>
            After the overview, use the remaining routes to inspect rendering, data flow, and
            failure handling in isolation.
          </p>

          <div className={s.nextList}>
            {nextRoutes.map(route => (
              <div
                className={s.nextRow}
                key={route.to}
              >
                <Link
                  className={s.nextLink}
                  to={route.to}
                >
                  <span className={s.rowNumber}>{route.number}</span>

                  <div className={s.nextTitleBlock}>
                    <Text
                      as="h3"
                      className={s.nextTitle}
                    >
                      {route.title}
                    </Text>
                    <span className={s.nextPath}>{route.path}</span>
                  </div>

                  <p className={s.rowBody}>{route.description}</p>

                  <span className={s.nextAction}>Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
