import type { JSX } from 'react';
import { Link } from 'react-router';

import type { Route } from './+types/home';

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
      <h1>Home</h1>
      <p>This is the home page.</p>

      <nav>
        <Link to="/about">About</Link>|<Link to="/ssr">SSR Page</Link>|
        <Link to="/hono-rpc">Hono RPC Demo</Link>|<Link to="/errors">Error Handling Demo</Link>
      </nav>
    </>
  );
}
