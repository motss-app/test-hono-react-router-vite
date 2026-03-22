interface ImportMetaEnv {
  PORT: string;
  VITE_DENO_DEPLOYMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:theme-bootstrap' {
  export const themeBootstrapSrc: string;
}
