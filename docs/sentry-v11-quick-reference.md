# Sentry v11 + Cloudflare: all changes

Sorted by impact (💥 breaking, ⚠️ behavior, ✨ new) then status.

Status: ✅ done | ➕ added | 🟢 no action needed | ⏭️ opted out | ❌ does not apply

On the skips: only 7 of 40 need code I chose not to write. Another 10 are APIs this repo never used, and 8 are already on or need no code. Full list under [Skipped](#skipped).

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
| 11 | `sentryReactRouter` to `/vite` | 💥 | ✅ | ✅ | Updated import |
| 12 | `unstable_sentryVitePluginOptions` gone | 💥 | ✅ | ✅ | `release` to top level |
| 13 | `captureMessage` errors session | 💥 | ✅ | ✅ | Removed, `logger.info` existed |
| 14 | Scope `tags` miss spans | 💥 | ✅ | ✅ | Added `setAttribute` |
| 18 | `honoIntegration` removed | 💥 | ❌ | ❌ | Never used |
| 19 | D1, DO, span envelopes removed | 💥 | ❌ | ❌ | Never used |
| 20 | `@sentry/types` unpublished | 💥 | ❌ | ❌ | Never imported |
| 21 | AI and OTel changes | 💥 | ❌ | ❌ | No such code |
| 22 | 10.75.2 to 11.4.0 | 💥 | ✅ | ✅ | 3 packages bumped |
| 36 | Miniflare v5 | 💥 | ❌ | ❌ | Not used directly |
| 38 | Spotlight UI 500s | 💥 | ✅ | ⚠️ | Blocked upstream |
| 15 | Span names lower cardinality | ⚠️ | ✅ | ✅ | Kept names readable |
| 16 | Dedupe crosses requests | ⚠️ | ✅ | 🟢 | No code needed |
| 17 | Trace matching case-insensitive | ⚠️ | ❌ | 🟢 | Already anchored |
| 29 | Sampling defaults to 1 | ⚠️ | ✅ | ✅ | Left at 100% by choice |
| 30 | `compatibility_date` stale | ⚠️ | ✅ | ✅ | All 7 to `2026-10-01` |
| 39 | RR hook spans unverified | ⚠️ | ❓ | ❓ | Not observed |
| 10b | `useDiagnosticsChannelInjection` renamed | ⚠️ | ✅ | 🟢 | Now `buildTimeInstrumentation`, default `true` |
| 23 | `@sentry/hono` available | ✨ | ✅ | ⏭️ | New package, own PR |
| 24 | `traceLifecycle` option | ✨ | ✅ | ➕ | Pinned to `stream` |
| 25 | `dataCollection` control | ✨ | ✅ | ➕ | Cookies and bodies off |
| 26 | Attribute-based `ignoreSpans` | ✨ | ✅ | ➕ | Used `url.path` |
| 27 | Workers profiling | ✨ | ❌ | ⏭️ | Costs money |
| 28 | Workers session replay | ✨ | ❌ | ⏭️ | Costs money |
| 31 | Cloudflare custom spans | ✨ | ✅ | ⏭️ | Would duplicate Sentry |
| 32 | RPC session spans | ✨ | ✅ | 🟢 | Already on |
| 33 | Custom Dashboards | ✨ | ✅ | 🟢 | Dashboard task |
| 34 | Release annotations | ✨ | ✅ | 🟢 | No code needed |
| 35 | `cf` CLI beta | ✨ | ❌ | ⏭️ | Beta, see #74 |
| 37 | Workflows, Basin, OAuth | ✨ | ❌ | ❌ | Not applicable |

## Skipped

Only these 7 needed code I chose not to write:

| Item | Why | To enable |
|---|---|---|
| `@sentry/hono` | New package, changes route names | Own PR |
| Workers profiling | Costs money | Add option |
| Workers replay | Costs money | Add option |
| Cloudflare custom spans | Duplicates Sentry | Only if Sentry dropped |
| `cf` CLI | Beta, Build Output may change | After stable, see #74 |
| Spotlight UI | Upstream bug, not ours | Wait for fix |
| Sampling tune | Needs real traffic | Watch bill |

The other skips need nothing: 10 are APIs this repo never imported (rows 18-21, 35, 36, 37), and 8 are already correct or need no code (rows 10b, 16, 32, 33, 34).

## Verified

Typecheck, lint 167 files, 4 tests, build, 3 dry-run deploys, all URLs in `docs/dev-urls.md` 200 except stale `/api/test`. CI green on 11 checks, all 7 Workers deployed to canary. SDK 11.4.0 live, 155-span trace, multi-hop RPC, dev spans dropped.

Full detail: [sentry-v11-migration.md](./sentry-v11-migration.md). Guide: [Sentry v11](https://docs.sentry.io/platforms/javascript/guides/cloudflare/migration/v10-to-v11/)