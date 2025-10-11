import { Link } from 'react-router';

// Catch-all route for 404s (including Chrome DevTools special paths)
export function loader({ request }: { request: Request; }) {
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
    return { url: url.pathname, silent: true };
  }

  return { url: url.pathname, silent: false };
}

export default function NotFound({ loaderData }: { loaderData: { url: string; silent: boolean; }; }) {
  // For special system paths, don't render anything visible
  if (loaderData.silent) {
    return null;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', margin: '0' }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page <code>{loaderData.url}</code> does not exist.</p>
      <div style={{ marginTop: '2rem' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
          ← Go back home
        </Link>
      </div>
    </div>
  );
}
