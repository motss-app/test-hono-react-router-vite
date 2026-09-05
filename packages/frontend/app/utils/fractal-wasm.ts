/**
 * Typed facade over the wasm-bindgen glue generated from
 * `packages/fractal-wasm` (emitted with `--no-typescript`, see its
 * `build.sh`). The glue is plain JavaScript, so the module shape is declared
 * here and the dynamic import is cast to it.
 */

export interface FractalWasmModule {
  /**
   * Initializes the WASM module. With no argument the glue fetches
   * `fractal_bg.wasm` relative to itself. Must be awaited once before
   * calling `render`.
   */
  default: (moduleOrPath?: unknown) => Promise<unknown>;
  /**
   * Renders the Mandelbrot set and returns packed RGBA8 bytes
   * (`width * height * 4`). Mirrors `packages/fractal-wasm/src/lib.rs`.
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
