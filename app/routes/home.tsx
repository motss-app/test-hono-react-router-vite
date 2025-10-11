import type { Route } from "./+types/home";

import { Link } from 'react-router';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>This is the home page.</p>

      <nav>
        <Link to="/about">About</Link>
        {' | '}
        <Link to="/ssr">SSR Page</Link>
        {' | '}
        <Link to="/hono-rpc">Hono RPC Demo</Link>
        {' | '}
        <Link to="/errors">Error Handling Demo</Link>
      </nav>
    </>
  );
}
