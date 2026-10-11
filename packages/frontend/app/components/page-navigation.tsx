import type { KeyboardEvent } from 'react';

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
import { Link } from './Link.tsx';
import { LocaleSwitcher } from './locale-switcher.tsx';
import * as s from './page-chrome.css.ts';
import { ThemeSelector } from './theme-selector.tsx';

function closeMenuOnEscape(event: KeyboardEvent<HTMLDetailsElement>) {
  if (event.key === 'Escape') {
    event.currentTarget.open = false;
    event.currentTarget.querySelector('summary')?.focus();
  }
}

export function SiteBrand() {
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

export function SiteNavigation({ activePath }: { activePath: string }) {
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

export function SkipToContent({ mainId }: { mainId: string }) {
  return (
    <a
      className={s.skipLink}
      href={`#${mainId}`}
    >
      {m.home_skip_content()}
    </a>
  );
}

export function PagePreferences({
  activePath,
  hasSidebar,
}: {
  activePath: string;
  hasSidebar?: boolean;
}) {
  return (
    <div className={s.controls}>
      <LocaleSwitcher />
      <ThemeSelector />
      {/*
       * biome-ignore lint/a11y/noNoninteractiveElementInteractions: Disclosure.
       * Native disclosure handles Escape from navigation descendants.
       */}
      <details
        className={hasSidebar === false ? s.navigationMenu : s.mobileMenu}
        onKeyDown={closeMenuOnEscape}
      >
        <summary
          aria-label={m.home_navigation()}
          className={s.iconButton}
        >
          <IconBars aria-hidden="true" />
        </summary>
        <div className={s.mobileMenuPanel}>
          <SiteNavigation activePath={activePath} />
        </div>
      </details>
    </div>
  );
}
