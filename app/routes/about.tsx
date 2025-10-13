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
    <div className="min-h-screen py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="i-fa:info-circle text-6xl text-blue-600 mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            About This Project
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A modern full-stack web application showcasing the power of React Router, Hono, and
            cutting-edge development tools.
          </p>
        </div>

        {/* Tech Stack */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center space-x-3">
                <div className="i-fa:cogs text-blue-600 text-3xl" />
                <span>Frontend</span>
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>React 19 with TypeScript</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>React Router 7 for routing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>UnoCSS for atomic styling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>FontAwesome 7 icons</span>
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-white flex items-center space-x-3">
                <div className="i-fa:server text-green-600 text-3xl" />
                <span>Backend</span>
              </h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>Hono web framework</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>Node.js runtime</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>TypeScript support</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="i-fa:check text-green-600" />
                  <span>RPC capabilities</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Key Features
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="i-fa:bolt text-4xl text-yellow-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Fast Development
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Hot module replacement and instant builds with Vite
              </p>
            </div>

            <div className="text-center p-6">
              <div className="i-fa:shield-alt text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Type Safety
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Full TypeScript support throughout the entire stack
              </p>
            </div>

            <div className="text-center p-6">
              <div className="i-fa:mobile-alt text-4xl text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">
                Responsive Design
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Mobile-first design with UnoCSS utilities
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center bg-slate-900 text-white p-12 rounded-2xl">
          <h2 className="text-3xl font-bold mb-4">Explore the Demos</h2>
          <p className="text-xl mb-8 opacity-90">
            See these technologies in action with our interactive demos
          </p>
          <Link
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2 text-lg"
            to="/"
          >
            <div className="i-fa:arrow-left" />
            <span>Back to Home</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
