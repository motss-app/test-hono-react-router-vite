/// <reference types="vite/client" />

interface ImportMetaEnv {
  PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
