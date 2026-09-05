//! Shared Mandelbrot kernel for the Rust Lab page.
//!
//! One render implementation powers two runtimes:
//! - The browser: compiled to a WASM module (`build.sh` → `--target web`) and
//!   called from `packages/frontend` for interactive canvas rendering.
//! - The edge: linked into the `fractal-rust` Cloudflare Worker, which renders
//!   high-resolution PNGs server-side via the `/fractal/render` endpoint.

use std::sync::Mutex;
use wasm_bindgen::prelude::wasm_bindgen;

/// Color palettes shared by the client module and the edge worker.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Palette {
  Fire,
  Ice,
  Mono,
  Viridis,
}

impl Palette {
  /// All palettes in stable order, useful for validation and docs.
  pub const ALL: [Palette; 4] = [
    Palette::Fire,
    Palette::Ice,
    Palette::Mono,
    Palette::Viridis,
  ];

  /// Parses a palette name as passed through query strings and JS calls.
  /// Unknown names fall back to `Fire` so callers never need error handling.
  pub fn parse(name: &str) -> Palette {
    match name {
      "ice" => Palette::Ice,
      "mono" => Palette::Mono,
      "viridis" => Palette::Viridis,
      _ => Palette::Fire,
    }
  }

  /**
   * Maps the numeric palette id passed from JS (`0 = fire`, `1 = ice`,
   * `2 = mono`, `3 = viridis`) to a palette. Unknown ids fall back to
   * `Fire`, mirroring `parse`. Numeric ids avoid per-frame UTF-8 string
   * marshalling across the WASM boundary.
   */
  pub fn from_u8(id: u8) -> Palette {
    match id {
      1 => Palette::Ice,
      2 => Palette::Mono,
      3 => Palette::Viridis,
      _ => Palette::Fire,
    }
  }

  pub fn as_str(self) -> &'static str {
    match self {
      Palette::Fire => "fire",
      Palette::Ice => "ice",
      Palette::Mono => "mono",
      Palette::Viridis => "viridis",
    }
  }

  /// Maps a normalized iteration position `t` in `[0, 1]` to an RGB triple by
  /// interpolating between the palette stops.
  #[inline]
  pub fn sample(self, t: f64) -> [u8; 3] {
    sample_stops(self.stops(), t)
  }

  /**
   * Resolves the palette stop table. Hoisted out of the per-pixel loop by
   * `render_into` so the match runs once per frame instead of once per
   * pixel.
   */
  #[inline]
  fn stops(self) -> &'static [[u8; 3]] {
    match self {
      Palette::Fire => &FIRE_STOPS,
      Palette::Ice => &ICE_STOPS,
      Palette::Mono => &MONO_STOPS,
      Palette::Viridis => &VIRIDIS_STOPS,
    }
  }
}

/**
 * Interpolates one channel between two stops.
 *
 * `(x + 0.5) as u8` instead of `x.round() as u8`: `round` compiles to a
 * `round` libcall per channel on `wasm32-unknown-unknown` (three per pixel),
 * while add-plus-saturating-convert stays inline. Bit-identical here: inputs
 * are always in `[0, 255]`, where round-half-up (what `round` does for
 * non-negative values) equals truncation of `x + 0.5`, and `255.5`
 * saturates back to `255`.
 */
#[inline]
fn lerp_u8(from: u8, to: u8, frac: f64) -> u8 {
  (f64::from(from) + (f64::from(to) - f64::from(from)) * frac + 0.5) as u8
}

/// Shared palette sampler used by both `Palette::sample` and the
/// match-hoisted fast loop in `render_into`, so both always agree.
#[inline]
fn sample_stops(stops: &[[u8; 3]], t: f64) -> [u8; 3] {
  let last = stops.len() - 1;
  let scaled = t.clamp(0.0, 1.0) * last as f64;
  let index = (scaled as usize).min(last - 1);
  let frac = scaled - index as f64;
  let start = stops[index];
  let end = stops[index + 1];
  [
    lerp_u8(start[0], end[0], frac),
    lerp_u8(start[1], end[1], frac),
    lerp_u8(start[2], end[2], frac),
  ]
}

