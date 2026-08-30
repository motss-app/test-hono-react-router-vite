import { readEnv, withLogGroup, writeLine } from '../lib/deploy.ts';

type CloudflareApiErrorResponse = {
  errors?: Array<{
    code?: number;
    message?: string;
  }>;
  messages?: Array<{
    code?: number;
    message?: string;
  }>;
};

const zoneId = readEnv('CLOUDFLARE_ZONE_ID');
const zoneFingerprint = `${zoneId.slice(0, 6)}…${zoneId.slice(-4)}`;

await withLogGroup(`🚀 Purging Cloudflare cache for Canary (zone ${zoneFingerprint})`, async () => {
  try {
    await purgeCache([
      'hono-react-router-vite-canary.motss.fyi',
    ]);
    writeLine(`✅ Canary Cloudflare cache purged (zone ${zoneFingerprint})`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    writeLine(`⚠️ Canary Cloudflare cache purge failed (zone ${zoneFingerprint})`);
    writeLine(message);
    writeLine('↪ continuing without blocking deployment');
  }
});

async function purgeCache(hosts: string[]): Promise<void> {
  const purgeZoneId = readEnv('CLOUDFLARE_ZONE_ID');
  const token = readEnv('CLOUDFLARE_API_TOKEN');

  const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${purgeZoneId}/purge_cache`, {
    body: JSON.stringify({
      hosts,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!res.ok) {
    const body = await res.text();
    const errorMessage = formatPurgeCacheError(res.status, res.statusText, body);

    writeLine(errorMessage);
    throw new Error(errorMessage);
  }

  writeLine('Cache purged');
}

function formatPurgeCacheError(status: number, statusText: string, body: string): string {
  const lines = [
    `Cache purge failed: ${status}${statusText ? ` ${statusText}` : ''}`,
  ];
  const responseDetails = formatCloudflareResponse(body);

  if (responseDetails) {
    lines.push(`Response: ${responseDetails}`);
  }

  return lines.join('\n');
}

function formatCloudflareResponse(body: string): string {
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    return '';
  }

  try {
    const parsed = JSON.parse(trimmedBody) as CloudflareApiErrorResponse;
    const details = [
      ...(parsed.errors ?? []),
      ...(parsed.messages ?? []),
    ]
      .map(({ code, message }) => {
        const codeText = code === undefined ? '' : `${code}: `;
        return `${codeText}${message ?? ''}`.trim();
      })
      .filter(Boolean);

    if (details.length > 0) {
      return details.join(' | ');
    }
  } catch {
    // Fall through to the raw body snippet below.
  }

  return trimmedBody.slice(0, 500);
}
