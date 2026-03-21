# StyleX migration follow-up plan

## Problem and approach

The branch is broadly healthy (`deno task check`, `deno task lint`, and `deno task build` all passed), so this follow-up should focus on migration quality rather than rescue work. The plan is to first re-validate each reported issue, then fix the confirmed ones in a small number of coherent changes: theme bootstrap correctness, dark-mode consistency, and small behavior-preserving cleanup.

## Workplan

- [x] Re-validate every reported issue before changing code
  - Confirmed false positive: the Vite production-plugin concern is not a real issue because production uses `vite.react-router.config.ts`, not `vite.config.ts`.
  - Confirmed issue: `ThemeBootstrap` currently performs side effects during render and does not truly run as a pre-hydration bootstrap script.
  - Confirmed issue: theme persistence currently conflates "follow system" with "explicit saved preference", so system changes can overwrite a user-chosen theme.
  - Confirmed issue: `app/routes/about.tsx` and `app/routes/home.tsx` regressed to dark-biased colors in light mode instead of preserving the prior light/dark behavior.
  - Confirmed issue: `app/styles/icon.stylex.ts` uses fixed `1rem` sizing, which prevents icons from scaling with surrounding text like the previous `1em`-based behavior.

- [x] Fix the theme bootstrap implementation
  - Replaced the render-time `ThemeBootstrap` component with a real external bootstrap asset loaded from `<head>`.
  - Moved the bootstrap logic into a normal TypeScript entry file and added a Vite plugin that serves a truly virtual in-memory dev script plus a hashed production asset under `/assets/`.
  - Wired the production HTML to include both the hashed bootstrap `src` and an explicit `integrity` attribute.
  - Removed the inline-script string authoring path and kept the bootstrap idempotent via a global initialization flag.
  - Verified the updated path with `deno task check`, `deno task lint`, and `deno task build`.

- [x] Correct theme persistence and system-preference behavior
  - Updated the bootstrap logic so system color-scheme changes are only applied when there is no explicit saved user preference.
  - Kept `localStorage` access defensive while simplifying the control flow in the browser bootstrap entry.
  - Verified the updated behavior path with `deno task check`, `deno task lint`, and `deno task build`.

- [ ] Normalize dark-mode styling across migrated routes
  - Audit `app/routes/about.tsx`, `app/routes/errors.tsx`, and any other migrated route using hard-coded "dark" colors or Tailwind-era comments.
  - Replace duplicated raw dark-mode values with `tokens` and `themeConditions` where appropriate.
  - Standardize on the repo's chosen dark-mode pattern so `prefers-color-scheme` and `data-theme="dark"` behave consistently.
  - Remove stale Tailwind migration comments once the equivalent StyleX rules are clear.

- [ ] Clean up StyleX token/theme primitives
  - Review `app/styles/tokens.stylex.ts` for unused or misleading exports such as `darkTheme` if it is not actually wired into rendering.
  - Either remove dead theme helpers or wire them in intentionally; avoid keeping both token conditions and unused theme objects unless they serve a real purpose.
  - Add any missing semantic tokens needed by the route cleanup so colors stop being repeated inline.

- [ ] Restore icon sizing behavior
  - Change `app/styles/icon.stylex.ts` from fixed `1rem` sizing to `1em` sizing so icons scale with surrounding text as they did before.
  - Spot-check headings, links, and inline icon/text alignment after the change.

- [ ] Run full validation after the fixes
  - Run `deno task check`.
  - Run `deno task lint`.
  - Run `deno task build`.
  - If needed, do a quick manual spot-check of the affected routes in dev/preview for theme switching and icon scale.

## Notes

- The reported Vite production-plugin issue looks likely to be a false positive because the production build path uses `vite.react-router.config.ts`, not `vite.config.ts`. I would not change Vite config until that is re-confirmed from the actual task flow.
- The highest-value fix is the theme bootstrap path because it affects render safety, hydration behavior, and user theme persistence.
- The bootstrap is now delivered as an external script, which makes it friendlier to `script-src 'self'` CSP policies than an inline `<script>`.
- React Router still emits additional inline runtime scripts during SSR/SSG, so a strict no-inline CSP for the whole document remains broader follow-up work beyond this bootstrap change.
- The production build now includes `/theme-bootstrap.js` in React Router's generated integrity map, but the bootstrap is intentionally loaded as a classic head script so it executes before hydration.
- After that, the best improvement is consolidating dark-mode styling so the migration feels intentional instead of "Tailwind translated into hex values."