const FIRE_STOPS: [[u8; 3]; 5] = [
  [8, 6, 18],
  [122, 15, 20],
  [232, 92, 22],
  [255, 205, 70],
  [255, 252, 224],
];

const ICE_STOPS: [[u8; 3]; 5] = [
  [6, 8, 20],
  [18, 60, 130],
  [40, 150, 210],
  [140, 225, 245],
  [245, 252, 255],
];

const MONO_STOPS: [[u8; 3]; 4] = [
  [10, 10, 12],
  [90, 90, 96],
  [180, 180, 188],
  [245, 245, 248],
];

/// Approximation of the matplotlib `viridis` colormap.
const VIRIDIS_STOPS: [[u8; 3]; 5] = [
  [68, 1, 84],
  [59, 82, 139],
  [33, 145, 140],
  [94, 201, 98],
  [253, 231, 37],
];

/// Viewport description for a Mandelbrot render.
pub struct FractalParams {
  pub width: u32,
  pub height: u32,
  pub center_x: f64,
  pub center_y: f64,
  /// Vertical half-span of the view, in complex-plane units. The horizontal
  /// span is derived from the aspect ratio so pixels stay square.
  pub scale: f64,
  pub max_iter: u32,
  pub palette: Palette,
}

/// Renders the Mandelbrot set into `buf` as packed RGBA8 bytes
/// (`buf.len() == width * height * 4`).
#[inline]
fn frame_len(width: u32, height: u32) -> usize {
  (width as usize)
    .checked_mul(height as usize)
    .and_then(|pixels| pixels.checked_mul(4))
    .expect("fractal frame dimensions exceed addressable memory")
}

pub fn render_into(buf: &mut [u8], params: &FractalParams) {
  let width = params.width as usize;
  let height = params.height as usize;
  assert_eq!(buf.len(), frame_len(params.width, params.height));

  let half_h = params.scale;
  let half_w = half_h * (params.width as f64 / params.height as f64);
  let left = params.center_x - half_w;
  let top = params.center_y - half_h;
  let step_x = (2.0 * half_w) / params.width as f64;
  let step_y = (2.0 * half_h) / params.height as f64;
  let max_iter = params.max_iter;
  let max_iter_f = max_iter as f64;
  let interior = [8_u8, 10, 22];
  // Viewport-independent: resolve once per frame, not once per pixel.
  let stops = params.palette.stops();

  /* Raw destination pointer: `offset` stays within `buf` by construction
   * (`py < height`, `px < width`, four bytes per pixel), so these unchecked
   * stores are safe and skip four bounds checks per pixel that LLVM cannot
   * otherwise elide. The borrow on `buf` ends here; nothing else aliases it
   * during the loop. */
  let dst = buf.as_mut_ptr();

  for py in 0..height {
    let ci = top + (py as f64 + 0.5) * step_y;
    let mut offset = py * width * 4;

    for px in 0..width {
      let cr = left + (px as f64 + 0.5) * step_x;
      let (iterations, magsq) = escape_time(cr, ci, max_iter);

      // SAFETY: `offset + 3 < buf.len()` by the loop bounds above.
      unsafe {
        if iterations >= max_iter {
          *dst.add(offset) = interior[0];
          *dst.add(offset + 1) = interior[1];
          *dst.add(offset + 2) = interior[2];
        } else {
          // Smooth coloring: fractional iteration count derived from the
          // escape modulus removes visible color banding between iteration
          // levels. Every float op mirrors the JS baseline (`sqrt`, `ln`,
          // `/ max_iter_f`, `/ LN_2`) bit-for-bit, so both engines emit
          // identical bytes by construction — no statistical argument needed.
          let modulus = magsq.sqrt();
          let smooth = f64::from(iterations) + 1.0 - modulus.ln().ln() / std::f64::consts::LN_2;
          let [r, g, b] = sample_stops(stops, smooth / max_iter_f);
          *dst.add(offset) = r;
          *dst.add(offset + 1) = g;
          *dst.add(offset + 2) = b;
        }

        *dst.add(offset + 3) = 255;
      }
      offset += 4;
    }
  }
}

