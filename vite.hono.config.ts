import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    emptyOutDir: false, // Don't delete the client and server folders from React Router,
    minify: false,
    outDir: 'build',
    reportCompressedSize: true,
    rollupOptions: {
      experimental: {
        incrementalBuild: true,
        nativeMagicString: true,
        viteMode: true,
      },
      input: './app/server.ts',
      output: {
        entryFileNames: 'server.js',
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
