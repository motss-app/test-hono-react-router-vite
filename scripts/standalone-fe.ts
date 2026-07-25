#!/usr/bin/env -S deno run -A
import type { Context } from 'hono';
import { Hono } from 'hono';

const clientDir = Deno.env.get('FE_CLIENT_DIR') ?? 'build/client';
const port = Number(Deno.env.get('PORT') ?? 5174);
const hostname = Deno.env.get('HOST') ?? '127.0.0.1';

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
      const content = await Deno.readFile(filePath);
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
    const content = await Deno.readFile(filePath);
    return c.html(new TextDecoder().decode(content));
  } catch {
    return c.notFound();
  }
});

Deno.serve(
  {
    hostname,
    port,
  },
  app.fetch
);
