#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# Generated glue + wasm land inside the frontend app so Vite bundles them with
# the page. The output directory is committed; regenerate with this script or
# `deno task build:fractal-wasm` after changing Rust code.
OUT_DIR="../frontend/app/labs-wasm"

echo "==> Building fractal WASM (release)..."
cargo build --target wasm32-unknown-unknown --release

echo "==> Running wasm-bindgen..."
# `--no-typescript`: the generated `.d.ts` next to `fractal.js` trips deno
# lint's `no-sloppy-imports` rule; types live in
# `packages/frontend/app/utils/fractal-wasm.ts` instead.
wasm-bindgen \
  target/wasm32-unknown-unknown/release/fractal_wasm.wasm \
  --out-dir "$OUT_DIR" \
  --out-name fractal \
  --target web \
  --no-typescript

WASM_FILE="$OUT_DIR/fractal_bg.wasm"

# Binaryen post-optimization (peephole, inlining, DCE at the WASM level).
# `cargo --release` already applies `opt-level=3 + lto`, but that only covers
# LLVM; without this step the shipped bytes miss the standard `wasm-pack`
# `-O3` pass. Optional locally so devs without binaryen still build; CI
# installs binaryen and always takes this path.
if command -v wasm-opt >/dev/null 2>&1; then
  echo "==> Optimizing with wasm-opt -O3..."
  # `rustc` emits bulk-memory and saturating float-to-int ops by default, so
  # the matching features must be enabled or `wasm-opt` rejects the input.
  if wasm-opt -O3 \
    --enable-bulk-memory \
    --enable-mutable-globals \
    --enable-nontrapping-float-to-int \
    --enable-sign-ext \
    "$WASM_FILE" -o "$WASM_FILE.opt"; then
    mv "$WASM_FILE.opt" "$WASM_FILE"
  else
    echo "==> wasm-opt failed, keeping unoptimized output"
    rm -f "$WASM_FILE.opt"
  fi
else
  echo "==> wasm-opt not found, skipping (install binaryen for smaller/faster output)"
fi

echo "==> Done: $(wc -c < "$WASM_FILE") bytes"
