/**
 * Build-time flags injected by Vite via `define` in vite.react-router.config.ts
 * and vite.worker.config.ts. Set VITE_LOAD_TEST=true during build to enable
 * load test mode — Sentry tracing and timing middleware are disabled.
 */
export const isLoadTestMode = import.meta.env?.VITE_LOAD_TEST === 'true';
