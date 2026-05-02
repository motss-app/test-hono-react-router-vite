import { purgeCache, readEnv, withLogGroup, writeLine } from '../lib/deploy.ts';

const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
const zoneFingerprint = `${zoneId.slice(0, 6)}…${zoneId.slice(-4)}`;

await withLogGroup(`🚀 Purging Cloudflare cache for Canary (zone ${zoneFingerprint})`, async () => {
  await purgeCache([
    'hono-react-router-vite-canary.motss.fyi',
  ]);
  writeLine(`✅ Canary Cloudflare cache purged (zone ${zoneFingerprint})`);
});
