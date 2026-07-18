import { Identify, identify, init, page, track } from '@amplitude/analytics-browser';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

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
 * Initializes Amplitude analytics: identifies the current visitor, records the
 * initial page view, and registers Core Web Vitals listeners. Call once after
 * the client entry module has loaded.
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

  init(apiKey, visitorId, {
    cookieOptions: {
      expiration: 365 * 24 * 60 * 60 * 1000,
    },
    fetchRemoteConfig: false,
    sessionTimeout: 30 * 60 * 1000,
    trackingOptions: {
      ipAddress: false,
    },
  });

  if (appSessionId) {
    const identifyObj = new Identify();
    identifyObj.set('app_session_id', appSessionId);
    identify(identifyObj);
  }

  page('Page View', {
    path: globalThis.location.pathname,
  });

  // Core Web Vitals → Amplitude
  const webVitalsHandler = (metric: { name: string; value: number; rating: string }) => {
    track('Web Vitals', {
      name: metric.name,
      path: globalThis.location.pathname,
      rating: metric.rating,
      value: metric.value,
    });
  };

  onLCP(webVitalsHandler);
  onCLS(webVitalsHandler);
  onINP(webVitalsHandler);
  onFCP(webVitalsHandler);
  onTTFB(webVitalsHandler);
}
