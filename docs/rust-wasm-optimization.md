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

Measured fresh on 2026-09-23 with `rustc 1.98.1`, `wasm-bindgen 0.2.128`, and
Binaryen `wasm-opt 133`:

| Stage | Size |
|---|---|
| After `cargo build --release` (raw output, custom sections included) | 1,132,724 bytes |
| After `wasm-bindgen` (JS glue split out) | 419,094 bytes |
| After `wasm-opt -O3` | 317,306 bytes |
| Total reduction | 815,418 bytes (72%) |

The raw `cargo` output carries 456,470 bytes of custom sections, dominated by
`__wasm_bindgen_unstable` (312,982 bytes) and `name` (143,263 bytes), which
`wasm-bindgen` consumes, and it also rewrites the import and export sections.
That accounts for most of the first drop. An earlier revision of this table
reported 416,709 bytes "after cargo build". Those rows follow `build.sh`'s
Before/After/Saved output (416,709 - 316,894 = 99,815, exactly the reduction
the old table listed), and `build.sh` reads its Before size after
`wasm-bindgen` has already run, so that first row was a post-bindgen
measurement rather than raw cargo output. Stage sizes drift slightly whenever
`Cargo.lock` changes.

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

## Measured artifact sizes

All figures measured 2026-09-23 on macOS arm64. Percentages in parentheses
are compressed size as a share of raw size.

```bash
stat -f%z FILE                    # raw bytes
gzip -9 -n -c FILE | wc -c        # gzip bytes (-n drops stored name/time)
brotli -q 11 -c FILE | wc -c      # brotli bytes
```

### Shipped modules (after `wasm-bindgen`)

| Artifact | Raw bytes | gzip -9 | brotli -q11 |
|---|---:|---:|---:|
| `packages/color-rust/build/index_bg.wasm` | 4,862,301 | 1,606,787 (33%) | 1,155,169 (24%) |
| `packages/fractal-rust/build/index_bg.wasm` | 467,397 | 187,017 (40%) | 156,634 (34%) |
| `packages/healthz-rust/build/index_bg.wasm` | 388,150 | 142,462 (37%) | 116,517 (30%) |
| `packages/frontend/app/labs-wasm/fractal_bg.wasm` | 18,365 | 8,733 (48%) | 7,587 (41%) |

Notes:

- The three Worker files still carry a `name` custom section (320,103,
  68,021, and 64,447 bytes) while `fractal_bg.wasm` does not.
  `wasm-opt -O3` strips that section, and re-running it over each shipped file
  today yields 4,556,424 bytes (6.3% smaller), 398,488 bytes (14.7% smaller),
  and 322,732 bytes (16.9% smaller). In other words those three Worker
  artifacts are effectively un-optimized.
- Only `fractal_bg.wasm` is downloaded by browsers. The three Worker modules
  upload together with their Worker and execute on Cloudflare, so for those
  the raw size drives deploy transfer and V8 parse cost instead of user
  downloads.
- `image-optimize-rust` has no `build/` output on this machine, so only its
  raw Cargo row appears below.
