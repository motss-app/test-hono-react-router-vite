export interface WorkerFetcher {
  fetch(input: RequestInfo | URL, init?: Parameters<typeof fetch>[1]): Promise<Response>;
}

export interface GatewayBindings {
  FRONTEND: WorkerFetcher;
  BFF: WorkerFetcher;
  SENTRY_DSN?: string;
}
