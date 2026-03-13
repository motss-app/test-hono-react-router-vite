import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false, // Don't delete the client and server folders from React Router,
    outDir: 'build',
    rolldownOptions: {
      input: './app/server.ts',
      output: {
        entryFileNames: 'server.js',
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
