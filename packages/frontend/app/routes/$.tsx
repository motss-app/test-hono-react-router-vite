import type { JSX } from 'react/jsx-runtime';
import { data, Link } from 'react-router';

import type { Route } from './+types/$.ts';
import { s } from './$.css.ts';

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: '404 · React Router + Hono Demo',
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
    <div className={s.container}>
      <h1 className={s.h1}>404</h1>
      <h2>Page Not Found</h2>
      <p>
        The page <code>{loaderData.url}</code> does not exist.
      </p>
      <div className={s.marginTop}>
        <Link
          className={s.link}
          to="/"
        >
          ← Go back home
        </Link>
      </div>
    </div>
  );
}
