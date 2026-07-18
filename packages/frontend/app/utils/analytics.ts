import { add, Identify, identify, init, track } from '@amplitude/analytics-browser';
import { webVitalsPlugin } from '@amplitude/plugin-web-vitals-browser';
import { captureException } from '@sentry/browser';

import { getBrowserAppSessionId } from '../monitoring/app-session.ts';

const VISITOR_ID_KEY = 'app_visitor_id';

/**
 * Returns a stable visitor ID from localStorage, generating and persisting a new
 * UUID on first call. Used as the Amplitude user identity across sessions.
 */
function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }

  return id;
}

/**
 * Initializes Amplitude analytics: sets up the SDK, registers the web-vitals
 * plugin, and identifies the current visitor. Call once after the client entry
 * module has loaded. Page views are tracked separately by RouteChangeTracker.
 */
export function initAnalytics(): void {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

  if (!apiKey) {
    // biome-ignore lint/suspicious/noConsole: Warn when analytics API key is missing so devs notice in dev tools.
    console.warn('[analytics] VITE_AMPLITUDE_API_KEY is not set, skipping Amplitude init');
    return;
  }

  const visitorId = getVisitorId();
  const appSessionId = getBrowserAppSessionId();

  // Plugin must be registered before init per Amplitude docs.
  add(webVitalsPlugin());

  init(apiKey, visitorId, {
    cookieOptions: {
      expiration: 365 * 24 * 60 * 60 * 1000,
    },
    fetchRemoteConfig: false,
    sessionTimeout: 30 * 60 * 1000,
    trackingOptions: {
      ipAddress: false,
    },
  }).promise.catch((err: unknown) => captureException(err));

  if (appSessionId) {
    const identifyObj = new Identify();
    identifyObj.set('app_session_id', appSessionId);
    identify(identifyObj);
  }
}

/**
 * Tracks a page view on client-side navigation. Call this from a React Router
 * route change listener to capture all SPA page views.
 */
export function trackPageView(pathname: string): void {
  track('Page View', {
    path: pathname,
  });
}
