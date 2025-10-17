import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{tsx,ts}',
  ],
  plugins: [],
  theme: {
    extend: {},
  },
};

// biome-ignore lint/style/noDefaultExport: Tailwind requires default export
export default config;
