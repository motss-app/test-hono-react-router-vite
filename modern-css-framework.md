# RFC: Project AtomiCSS — Atomic Theming

- **Status**: Proposed
- **Date**: 2026-03-16
- **Author**: Frontend Platform Team
- **Audience**: Web Platform, Design System, Security, Product Engineering
- **Decision Type**: Architecture / Frontend Foundation

---

## Executive Summary

This RFC recommends **StyleX** as the primary styling system for our React application.  
Our platform requires runtime tenant theming (fetched from an external service), live updates to design tokens via CSS custom properties, strong performance, and excellent developer experience for a 10-engineer team building a multi-tenant product for large banks serving millions of users.

After evaluating **Tailwind CSS v3**, **Tailwind CSS v4**, **vanilla-extract**, **Linaria**, and **StyleX**, we conclude:

1. **Tailwind v3 is not suitable as the primary theming foundation** for our runtime-token model.
2. **Atomic CSS remains the best long-term direction** for scale, performance, and maintainability.
3. **StyleX best satisfies our combined requirements** (runtime theming compatibility, atomic output, strong ergonomics, and predictable performance).

Detailed hard requirement coverage is documented in **Decision and Recommendation**.

---

## Problem Statement

We need a theming system that can:

- Fetch tenant theme configuration at runtime from a remote service.
- Update all core design tokens (colors, spacing, typography, radii, etc.) via CSS variables.
- Apply changes globally with minimal re-render/recompute cost.
- Scale across many tenants and high traffic with predictable performance.
- Keep developer ergonomics high for a medium-sized team (10 engineers).

In this environment, styling is not only a UI concern it is a platform concern with direct impact on reliability, security, and operational scalability.

---

## Requirements

### Functional Requirements

1. Runtime theme payload ingestion from a remote service.
2. Runtime token updates via CSS custom properties.
3. Global token propagation without rebuilding CSS.
4. Support for tenant overrides and theme versioning.

### Non-Functional Requirements

1. High rendering performance under scale.
2. Strong developer experience and maintainability.
3. Predictable SSR behavior and hydration safety.
4. Type-safe token usage to reduce regressions.
5. Low operational complexity across environments.

---

## Real-World Scenario: Tenant-Branded Pay Button

To make the framework evaluation concrete, all comparisons use the following scenario.

### The Scenario

A reusable `<PayButton>` component lives in a shared `@company/design-system` package. It depends on tokens published from a separate `@company/design-tokens` package. A consuming `checkout-app` applies a tenant theme on top. The requirements are:

- Apply the tenant's brand color, on-brand text color, and border radius — all fetched from a remote theme service at runtime.
- Support a hover state.
- Accept optional style overrides from consumers (e.g., layout adjustments) without exposing brand tokens to arbitrary override.
- Tokens must be shareable across packages — renames or missing keys should surface as compile-time errors, not silent regressions.

```ts
// Shape of the tenant theme payload returned by the remote service
type TenantTheme = {
  brand: string;    // e.g. "#0057FF"
  onBrand: string;  // e.g. "#FFFFFF"
  radiusMd: string; // e.g. "8px"
};
```

### Tailwind CSS v3

Tailwind v3 generates CSS classes at build time from statically scanned source. Using dynamic tenant values as class names is not safe because the compiler cannot discover them at build time.

```tsx
// ❌ Build-time scan cannot discover runtime values — classes may be missing in production
const tenant = await fetchTenantTheme();
<button className={`bg-[${tenant.brand}] text-[${tenant.onBrand}] rounded-[${tenant.radiusMd}]`}>
  Pay Now
</button>

// ✅ Workaround: set CSS variables inline and use arbitrary value syntax
<button
  style={{
    '--tenant-brand': tenant.brand,
    '--tenant-on-brand': tenant.onBrand,
    '--tenant-radius': tenant.radiusMd,
  } as React.CSSProperties}
  className="bg-[var(--tenant-brand)] text-[var(--tenant-on-brand)] rounded-[var(--tenant-radius)] px-4 py-2 hover:opacity-90"
>
  Pay Now
</button>
```

**Token sharing across packages**: A shared package can export a Tailwind config preset. The contract is a plain JS object — there is no TypeScript enforcement of shape or completeness.

