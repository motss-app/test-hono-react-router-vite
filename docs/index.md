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
- **[CSP for SSG and SSR](csp-ssg-ssr-guide.md)** - How to handle CSP for inline and external resources across same-origin and third-party domains
- **[What is Prerendered](what-is-prerendered.md)** - Current prerendering status
- **[Server Timing](server-timing.md)** - Monitor SSR performance with Server-Timing headers

### 🧪 Development and Testing
- **[Testing Guide](testing.md)** - Test your setup and common troubleshooting

### 🔧 Miscellaneous
- **[Chrome DevTools Explained](chrome-devtools-explained.md)** - Understanding Chrome DevTools requests

## Quick Start

1. **Install dependencies**: `deno task install`
2. **Start development**: `deno task dev` (app + API + Spotlight at http://localhost:5173)
3. **Test API**: Visit http://localhost:5173/api/test
4. **Build for production**: `deno task build && deno task start`

## Architecture Overview

- **Development**: Vite dev server with HMR, Hono for API routes, React Router for pages
- **Production**: Hono server serving static files + SSR, API routes
- **Rendering**: Hybrid - SSG for static pages, SSR for dynamic, CSR for interactivity

## Key Features

✅ Hot Module Replacement (HMR)  
✅ Server-Side Rendering (SSR)  
✅ Static Site Generation (SSG)  
✅ API routes with Hono  
✅ TypeScript support  
✅ Production-ready build  
✅ Docker deployment ready  

## Routes

| Route | Mode | Description |
|-------|------|-------------|
| `/` | SSG | Home page (prerendered) |
| `/about` | SSG | About page (prerendered) |
| `/errors` | SSG | Error demo page (prerendered) |
| `/ssr` | SSR | Server-rendered demo |
| `/api/*` | API | Hono API endpoints |
| `/*` | SSR | 404 catch-all |

## Need Help?

- Check the specific guides above
- Run `deno check` for type errors
- Use `deno task preview` to test production build locally
