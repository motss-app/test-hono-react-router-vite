# Rust WASM Release Optimization

## Overview

The Rust packages in this repository compile to `wasm32-unknown-unknown` for
Cloudflare Workers or the browser. The default release policy is speed first,
because the current Worker artifacts are comfortably below Cloudflare's 64 MiB
code limit. Use the size-balanced profile only when a build approaches the
limit or transfer/cold-start measurements show that size matters more than
compute time.

## Recommended speed-first profile

```toml
[profile.release]
lto = true              # Fat LTO across the dependency graph
codegen-units = 1       # Better whole-program optimization
opt-level = 3           # Maximum runtime optimization
panic = "abort"         # No unwinding path
```

`lto = true` is equivalent to fat LTO. `codegen-units = 1` improves cross-crate
optimization at the cost of longer release builds. `panic = "abort"` is useful
for WASM because the endpoint does not need stack unwinding.

For `fractal-rust` and `color-rust`, keep `strip = false`: the repository has verified that
`strip = true` can break `wasm-bindgen` Worker builds. Stripping affects symbols
and debug information, not hot-path runtime speed.

## Size-balanced fallback

Use this only if the speed-first build becomes materially larger or the Worker
approaches the 64 MiB limit:

```toml
[profile.release]
lto = true
codegen-units = 1
opt-level = "s"         # Size-oriented while retaining loop vectorization
panic = "abort"
```

Use `opt-level = "z"` only when the smallest transfer is the priority. It also
turns off loop vectorization, so it is generally a worse choice for image or
fractal processing than `"s"` or `3`.

## Post-build: Binaryen `wasm-opt`

The [Binaryen](https://github.com/WebAssembly/binaryen) `wasm-opt` tool
performs additional dead-code elimination, constant folding, and instruction
combining on the compiled WASM binary.

Use `-O3` for the speed-first profile:

```bash
wasm-opt -O3 build/index_bg.wasm -o build/index_bg.wasm
```

Use `-Os` or `-Oz` only for the size-balanced fallback. The `-Oz` pipeline is
not the default for CPU-bound Workers.

## WASM SIMD

Enable `simd128` selectively for compute-heavy Workers, not globally:

```toml
[target.wasm32-unknown-unknown]
rustflags = ["-C", "target-feature=+simd128"]
```

`packages/color-rust/.cargo/config.toml` enables it for image decoding,
pixel conversion, and dominant-color analysis. `fractal-rust` retains SIMD for
server-side fractal rendering. Do not enable it for `healthz-rust`: that Worker
has no meaningful numeric hot path, so SIMD would add compatibility and build
complexity without useful work.

Measured locally with the same 1204x800 AVIF over 20 sequential requests:

| Build | p50 | p75 | WASM size |
|---|---:|---:|---:|
| Scalar | 102.8 ms | 105.9 ms | 4,675,273 bytes |
| `simd128` | 91.9 ms | 103.6 ms | 4,930,655 bytes |

The SIMD build improved median latency by about 10.5% and increased the module
by 255,382 bytes (about 5.5%). Keep it enabled while Cloudflare Workers supports
WASM SIMD and production latency confirms the local result.

### Measured speed-first pipeline: `healthz-rust`

| Stage | Size |
|---|---|
| After `cargo build --release` | 416,709 bytes |
| After `wasm-opt -O3` | 316,894 bytes |
| **Reduction** | **99,815 bytes (23%)** |

### Usage

```bash
# Install Binaryen (macOS)
brew install binaryen

# Optimize a WASM file in-place for runtime speed
wasm-opt -O3 build/index_bg.wasm -o build/index_bg.wasm
```

The build scripts automate the full pipeline:

```
Speed first: `cargo build → wasm-bindgen → wasm-opt -O3`

Size fallback: `cargo build → wasm-bindgen → wasm-opt -Os` or `-Oz`
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

`opt-level = 3` generally produces the fastest code but can produce a larger
binary. It is the right default for image decoding, dominant-color analysis,
and fractal rendering while the resulting Worker remains well under 64 MiB.

### `opt-level = "s"` or `"z"` (size fallback)

`"s"` is the preferred size fallback because it retains more speed-oriented
optimizations. `"z"` is the smallest compiler-level profile, but disables loop
vectorization and should be reserved for size-critical, non-CPU-bound Workers.

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
to upstream services, not WASM size. The roughly 100 KB saved by `wasm-opt` shaves
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
