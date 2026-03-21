import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { create, props } from '@stylexjs/stylex';
import type { JSX } from 'react';

import { Link } from '../components/Link.tsx';
import { Text } from '../components/Text.tsx';
import { IconHome, IconInfo, IconServer, IconTriangleExclamation } from '../icons.ts';
import { iconStyles } from '../styles/icon.stylex.ts';
import { colorTokens, fontWeightTokens, themeConditions } from '../styles/tokens.stylex.ts';
import type { Route } from './+types/home.ts';

const s = create({
  heading: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate200,
      default: colorTokens.slate900,
    },
    fontSize: '2.25rem',
    fontWeight: fontWeightTokens.fontWeightBold,
    marginBottom: '2rem',
    textAlign: 'center',
  },
  linkBlue: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#bfdbfe',
        default: colorTokens.infoHover,
      },
    },
    alignItems: 'center',
    color: {
      [themeConditions.dataThemeDark]: '#93c5fd',
      default: colorTokens.info,
    },
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  linkGreen: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#bbf7d0',
        default: colorTokens.successHover,
      },
    },
    alignItems: 'center',
    color: {
      [themeConditions.dataThemeDark]: '#86efac',
      default: colorTokens.success,
    },
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  linkPurple: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#e9d5ff',
        default: colorTokens.purpleHover,
      },
    },
    alignItems: 'center',
    color: {
      [themeConditions.dataThemeDark]: '#d8b4fe',
      default: colorTokens.purple,
    },
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  linkRed: {
    ':hover': {
      color: {
        [themeConditions.dataThemeDark]: '#fecaca',
        default: colorTokens.errorHover,
      },
    },
    alignItems: 'center',
    color: {
      [themeConditions.dataThemeDark]: '#fca5a5',
      default: colorTokens.error,
    },
    display: 'flex',
    fontWeight: fontWeightTokens.fontWeightSemibold,
    gap: '0.5rem',
    textDecoration: 'none',
    transition: 'color 0.15s ease-in-out',
  },
  navList: {
    display: 'grid',
    gap: '1rem',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  navRoot: {
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '2rem',
    width: 'fit-content',
  },
  paragraph: {
    color: {
      [themeConditions.dataThemeDark]: colorTokens.slate300,
      default: colorTokens.slate700,
    },
    fontSize: '1.25rem',
    lineHeight: '1.625',
    marginLeft: 'auto',
    marginRight: 'auto',
    maxWidth: '42rem',
    textAlign: 'center',
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