/// Iterates `z = z² + c` until `|z|² > 4` or `max_iter` is reached. Returns the
/// iteration count and `|z|²` at escape. Callers take `sqrt` only on the
/// escaped path, so interior pixels pay for no transcendental work; the
/// escaped path then applies the exact same operations as the JS baseline.
#[inline]
fn escape_time(cr: f64, ci: f64, max_iter: u32) -> (u32, f64) {
  let mut zr = 0.0_f64;
  let mut zi = 0.0_f64;
  let mut zr2 = 0.0_f64;
  let mut zi2 = 0.0_f64;
  let mut iterations = 0_u32;

  while iterations < max_iter && zr2 + zi2 <= 4.0 {
    zi = 2.0 * zr * zi + ci;
    zr = zr2 - zi2 + cr;
    zr2 = zr * zr;
    zi2 = zi * zi;
    iterations += 1;
  }

  (iterations, zr2 + zi2)
}

/// Renders the Mandelbrot set and returns packed RGBA8 bytes for the browser.
/// This is the export consumed by `packages/frontend/app/rust-lab-wasm`.
#[wasm_bindgen]
pub fn render(
  width: u32,
  height: u32,
  center_x: f64,
  center_y: f64,
  scale: f64,
  max_iter: u32,
  palette: &str,
) -> Vec<u8> {
  let mut buf = vec![0_u8; frame_len(width, height)];
  render_into(
    &mut buf,
    &FractalParams {
      width,
      height,
      center_x,
      center_y,
      scale,
      max_iter,
      palette: Palette::parse(palette),
    },
  );
  buf
}

/**
 * Persistent output buffer reused across frames by `render_fast`.
 *
 * The legacy `render` export allocates (`vec![0; len]`, a full 2MB memset)
 * and copies (wasm-bindgen `.slice()` plus a second `Uint8ClampedArray`
 * copy in JS) on every frame. Reusing one buffer removes the per-frame
 * allocation and both copies: JS reads the pixels through a zero-copy view
 * of the WASM linear memory instead. Single-threaded WASM never contends
 * on the lock; it only pins the `static` behind a safe API.
 */
static OUTPUT: Mutex<Vec<u8>> = Mutex::new(Vec::new());

/**
 * Renders the Mandelbrot set into the persistent output buffer and returns
 * its pointer. Read the pixels synchronously via `wasm_memory()` before the
 * next call reuses the buffer:
 *
 * ```js
 * const ptr = mod.render_fast(w, h, cx, cy, scale, iter, paletteId);
 * const pixels = new Uint8ClampedArray(mod.wasm_memory().buffer, ptr, w * h * 4);
 * ```
 *
 * `palette` is the numeric id from `Palette::from_u8`, so no string crosses
 * the boundary. Pixel output is identical to `render` for the same inputs.
 */
#[wasm_bindgen]
pub fn render_fast(
  width: u32,
  height: u32,
  center_x: f64,
  center_y: f64,
  scale: f64,
  max_iter: u32,
  palette: u8,
) -> *const u8 {
  let len = frame_len(width, height);
  let mut out = OUTPUT.lock().unwrap();
  // `resize` only zeroes fresh tail bytes on growth; the kernel overwrites
  // every byte below, so steady-state frames allocate nothing.
  out.resize(len, 0);
  render_into(
    &mut out,
    &FractalParams {
      width,
      height,
      center_x,
      center_y,
      scale,
      max_iter,
      palette: Palette::from_u8(palette),
    },
  );
  out.as_ptr()
}

/**
 * Exposes the WASM linear memory so JS can wrap `render_fast` output in a
 * zero-copy typed-array view. Re-fetch `.buffer` on every frame: it detaches
 * whenever the memory grows.
 */
#[wasm_bindgen]
pub fn wasm_memory() -> wasm_bindgen::JsValue {
  wasm_bindgen::memory()
}
