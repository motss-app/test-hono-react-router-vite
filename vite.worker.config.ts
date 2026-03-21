import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    modulePreload: {
      polyfill: true,
    },
    outDir: 'build',
    rolldownOptions: {
      input: './app/worker.ts',
      output: {
        entryFileNames: 'worker.js',
        format: 'esm',
      },
    },
    sourcemap: true,
    ssr: true,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
