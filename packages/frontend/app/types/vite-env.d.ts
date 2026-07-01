interface ImportMetaEnv {
  PORT: string;
  SENTRY_RELEASE?: string;
  VITE_LOAD_TEST?: string;
  VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:theme-bootstrap' {
  export const themeBootstrapSrc: string;
}
