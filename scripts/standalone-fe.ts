#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import { serve } from '@hono/node-server';
import type { Context } from 'hono';
import { Hono } from 'hono';

const clientDir = process.env.FE_CLIENT_DIR ?? 'build/client';
const port = Number(process.env.PORT ?? 5174);
const hostname = process.env.HOST ?? '127.0.0.1';

const app = new Hono();

app.get('/healthz', (c: Context) =>
  c.json({
    status: 'ok',
  })
);

const staticDirs = [
  'assets',
];

for (const dir of staticDirs) {
  app.get(`/${dir}/*`, async (c: Context) => {
    const filePath = `${clientDir}/${c.req.path}`;
    try {
      const content = await readFile(filePath);
      const ext = filePath.split('.').pop() ?? '';
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
      return c.body(content, 200, {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Type': mime[ext] ?? 'application/octet-stream',
      });
    } catch {
      return c.notFound();
    }
  });
}

app.get('/*', async (c: Context) => {
  const filePath =
    c.req.path === '/' || c.req.path === ''
      ? `${clientDir}/index.html`
      : `${clientDir}${c.req.path}/index.html`;
  try {
    const content = await readFile(filePath, 'utf8');
    return c.html(content);
  } catch {
    return c.notFound();
  }
});

serve({
  fetch: app.fetch,
  hostname,
  port,
});
