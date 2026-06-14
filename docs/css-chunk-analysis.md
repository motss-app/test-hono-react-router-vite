# CSS Chunk Analysis

Production build CSS chunks from [canary deployment](https://hono-react-router-vite-canary.motss.fyi/).

## Vanilla Extract (Current)

| Chunk | File | Transfer (zstd) | Decoded | Description |
|-------|------|-----------------|---------|-------------|
| Root | `root-_RL9NZhf.css` | 2.3 KB | 4.8 KB | Open Sans font-face declarations (variable font) |
| Icons | `icons--3HQTF-S.css` | 3.0 KB | 5.5 KB | SVG icon paths (inline SVG CSS) |
| App | `app-D-weqUcu.css` | 1.7 KB | 2.6 KB | Global styles, error components, utilities |
| Tokens | `tokens.css.ts-cd_SNjzv.css` | 1.3 KB | 1.9 KB | CSS custom properties (design tokens) |
| Home | `home-DCbOpOk6.css` | 2.8 KB | 8.3 KB | Homepage route-specific styles |
| **Total** | | **11.1 KB** | **23.1 KB** | |

## StyleX (Previous)

| Chunk | File | Transfer (zstd) | Decoded | Description |
|-------|------|-----------------|---------|-------------|
| Style | `style-DIqt4Hzk.css` | 10.6 KB | 29.7 KB | All styles in single file |
| **Total** | | **10.6 KB** | **29.7 KB** | |

## Comparison

| Metric | StyleX | Vanilla Extract | Delta |
|--------|--------|-----------------|-------|
| Files | 1 | 5 | -4 |
| Decoded | 29.7 KB | 23.1 KB | -6.6 KB (-22%) |
| Transfer (zstd) | 10.6 KB | 11.1 KB | +0.5 KB (+5%) |

## Optimization: Shorter Identifiers

VE's Vite plugin supports `identifiers: 'short'` for shorter class names:

```ts
// vite.react-router.config.ts
vanillaExtractPlugin({
  identifiers: 'short'  // default is 'debug'
})
```

**Current (debug mode):**
```css
.home_s_title__1vwz5lwq { font-size: 3.95rem; }
```

**With short identifiers:**
```css
.hnw5tz3 { font-size: 3.95rem; }
```

This would reduce raw CSS by ~30-40% since class names shrink from ~25 chars to ~7 chars.

**Notes:**
- Transfer sizes use zstd compression (Cloudflare)
- `tokens.css.ts` is a vanilla-extract generated file
- `home-DCbOpOk6.css` is route-split (only loaded on `/`)
- Font files (Open Sans variable) are served as separate `.woff2` assets
- All CSS is minified with LightningCSS

## Optimization: Lazy Loadable Styles

**Goal:** Split styles so each lazy-loaded component only loads its own CSS.

**Current problem:**
```ts
// root.css.ts contains ALL component styles
export const button = style({ padding: '16px' });
export const card = style({ background: 'white' });
// → Both styles ship in root.css, even if card is lazy
```

**Proposed solution:** Co-locate styles with components, enable route-based CSS splitting.

```ts
// features/home/home.css.ts
export const hero = style({ minHeight: '100vh' });
export const title = style({ fontSize: '3.95rem' });

// features/about/about.css.ts
export const content = style({ maxWidth: '42rem' });
```

**Benefits:**
- Each route only loads its own CSS
- No unused CSS shipped for lazy components
- Better cache invalidation (only changed route's CSS updates)
- Should outperform StyleX in transfer size

**Status:** Not implemented yet

## CSS Samples

Downloaded CSS files are stored in `css-samples/` for comparison:

```
css-samples/
├── vanilla-extract/
│   ├── root-_RL9NZhf.css
│   ├── icons--3HQTF-S.css
│   ├── app-D-weqUcu.css
│   ├── tokens.css.ts-cd_SNjzv.css
│   └── home-DCbOpOk6.css
└── stylex/
    └── style-DIqt4Hzk.css
```
