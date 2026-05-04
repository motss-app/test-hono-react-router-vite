import { apiApp } from '@motss-app/bff';
import { Hono } from 'hono';
import { timing } from 'hono/timing';

import type { HonoEnv } from './types/hono.types.ts';

export function createApp() {
  return (
    new Hono<HonoEnv>()
      // Add Context Storage middleware to enable getContext() outside handlers
      // .use('*', contextStorage())
      // Add Server-Timing middleware globally
      .use('*', timing())
      .route('/api', apiApp)
  );
}

export type App = ReturnType<typeof createApp>;
