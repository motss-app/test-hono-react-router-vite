import amplitudePlugin from '@analytics/amplitude';
import Analytics from 'analytics';
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
 * Shared analytics client backed by the Amplitude plugin.
 *
 * Uses the `analytics` abstraction (getanalytics.io) so the provider can be
 * swapped without touching call-sites throughout the app.
 */
export const analytics = Analytics({
  app: 'test-hono-react-router-vite',
  plugins: [
    amplitudePlugin({
      apiKey: import.meta.env.VITE_AMPLITUDE_API_KEY ?? '',
      options: {
        trackingOptions: {
          ip_address: false,
        },
      },
    }),
  ],
});

/**
 * Initializes Amplitude analytics: identifies the current visitor, records the
 * initial page view, and registers Core Web Vitals listeners. Call once after
 * the client entry module has loaded.
 */
export function initAnalytics(): void {
  analytics.identify(getVisitorId(), {
    app_session_id: getBrowserAppSessionId(),
  });
  analytics.page();

  // Core Web Vitals → Amplitude
  const webVitalsHandler = (metric: { name: string; value: number; rating: string }) => {
    analytics.track('Web Vitals', {
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
