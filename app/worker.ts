import { createApp } from './app.ts';
import { createSsrHandler } from './ssr-handler.ts';

const app = createApp();

// Production: Serve React Router SSR
if (import.meta.env.PROD) {
  createSsrHandler(app);
}

export default {
  fetch: app.fetch,
};
