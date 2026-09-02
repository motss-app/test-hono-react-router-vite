#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Building WASM (release)..."
cargo build --target wasm32-unknown-unknown --release

echo "==> Running wasm-bindgen..."
wasm-bindgen \
  target/wasm32-unknown-unknown/release/healthz_rust.wasm \
  --out-dir build \
  --out-name index \
  --target web \
  --no-typescript

WASM_FILE="build/index_bg.wasm"
BEFORE_SIZE=$(wc -c < "$WASM_FILE")

echo "==> Running wasm-opt -Oz..."
if command -v wasm-opt &>/dev/null; then
  wasm-opt -Oz "$WASM_FILE" -o "$WASM_FILE"
  AFTER_SIZE=$(wc -c < "$WASM_FILE")
  SAVED=$(( BEFORE_SIZE - AFTER_SIZE ))
  echo "    Before: $BEFORE_SIZE bytes"
  echo "    After:  $AFTER_SIZE bytes"
  echo "    Saved:  $SAVED bytes ($(( SAVED * 100 / BEFORE_SIZE ))%)"
else
  echo "    wasm-opt not found — skipping. Install via: brew install binaryen"
fi

echo "==> Done."
