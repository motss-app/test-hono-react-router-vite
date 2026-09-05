/**
 * Typed facade over the wasm-bindgen glue generated from
 * `packages/fractal-wasm` (emitted with `--no-typescript`, see its
 * `build.sh`). The glue is plain JavaScript, so the module shape is declared
 * here and the dynamic import is cast to it.
 */

import type { FractalPaletteName } from './fractal-render.ts';

/**
 * Numeric palette ids matching `Palette::from_u8` in
 * `packages/fractal-wasm/src/lib.rs`. Passing an id instead of a string
 * avoids per-frame UTF-8 string marshalling across the WASM boundary.
 */
export const FRACTAL_PALETTE_IDS: Record<FractalPaletteName, number> = {
  fire: 0,
  ice: 1,
  mono: 2,
  viridis: 3,
};

export interface FractalWasmModule {
  /**
   * Initializes the WASM module. With no argument the glue fetches
   * `fractal_bg.wasm` relative to itself. Must be awaited once before
   * calling `render`.
   */
  default: (moduleOrPath?: unknown) => Promise<unknown>;
  /**
   * Legacy render: computes the Mandelbrot set and returns packed RGBA8 bytes
   * (`width * height * 4`) via a copied `Uint8Array`. Kept as a fallback;
   * prefer `render_fast` below. Mirrors `packages/fractal-wasm/src/lib.rs`.
   */
  render: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    maxIter: number,
    palette: string
  ) => Uint8Array;
  /**
   * Zero-copy render into the module's persistent output buffer. Returns the
   * byte pointer; wrap it with `wasmFrameView` before the next call reuses
   * the buffer. Absent when an older cached glue is loaded — fall back to
   * `render` in that case.
   */
  render_fast?: (
    width: number,
    height: number,
    centerX: number,
    centerY: number,
    scale: number,
    maxIter: number,
    palette: number
  ) => number;
  /**
   * Exposes the WASM linear memory backing `render_fast` output. Re-fetch
   * `.buffer` on every frame: it detaches whenever the memory grows.
   */
  wasm_memory?: () => WebAssembly.Memory;
}

/**
 * Wraps `render_fast` output in a zero-copy `Uint8ClampedArray` view — no
 * `.slice()`, no second clamped copy. The view aliases WASM memory, so hand
 * it to `ImageData` synchronously before the next render reuses the buffer.
 */
export function wasmFrameView(
  mod: FractalWasmModule,
  ptr: number,
  byteLength: number
): Uint8ClampedArray<ArrayBuffer> {
  const memory = mod.wasm_memory?.();
  if (!memory) {
    throw new Error('Fractal WASM fast path unavailable: wasm_memory missing');
  }
  // The module is single-threaded, so its memory is never shared: the buffer
  // is always a plain `ArrayBuffer` despite the `ArrayBufferLike` typing.
  const buffer = memory.buffer as ArrayBuffer;
  return new Uint8ClampedArray(buffer, ptr, byteLength);
}

/**
 * Loads and initializes the Rust WASM module. Safe to call multiple times;
 * the glue caches its instance after the first init.
 */
export async function loadFractalWasm(): Promise<FractalWasmModule> {
  const mod = await import('../labs-wasm/fractal.js');
  await mod.default();
  return mod as unknown as FractalWasmModule;
}
