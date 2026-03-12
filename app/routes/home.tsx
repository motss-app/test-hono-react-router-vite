import { NavigationMenu } from '@base-ui/react/navigation-menu';
import {
  IconHome,
  IconInfo,
  IconServer,
  IconTriangleExclamation,
} from '../icons/iconify.ts';
import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/Text.tsx';
import { iconStyles } from '../styles/icon.stylex.ts';
import { tokens } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/home.ts';

const s = create({
  heading: {
    color: 'oklch(92.9% .013 255.508)',
    fontSize: tokens.fontSize4xl,
    fontWeight: tokens.fontWeightBold,
    marginBottom: tokens.spacing8,
    textAlign: tokens.textAlign,
  },
  linkBlue: {
    ':hover': {
      color: 'oklch(70.7% .165 254.624)',
    },
    alignItems: 'center',
    color: {
      '@media (prefers-color-scheme: dark)': 'oklch(70.7% .165 254.624)',
      default: 'oklch(42.4% .199 265.638)',
    },
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  linkGreen: {
    ':hover': {
      color: 'oklch(79.2% .209 151.711)',
    },
    alignItems: 'center',
    color: {
      '@media (prefers-color-scheme: dark)': 'oklch(79.2% .209 151.711)',
      default: 'oklch(62.7% .194 149.214)',
    },
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  linkPurple: {
    ':hover': {
      color: 'oklch(71.4% .203 305.504)',
    },
    alignItems: 'center',
    color: {
      '@media (prefers-color-scheme: dark)': 'oklch(71.4% .203 305.504)',
      default: 'oklch(55.8% .288 302.321)',
    },
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  linkRed: {
    ':hover': {
      color: 'oklch(70.4% .191 22.216)',
    },
    alignItems: 'center',
    color: {
      '@media (prefers-color-scheme: dark)': 'oklch(70.4% .191 22.216)',
      default: 'oklch(57.7% .245 27.325)',
    },
    display: 'flex',
    fontWeight: tokens.fontWeightSemibold,
    gap: tokens.spacing2,
    textDecoration: 'none',
    transition: tokens.transitionColors,
  },
  navList: {
    display: 'grid',
    gap: tokens.spacing4,
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navRoot: {
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: tokens.spacing8,
    width: 'fit-content',
  },
  paragraph: {
    color: 'oklch(70.4% .04 256.788)',
    fontSize: tokens.fontSizeXl,
    lineHeight: tokens.lineHeightRelaxed,
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: tokens.maxWidth2xl,
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
      <Text
        as="h1"
        {...props(s.heading)}
      >
        Home
      </Text>
      <Text {...props(s.paragraph)}>This is the home page.</Text>

      <NavigationMenu.Root {...props(s.navRoot)}>
        <NavigationMenu.List {...props(s.navList)}>
          <NavigationMenu.Item>
            <Link
              to="/about"
              {...props(s.linkBlue)}
            >
              <NavigationMenu.Icon>
                <IconInfo {...props(iconStyles.base)} />
              </NavigationMenu.Icon>
              About
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/ssr"
              {...props(s.linkGreen)}
            >
              <NavigationMenu.Icon>
                <IconServer {...props(iconStyles.base)} />
              </NavigationMenu.Icon>
              SSR Page
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/hono-rpc"
              {...props(s.linkPurple)}
            >
              <NavigationMenu.Icon>
                <IconHome {...props(iconStyles.base)} />
              </NavigationMenu.Icon>
              Hono RPC Demo
            </Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <Link
              to="/errors"
              {...props(s.linkRed)}
            >
              <NavigationMenu.Icon>
                <IconTriangleExclamation {...props(iconStyles.base)} />
              </NavigationMenu.Icon>
              Error Handling Demo
            </Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </>
  );
}
