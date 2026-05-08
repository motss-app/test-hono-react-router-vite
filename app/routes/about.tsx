import { create, keyframes, props } from '@stylexjs/stylex';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/text.tsx';
import {
  IconArrowLeft,
  IconBolt,
  IconGears,
  IconMobile,
  IconServer,
  IconShield,
} from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/about.ts';

const heroReveal = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate3d(0, 1.5rem, 0)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate3d(0, 0, 0)',
  },
});

const artworkDrift = keyframes({
  '0%': {
    transform: 'scale(1.02) translate3d(0, 0, 0)',
  },
  '50%': {
    transform: 'scale(1.05) translate3d(-0.75%, 0.5%, 0)',
  },
  '100%': {
    transform: 'scale(1.03) translate3d(-0.25%, -0.35%, 0)',
  },
});

const s = create({
  ctaPrimary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: '#7dd3fc',
        default: colorTokens.infoHover,
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    alignItems: 'center',
    animationDelay: '240ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#bae6fd',
      default: colorTokens.info,
    },
    borderRadius: '9999px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: colorTokens.white,
    },
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
  ctaSecondary: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(148, 163, 184, 0.12)',
        default: 'rgba(255, 255, 255, 0.7)',
      },
      borderColor: {
        [themeConditions.dataThemeDark]: colorTokens.slate400,
        default: '#bfdbfe',
      },
      transform: 'translate3d(0, -0.125rem, 0)',
    },
    alignItems: 'center',
    animationDelay: '320ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backgroundColor: {
      [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.28)',
      default: 'rgba(255, 255, 255, 0.78)',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: 'rgba(226, 232, 240, 0.26)',
      default: 'rgba(15, 23, 42, 0.12)',
    },
    borderRadius: '9999px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    display: 'inline-grid',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    gridAutoFlow: 'column',
    padding: '0.92rem 1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
    whiteSpace: 'nowrap',
  },
  featureBody: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
  },
  featureIcon: {
    display: 'inline-grid',
    marginBottom: '0.5rem',
  },
  featureIconAmber: {
    color: {
      [themeConditions.dataThemeDark]: '#fcd34d',
      default: colorTokens.warning,
    },
  },
  featureIconBlue: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
  },
  featureIconGreen: {
    color: {
      [themeConditions.dataThemeDark]: '#86efac',
      default: colorTokens.success,
    },
  },
  featureIconSvg: {
    height: '1.5rem',
    width: '1.5rem',
  },
  featureNumber: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontSize: {
      '@media (min-width: 768px)': '2rem',
      default: '1.45rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  },
  featureRow: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  },
  featureTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
  },
  hero: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#08101b',
      default: '#edf6ff',
    },
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  heroActions: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  heroBody: {
    animationDelay: '160ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate800,
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '31rem',
  },
  heroCopy: {
    maxWidth: '38rem',
    minWidth: 0,
    paddingBottom: {
      '@media (min-width: 768px)': '4rem',
      default: '2.5rem',
    },
    position: 'relative',
    zIndex: 2,
  },
  heroInner: {
    alignItems: 'flex-end',
    display: 'grid',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minHeight: '100svh',
    minWidth: 0,
    paddingBottom: {
      '@media (min-width: 768px)': '0',
      default: '2rem',
    },
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '4rem',
    position: 'relative',
  },
  heroLead: {
    animationDelay: '110ms',
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate100,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '1.95rem',
      default: '1.28rem',
    },
    fontWeight: fontWeightTokens.fontWeightMedium,
    letterSpacing: '-0.025em',
    lineHeight: '1.12',
    marginBottom: '0.85rem',
    marginTop: 0,
    maxWidth: '16ch',
  },
  heroMedia: {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: '1',
    },
    animationDirection: 'alternate',
    animationDuration: '18s',
    animationIterationCount: 'infinite',
    animationName: artworkDrift,
    animationTimingFunction: 'ease-in-out',
    backgroundImage: {
      [themeConditions.dataThemeDark]: 'url("/assets/about-hero-dark.svg")',
      default: 'url("/assets/about-hero-light.svg")',
    },
    backgroundPosition: {
      '@media (min-width: 768px)': 'center center',
      default: '72% center',
    },
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    inset: 0,
    opacity: {
      [themeConditions.dataThemeDark]: 1,
      default: 0.8,
    },
    position: 'absolute',
    transformOrigin: 'center',
  },
  heroOverlay: {
    backgroundImage: {
      [themeConditions.dataThemeDark]:
        'linear-gradient(90deg, rgba(8, 16, 27, 0.92) 0%, rgba(8, 16, 27, 0.72) 26%, rgba(8, 16, 27, 0.28) 54%, rgba(8, 16, 27, 0.1) 100%), linear-gradient(180deg, rgba(8, 16, 27, 0.12) 0%, rgba(8, 16, 27, 0.18) 100%)',
      default:
        'linear-gradient(90deg, rgba(249, 252, 255, 0.995) 0%, rgba(249, 252, 255, 0.94) 28%, rgba(243, 248, 255, 0.78) 48%, rgba(239, 246, 255, 0.48) 68%, rgba(237, 246, 255, 0.26) 100%), linear-gradient(180deg, rgba(255, 255, 255, 0.22) 0%, rgba(226, 239, 255, 0.12) 100%)',
    },
    inset: 0,
    position: 'absolute',
    zIndex: 1,
  },
  itemBullet: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    borderRadius: '9999px',
    height: '0.45rem',
    marginTop: '0.5rem',
    width: '0.45rem',
  },
  itemText: {
    minWidth: 0,
  },
  nextAction: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate600,
    },
    fontSize: '0.95rem',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },
  nextLink: {
    ':hover': {
      backgroundColor: {
        [themeConditions.dataThemeDark]: 'rgba(15, 23, 42, 0.22)',
        default: 'rgba(248, 250, 252, 0.9)',
      },
      transform: 'translate3d(0.35rem, 0, 0)',
    },
    alignItems: {
      '@media (min-width: 960px)': 'center',
      default: 'start',
    },
    borderRadius: '1rem',
    display: 'grid',
    gap: '0.95rem 1rem',
    gridTemplateColumns: {
      '@media (min-width: 960px)': '5.5rem minmax(0, 18rem) minmax(0, 1fr) auto',
      default: '1fr',
    },
    minWidth: 0,
    paddingBottom: '1.45rem',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    paddingTop: '1.45rem',
    textDecoration: 'none',
    transition: 'background-color 0.2s ease, transform 0.2s ease',
  },
  nextList: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  },
  nextPath: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate400,
      default: colorTokens.slate600,
    },
    fontSize: '0.86rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  nextRow: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  },
  nextTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
  },
  nextTitleBlock: {
    minWidth: 0,
  },
  page: {
    minWidth: 0,
    paddingBottom: '4rem',
  },
  routesInner: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '84rem',
    minWidth: 0,
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '3.5rem',
  },
  routesIntro: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '1rem',
    lineHeight: '1.7',
    marginBottom: '2rem',
    marginTop: 0,
    maxWidth: '34rem',
  },
  routesTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '2.6rem',
      default: '2rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '0.98',
    marginBottom: '0.75rem',
    marginTop: 0,
    maxWidth: '12ch',
  },
  rowBody: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '0.98rem',
    lineHeight: '1.65',
    margin: 0,
    minWidth: 0,
  },
  rowIcon: {
    display: 'inline-grid',
    marginBottom: '0.5rem',
    placeItems: 'center',
  },
  rowIconBlue: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
  },
  rowIconGreen: {
    color: {
      [themeConditions.dataThemeDark]: '#86efac',
      default: colorTokens.success,
    },
  },
  rowIconSvg: {
    height: '1.5rem',
    width: '1.5rem',
  },
  rowNumber: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    fontSize: {
      '@media (min-width: 768px)': '2rem',
      default: '1.45rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.04em',
    lineHeight: '1',
  },
  rowRow: {
    borderBottomColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    minWidth: 0,
  },
  rowTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.45rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    letterSpacing: '-0.03em',
    lineHeight: '1.1',
    marginBottom: '0.3rem',
    marginTop: 0,
  },
  rowTitleBlock: {
    minWidth: 0,
  },
  stackItems: {
    display: 'grid',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    minWidth: 0,
    padding: 0,
  },
  stackList: {
    borderTopColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate200,
    },
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    minWidth: 0,
  },
  stackListItem: {
    alignItems: 'start',
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: 'auto minmax(0, 1fr)',
    minWidth: 0,
  },
  title: {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: '1ms',
      animationIterationCount: '1',
    },
    animationDuration: '700ms',
    animationFillMode: 'both',
    animationName: heroReveal,
    animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '6.4rem',
      default: '3.95rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    letterSpacing: '-0.07em',
    lineHeight: '0.84',
    marginBottom: '1rem',
    marginTop: 0,
    maxWidth: '7ch',
  },
  titleAccent: {
    color: {
      [themeConditions.dataThemeDark]: '#7dd3fc',
      default: colorTokens.info,
    },
    display: 'block',
  },
});

