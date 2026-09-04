# Documentation Index

This project combines React Router v7, Hono, and Vite for a modern full-stack web application with hybrid rendering (SSG + SSR + CSR).

## Table of Contents

### 🚀 Setup and Configuration
- **[Setup Guide](setup.md)** - Complete setup for React Router + Hono + Vite integration
- **[Build Setup](build-setup.md)** - Production build configuration and Docker deployment
- **[Sentry Setup Guide](sentry-setup.md)** - Sentry, Spotlight, Deno, Cloudflare Worker wiring, shared SSR route-module split, the SRI-safe build flow, and the Worker `no_bundle`/source-map/module-rule alignment
- **[Theme Bootstrap Virtual Module](theme-bootstrap-virtual-module.md)** - How the theme bootstrap virtual module works in dev and production builds, and why `themeBuildPlugin()` must stay enabled
- **[Working Setup](working-setup.md)** - Final working architecture summary

### 🛠️ Error Handling
- **[Error Handling Guide](error-handling.md)** - Complete error handling reference

### ⚡ Rendering and Performance
- **[Rendering Modes](rendering-modes.md)** - SSG vs SSR vs CSR explained
- **[Prerendering Guide](prerendering-guide.md)** - When and how to prerender routes
- **[CSP for SSG and SSR](csp-ssg-ssr-guide.md)** - CSP concepts, nonce vs hash usage, React Router integration, and third-party resource patterns
- **[CSP and Document-Policy](csp-document-policy.md)** - Deep dive on the source-expression model, dev/prod asymmetry, `Document-Policy: js-profiling` for Sentry browser profiling, and the `c80400a` / `61aaa75` fixes
- **[CSP and Reporting Headers Rationale](csp-headers-rationale.md)** - Why each CSP/reporting header and directive is emitted, the three reporting-API generations, and the modern minimal (2-header) setup
- **[What is Prerendered](what-is-prerendered.md)** - Current prerendering status
- **[Server Timing](server-timing.md)** - Monitor SSR performance with Server-Timing headers

### 🧪 Development and Testing
- **[Testing Guide](testing.md)** - Test your setup and common troubleshooting

### 🔧 Miscellaneous
- **[Chrome DevTools Explained](chrome-devtools-explained.md)** - Understanding Chrome DevTools requests

## Quick Start

1. **Install dependencies**: `deno install`
2. **Start development**: `deno task dev` (gateway + frontend worker + BFF + Spotlight at http://localhost:8787)
3. **Test API**: Visit http://localhost:8787/api/test
4. **Build for production**: `deno task build && deno task start`

## Architecture Overview

- **Development**: Gateway worker on `8787`, frontend worker on `5173`, and BFF as an auxiliary worker
- **Production**: Gateway worker routing to private frontend and BFF workers
- **Rendering**: Hybrid - SSG for static pages, SSR for dynamic, CSR for interactivity

## Key Features

✅ Hot Module Replacement (HMR)  
✅ Server-Side Rendering (SSR)  
✅ Static Site Generation (SSG)  
✅ API routes through the BFF worker  
✅ TypeScript support  
✅ Production-ready build  
✅ Cloudflare Worker deployment ready  

## Routes

| Route | Mode | Description |
|-------|------|-------------|
| `/` | SSG | Home page (prerendered) |
| `/about` | SSG | About page (prerendered) |
| `/errors` | SSG | Error demo page (prerendered) |
| `/ssr` | SSR | Server-rendered demo |
| `/errors/:code` | SSR | Dynamic error demo |
| `/api/*` | API | Hono API endpoints |
| `/*` | SSR | 404 catch-all |

## Need Help?

- Check the specific guides above
- Run `deno check` for type errors
- Use `deno task preview` or `deno task start` to test the built worker stack locally
