import { app } from './app.ts';
import { createSsrHandler } from './ssr-handler.ts';

// Production: Serve React Router SSR
if (import.meta.env.PROD) {
  await createSsrHandler(app);
}

export default {
  fetch: app.fetch,
};
