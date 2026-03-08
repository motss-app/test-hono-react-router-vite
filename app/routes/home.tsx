import { NavigationMenu } from '@base-ui-components/react/navigation-menu';
import { Icon } from '@iconify/react';
import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';
import { Link } from 'react-router';

import { tokens } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/home.ts';

const s = create({
  heading: {
    color: tokens.textColor, // dark mode handled by theme provider or CSS variables
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing8,
    textAlign: tokens.textAlign,
  },
  link: {
    alignItems: 'center',
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  // Link variants
  linkBlue: {
    ':hover': {
      color: tokens.infoHover,
    },
    color: tokens.info,
  },
  linkGreen: {
    ':hover': {
      color: tokens.successHover,
    },
    color: tokens.success,
  },
  linkPurple: {
    ':hover': {
      color: tokens.purpleHover,
    },
    color: tokens.purple,
  },
  linkRed: {
    ':hover': {
      color: tokens.errorHover,
    },
    color: tokens.error,
  },
  navList: {
    display: 'grid',
    gap: tokens.spacing16,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navRoot: {
    borderColor: '#fde68a', // b-amber-200
    borderRadius: tokens.borderRadiusSm,
    borderStyle: 'solid',
    borderWidth: '1px',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: tokens.spacing16,
    width: 'fit-content',
  },
  paragraph: {
    color: tokens.textColor,
    fontSize: tokens.fontSizeXl,
    lineHeight: 1.625, // leading-relaxed
    marginBottom: '3rem', // mb-12
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem', // max-w-2xl
    opacity: 0.8, // Approximation for slate-600/400
    textAlign: tokens.textAlign,
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

export default function Home(): JSX.Element {
  return (
    <>
      <h1 {...props(s.heading)}>Home</h1>
      <p {...props(s.paragraph)}>This is the home page.</p>

      <NavigationMenu.Root {...props(s.navRoot)}>
        <NavigationMenu.List {...props(s.navList)}>
          <NavigationMenu.Item>
            <Link
              to="/about"
              {...props(s.link, s.linkBlue)}
            >
              <NavigationMenu.Icon>
                <Icon icon="fa7-solid:info" />
              </NavigationMenu.Icon>
              About
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/ssr"
              {...props(s.link, s.linkGreen)}
            >
              <NavigationMenu.Icon>
                <Icon icon="fa7-solid:server" />
              </NavigationMenu.Icon>
              SSR Page
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/hono-rpc"
              {...props(s.link, s.linkPurple)}
            >
              <NavigationMenu.Icon>
                <Icon icon="fa7-solid:home" />
              </NavigationMenu.Icon>
              Hono RPC Demo
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/errors"
              {...props(s.link, s.linkRed)}
            >
              <NavigationMenu.Icon>
                <Icon icon="fa7-solid:triangle-exclamation" />
              </NavigationMenu.Icon>
              Error Handling Demo
            </Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </>
  );
}
