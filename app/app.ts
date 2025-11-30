import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { timing } from 'hono/timing';

import { apiApp } from './apis/mod.ts';
import type { HonoEnv } from './types/hono.types.ts';

export const app = new Hono<HonoEnv>()
  // Add Context Storage middleware to enable getContext() outside handlers
  .use('*', contextStorage())
  // Add Server-Timing middleware globally
  .use('*', timing())
  .route('/api', apiApp);

export type App = typeof app;
