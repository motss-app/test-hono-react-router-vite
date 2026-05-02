import { purgeCache, writeLine } from '../lib/deploy.ts';

writeLine('🚀 Purging Cloudflare cache for Canary...');
await purgeCache([
  'hono-react-router-vite-canary.motss.fyi',
]);
writeLine('✅ Canary Cloudflare cache purged');
