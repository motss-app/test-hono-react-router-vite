#!/usr/bin/env node
import process from 'node:process';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { apiApp } from '../packages/bff/src/api.ts';

const app = new Hono().route('/api', apiApp);

const port = Number(process.env.PORT ?? 3001);
const hostname = process.env.HOST ?? '127.0.0.1';

serve({
  fetch: app.fetch,
  hostname,
  port,
});
