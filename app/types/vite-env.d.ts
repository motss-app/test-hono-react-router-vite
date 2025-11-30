interface ImportMetaEnv {
  PORT: string;
  VITE_DENO_DEPLOYMENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
