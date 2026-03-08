# Migration Plan: Tailwind CSS to StyleX

This plan outlines the steps to replace Tailwind CSS with StyleX in the project, following the [StyleX Theming Patterns SKILL.md](file:///Users/rongsen/.copilot/skills/stylex-theming-patterns/SKILL.md).

## 1. Dependency Management
- [ ] Uninstall Tailwind CSS packages: `tailwindcss`, `@tailwindcss/vite`, `@iconify/tailwind4`.
- [ ] Install StyleX packages via Deno:
  - `deno install --dev npm:@stylexjs/stylex npm:vite-plugin-stylex`.
- [ ] Install Iconify React component:
  - `deno install npm:@iconify/react`.

## 2. Configuration Updates
- [ ] **Vite Config (`vite.config.ts`)**:
  - Remove `tailwindcss()`.
  - Add `stylexPlugin()` from `vite-plugin-stylex`.
- [ ] **Clean up**:
  - Delete `tailwind.config.ts`.
  - Clear `app/app.css` (remove `@tailwind` directives).

## 3. StyleX Setup (Strict Theming)
- [ ] **Tokens (`app/styles/tokens.stylex.ts`)**:
  - Define base design tokens using `stylex.defineVars`.
- [ ] **Global Styles (`app/app.css`)**:
  - Keep for global resets if necessary, but remove Tailwind specific code.

## 4. Component Migration
- [ ] **Root (`app/root.tsx`)**:
  - Remove/Update global CSS import.
  - Apply global theme variables if needed.
- [ ] **Home Route (`app/routes/home.tsx`)**:
  - Convert Tailwind utility classes to `stylex.create`.
  - Replace icon classes (e.g., `iconify fa7-solid--info`) with `@iconify/react` component (e.g., `<Icon icon="fa7-solid:info" />`).
- [ ] **Other Components**:
  - Convert iteratively.

## 5. Verification
- [ ] Run `deno task dev` (or equivalent) to verify build.
- [ ] Check for type errors with `deno task check`.
- [ ] Verify styles are applied correctly in browser (if possible to run/preview).

## 6. Learnings & React Router v7 + Hono Integration Gotchas
- **Plugin Configuration**: The `@stylexjs/unplugin` should be added **only** to the main `vite.config.ts` (the root config used by the dev server). **Do not** add it to secondary build configurations like `vite.react-router.config.ts` to avoid duplicate processing issues, duplicated injection errors, or module resolution collisions during the `writeBundle` SSR phase.
- **Global CSS & CSS Layers**: Standard, unlayered CSS files (e.g., `app.css`) indiscriminately override StyleX styles. Instead of mixing vanilla global CSS with StyleX, completely replace it by defining a `globalStyles = create({...})` object and spreading the props directly onto your root `<html>` and `<body>` tags in `app/root.tsx`.
- **Development Virtual CSS**: To support StyleX Hot Module Replacement (HMR) seamlessly without RSC (React Server Components), explicitly link to the virtual development stylesheet directly in the HTML `<head>` tag in `app/root.tsx` when `import.meta.env.DEV` is strictly true:
  ```tsx
  {import.meta.env.DEV ? ( <link href="/virtual:stylex.css" rel="stylesheet" /> ) : null}
  ```
- **HMR "Broken pipe" Errors (Deno+Node compat)**: When using Vite HMR inside Deno's Node Polyfill adapter, disconnecting WebSocket tabs raises fatal "Broken pipe (os error 32)" process exits. This must be ignored globally inside your main dev server entry (`app/server.ts`) via standard `globalThis.addEventListener('unhandledrejection', ...)` handling.
- **Component Style Refactoring**: Never leave `style={{...}}` inline strings in the application as they circumvent strict typing. Extract them all to explicit `.stylex.ts` properties safely mapped against `tokens.stylex.ts` static token configurations.