- Only `healthz-rust` and `fractal-wasm` have a committed `build.sh`
  (`healthz-rust`'s skips the `wasm-opt` step when binaryen is missing), and no
  `deno task` builds `color-rust` or `fractal-rust`, so rebuild these Worker
  artifacts manually after changing their sources.

### Raw Cargo output (before `wasm-bindgen`)

Lives at `packages/<crate>/target/wasm32-unknown-unknown/release/`. These
files still carry the `__wasm_bindgen_unstable` and `name` custom sections
that the pipeline consumes, which is why they are so much larger than the
shipped rows above.

| Artifact | Raw bytes | gzip -9 | brotli -q11 |
|---|---:|---:|---:|
| `color_rust.wasm` | 6,131,881 | 1,825,173 (30%) | 1,226,723 (20%) |
| `image_optimize_rust.wasm` | 4,764,339 | 1,437,991 (30%) | 788,034 (17%) |
| `fractal_rust.wasm` | 1,223,531 | 336,309 (27%) | 241,807 (20%) |
| `healthz_rust.wasm` | 1,132,724 | 289,773 (26%) | 198,682 (18%) |
| `color_wasm.wasm` | 98,623 | 42,958 (44%) | 35,783 (36%) |
| `fractal_wasm.wasm` | 36,318 | 13,372 (37%) | 11,098 (31%) |

### Native (pure Rust) binary sizes

For a fair baseline, `color-wasm` and `fractal-wasm` were linked into a host
executable that calls `dominant_color` and `render_into`, built with the same
release profile the crates use for WASM (`lto`, `codegen-units = 1`,
`opt-level = 3`, `panic = "abort"`, `strip = true`). Two more binaries from
this repo give extra scale reference. Reproduce the measurement with the
`stat` and compression commands above.

| Binary | Raw bytes | gzip -9 | brotli -q11 |
|---|---:|---:|---:|
| Executable linking `color-wasm` + `fractal-wasm` | 335,824 | 159,194 (47%) | 128,741 (38%) |
| The same two crates as WASM (`color_wasm.wasm` + `fractal_wasm.wasm`) | 134,941 | 56,330 (42%) | 46,881 (35%) |
| `bench_neuquant`, the release bin in `image-optimize-rust` | 392,928 | 161,418 (41%) | 130,972 (33%) |
| `http-bench`, the checked-in Rust HTTP load tool | 1,051,280 | 526,258 (50%) | 406,233 (39%) |

What the comparison shows:

- For identical crate code the two WASM modules together are 134,941 bytes
  against 335,824 bytes for the native executable, about 40% as large. The
  native binary statically links `std`, panic machinery, and Mach-O load
  commands, while each WASM module only carries the code its exports reach.
- WASM compresses at least as well as native code in this sample. gzip keeps
  33% to 48% of the shipped WASM rows but 41% to 50% of the native binaries.
- Do not use a native `cdylib` build of these crates as a baseline.
  `cargo build --release` for the host produces `libcolor_wasm.dylib` and
  `libfractal_wasm.dylib` at 50,640 bytes each, but 95.4% of each file is zero
  padding, the `__text` section is 616 bytes, and `nm` lists only nine
  `__wbindgen_*` symbols. The `#[wasm_bindgen]` exports do not exist for the
  host target, so LTO strips the entire API as unreachable. An executable that
  calls the code, as above, is the honest baseline.

## Can WASM be gzipped?

Yes, both on the wire and on disk, and for this repo the wire case already
happens in production.

### On the wire

- Across every artifact measured above, gzip removes 52% to 74% of the bytes
  and brotli removes 59% to 84%. WASM compresses better than the native
  binaries in the same measurements because WASM bytecode is denser and more
  uniform than machine code.
- Cloudflare's edge compresses `application/wasm` by default when the
  request's `accept-encoding` allows it, since the type sits on
  [Cloudflare's default compression list](https://developers.cloudflare.com/speed/optimization/content/compression/).
  The minimum response sizes for edge compression, 48 bytes for gzip and 50
  bytes for brotli or zstd, are met by every module here.
- `headers/_headers.*` sets `no-transform` only on `/**/*.html`, which is why
  the gateway has to gzip prerendered HTML itself. `.wasm` responses carry no
  `no-transform`, so the edge is free to compress them.
- The gateway's in-worker gzip path matches `text/html` only, so it passes
  `.wasm` through untouched and there is no double encoding. Local dev is the
  exception: the dev server returns `fractal_bg.wasm` with
  `Content-Length: 18365` and no `Content-Encoding` header, so dev transfer
  equals the raw column above.
- Streaming instantiation keeps working under compression. `Content-Encoding`
  is decoded by the fetch layer before JavaScript sees the body, and
  `WebAssembly.instantiateStreaming` only checks
  `Content-Type: application/wasm`.

### On disk

- A precompressed `.wasm.br` or `.wasm.gz` can replace the raw file, but only
  when the server sends a matching `Content-Encoding` header while keeping
  `Content-Type: application/wasm`. Serving gzip bytes as a plain file fails
  `instantiateStreaming`.
- This repo does not need precompressed files: the edge compresses
  `application/wasm` dynamically already, so raw `.wasm` files are committed
  and served as is.

### What compression does not change

- Gzip only shrinks network transfer. V8 parses and compiles the decompressed
  module, so cold start and memory cost follow the raw size. For those the
  levers stay `wasm-opt` and the Cargo profile, as the pipeline section above
  measures.
- The three Worker modules are never downloaded by browsers, so what users
  actually feel is the edge-compressed `fractal_bg.wasm`.

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
