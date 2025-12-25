import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    cssCodeSplit: true,
    cssMinify: true,
    emptyOutDir: false,
    minify: true,
    modulePreload: {
      polyfill: true,
    },
    outDir: 'build',
    reportCompressedSize: true,
    rollupOptions: {
      input: './app/worker.ts',
      output: {
        entryFileNames: 'worker.js',
        format: 'esm',
      },
    },
    sourcemap: true,
    ssr: true,
    target: 'esnext',
  },
  plugins: [
    tsconfigPaths(),
  ],
});
