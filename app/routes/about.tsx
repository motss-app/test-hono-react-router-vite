import { Icon } from '@iconify/react';
import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { tokens } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/about.ts';

const s = create({
  backLink: {
    ':hover': {
      color: tokens.primaryHover,
    },
    color: tokens.primary,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  backLinkWrapper: {
    marginBlockStart: tokens.spacing8,
  },
  card: {
    backgroundColor: tokens.bgColor, // Implicit, but good to be explicit or leave transparent if body bg
    borderRadius: '0.75rem', // rounded-xl
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    padding: tokens.spacing8,
  },
  cardIcon: {
    fontSize: '1.875rem', // text-3xl
  },
  container: {
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '56rem', // max-w-4xl
    paddingBottom: tokens.spacing16,
    paddingLeft: tokens.spacing4,
    paddingRight: tokens.spacing4,
    paddingTop: tokens.spacing16,
    width: '100%',
  },
  ctaSection: {
    backgroundColor: '#0f172a', // bg-slate-900 (always dark for CTA)
    borderRadius: '1rem', // rounded-2xl
    color: 'white',
    padding: '3rem', // p-12
    textAlign: 'center',
  },
  ctaText: {
    color: 'white',
    fontSize: tokens.fontSizeXl,
    marginBottom: tokens.spacing8,
    opacity: 0.9,
  },
  ctaTitle: {
    color: 'white',
    fontSize: '1.875rem',
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing4,
  },
  featureCard: {
    padding: '1.5rem',
    textAlign: 'center',
  },
  featureIconBase: {
    fontSize: '2.25rem', // text-4xl
    marginBottom: tokens.spacing4,
  },
  featureIconPurple: {
    color: tokens.purple,
  },
  featureIconYellow: {
    color: tokens.warning,
  },
  featureText: {
    color: tokens.textColor,
    opacity: 0.8,
  },
  featureTitle: {
    color: tokens.textColor,
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
    gap: '1.5rem', // gap-6
    gridTemplateColumns: {
      '@media (min-width: 768px)': 'repeat(3, 1fr)',
      default: '1fr',
    },
  },
  h1: {
    color: tokens.textColor,
    fontSize: {
      '@media (min-width: 768px)': '3rem',
      default: '2.25rem',
    }, // text-4xl / md:5xl
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing4,
  },
  h2: {
    color: tokens.textColor,
    fontSize: '1.875rem', // text-3xl
    fontWeight: tokens.fontWeightBold,
    marginBottom: '3rem', // mb-12
    textAlign: 'center',
  },
  h3: {
    alignItems: 'center',
    color: tokens.textColor,
    display: 'flex',
    fontSize: '1.5rem', // text-2xl
    fontWeight: tokens.fontWeightSemibold,
    gap: '0.75rem', // space-x-3
    marginBottom: tokens.spacing4,
  },
  heroIconWrapper: {
    color: tokens.primary,
    fontSize: '3.75rem', // text-6xl
    marginBottom: tokens.spacing4, // mb-6 originally
  },
  heroSection: {
    marginBottom: tokens.spacing16,
  },
  list: {
    color: tokens.textColor,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem', // space-y-3
    listStyle: 'none',
    margin: 0,
    opacity: 0.8,
    padding: 0,
  },
  listItem: {
    alignItems: 'center',
    display: 'flex',
    gap: tokens.spacing2,
  },
  p: {
    color: tokens.textColor,
    fontSize: tokens.fontSizeXl,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
    opacity: 0.8, // slate-600 approx
  },
  pageWrapper: {
    minHeight: '100vh',
    padding: tokens.spacing8,
  },
  section: {
    marginBottom: tokens.spacing16,
  },
  textBlue: {
    color: tokens.primary,
  },
  textCenter: {
    textAlign: 'center',
  },
  textGreen: {
    color: tokens.success,
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
        <div {...props(s.heroSection, s.textCenter)}>
          <div {...props(s.heroIconWrapper)}>
            <Icon icon="fa7-solid:circle-info" />
          </div>
          <h1 {...props(s.h1)}>About This Project</h1>
          <p {...props(s.p)}>
            A modern full-stack web application showcasing the power of React Router, Hono, and
            cutting-edge development tools.
          </p>
        </div>

        {/* Tech Stack */}
        <section {...props(s.section)}>
          <h2 {...props(s.h2)}>Technology Stack</h2>

          <div {...props(s.grid2)}>
            <div {...props(s.card)}>
              <h3 {...props(s.h3)}>
                <span {...props(s.cardIcon, s.textBlue)}>
                  <Icon icon="fa7-solid:gears" />
                </span>
                <span>Frontend</span>
              </h3>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>React 19 with TypeScript</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>React Router 7 for routing</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>StyleX for styling</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>Iconify with FontAwesome 7</span>
                </li>
              </ul>
            </div>

            <div {...props(s.card)}>
              <h3 {...props(s.h3)}>
                <span {...props(s.cardIcon, s.textGreen)}>
                  <Icon icon="fa7-solid:server" />
                </span>
                <span>Backend</span>
              </h3>
              <ul {...props(s.list)}>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>Hono web framework</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>Node.js runtime</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>TypeScript support</span>
                </li>
                <li {...props(s.listItem)}>
                  <span {...props(s.textGreen)}>
                    <Icon icon="fa7-solid:check" />
                  </span>
                  <span>RPC capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section {...props(s.section)}>
          <h2 {...props(s.h2)}>Key Features</h2>

          <div {...props(s.grid3)}>
            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.featureIconYellow)}>
                <Icon icon="fa7-solid:bolt" />
              </div>
              <h3 {...props(s.featureTitle)}>Fast Development</h3>
              <p {...props(s.featureText)}>Hot module replacement and instant builds with Vite</p>
            </div>

            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.textBlue)}>
                <Icon icon="fa7-solid:shield" />
              </div>
              <h3 {...props(s.featureTitle)}>Type Safety</h3>
              <p {...props(s.featureText)}>Full TypeScript support throughout the entire stack</p>
            </div>

            <div {...props(s.featureCard)}>
              <div {...props(s.featureIconBase, s.featureIconPurple)}>
                <Icon icon="fa7-solid:mobile" />
              </div>
              <h3 {...props(s.featureTitle)}>Responsive Design</h3>
              <p {...props(s.featureText)}>Mobile-first design with StyleX</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section {...props(s.ctaSection)}>
          <h2 {...props(s.ctaTitle)}>Explore the Demos</h2>
          <p {...props(s.ctaText)}>See these technologies in action with our interactive demos</p>
        </section>
      </div>
    </div>
  );
}