const stackSections = [
  {
    description:
      'The interface layer keeps routing, components, styling, and iconography easy to inspect.',
    icon: IconGears,
    iconStyle: s.rowIconBlue,
    items: [
      'React 19 with TypeScript',
      'React Router 7 for routing',
      'StyleX for styling',
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
    <main {...props(s.page)}>
      <section {...props(s.hero)}>
        <div
          aria-hidden="true"
          {...props(s.heroMedia)}
        />
        <div
          aria-hidden="true"
          {...props(s.heroOverlay)}
        />

        <div {...props(s.heroInner)}>
          <div {...props(s.heroCopy)}>
            <Text
              as="h1"
              {...props(s.title)}
            >
              About
              <span {...props(s.titleAccent)}>This Project</span>
            </Text>

            <Text
              as="p"
              {...props(s.heroLead)}
            >
              Architecture, stack, and design decisions in one place.
            </Text>

            <p {...props(s.heroBody)}>
              This demo keeps the stack intentionally compact so React Router, Hono, StyleX, and
              typed request flows stay easy to inspect instead of disappearing behind abstraction.
            </p>

            <div {...props(s.heroActions)}>
              <Link
                to="/"
                {...props(s.ctaSecondary)}
              >
                <IconArrowLeft {...props(iconStyles.base)} />
                <span>Back home</span>
              </Link>
              <Link
                to="/hono-rpc"
                {...props(s.ctaPrimary)}
              >
                Open the RPC demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div {...props(s.routesInner)}>
          <Text
            as="h2"
            {...props(s.routesTitle)}
          >
            The stack stays small so the ideas stay visible.
          </Text>

          <p {...props(s.routesIntro)}>
            Rather than hide the app behind heavy framework chrome, each layer is exposed clearly so
            you can read how the demo is assembled.
          </p>

          <div {...props(s.stackList)}>
            {stackSections.map(section => {
              const Icon = section.icon;

              return (
                <div
                  key={section.title}
                  {...props(s.rowRow)}
                >
                  <div {...props(s.nextLink)}>
                    <span {...props(s.rowNumber)}>{section.number}</span>

                    <div {...props(s.rowTitleBlock)}>
                      <span {...props(s.rowIcon, section.iconStyle)}>
                        <Icon {...props(iconStyles.base, s.rowIconSvg)} />
                      </span>
                      <Text
                        as="h3"
                        {...props(s.rowTitle)}
                      >
                        {section.title}
                      </Text>
                    </div>

                    <p {...props(s.rowBody)}>{section.description}</p>

                    <ul {...props(s.stackItems)}>
                      {section.items.map(item => (
                        <li
                          key={item}
                          {...props(s.stackListItem)}
                        >
                          <span {...props(s.itemBullet)} />
                          <span {...props(s.itemText)}>{item}</span>
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
        <div {...props(s.routesInner)}>
          <Text
            as="h2"
            {...props(s.routesTitle)}
          >
            Three qualities shape the build.
          </Text>

          <p {...props(s.routesIntro)}>
            The goal is not visual noise or framework gymnastics — it is a readable demo surface
            with fast iteration and clear behavior.
          </p>

          <div {...props(s.nextList)}>
            {features.map(feature => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  {...props(s.featureRow)}
                >
                  <div {...props(s.nextLink)}>
                    <span {...props(s.featureNumber)}>{feature.number}</span>

                    <div {...props(s.rowTitleBlock)}>
                      <span {...props(s.featureIcon, feature.iconStyle)}>
                        <Icon {...props(iconStyles.base, s.featureIconSvg)} />
                      </span>
                      <Text
                        as="h3"
                        {...props(s.featureTitle)}
                      >
                        {feature.title}
                      </Text>
                    </div>

                    <p {...props(s.featureBody)}>{feature.description}</p>

                    <span {...props(s.nextAction)}>Built in →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div {...props(s.routesInner)}>
          <Text
            as="h2"
            {...props(s.routesTitle)}
          >
            Continue through the demo routes.
          </Text>

          <p {...props(s.routesIntro)}>
            After the overview, use the remaining routes to inspect rendering, data flow, and
            failure handling in isolation.
          </p>

          <div {...props(s.nextList)}>
            {nextRoutes.map(route => (
              <div
                key={route.to}
                {...props(s.nextRow)}
              >
                <Link
                  to={route.to}
                  {...props(s.nextLink)}
                >
                  <span {...props(s.rowNumber)}>{route.number}</span>

                  <div {...props(s.nextTitleBlock)}>
                    <Text
                      as="h3"
                      {...props(s.nextTitle)}
                    >
                      {route.title}
                    </Text>
                    <span {...props(s.nextPath)}>{route.path}</span>
                  </div>

                  <p {...props(s.rowBody)}>{route.description}</p>

                  <span {...props(s.nextAction)}>Open →</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
