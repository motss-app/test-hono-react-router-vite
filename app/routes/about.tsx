import type { JSX } from 'react';
import { Link } from 'react-router';

import type { Route } from './+types/about.ts';

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

export default function About(): JSX.Element {
  return (
    <>
      <h1>About</h1>
      <p>This is the about page.</p>

      <Link to="/">Home</Link>
    </>
  );
}