```ts
// @company/design-tokens/tailwind.preset.ts
export default {
  theme: {
    extend: {
      colors: { brand: 'var(--tenant-brand)', 'on-brand': 'var(--tenant-on-brand)' },
      borderRadius: { brand: 'var(--tenant-radius-md)' },
    },
  },
};

// checkout-app/tailwind.config.ts
import designTokens from '@company/design-tokens/tailwind.preset';
export default { presets: [designTokens], content: ['./src/**/*.{tsx,ts}'] };
```

**What this means in practice**: Token semantics live in arbitrary strings, not a typed contract. If `colors.brand` is renamed to `colors.primary`, the class string `bg-brand` silently stops matching — no compile-time warning. There is also no type safety preventing a consumer from passing the wrong CSS variable name at runtime.

---

### Tailwind CSS v4

Tailwind v4 introduces `@theme` to declare CSS custom properties as first-class design tokens. Utilities are auto-generated from those properties (`--color-brand` → `bg-brand`, `text-brand`).

```css
/* @company/design-tokens/tokens.css */
/* @theme registers CSS variables as Tailwind design tokens.
   --color-brand creates bg-brand, text-brand, border-brand utilities. */
@theme {
  --color-brand: var(--tenant-brand);
  --color-on-brand: var(--tenant-on-brand);
  --radius-brand: var(--tenant-radius-md);
}
```

```tsx
// Clean utility authoring — no arbitrary value strings
<button className="bg-brand text-on-brand rounded-[--radius-brand] px-4 py-2 hover:opacity-90">
  Pay Now
</button>
```

```ts
// Runtime update: push tenant values into CSS variables
function applyTenantTheme(theme: TenantTheme): void {
  const root = document.documentElement;
  root.style.setProperty('--tenant-brand', theme.brand);
  root.style.setProperty('--tenant-on-brand', theme.onBrand);
  root.style.setProperty('--tenant-radius-md', theme.radiusMd);
}
```

**Token sharing across packages**: Tokens ship as a CSS file consuming apps `@import` it.

```css
/* checkout-app/global.css */
@import '@company/design-tokens/tokens.css';
```

**What this means in practice**: A clear improvement over v3 — utilities are generated from the token layer. However, the token schema (`--color-*`, `--radius-*`) is governed by Tailwind namespaces, not a TypeScript contract. A renamed token produces a broken utility class with no compile-time warning. The `applyTenantTheme` function is entirely custom infrastructure — Tailwind provides no validation, fallback, or governance on top of it.

---

### vanilla-extract

vanilla-extract provides a TypeScript-first token contract via `createThemeContract`. The contract object is the single source of truth — it is shared across packages and enforced at both usage sites and implementations.

```ts
// @company/design-tokens/contract.css.ts
import { createThemeContract } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: { brand: null, onBrand: null },
  radius: { md: null },
});
```

```ts
// @company/design-system/button.css.ts
import { style } from '@vanilla-extract/css';
import { vars } from '@company/design-tokens/contract.css';

export const payButton = style({
  backgroundColor: vars.color.brand, // TS error if vars.color.brand is renamed
  color: vars.color.onBrand,
  borderRadius: vars.radius.md,
  paddingBlock: '8px',
  paddingInline: '16px',
  ':hover': { opacity: 0.9 },
});
```

```tsx
// @company/design-system/PayButton.tsx
import { payButton } from './button.css';
export function PayButton() {
  return <button className={payButton}>Pay Now</button>;
}
```

**Token sharing across packages**: `assignVars` (build-time) bakes a known tenant's values into a static CSS class. `setElementVars` (runtime) handles tenants whose values arrive from an API — both accept the same typed contract shape.

```ts
// checkout-app/acme-bank.css.ts — build-time theme for a pre-registered tenant
import { style, assignVars } from '@vanilla-extract/css';
import { vars } from '@company/design-tokens/contract.css';

export const acmeBankTheme = style({
  vars: assignVars(vars, {
    color: { brand: '#0057FF', onBrand: '#FFFFFF' }, // TS error if any key is missing
    radius: { md: '8px' },
  }),
});
```

```tsx
// Apply the pre-built theme class at the root
<div className={acmeBankTheme}><PayButton /></div>
```

```ts
// checkout-app/runtime.ts — runtime theme for API-fetched tenants
import { setElementVars } from '@vanilla-extract/dynamic';
import { vars } from '@company/design-tokens/contract.css';

function applyTenantTheme(theme: TenantTheme): void {
  setElementVars(document.documentElement, vars, {
    color: { brand: theme.brand, onBrand: theme.onBrand },
    radius: { md: theme.radiusMd },
  });
}
```

