import { presetIcons } from '@unocss/preset-icons';
import { presetWind4 } from '@unocss/preset-wind4';
import { defineConfig } from 'unocss';

export default defineConfig({
  outputToCssLayers: true,
  presets: [
    presetWind4(),
    presetIcons({
      collections: {
        // Free FontAwesome styles
        fa: () => import('@iconify-json/fa7-regular/icons.json').then(i => i.default),
        fab: () => import('@iconify-json/fa7-brands/icons.json').then(i => i.default),
        fas: () => import('@iconify-json/fa7-solid/icons.json').then(i => i.default),

        // Pro styles - requires FontAwesome Pro token
        // First, configure npm with FA token: npm config set @fortawesome:registry https://npm.fontawesome.com/ && npm config set //npm.fontawesome.com/:_authToken YOUR_TOKEN
        // Then install: pnpm add -D @fortawesome/pro-regular-svg-icons @fortawesome/pro-solid-svg-icons @fortawesome/pro-thin-svg-icons @fortawesome/pro-light-svg-icons @fortawesome/pro-duotone-svg-icons
        // Then run: node scripts/convert-fa-pro.ts
        // Then uncomment the lines below
        // fal: () => import('./app/icons/fal/icons.json').then(i => i.default),
        // fad: () => import('./app/icons/fad/icons.json').then(i => i.default),
        // fat: () => import('./app/icons/fat/icons.json').then(i => i.default),
        // far: () => import('./app/icons/far/icons.json').then(i => i.default),
        // fas: () => import('./app/icons/fas/icons.json').then(i => i.default),
      },
    }),
  ],
});
