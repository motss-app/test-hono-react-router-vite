import { data, Link, type LoaderFunctionArgs } from 'react-router';

import type { Route } from '../routes/+types/$';

// Catch-all route for 404s (including Chrome DevTools special paths)
export function loader({ request }: LoaderFunctionArgs) {
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

export default function NotFound({ loaderData }: Route.ComponentProps) {
  // For special system paths, don't render anything visible
  if (loaderData.silent) {
    return null;
  }

  return (
    <div
      style={{
        fontFamily: 'system-ui',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          margin: '0',
        }}
      >
        404
      </h1>
      <h2>Page Not Found</h2>
      <p>
        The page <code>{loaderData.url}</code> does not exist.
      </p>
      <div
        style={{
          marginTop: '2rem',
        }}
      >
        <Link
          style={{
            color: '#0066cc',
            textDecoration: 'none',
          }}
          to="/"
        >
          ← Go back home
        </Link>
      </div>
    </div>
  );
}