> **Build-time vs. runtime**: `assignVars` runs inside `style()` at build time — use it for pre-registered tenants whose values are known at deployment. `setElementVars` runs in the browser — use it for tenants whose values arrive from an API at runtime.

**What this means in practice**: vanilla-extract has a solid first-party story for both build-time theming (`assignVars`) and runtime updates (`setElementVars`), all enforced by the same typed contract. Token renames and incomplete implementations are TS errors. The remaining gap vs. StyleX is at the component API level — there is no built-in equivalent to `StyleXStylesWithout` for constraining which properties a consumer can override on a design-system component.

---

### Linaria

Linaria statically extracts styles at build time. Using `@linaria/atomic` (first-party, opt-in via the `atomizer` config) outputs one atomic class per CSS declaration, enabling deduplication and `cx()`-based property-conflict-safe composition.

```ts
// linaria.config.ts — enable atomic output
import { atomize } from '@linaria/atomic';
export default { atomizer: atomize };
```

```tsx
// @company/design-system/PayButton.tsx
import { css } from '@linaria/atomic';
import { cx } from '@linaria/core';

// Each declaration becomes its own atomic class at build time.
// Dynamic tenant values are passed as CSS custom properties via inline style.
const payButtonBase = css`
  background: var(--btn-brand);
  color: var(--btn-on-brand);
  border-radius: var(--btn-radius-md);
  padding: 8px 16px;
`;

const payButtonHover = css`
  &:hover { opacity: 0.9; }
`;

export function PayButton({ theme }: { theme: TenantTheme }) {
  return (
    <button
      className={cx(payButtonBase, payButtonHover)}
      style={{
        '--btn-brand': theme.brand,
        '--btn-on-brand': theme.onBrand,
        '--btn-radius-md': theme.radiusMd,
      } as React.CSSProperties}
    >
      Pay Now
    </button>
  );
}
```

> `cx()` from `@linaria/core` deduplicates atomic classes by property slug — when two atomic classes share a property, the last one passed to `cx()` wins. This is Linaria's equivalent of StyleX's `stylex.props()` merge, but it is a runtime operation (not compile-time deterministic).

**Token sharing across packages**: Tokens are shared as plain TypeScript constants. Key renames are caught at usage sites, but there is no enforcement that consuming apps inject all required runtime values.

```ts
// @company/design-tokens/tokens.ts
export const tokens = {
  brand: '--btn-brand',     // CSS var names used as the "contract"
  onBrand: '--btn-on-brand',
  radiusMd: '--btn-radius-md',
} as const;

// @company/design-system/PayButton.tsx — reference token names from the shared package
import { tokens } from '@company/design-tokens/tokens';

export function PayButton({ theme }: { theme: TenantTheme }) {
  return (
    <button
      className={cx(payButtonBase, payButtonHover)}
      style={{
        [tokens.brand]: theme.brand,
        [tokens.onBrand]: theme.onBrand,
        [tokens.radiusMd]: theme.radiusMd,
      } as React.CSSProperties}
    >
      Pay Now
    </button>
  );
}
```

**What this means in practice**: `@linaria/atomic` gives Linaria genuine atomic CSS output with `cx()` for safe composition. Dynamic tenant values are injected as inline CSS custom properties — ergonomic, no rebuild required. The governance gap remains: token "names" are plain string constants, not a structural contract. A missing injection produces a silent visual regression, not a type error. There is also no built-in mechanism for constraining which properties consumers can override.

---

### StyleX

StyleX provides a typed token layer via `defineVars`, a typed theme implementation surface via `createTheme`, deterministic style composition via `stylex.props`, and typed component override constraints via `StyleXStyles`/`StyleXStylesWithout`.

```ts
// @company/design-tokens/tokens.stylex.ts
import * as stylex from '@stylexjs/stylex';

export const tokens = stylex.defineVars({
  brand: 'var(--tenant-brand)',
  onBrand: 'var(--tenant-on-brand)',
  radiusMd: 'var(--tenant-radius-md)',
});
```

