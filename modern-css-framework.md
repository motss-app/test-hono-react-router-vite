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

In this environment, styling is not only a UI concern; it is a platform concern with direct impact on reliability, security, and operational scalability.

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
- Better than v3, but still not the best fit for strict, typed, multi-tenant token governance.

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

Here, `bg-brand` resolves through `--color-brand` -> `var(--tenant-brand)` at runtime.  
Good improvement, but we still own most runtime token lifecycle complexity ourselves.

---

### vanilla-extract

### Pros
- Strong TypeScript-first token contracts.
- Zero-runtime CSS extraction.
- Clean design-token modeling.

### Cons
- Core vanilla-extract is not atomic by default; atomic-style utilities are possible with `@vanilla-extract/sprinkles` plus extra custom infrastructure and policies.
- More ceremony for highly dynamic tenant runtime flows.
- Developer workflow can feel verbose for rapid UI iteration.

### Example

```ts
import { createThemeContract, style } from '@vanilla-extract/css';

export const vars = createThemeContract({
  color: { primary: null, onPrimary: null },
});

export const button = style({
  backgroundColor: vars.color.primary,
  color: vars.color.onPrimary,
});
```

Excellent typing, but runtime multi-tenant operations can require additional plumbing and conventions.

---

### Linaria

### Pros
- Familiar CSS-in-JS authoring style.
- Static extraction (no heavy runtime styling engine).
- Works with CSS variables for theming.

### Cons
- Dynamic styling constraints can be limiting.
- Ergonomics can be weaker for Tailwind-heavy teams; moving from utility-first classes to Linaria `css`/`styled` template APIs introduces relearning and migration friction.
- Ecosystem momentum and tooling depth are weaker than top alternatives.
- Core Linaria is not atomic by default; atomic styles are available via `@linaria/atomic` with extra setup/trade-offs.

### Example

```tsx
import { styled } from '@linaria/react';

const Button = styled.button`
  background: var(--tenant-primary);
  color: var(--tenant-on-primary);
`;
```

Linaria works functionally, but it is a weaker long-term platform fit for our scale and governance requirements.

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
- Deterministic style resolution by order (later styles win) reduces need for runtime class-merge helpers like `tailwind-merge`.
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
// Deterministic resolution: later styles win on conflicts
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

| Framework | Runtime Tenant Tokens | Runtime Updates Without Rebuild | Typed Token Contract | Atomic CSS Efficiency | Multi-Tenant Governance Fit | Decision Fit |
|---|---|---|---|---|---|---|
| Tailwind CSS v3 | 🟡 | 🟡 | ❌ | ✅ | ❌ | Not recommended |
| Tailwind CSS v4 | 🟡 | 🟡 | 🟡 | ✅ | 🟡 | Improved, still not ideal |
| vanilla-extract | ✅ | 🟡 | ✅ | 🟡 | 🟡 | Strong typing, higher plumbing |
| Linaria | ✅ | ✅ | ❌ | 🟡 | 🟡 | Functional but governance-heavy |
| StyleX | ✅ | ✅ | ✅ | ✅ | ✅ | Recommended |

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
- Validate bundler paths for current stack and document compatibility notes for Next.js/Webpack use cases.

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
   - Scenario: tenant theme API times out during SSR; do we use cached tokens, a safe default theme, or block render with an error state?

3. **What migration sequence should we use by route/domain?**
   - Why this matters: rollout order determines delivery risk and team velocity.
   - Scenario: migrate high-traffic authenticated flows first for consistency, or start with low-risk content/admin routes to de-risk patterns.

4. **Are there compliance or accessibility constraints we still need to codify as hard rules?**
   - Why this matters: in regulated domains, token/theming changes can create audit and accessibility risk.
   - Scenario: a tenant-provided brand color fails WCAG contrast; should build-time/runtime validation reject it automatically?
