import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    emptyOutDir: false,
    minify: true,
    outDir: 'build',
    reportCompressedSize: true,
    rollupOptions: {
      input: './app/worker.ts',
      output: {
        entryFileNames: 'worker.js',
        format: 'esm',
      },
      perf: true,
    },
    sourcemap: true,
    ssr: true,
    target: 'esnext',
  },
  plugins: [
    tsconfigPaths(),
  ],
});
