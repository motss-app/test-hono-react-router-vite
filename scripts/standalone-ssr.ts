#!/usr/bin/env -S deno run -A
import { Hono } from 'hono';
import type { RouterContext, ServerBuild } from 'react-router';
import { createRequestHandler, RouterContextProvider } from 'react-router';

import type { HonoEnv } from '../packages/frontend/app/types/hono.types.ts';

const clientDir = Deno.env.get('FE_CLIENT_DIR') ?? 'build/client';
const port = Number(Deno.env.get('PORT') ?? 5175);
const hostname = Deno.env.get('HOST') ?? '127.0.0.1';

// deno-lint-ignore no-explicit-any
const build = (await import('../build/server/index.js')) as any as ServerBuild;
const handler = createRequestHandler(build, 'production');

const honoContextSymbol = Symbol.for('hono.context') as unknown as RouterContext<
  HonoEnv['Variables']
>;

const app = new Hono();

const mime: Record<string, string> = {
  css: 'text/css',
  html: 'text/html',
  ico: 'image/x-icon',
  js: 'application/javascript',
  json: 'application/json',
  png: 'image/png',
  svg: 'image/svg+xml',
  woff2: 'font/woff2',
};

app.get('/assets/*', async c => {
  const filePath = `${clientDir}/${c.req.path}`;
  try {
    const content = await Deno.readFile(filePath);
    const ext = filePath.split('.').pop() ?? '';
    return c.body(content, 200, {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': mime[ext] ?? 'application/octet-stream',
    });
  } catch {
    return c.notFound();
  }
});

app.get('/healthz', c => c.text('frontend ssr ok'));

app.get('*', async c => {
  const honoVars = {
    honoData: {
      computedValue: crypto.randomUUID(),
      meta: {
        requestId: crypto.randomUUID(),
        requestUrl: c.req.url,
      },
      serverTimestamp: new Date().toISOString(),
    },
  };

  const loadContext = new RouterContextProvider(
    new Map([
      [
        honoContextSymbol,
        honoVars,
      ],
    ])
  );

  const response = await handler(c.req.raw, loadContext);
  return new Response(response.body, {
    headers: response.headers,
    status: response.status,
  });
});

Deno.serve(
  {
    hostname,
    port,
  },
  app.fetch
);
