interface ImportMetaEnv {
  PORT: string;
  SENTRY_RELEASE?: string;
  VRT: boolean;
  VITE_LOAD_TEST?: string;
  VITE_POSTHOG_TOKEN?: string;
  VITE_POSTHOG_API_HOST?: string;
  VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:theme-bootstrap' {
  export const themeBootstrapSrc: string;
}
