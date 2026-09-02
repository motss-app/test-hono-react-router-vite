# Rust WASM Optimization — healthz-rust

## Overview

The `healthz-rust` package is a Cloudflare Worker compiled to WASM via
`wasm-bindgen`. This document records the optimization strategies applied and
their measured impact.

## Cargo.toml profile

```toml
[profile.release]
lto = true              # Link-Time Optimization across crates
codegen-units = 1       # Single codegen unit = better optimization passes
opt-level = "z"         # Smallest binary (most aggressive size setting)
panic = "abort"         # No unwinding tables = smaller binary
```

These are the **maximum size optimizations** Rust supports at the compiler
level. There is no `opt-level = "zz"` — `"z"` is the floor.

## Post-build: `wasm-opt -Oz`

The [Binaryen](https://github.com/aspect-build/aspect-build) `wasm-opt` tool
performs additional dead-code elimination, constant folding, and instruction
combining on the compiled WASM binary.

### Measured impact

| Stage | Size |
|---|---|
| After `cargo build --release` | 343 KB |
| After `wasm-opt -Oz` | 250 KB |
| **Reduction** | **93 KB (27%)** |

### Usage

```bash
# Install Binaryen (macOS)
brew install binaryen

# Optimize a WASM file in-place
wasm-opt -Oz build/index_bg.wasm -o build/index_bg.wasm
```

The `build.sh` script in `packages/healthz-rust/` automates the full pipeline:

```
cargo build → wasm-bindgen → wasm-opt -Oz
```

## What does NOT help

### `wee_alloc`

A tiny allocator for WASM. Unmaintained since 2020 and provides no meaningful
size or speed gain over Rust's default allocator for `wasm32-unknown-unknown`.
Skip it.

### `simd-json`

A SIMD-accelerated JSON **parser** (deserializer). Our BFF endpoints only
**serialize** JSON responses — `simd-json` is the wrong tool. Additionally, it
requires WASM SIMD support which may not be available on all CF Workers runtimes.

### Removing `serde_json` from direct deps

The `worker` crate (v0.8) depends on `serde_json` internally. Removing it from
`Cargo.toml` does not eliminate it from the binary — it remains a transitive
dependency. Direct removal saves zero bytes.

### `opt-level = 3` (speed)

`opt-level = 3` produces the **fastest** code but the **largest** binary. For a
BFF with trivial routing, the JIT compilation speed difference is negligible.
Use `"z"` unless you have CPU-bound hot paths.

## Dependency size breakdown

| Crate | Role | Approx WASM cost |
|---|---|---|
| `worker` | CF Workers SDK | ~120 KB |
| `serde` | Serialization framework | ~40 KB |
| `serde_json` | JSON serialize/deserialize | ~50 KB |
| `js-sys` | JS interop bindings | ~30 KB |
| `wasm-bindgen` | WASM ↔ JS glue | ~10 KB |

The `worker` crate is the largest dependency. Replacing it with raw
`wasm-bindgen` + `web-sys` would cut ~100 KB but requires significant
reimplementation of the Workers runtime bindings.

## Cold start reality

On Cloudflare Workers, cold start has two components:

1. **V8 isolate startup** (~2-5 ms) — fixed cost, independent of code size
2. **Code parsing/compilation** — V8 compiles lazily; only executed functions are
   JIT-compiled

For a small BFF like this, the **total cold start is dominated by network I/O**
to upstream services, not WASM size. The 93 KB saved from `wasm-opt` shaves
roughly microseconds off cold start — not milliseconds.

Rust WASM cold start advantages are real but apply to:
- Large compute-heavy modules (image processing, crypto)
- Predictable latency (no GC pauses, no JIT tail spikes)
- High-throughput endpoints where per-request overhead matters

## When to consider further optimization

| Threshold | Action |
|---|---|
| WASM > 1 MB | Aggressive `wasm-opt`, consider splitting workers |
| p99 latency spikes | Profile JIT; Rust WASM avoids this entirely |
| CPU-bound transforms | Move logic to Rust WASM, call from Hono BFF |
| Cold start > 50 ms | Likely network-bound; optimize upstream, not WASM |
