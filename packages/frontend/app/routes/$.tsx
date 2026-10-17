import type { JSX } from 'react/jsx-runtime';
import { data, Link } from 'react-router';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import { PagePreferences, SiteBrand } from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import * as m from '../paraglide/messages.js';
import type { Route } from './+types/$.ts';
import { s } from './not-found.css.ts';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_404_title(),
    },
  ];
}

// Catch-all route for 404s (including Chrome DevTools special paths)
export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);

  // Silently handle Chrome DevTools system requests
  // Note: favicon.ico and robots.txt are intentionally NOT silenced
  // because you might want to serve them or see 404s for them
  const silentPaths = [
    '.well-known/appspecific',
  ];

  if (silentPaths.some(path => url.pathname.includes(path))) {
    // For these paths, just return minimal data
    // React Router will still render, but we can hide it
    return data({
      silent: true,
      url: url.pathname,
    });
  }

  return data({
    silent: false,
    url: url.pathname,
  });
}

export default function NotFound({ loaderData }: Route.ComponentProps): JSX.Element | null {
  // For special system paths, don't render anything visible
  if (loaderData.silent) {
    return null;
  }

  return (
    <>
      <NotFoundHeader />
      <main className={s.container}>
        <h1 className={s.h1}>404</h1>
        <h2>{m.not_found_title()}</h2>
        <p>
          {m.not_found_description({
            url: loaderData.url,
          })}
        </p>
        <div className={s.marginTop}>
          <Link
            className={s.link}
            to="/"
          >
            ← {m.not_found_back_home()}
          </Link>
        </div>
      </main>
      <NotFoundFooter />
    </>
  );
}

function NotFoundFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function NotFoundHeader() {
  return (
    <header className={chrome.header}>
      <div className={chrome.mobileBrand}>
        <SiteBrand />
      </div>
      <div className={chrome.breadcrumbSlot}>
        <Breadcrumbs
          items={[
            {
              label: m.holy_grail_nav_home(),
              to: '/',
            },
            {
              label: m.not_found_title(),
            },
          ]}
        />
      </div>
      <PagePreferences
        activePath="/missing-route"
        hasSidebar={false}
      />
    </header>
  );
}
