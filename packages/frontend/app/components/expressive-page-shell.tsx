import type { KeyboardEvent, PropsWithChildren } from 'react';

import * as m from '../paraglide/messages.js';
import {
  IconBars,
  IconBolt,
  IconCircleInfo,
  IconCode,
  IconFlask,
  IconHouse,
  IconLayerGroup,
  IconTriangleExclamation,
} from './expressive.icons.ts';
import * as s from './expressive-page-shell.css.ts';
import { Link } from './Link.tsx';
import { LocaleSwitcher } from './locale-switcher.tsx';
import { ThemeSelector } from './theme-selector.tsx';

function closeMenuOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key === 'Escape') {
    event.currentTarget.open = false;
    event.currentTarget.querySelector('summary')?.focus();
  }
}

function Brand() {
  return (
    <Link
      className={s.brand}
      to="/"
    >
      <span
        aria-hidden="true"
        className={s.brandMark}
      />
      <span>
        Hono<span className={s.brandCaption}>{m.home_brand_caption()}</span>
      </span>
    </Link>
  );
}

function Navigation({ activePath }: { activePath: string }) {
  const routes = [
    {
      Icon: IconHouse,
      label: m.holy_grail_nav_home(),
      to: '/',
    },
    {
      Icon: IconCircleInfo,
      label: m.route_about_title(),
      to: '/about',
    },
    {
      Icon: IconLayerGroup,
      label: m.route_holy_grail_title(),
      to: '/holy-grail',
    },
    {
      Icon: IconBolt,
      label: m.route_ssr_title(),
      to: '/ssr',
    },
    {
      Icon: IconCode,
      label: m.route_hono_rpc_title(),
      to: '/hono-rpc',
    },
    {
      Icon: IconFlask,
      label: m.route_labs_title(),
      to: '/labs',
    },
    {
      Icon: IconTriangleExclamation,
      label: m.route_errors_title(),
      to: '/errors',
    },
  ];

  return (
    <nav
      aria-label={m.home_navigation()}
      className={s.navigation}
    >
      {routes.map(({ to, label, Icon }) => (
        <Link
          aria-current={activePath === to ? 'page' : undefined}
          className={s.navLink}
          key={to}
          to={to}
        >
          <Icon
            aria-hidden="true"
            className={s.navIcon}
          />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
}

export function ExpressivePageShell({
  children,
  activePath,
  mainId,
}: PropsWithChildren<{
  activePath: string;
  mainId: string;
}>) {
  return (
    <div className={s.shell}>
      <a
        className={s.skipLink}
        href={`#${mainId}`}
      >
        {m.home_skip_content()}
      </a>
      <aside className={s.sidebar}>
        <Brand />
        <Navigation activePath={activePath} />
      </aside>
      <div className={s.workspace}>
        <header className={s.header}>
          <div className={s.mobileBrand}>
            <Brand />
          </div>
          <span className={s.pageLabel}>{m.holy_grail_nav_home()}</span>
          <div className={s.controls}>
            <LocaleSwitcher />
            <ThemeSelector />
            {/*
             * biome-ignore lint/a11y/noNoninteractiveElementInteractions: Disclosure.
             * Native disclosure handles Escape from navigation descendants.
             */}
            <details
              className={s.mobileMenu}
              onKeyDown={closeMenuOnEscape}
            >
              <summary
                aria-label={m.home_navigation()}
                className={s.iconButton}
              >
                <IconBars aria-hidden="true" />
              </summary>
              <div className={s.mobileMenuPanel}>
                <Navigation activePath={activePath} />
              </div>
            </details>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