```ts
// @company/design-system/PayButton.stylex.ts
import * as stylex from '@stylexjs/stylex';
import { tokens } from '@company/design-tokens/tokens.stylex';

export const styles = stylex.create({
  base: {
    backgroundColor: tokens.brand, // TS error if tokens.brand is renamed
    color: tokens.onBrand,
    borderRadius: tokens.radiusMd,
    paddingBlock: 8,
    paddingInline: 16,
    ':hover': { opacity: 0.9 },
  },
});
```

```tsx
// @company/design-system/PayButton.tsx
import * as stylex from '@stylexjs/stylex';
import type { StyleXStylesWithout } from '@stylexjs/stylex';
import { styles } from './PayButton.stylex';

type PayButtonProps = {
  // Allow visual overrides but block layout-breaking properties
  style?: StyleXStylesWithout<{ position: unknown; width: unknown; height: unknown; margin: unknown }>;
};

export function PayButton({ style }: PayButtonProps) {
  return <button {...stylex.props(styles.base, style)}>Pay Now</button>;
}
```

**Token sharing across packages**: `createTheme` provides a typed, structurally complete implementation surface. Missing or extra keys are TS errors. No raw CSS variable strings at any level.

```ts
// checkout-app/acme-bank.stylex.ts — implement the token contract for this tenant
import * as stylex from '@stylexjs/stylex';
import { tokens } from '@company/design-tokens/tokens.stylex';

// All keys required — missing keys are TS errors
export const acmeBankTheme = stylex.createTheme(tokens, {
  brand: '#0057FF',
  onBrand: '#FFFFFF',
  radiusMd: '8px',
});
```

```tsx
// checkout-app/App.tsx
<div {...stylex.props(acmeBankTheme)}><PayButton /></div>
```

```ts
// Runtime fallback: for API-fetched tenants, inject CSS variables directly
function applyTenantTheme(theme: TenantTheme): void {
  const root = document.documentElement;
  root.style.setProperty('--tenant-brand', theme.brand);
  root.style.setProperty('--tenant-on-brand', theme.onBrand);
  root.style.setProperty('--tenant-radius-md', theme.radiusMd);
}
```

**What this means in practice**: Token usage is statically typed end-to-end — `defineVars` is the contract, `createTheme` is the typed implementation, and `StyleXStylesWithout` governs what consumers can override on design-system components. Deterministic merge order in `stylex.props` eliminates the need for a class-merge utility. This is the strongest combination of token governance, runtime theming, and cross-package sharability available across all evaluated frameworks.

---

## Why Tailwind CSS v3 Is Not Suitable (Primary Decision Driver)

Tailwind v3 is excellent for utility-first development, but it is fundamentally optimized for **build-time class generation**, while our core problem is **runtime token orchestration**.

### Key Limitations vs. Our Requirements

1. **Build-time class discovery model**
   - Tailwind v3 generates utilities from statically discoverable class names.
   - Runtime-fetched tenant values are not statically known.
   - This creates friction for token-driven theming where values arrive after deployment.

2. **Dynamic utility construction is brittle**
   - Patterns like `bg-${tenantColor}` are not safely analyzable by the compiler.
   - Runtime-fetched values are invisible during build, so required classes can be missing in production.
   - **Scenario (tenant colors arrive from API):**
     ```tsx
     const tenant = await fetchTenantTheme();
     return (
       <button
         className={`bg-${tenant.primary} hover:bg-${tenant.primaryHover} text-white`}
       >
         Pay now
       </button>
     );
     ```
   - If `tenant.primary = "emerald-600"` was never seen in source, `bg-emerald-600` may not exist in the built CSS.
   - Typical fallback is a large safelist (manual and hard to keep in sync):
     ```ts
     // tailwind.config.ts
     safelist: [
       'bg-blue-600', 'bg-blue-700',
       'bg-emerald-600', 'bg-emerald-700',
       'bg-rose-600', 'bg-rose-700',
     ]
     ```

3. **Token governance is indirect**
   - Theming is usually represented as utility strings, not a typed token contract.
   - This weakens consistency and increases drift risk in a regulated product domain.
   - **Scenario (same semantic intent, different utility strings):**
     ```tsx
     // payments/ApproveButton.tsx
     <button className="bg-blue-600 text-white rounded-md px-4 py-2">Approve</button>

     // transfers/ApproveButton.tsx
     <button className="bg-sky-600 text-white rounded-lg px-3 py-2">Approve</button>
     ```
   - Both compile, but the semantic token (`action.primary`) is now fragmented into local string choices.
   - A brand/contrast update becomes a broad manual audit instead of a single typed token change.

