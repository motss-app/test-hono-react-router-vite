import { PostHog } from 'posthog-node';

/**
 * Create a PostHog client for Cloudflare Workers.
 *
 * Per the PostHog Cloudflare Workers docs:
 * - Uses `flushAt: 1` and `flushInterval: 0` for immediate event flushing
 *   since Workers can terminate before batched data is sent.
 * - Creates a new client per request — Workers may reuse globals across
 *   requests, but the shutdown/flush lifecycle makes per-request safer.
 *
 * @see https://posthog.com/docs/libraries/cloudflare-workers
 */
export function createPostHogClient(env: {
  VITE_POSTHOG_API_HOST?: string;
  VITE_POSTHOG_TOKEN?: string;
}): PostHog | undefined {
  const token = env.VITE_POSTHOG_TOKEN;

  if (!token) {
    return undefined;
  }

  return new PostHog(token, {
    flushAt: 1,
    flushInterval: 0,
    host: env.VITE_POSTHOG_API_HOST ?? 'https://us.i.posthog.com',
  });
}
