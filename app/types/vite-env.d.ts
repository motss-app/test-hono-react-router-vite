interface ImportMetaEnv {
  PORT: string;
  SENTRY_RELEASE?: string;
  VITE_SENTRY_DSN?: string;
  VITE_SENTRY_SPOTLIGHT?: string;
  VITE_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:theme-bootstrap' {
  export const themeBootstrapSrc: string;
}