4. **Predefined utility surface can constrain custom design systems**
   - Tailwind's strength is predefined utility APIs, but custom design systems often use semantic tokens that do not map 1:1 to those APIs.
   - **Scenario (internal semantic tokens):**
     ```tsx
     <button
       className="bg-[var(--action-primary-bg-default)] hover:bg-[var(--action-primary-bg-hover)] text-white"
     >
       Approve
     </button>
     ```
   - This works, but it bypasses most predefined utility semantics and shifts complexity to manual token mapping.
   - When token semantics evolve, teams often add custom plugin/utility layers or internal wrappers, which increases maintenance overhead.

5. **Workarounds reduce framework value**
   - Teams fall back to custom CSS variable bridges and ad hoc inline styles.
   - At that point, Tailwind handles layout utilities well but no longer serves as a strong design-token system.

### Tailwind v3 Example (Strength vs. Weakness)

```tsx
// Strength: fast static utility authoring
<button className="rounded-md px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white">
  Save
</button>
```

```tsx
// Weakness: runtime-fetched theme values are not compiler-friendly as utility names
const tenant = await fetchTenantTheme();
return (
  <button
    style={{ '--tenant-primary': tenant.primary } as React.CSSProperties}
    className="bg-[var(--tenant-primary)] text-white"
  >
    Save
  </button>
);
```

This workaround is possible, but token semantics and type safety are mostly outside Tailwind's core model.

---

## Alternatives Considered

### Tailwind CSS v4

### Pros
- Better token/CSS variable ergonomics than v3.
- Excellent utility DX and ecosystem maturity.
- Strong team familiarity in many organizations.

### Cons
- Still utility-string-centric rather than token-contract-centric in TypeScript.
- Runtime remote token orchestration still depends on custom infrastructure.
- Theme modeling is still driven by Tailwind namespaces (`--color-*`, `--spacing-*`), so bespoke semantic token systems still need mapping layers.
- An improvement over v3, but still not the best fit for strict, typed, multi-tenant token governance.

### Example

```css
/* Tailwind v4 uses `@theme` to declare design tokens.
   `--color-brand` creates utilities like `bg-brand` and `text-brand`. */
@theme {
  --color-brand: var(--tenant-brand);
  --color-on-brand: var(--tenant-on-brand);
}
```

```tsx
<button className="bg-brand text-on-brand">Save</button>
```

```ts
// Runtime tenant update path
function applyTenantTheme(theme: { brand: string; onBrand: string }): void {
  const root = document.documentElement;
  root.style.setProperty('--tenant-brand', theme.brand);
  root.style.setProperty('--tenant-on-brand', theme.onBrand);
}
```

Here, `bg-brand` resolves through `--color-brand` → `var(--tenant-brand)` at runtime.  
This is a good improvement, but teams still own most of the runtime token lifecycle complexity themselves.

---

### vanilla-extract

### Pros
- Strong TypeScript-first token contracts via `createThemeContract`.
- Zero-runtime CSS extraction.
- Clean design-token modeling.
- First-party typed runtime theme updates via `@vanilla-extract/dynamic` (`assignInlineVars` / `setElementVars`).

