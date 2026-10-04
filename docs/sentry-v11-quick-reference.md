# Sentry v11 + Cloudflare: all changes

Legend. Impact: 💥 breaking, ⚠️ behavior, ✨ new. Status: ✅ done, ⏭️ skipped, ❌ n/a.

Not enabled, and why: `@sentry/hono` adds a new package and its own route naming, so it needs its own PR and test. Workers profiling and session replay cost money, and Workers replay support is limited. Cloudflare custom span APIs would duplicate Sentry spans, since Sentry already traces here. All three are opt-in later, not blockers.

| # | Change | Impact | Us | Status | What I did |
|---|---|---|---|---|---|
| 1 | `nodejs_compat` import removed | 💥 | ✅ | ✅ | 6 imports to `@sentry/cloudflare` |
| 2 | `nodejs_als` flag dropped | 💥 | ✅ | ✅ | Removed, kept `nodejs_compat` |
| 3 | Span streaming is default | 💥 | ✅ | ✅ | Filtering to `ignoreSpans` |
| 4 | `beforeSendTransaction` ignored | 💥 | ✅ | ✅ | Moved to `beforeSendSpan` |
| 5 | `ignoreTransactions` ignored | 💥 | ✅ | ✅ | Replaced with `ignoreSpans` |
| 6 | Span fields renamed | 💥 | ✅ | ✅ | `data` to `attributes` |
| 7 | `sendDefaultPii` removed | 💥 | ✅ | ✅ | Pinned `dataCollection` |
| 8 | `enableLogs` removed | 💥 | ✅ | ✅ | Removed, `logger.*` works |
| 9 | `enableRpcTracePropagation` removed | 💥 | ✅ | ✅ | Kept the allow list |
| 10 | Vite `_experimental` removed | 💥 | ✅ | ✅ | Used top-level options |
| 10b | `useDiagnosticsChannelInjection` renamed | ⚠️ | ✅ | ⏭️ | Now `buildTimeInstrumentation`, default `true`, so dropped as redundant |
| 11 | `sentryReactRouter` to `/vite` | 💥 | ✅ | ✅ | Updated import |
| 12 | `unstable_sentryVitePluginOptions` gone | 💥 | ✅ | ✅ | `release` to top level |
| 13 | `captureMessage` errors session | 💥 | ✅ | ✅ | Removed, `logger.info` existed |
| 14 | Scope `tags` miss spans | 💥 | ✅ | ✅ | Added `setAttribute` |
| 15 | Span names lower cardinality | ⚠️ | ✅ | ✅ | Kept names readable |
| 16 | Dedupe crosses requests | ⚠️ | ✅ | ⏭️ | No code needed |
| 17 | Trace matching case-insensitive | ⚠️ | ❌ | ⏭️ | Already anchored |
| 18 | `honoIntegration` removed | 💥 | ❌ | ⏭️ | Never used |
| 19 | D1, DO, span envelopes removed | 💥 | ❌ | ⏭️ | Never used |
| 20 | `@sentry/types` unpublished | 💥 | ❌ | ⏭️ | Never imported |
| 21 | AI and OTel changes | 💥 | ❌ | ⏭️ | No such code |
| 22 | 10.75.2 to 11.4.0 | 💥 | ✅ | ✅ | 3 packages bumped |
| 23 | `@sentry/hono` available | ✨ | ✅ | ⏭️ | Not enabled, own PR |
| 24 | `traceLifecycle` option | ✨ | ✅ | ✅ | Pinned to `stream` |
| 25 | `dataCollection` control | ✨ | ✅ | ✅ | Cookies and bodies off |
| 26 | Attribute-based `ignoreSpans` | ✨ | ✅ | ✅ | Used `url.path` |
| 27 | Workers profiling | ✨ | ❌ | ⏭️ | Costs money |
| 28 | Workers session replay | ✨ | ❌ | ⏭️ | Costs money |
| 29 | Sampling defaults to 1 | ⚠️ | ✅ | ✅ | Left at 100% by choice, your call |
| 30 | `compatibility_date` stale | ⚠️ | ✅ | ✅ | All 7 to `2026-10-01` |
| 31 | Cloudflare custom spans | ✨ | ✅ | ⏭️ | Would duplicate Sentry |
| 32 | RPC session spans | ✨ | ✅ | ⏭️ | Already on |
| 33 | Custom Dashboards | ✨ | ✅ | ⏭️ | Dashboard task |
| 34 | Release annotations | ✨ | ✅ | ⏭️ | No code needed |
| 35 | `cf` CLI beta | ✨ | ❌ | ⏭️ | Beta, see #74 |
| 36 | Miniflare v5 | 💥 | ❌ | ⏭️ | Not used |
| 37 | Workflows, Basin, OAuth | ✨ | ❌ | ⏭️ | n/a |
| 38 | Spotlight UI 500s | 💥 | ✅ | ⚠️ | Blocked upstream |
| 39 | RR hook spans unverified | ⚠️ | ❓ | ❓ | Not observed |

## Not done, on purpose

| Item | Why not | To enable |
|---|---|---|
| `@sentry/hono` | New package, changes route names | Own PR |
| Workers profiling | Costs money | Add option |
| Workers replay | Costs money | Add option |
| Cloudflare custom spans | Duplicates Sentry spans | Only if Sentry is dropped |
| Tune sampling | Need real traffic | Watch bill |

## Verified

Typecheck, lint, 167 files, 4 tests, build, 3 dry-run deploys, runtime 200s, SDK 11.4.0 live, 155-span trace, multi-hop RPC, dev spans dropped, no console errors.

Blocked: Spotlight UI (row 38). Unverified: RR hook spans (row 39).

Full detail: [sentry-v11-migration.md](./sentry-v11-migration.md). Cloudflare: [#92](https://github.com/motss-app/test-hono-react-router-vite/issues/92). Guide: [Sentry v11](https://docs.sentry.io/platforms/javascript/guides/cloudflare/migration/v10-to-v11/)