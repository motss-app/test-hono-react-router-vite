import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { Text } from '../components/Text.tsx';
import {
  IconBolt,
  IconCheck,
  IconCircleInfo,
  IconGears,
  IconMobile,
  IconServer,
  IconShield,
} from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/about.ts';

const s = create({
  backLink: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#93c5fd',
        default: colorTokens.infoHover,
      },
    },
    color: {
      [themeConditions.dataThemeDark]: '#93c5fd',
      default: colorTokens.info,
    },
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  backLinkWrapper: {
    marginBlockStart: '2rem',
  },
  card: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: colorTokens.slate100,
    },
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    padding: '2rem',
  },
  cardIcon: {
    fontSize: '1.875rem',
  },
  cardIconSvg: {
    height: '1.875rem',
    width: '1.875rem',
  },
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '56rem',
    paddingBottom: '4rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '4rem',
    width: '100%',
  },
  ctaSection: {
    backgroundColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate900,
      default: '#eff6ff',
    },
    borderColor: {
      [themeConditions.dataThemeDark]: colorTokens.slate800,
      default: '#bfdbfe',
    },
    borderRadius: '1rem',
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    padding: '3rem',
    textAlign: 'center',
  },
  ctaText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate700,
    },
    fontSize: '1.25rem',
    marginBottom: '2rem',
  },
  ctaTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.875rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1rem',
  },
  featureCard: {
    padding: '1.5rem',
    textAlign: 'center',
  },
  featureIconBase: {
    fontSize: '2.25rem',
    marginBottom: '1rem',
  },
  featureIconPurple: {
    color: {
      [themeConditions.dataThemeDark]: '#c084fc',
      default: colorTokens.purple,
    },
  },
  featureIconSvg: {
    height: '2.25rem',
    width: '2.25rem',
  },
  featureIconYellow: {
    color: {
      [themeConditions.dataThemeDark]: '#fbbf24',
      default: colorTokens.warning,
    },
  },
  featureText: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
  },
  featureTitle: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.25rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    marginBottom: '0.75rem',
  },
  grid2: {
    display: 'grid',
    gap: '2rem',
    gridTemplateColumns: {
      '@media (min-width: 768px)': '1fr 1fr',
      default: '1fr',
    },
  },
  grid3: {
    display: 'grid',
    gap: '1.5rem',
    gridTemplateColumns: {
      '@media (min-width: 768px)': 'repeat(3, 1fr)',
      default: '1fr',
    },
  },
  h1: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: {
      '@media (min-width: 768px)': '3rem',
      default: '2.25rem',
    },
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '1.5rem',
  },
  h2: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    fontSize: '1.875rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '3rem',
    textAlign: 'center',
  },
  h3: {
    alignItems: 'center',
    color: {
      [themeConditions.dataThemeDark]: colorTokens.white,
      default: colorTokens.slate900,
    },
    display: 'flex',
    fontSize: '1.5rem',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  heroIconSvg: {
    height: '3rem',
    width: '3rem',
  },
  heroIconWrapper: {
    color: {
      [themeConditions.dataThemeDark]: '#93c5fd',
      default: colorTokens.info,
    },
    fontSize: '3.75rem',
    marginBottom: '1.5rem',
  },
  heroSection: {
    marginBottom: '4rem',
    textAlign: 'center',
  },
  list: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  listIconSvg: {
    height: '1.125rem',
    width: '1.125rem',
  },
  listItem: {
    alignItems: 'center',
    display: 'flex',
    gap: '0.5rem',
  },
  p: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '1.25rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
  },
  pageWrapper: {
    padding: '2rem',
  },
  section: {
    marginBottom: '4rem',
  },
  textBlue: {
    color: {
      [themeConditions.dataThemeDark]: '#93c5fd',
      default: colorTokens.info,
    },
  },
  textGreen: {
    color: {
      [themeConditions.dataThemeDark]: '#4ade80',
      default: colorTokens.success,
    },
  },
});

export function meta(_args: Route.MetaArgs): Route.MetaDescriptors {
  return [
    {
      title: 'New React Router App',
    },
    {
      content: 'Welcome to React Router!',
      name: 'description',
    },
  ];
}

export default function About(): JSX.Element {
  return (
    <div {...props(s.pageWrapper)}>
      <div {...props(s.backLinkWrapper)}>
        <Link
          to="/"
          {...props(s.backLink)}
        >
          ← Back to Home
        </Link>
      </div>

      <div {...props(s.container)}>
        {/* Header */}
        <div {...props(s.heroSection)}>
          <div {...props(s.heroIconWrapper)}>
            <IconCircleInfo {...props(iconStyles.base, s.heroIconSvg)} />
          </div>
          <Text
            as="h1"
            {...props(s.h1)}
          >
            About This Project
          </Text>
          <Text {...props(s.p)}>
            A modern full-stack web application showcasing the power of React Router, Hono, and
            cutting-edge development tools.
          </Text>
        </div>

        {/* Tech Stack */}
        <section {...props(s.section)}>
          <Text
            as="h2"
            {...props(s.h2)}
          >
            Technology Stack
          </Text>

          <div {...props(s.grid2)}>
            <div {...props(s.card)}>
              <Text
                as="h3"
                {...props(s.h3)}
              >
                <span {...props(s.cardIcon, s.textBlue)}>
                  <IconGears {...props(iconStyles.base, s.cardIconSvg)} />
                </span>
                <span>Frontend</span>
              </Text>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>React 19 with TypeScript</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>React Router 7 for routing</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>StyleX for styling</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>Iconify with FontAwesome 7</span>
                </li>
              </ul>
            </div>

            <div {...props(s.card)}>
              <Text
                as="h3"
                {...props(s.h3)}
              >
                <span {...props(s.cardIcon, s.textGreen)}>
                  <IconServer {...props(iconStyles.base, s.cardIconSvg)} />
                </span>
                <span>Backend</span>
              </Text>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>Hono web framework</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>Node.js runtime</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>TypeScript support</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base, s.listIconSvg)} />
                  </span>
                  <span>RPC capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section {...props(s.section)}>
          <Text
            as="h2"
            {...props(s.h2)}
          >
            Key Features
          </Text>

          <div {...props(s.grid3)}>
            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.featureIconYellow)}>
                <IconBolt {...props(iconStyles.base, s.featureIconSvg)} />
              </div>
              <Text
                as="h3"
                {...props(s.featureTitle)}
              >
                Fast Development
              </Text>
              <Text {...props(s.featureText)}>
                Hot module replacement and instant builds with Vite
              </Text>
            </div>

            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.textBlue)}>
                <IconShield {...props(iconStyles.base, s.featureIconSvg)} />
              </div>
              <Text
                as="h3"
                {...props(s.featureTitle)}
              >
                Type Safety
              </Text>
              <Text {...props(s.featureText)}>
                Full TypeScript support throughout the entire stack
              </Text>
            </div>

            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.featureIconPurple)}>
                <IconMobile {...props(iconStyles.base, s.featureIconSvg)} />
              </div>
              <Text
                as="h3"
                {...props(s.featureTitle)}
              >
                Responsive Design
              </Text>
              <Text {...props(s.featureText)}>Mobile-first design with StyleX</Text>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section {...props(s.ctaSection)}>
          <Text
            as="h2"
            {...props(s.ctaTitle)}
          >
            Explore the Demos
          </Text>
          <Text {...props(s.ctaText)}>
            See these technologies in action with our interactive demos
          </Text>
        </section>
      </div>
    </div>
  );
}
