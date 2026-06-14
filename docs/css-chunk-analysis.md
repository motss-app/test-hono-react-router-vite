# CSS Chunk Analysis

Production build CSS chunks from [canary deployment](https://hono-react-router-vite-canary.motss.fyi/).

## Vanilla Extract (Short Identifiers - Current)

| Chunk | File | Decoded | Description |
|-------|------|---------|-------------|
| Root | `root-_RL9NZhf.css` | 4.7 KB | Open Sans font-face declarations (variable font) |
| Icons | `icons--3HQTF-S.css` | 5.4 KB | SVG icon paths (inline SVG CSS) |
| App | `app-bYUnBjN6.css` | 1.9 KB | Global styles, error components, utilities |
| Tokens | `tokens.css.ts-W-62spk5.css` | 1.2 KB | CSS custom properties (design tokens) |
| Home | `home-C9imiqXa.css` | 6.5 KB | Homepage route-specific styles |
| **Total** | | **19.7 KB** | |

## Vanilla Extract (Debug Identifiers - Previous)

| Chunk | File | Decoded | Description |
|-------|------|---------|-------------|
| Root | `root-_RL9NZhf.css` | 1.5 KB | Open Sans font-face declarations (variable font) |
| Icons | `icons--3HQTF-S.css` | 2.2 KB | SVG icon paths (inline SVG CSS) |
| App | `app-D-weqUcu.css` | 2.6 KB | Global styles, error components, utilities |
| Tokens | `tokens.css.ts-cd_SNjzv.css` | 1.9 KB | CSS custom properties (design tokens) |
| Home | `home-DCbOpOk6.css` | 8.1 KB | Homepage route-specific styles |
| **Total** | | **16.3 KB** | |

## StyleX (Previous)

| Chunk | File | Decoded | Description |
|-------|------|---------|-------------|
| Style | `style-DIqt4Hzk.css` | 29.7 KB | All styles in single file |
| **Total** | | **29.7 KB** | |

## Comparison

| Metric | StyleX | VE (Debug) | VE (Short) | Delta (Debug→Short) |
|--------|--------|------------|------------|---------------------|
| Files | 1 | 5 | 5 | - |
| Decoded | 29.7 KB | 16.3 KB | 19.7 KB | +3.4 KB (+21%) |

**Key findings:**
- Short identifiers increased decoded CSS by 21% (16.3 KB → 19.7 KB) — unexpected
- Icons CSS nearly doubled (2.2 KB → 5.4 KB) — SVG icon data grew significantly
- Root CSS tripled (1.5 KB → 4.7 KB) — font-face declarations expanded
- VE with short identifiers is still 34% smaller than StyleX in decoded size (19.7 KB vs 29.7 KB)

## Optimization: Atomic CSS Pattern

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

This reduces raw CSS by ~30-40% since class names shrink from ~25 chars to ~7 chars.

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

**Notes:**
- Transfer sizes use zstd compression (Cloudflare)
- `tokens.css.ts` is a vanilla-extract generated file
- `home-C9imiqXa.css` is route-split (only loaded on `/`)
- Font files (Open Sans variable) are served as separate `.woff2` assets
- All CSS is minified with LightningCSS

## CSS Samples

Downloaded CSS files are stored in `css-samples/` for comparison:

```
css-samples/
├── vanilla-extract/
│   ├── root-_RL9NZhf.css (short)
│   ├── icons--3HQTF-S.css (short)
│   ├── app-bYUnBjN6.css (short)
│   ├── tokens.css.ts-W-62spk5.css (short)
│   ├── home-C9imiqXa.css (short)
│   ├── root-_RL9NZhf.css (debug)
│   ├── icons--3HQTF-S.css (debug)
│   ├── app-D-weqUcu.css (debug)
│   ├── tokens.css.ts-cd_SNjzv.css (debug)
│   └── home-DCbOpOk6.css (debug)
└── stylex/
    └── style-DIqt4Hzk.css
```
