export interface WorkerFetcher {
  fetch(input: RequestInfo | URL, init?: Parameters<typeof fetch>[1]): Promise<Response>;
}

export interface GatewayBindings {
  CACHE_PURGE_SECRET?: string;
  FRONTEND: WorkerFetcher;
  BFF: WorkerFetcher;
  HEALTHZ_RUST?: WorkerFetcher;
  SENTRY_DSN?: string;
}
