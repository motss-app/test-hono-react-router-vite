import type { JSX } from 'react';
import { Link } from 'react-router';

import type { Route } from './+types/home.ts';

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
      <h1 className="text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-200">
        Home
      </h1>
      <p className="text-xl text-center mb-12 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
        This is the home page.
      </p>

      <nav className="flex flex-wrap justify-center gap-8 max-w-4xl mx-auto">
        <Link
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors"
          to="/about"
        >
          <div className="i-fas:info text-lg" />
          About
        </Link>
        <Link
          className="flex items-center gap-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-semibold transition-colors"
          to="/ssr"
        >
          <div className="i-fas:server text-lg" />
          SSR Page
        </Link>
        <Link
          className="flex items-center gap-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-semibold transition-colors"
          to="/hono-rpc"
        >
          <div className="i-fas:home text-lg" />
          Hono RPC Demo
        </Link>
        <Link
          className="flex items-center gap-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold transition-colors"
          to="/errors"
        >
          <div className="i-fas:warning text-lg" />
          Error Handling Demo
        </Link>
      </nav>
    </>
  );
}
