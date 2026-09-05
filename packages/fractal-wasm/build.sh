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

echo "==> Done: $(wc -c < "$WASM_FILE") bytes"
