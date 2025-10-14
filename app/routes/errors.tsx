import type { JSX } from 'react';
import { Link } from 'react-router';

// This is now just a demo/index page that doesn't throw errors
// No loader needed - this page is prerendered at build time
export default function ErrorsDemo(): JSX.Element {
  return (
    <div className="font-sans mx-auto max-w-3xl p-8 min-h-screen">
      <div className="mt-8">
        <Link
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          to="/"
        >
          ← Back to Home
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
        Error Handling Demo
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mb-8">
        Click any link to trigger different types of errors via SSR and see how they're handled.
      </p>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-12">
        {[
          {
            code: '404',
            codeColorClass: 'text-blue-600 dark:text-blue-400',
            desc: "Resource doesn't exist",
            descColorClass: 'text-blue-500 dark:text-blue-300',
            label: 'Not Found',
          },
          {
            code: '401',
            codeColorClass: 'text-amber-600 dark:text-amber-400',
            desc: 'Login required',
            descColorClass: 'text-amber-500 dark:text-amber-300',
            label: 'Unauthorized',
          },
          {
            code: '403',
            codeColorClass: 'text-red-600 dark:text-red-400',
            desc: 'No permission',
            descColorClass: 'text-red-500 dark:text-red-300',
            label: 'Forbidden',
          },
          {
            code: '500',
            codeColorClass: 'text-purple-600 dark:text-purple-400',
            desc: 'Server crashed',
            descColorClass: 'text-purple-500 dark:text-purple-300',
            label: 'Server Error',
          },
          {
            code: '502',
            codeColorClass: 'text-pink-600 dark:text-pink-400',
            desc: 'Invalid response',
            descColorClass: 'text-pink-500 dark:text-pink-300',
            label: 'Bad Gateway',
          },
          {
            code: '503',
            codeColorClass: 'text-gray-600 dark:text-gray-400',
            desc: 'Service down',
            descColorClass: 'text-gray-500 dark:text-gray-300',
            label: 'Unavailable',
          },
          {
            code: 'runtime',
            codeColorClass: 'text-green-600 dark:text-green-400',
            desc: 'JavaScript error',
            descColorClass: 'text-green-500 dark:text-green-300',
            label: 'Runtime Error',
          },
        ].map(({ code, label, desc, codeColorClass, descColorClass }) => (
          <Link
            className="border border-gray-300 hover:border-gray-400 rounded-lg block p-4 no-underline transition-all duration-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
            key={code}
            to={`/errors/${code}`}
          >
            <div className="font-bold mb-2 text-slate-900 dark:text-white">
              <span className={`text-2xl mr-2 ${codeColorClass}`}>{code}</span>
              {label}
            </div>
            <div className={`text-sm ${descColorClass}`}>{desc}</div>
          </Link>
        ))}
      </div>

      <div className="border border-amber-500 rounded-lg mb-8 p-4 bg-amber-900">
        <h3 className="mt-0 text-slate-900 dark:text-white">💡 How Error Handling Works</h3>
        <ul className="mb-0 text-slate-600 dark:text-slate-300">
          <li>
            <strong>This page (/errors):</strong> Prerendered at build time as static HTML
          </li>
          <li>
            <strong>Error routes (/errors/:code):</strong> Server-rendered dynamically on each
            request
          </li>
          <li>
            <strong>Error boundaries:</strong> Catch and display errors from loaders
          </li>
          <li>
            <strong>404 errors:</strong> Caught by the catch-all route
          </li>
          <li>
            <strong>Runtime errors:</strong> Caught by React error boundaries
          </li>
        </ul>
      </div>

      <div className="rounded-lg p-4 bg-slate-50 dark:bg-slate-800 mb-8">
        <h3 className="mt-0 text-slate-900 dark:text-white">🎯 URL Structure</h3>
        <ul className="font-mono text-sm mb-0 text-slate-600 dark:text-slate-300">
          <li>
            <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">/errors</code> -
            This demo page (prerendered)
          </li>
          <li>
            <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">/errors/404</code>{' '}
            - Dynamic error page (SSR)
          </li>
          <li>
            <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">/errors/500</code>{' '}
            - Dynamic error page (SSR)
          </li>
          <li>
            <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">
              /errors/runtime
            </code>{' '}
            - Dynamic error page (SSR)
          </li>
        </ul>
      </div>
    </div>
  );
}
