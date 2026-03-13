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
} from '../icons/iconify.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { tokens } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/about.ts';

const s = create({
  backLink: {
    ':hover': {
      color: '#93c5fd',
    },
    color: '#60a5fa',
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  backLinkWrapper: {
    marginBlockStart: tokens.spacing8,
  },
  card: {
    backgroundColor: '#1e293b', // dark:bg-slate-800
    borderRadius: tokens.borderRadiusXl,
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    padding: tokens.spacing8,
  },
  cardIcon: {
    fontSize: tokens.fontSize3xl,
  },
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: tokens.maxWidth4xl,
    paddingBottom: tokens.spacing16,
    paddingLeft: tokens.spacing4,
    paddingRight: tokens.spacing4,
    paddingTop: tokens.spacing16,
    width: '100%',
  },
  ctaSection: {
    backgroundColor: tokens.slate900,
    borderRadius: tokens.borderRadius2xl,
    color: tokens.white,
    padding: tokens.spacing12,
    textAlign: tokens.textAlign,
  },
  ctaText: {
    color: tokens.white,
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
    opacity: 0.9,
  },
  ctaTitle: {
    color: tokens.white,
    fontSize: tokens.fontSize3xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing4,
  },
  featureCard: {
    padding: tokens.spacing6,
    textAlign: tokens.textAlign,
  },
  featureIconBase: {
    fontSize: tokens.fontSize4xl,
    marginBottom: tokens.spacing4,
  },
  featureIconPurple: {
    color: tokens.purple,
  },
  featureIconYellow: {
    color: '#fbbf24', // amber-400
  },
  featureText: {
    color: '#94a3b8', // dark:text-slate-400
  },
  featureTitle: {
    color: '#ffffff', // dark:text-white
    fontSize: tokens.fontSizeXl,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '0.75rem',
  },
  grid2: {
    display: 'grid',
    gap: tokens.spacing8,
    gridTemplateColumns: {
      '@media (min-width: 768px)': '1fr 1fr',
      default: '1fr',
    },
  },
  grid3: {
    display: 'grid',
    gap: tokens.spacing6,
    gridTemplateColumns: {
      '@media (min-width: 768px)': 'repeat(3, 1fr)',
      default: '1fr',
    },
  },
  h1: {
    color: '#ffffff', // dark:text-white
    fontSize: {
      '@media (min-width: 768px)': '3rem',
      default: tokens.fontSize4xl,
    },
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing6,
  },
  h2: {
    color: '#ffffff', // dark:text-white
    fontSize: tokens.fontSize3xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing12,
    textAlign: tokens.textAlign,
  },
  h3: {
    alignItems: 'center',
    color: '#ffffff', // dark:text-white
    display: 'flex',
    fontSize: tokens.fontSize2xl,
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing3,
    marginBottom: tokens.spacing4,
  },
  heroIconWrapper: {
    color: '#60a5fa', // dark:text-blue-400
    fontSize: '3.75rem',
    marginBottom: tokens.spacing6,
  },
  heroSection: {
    marginBottom: tokens.spacing16,
    textAlign: tokens.textAlign,
  },
  list: {
    color: '#94a3b8', // dark:text-slate-400
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing3,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  listItem: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacing2,
  },
  p: {
    color: '#94a3b8', // dark:text-slate-400
    fontSize: tokens.fontSizeXl,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: tokens.maxWidth2xl,
  },
  pageWrapper: {
    padding: tokens.spacing8,
  },
  section: {
    marginBottom: tokens.spacing16,
  },
  textBlue: {
    color: '#60a5fa', // dark:text-blue-400
  },
  textGreen: {
    color: '#4ade80', // dark:text-green-400
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
            <IconCircleInfo {...props(iconStyles.base)} />
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
                  <IconGears {...props(iconStyles.base)} />
                </span>
                <span>Frontend</span>
              </Text>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>React 19 with TypeScript</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>React Router 7 for routing</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>StyleX for styling</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
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
                  <IconServer {...props(iconStyles.base)} />
                </span>
                <span>Backend</span>
              </Text>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>Hono web framework</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>Node.js runtime</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
                  </span>
                  <span>TypeScript support</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <IconCheck {...props(iconStyles.base)} />
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
                <IconBolt {...props(iconStyles.base)} />
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
                <IconShield {...props(iconStyles.base)} />
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
                <IconMobile {...props(iconStyles.base)} />
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
