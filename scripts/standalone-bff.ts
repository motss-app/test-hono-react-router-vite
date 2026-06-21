#!/usr/bin/env -S deno run -A
import { Hono } from 'hono';

import { apiApp } from '../packages/bff/src/api.ts';

const app = new Hono().route('/api', apiApp);

const port = Number(Deno.env.get('PORT') ?? 3001);
const hostname = Deno.env.get('HOST') ?? '127.0.0.1';

Deno.serve(
  {
    hostname,
    port,
  },
  app.fetch
);