### Cons
- Core vanilla-extract is not atomic by default atomic-style utilities are possible with `@vanilla-extract/sprinkles` plus extra custom infrastructure and policies.
- Runtime tenant updates require `@vanilla-extract/dynamic` (`assignInlineVars` / `setElementVars`) as an additional package not included in the core `@vanilla-extract/css` package.
- No built-in mechanism for typed component-level override constraints (equivalent to StyleX's `StyleXStylesWithout`).
- Developer workflow can feel verbose for rapid UI iteration.

### Example

```ts
import { createThemeContract, style, assignVars } from '@vanilla-extract/css';
import { setElementVars } from '@vanilla-extract/dynamic';

export const vars = createThemeContract({
  color: { primary: null, onPrimary: null },
});

export const button = style({
  backgroundColor: vars.color.primary,
  color: vars.color.onPrimary,
});

// Build-time theming: bake known tenant values into a static class (no JS at runtime)
export const acmeBankTheme = style({
  vars: assignVars(vars, {
    color: { primary: '#0057FF', onPrimary: '#FFFFFF' },
  }),
});

// Runtime theming: apply values fetched from an API — typed against the same contract
function applyTenantTheme(theme: { primary: string; onPrimary: string }): void {
  setElementVars(document.documentElement, vars, {
    color: { primary: theme.primary, onPrimary: theme.onPrimary },
  });
}
```

Excellent typing across both build-time (`assignVars`) and runtime (`setElementVars`) theming paths. The remaining gaps are atomic CSS output (requires `sprinkles`) and component-level override constraints.

---

### Linaria

### Pros
- Familiar CSS-in-JS authoring style.
- Static extraction (no heavy runtime styling engine).
- Works with CSS variables for theming.
- First-party atomic CSS support via `@linaria/atomic` (opt-in via `atomizer` configuration), using `cx()` from `@linaria/core` for property-conflict-safe composition.

### Cons
- Dynamic styling constraints can be limiting.
- Ergonomics can be weaker for Tailwind-heavy teams moving from utility-first classes to Linaria `css`/`styled` template APIs introduces relearning and migration friction.
- Ecosystem momentum and tooling depth are weaker than top alternatives.
- Atomic mode requires additional configuration (`atomizer`) and `cx()` for safe composition it is not zero-config out of the box.

### Example

```tsx
import { css } from '@linaria/atomic'; // requires atomizer in linaria.config.ts
import { cx } from '@linaria/core';

// Each declaration compiles to its own atomic class at build time.
// Dynamic values are injected as CSS custom properties via inline style.
const button = css`
  background: var(--btn-brand);
  color: var(--btn-on-brand);
`;

// Usage:
<button
  className={cx(button)}
  style={{ '--btn-brand': theme.brand, '--btn-on-brand': theme.onBrand } as React.CSSProperties}
>
  Save
</button>
```

`cx()` deduplicates atomic classes by property slug at runtime. The governance gap is that CSS variable names are plain strings — no cross-package contract enforces completeness.

---

### StyleX

### Pros
- **Atomic CSS output** with strong deduplication and predictable performance.
- **Hashed atomic selectors** plus rule deduplication can reduce final CSS bytes.
- **Ergonomic for JavaScript-first, token-first teams** and closely aligned with our current theming model.
- **TypeScript-friendly authoring** and constraints that reduce styling drift.
- Supports strict customization constraints for design-system components using `StyleXStyles` and `StyleXStylesWithout`.
- Fits runtime theming model through CSS variable-driven token values.
- Framework-agnostic and flexible for building a custom theming system from scratch.
- Deterministic style resolution (later styles always win on property conflicts) eliminates the need for runtime class-merge helpers like `tailwind-merge`.
- Strong SSR + hydration characteristics for large apps.

### Cons
- Shared token files often follow `*.stylex.ts` conventions, which add structural constraints.
- Pre-v1 status means tooling and DX are still maturing, even if architecture direction is largely stable.
- Smaller ecosystem than Tailwind.
- Requires disciplined token architecture (which is also a benefit for us).

### Example

```ts
import * as stylex from '@stylexjs/stylex';

export const tokens = stylex.defineVars({
  brand: 'var(--tenant-brand)',
  onBrand: 'var(--tenant-on-brand)',
  radiusMd: 'var(--tenant-radius-md)',
});

export const styles = stylex.create({
  button: {
    backgroundColor: tokens.brand,
    borderRadius: tokens.radiusMd,
    color: tokens.onBrand,
  },
  buttonDanger: {
    backgroundColor: 'var(--tenant-danger)',
  },
});
```

```ts
// Deterministic resolution: when two style objects share a property, the later one wins
const buttonProps = stylex.props(styles.button, isDanger && styles.buttonDanger);
```

```ts
import type { StyleXStyles, StyleXStylesWithout } from '@stylexjs/stylex';

type TextProps = {
  style?: StyleXStyles<{
    color?: 'red' | 'blue' | 'green';
    padding?: 0 | 4 | 8 | 16;
  }>;
};

type ButtonProps = {
  // Allow visual overrides but block layout-breaking styles
  style?: StyleXStylesWithout<{
    position: unknown;
    width: unknown;
    height: unknown;
    margin: unknown;
  }>;
};
```

```ts
// Runtime token update path
function applyTenantTheme(theme: Record<string, string>): void {
  const root = document.documentElement;
  root.style.setProperty('--tenant-brand', theme.brand);
  root.style.setProperty('--tenant-on-brand', theme.onBrand);
  root.style.setProperty('--tenant-radius-md', theme.radiusMd);
}
```

This model gives us a strong token contract in code while preserving true runtime updates.

---

## Decision and Recommendation

To keep the decision criteria transparent, we use hard requirement coverage (✅ / 🟡 / ❌) as the primary decision artifact instead of a weighted numeric score.

### Hard Requirement Coverage

Legend: ✅ = strong native fit, 🟡 = possible with extra custom infrastructure and policies, ❌ = weak fit for a core requirement.

| Framework | Runtime Tenant Tokens | Runtime Updates Without Rebuild | Typed Token Contract | Atomic CSS Efficiency | No Runtime Merge Utility Needed | Multi-Tenant Governance Fit | Decision Fit |
|---|---|---|---|---|---|---|---|
| Tailwind CSS v3 | 🟡 | 🟡 | ❌ | ✅ | ❌ | ❌ | Not recommended |
| Tailwind CSS v4 | 🟡 | 🟡 | 🟡 | ✅ | ❌ | 🟡 | Improved, still not ideal |
| vanilla-extract | ✅ | ✅ | ✅ | 🟡 | 🟡 | 🟡 | Strong typing, no component override constraints |
| Linaria | ✅ | ✅ | ❌ | ✅ | 🟡 | 🟡 | Functional but governance-heavy |
| StyleX | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Recommended |

### Decision

Adopt **StyleX** as the standard styling framework for the React web app.

### Rationale

1. Best alignment with runtime CSS variable-based tenant theming.
2. Atomic output supports scale and performance goals.
3. Strong authoring model for design-token governance.
4. Low migration friction because its token-driven API aligns with our existing theming patterns.
5. Best end-to-end fit for a multi-tenant banking platform with high reliability requirements.

---

## Risks and Mitigations

1. **Pre-v1 maturity and tooling churn**
   - Mitigation: pin StyleX versions, track release notes, and standardize internal wrappers/patterns.

2. **Ecosystem size vs. Tailwind**
   - Mitigation: standardize primitives internally and document approved patterns.

3. **Migration complexity**
   - Mitigation: phased migration by feature domain and token-first refactoring.

---

## Proposed Next Steps

### Foundation Setup

- Finalize StyleX integration and baseline conventions (`*.stylex.ts`, folder/layout rules, CI checks).
- Validate bundler configuration for current stack and document compatibility notes for Next.js/Webpack use cases.

### Token Contract Implementation

- Build semantic + primitive token contracts for shareable design-system usage.
- Implement runtime theme loader with validation, fallback policy, and legacy-token mapping.

### Design System Integration

- Apply StyleX + tokens to core design-system primitives first.
- Replace legacy theming usage in shared components with token-driven StyleX patterns.

### Scale-Out Adoption

- Roll out incrementally from pilot components to broader domains.
- Expand adoption to new app/content pages and run a feedback loop for DX/perf improvements.

### Stabilization and Governance

- Add observability (theme version/source/apply latency) and migration coverage tracking.
- Publish team playbooks, deprecate legacy styling paths, and lock long-term governance ownership.

---

## Open Questions / Feedback Requested

These questions come from the highest-risk implementation areas that are still open:

1. **Is the token schema complete for enterprise banking use cases?**
   - Why this matters: missing semantic tokens usually lead to local one-off styles and drift.
   - Scenario: a team needs `status.pending`, `status.blocked`, and `status.escalated` for risk workflows, but only `status.success/error` exist.

2. **What is the runtime fallback policy if the remote theme service is unavailable?**
   - Why this matters: this directly affects first render reliability and brand consistency.
   - Scenario: tenant theme API times out during SSR do we use cached tokens, a safe default theme, or block render with an error state?

3. **What migration sequence should we use by route/domain?**
   - Why this matters: rollout order determines delivery risk and team velocity.
   - Scenario: migrate high-traffic authenticated flows first for consistency, or start with low-risk content/admin routes to de-risk patterns.

4. **Are there compliance or accessibility constraints we still need to codify as hard rules?**
   - Why this matters: in regulated domains, token/theming changes can create audit and accessibility risk.
   - Scenario: a tenant-provided brand color fails WCAG contrast should build-time/runtime validation reject it automatically?
