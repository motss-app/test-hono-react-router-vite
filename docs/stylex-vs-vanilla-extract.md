# StyleX vs Vanilla Extract in This Repo

_Date: 2026-05-19_

## TLDR

**Vanilla Extract cannot match StyleX's automatic atomic CSS output without adding `@vanilla-extract/sprinkles` or building a custom atomic layer.**

It **can** match the following well:

- typed token sharing
- runtime CSS variable updates
- component and route CSS extraction/bundling
- route-level CSS lazy loading **if** Vite CSS code splitting is enabled

## Repo-specific findings

### Current StyleX usage

This repo uses `StyleX` directly in route modules and shared styles, for example:

- `packages/frontend/app/routes/home.tsx`
- `packages/frontend/app/app.styles.ts`
- `packages/frontend/app/styles/tokens.stylex.ts`

### Current theming model

The current theme system is mostly **selector-driven**, not token-contract-driven:

- `packages/frontend/app/critical/theme-bootstrap/bootstrap.ts` sets `data-theme` on `document.documentElement`
- `packages/frontend/app/styles/tokens.stylex.ts` defines `themeConditions.dataThemeDark` as `:root[data-theme="dark"]`
- compiled styles switch on `data-theme="dark"`

This means the app currently toggles theme by selector rather than by applying a typed runtime CSS variable contract across the app root.

### Current CSS loading behavior

Production CSS is currently flattened into a shared stylesheet:

- `packages/frontend/vite.react-router.config.ts` sets `cssCodeSplit: false`
- build output contains shared CSS such as `build/client/assets/style-DIqt4Hzk.css`
- route manifests show route JS chunks, but route CSS is not split per route in production right now

So route-level CSS lazy loading is **not currently enabled in this repo**, regardless of whether the styling system is `StyleX` or `vanilla-extract`.

## Capability comparison

| Capability | StyleX | Vanilla Extract without Sprinkles | Notes |
|---|---:|---:|---|
| Automatic atomic CSS output | ✅ | ❌ | Core `style()` creates scoped classes, not atomic declarations |
| Typed shared token contract | ✅ | ✅ | `defineVars` vs `createThemeContract` |
| Runtime CSS variable updates | ✅ | ✅ | VE supports `assignInlineVars` and `setElementVars` via `@vanilla-extract/dynamic` |
| Component/route CSS extraction | ✅ | ✅ | Both can participate in Vite CSS extraction |
| Route CSS lazy loading | ✅* | ✅* | Depends on bundler config current repo disables it with `cssCodeSplit: false` |
| Typed component override constraints | ✅ | ❌ | No built-in VE equivalent to `StyleXStylesWithout` |

\* Only when CSS splitting is enabled.

## What Vanilla Extract can do well here

### 1. Typed token contracts

Vanilla Extract is strong if the goal is a strictly typed theme contract shared across packages.

Good fit for:

- semantic tokens
- contract completeness checks
- build-time and runtime theme assignment through the same contract shape

### 2. Runtime CSS vars

Vanilla Extract has a good first-party runtime story:

- `assignInlineVars`
- `setElementVars`

That means it can support dynamic values fetched at runtime and applied through CSS custom properties.

### 3. Route and component CSS bundling

With the Vite plugin, Vanilla Extract emits extracted CSS files. If route modules import local `.css.ts` files and CSS splitting is enabled, those CSS assets can follow the same chunk graph as route JS.

## Where it falls short vs StyleX

### 1. Atomic CSS parity

This is the main blocker.

Without `Sprinkles`, Vanilla Extract does **not** provide the same kind of atomic CSS model as StyleX. Core `style()` emits a locally scoped class, not one atomic class per declaration.

So the answer to this question is effectively:

> Can Vanilla Extract achieve the same level of atomic CSS as StyleX without Sprinkles?

**No.**

### 2. Component override constraints

StyleX has a better built-in story for constraining consumer overrides on design-system components. Vanilla Extract does not provide a built-in equivalent to `StyleXStylesWithout`.

## Recommendation

### Stay on StyleX if your top priority is atomic CSS

StyleX is the better fit if you want:

- true atomic output
- deterministic style composition
- no extra utility layer
- better typed override constraints

### Consider Vanilla Extract if your top priority is typed theming

Vanilla Extract is a reasonable fit if you want:

- a typed theme contract
- runtime CSS variable assignment
- extracted CSS files via Vite
- route CSS lazy loading after re-enabling CSS splitting

But this comes with a tradeoff:

- you lose StyleX-style automatic atomic behavior unless you add `Sprinkles` or equivalent custom infrastructure

## Practical conclusion

If the question is:

> Can Vanilla Extract replace StyleX here with no meaningful loss?

The answer is:

**Not fully.**

More specifically:

- **Atomic CSS parity:** No
- **Runtime CSS var theming:** Yes
- **Route/component CSS bundling:** Yes
- **Route CSS lazy loading:** Yes, but only after changing build config
- **Typed shared token contracts:** Yes
- **Typed component override constraints:** Worse than StyleX

## If you want to spike a migration

A low-risk next step would be:

1. re-enable CSS splitting in `packages/frontend/vite.react-router.config.ts`
2. convert one route or shared component to Vanilla Extract
3. model tokens with `createThemeContract`
4. apply runtime values with `setElementVars`
5. compare CSS output size, chunk behavior, and authoring ergonomics

## References

Official Vanilla Extract docs used for this evaluation:

- [Vite integration](https://vanilla-extract.style/documentation/integrations/vite/)
- [Dynamic runtime vars](https://vanilla-extract.style/documentation/packages/dynamic/)
- [Sprinkles](https://vanilla-extract.style/documentation/packages/sprinkles/)
- [Core `style()` API](https://vanilla-extract.style/documentation/api/style/)
