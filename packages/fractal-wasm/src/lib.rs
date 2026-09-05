//! Shared Mandelbrot kernel for the Rust Lab page.
//!
//! One render implementation powers two runtimes:
//! - The browser: compiled to a WASM module (`build.sh` → `--target web`) and
//!   called from `packages/frontend` for interactive canvas rendering.
//! - The edge: linked into the `healthz-rust` Cloudflare Worker, which renders
//!   high-resolution PNGs server-side via the `/fractal/render` endpoint.

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
    let stops: &[[u8; 3]] = match self {
      Palette::Fire => &FIRE_STOPS,
      Palette::Ice => &ICE_STOPS,
      Palette::Mono => &MONO_STOPS,
      Palette::Viridis => &VIRIDIS_STOPS,
    };
    let last = stops.len() - 1;
    let scaled = t.clamp(0.0, 1.0) * last as f64;
    let index = (scaled as usize).min(last - 1);
    let frac = scaled - index as f64;
    let start = stops[index];
    let end = stops[index + 1];
    let lerp = |from: u8, to: u8| (f64::from(from) + (f64::from(to) - f64::from(from)) * frac).round() as u8;
    [
      lerp(start[0], end[0]),
      lerp(start[1], end[1]),
      lerp(start[2], end[2]),
    ]
  }
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
pub fn render_into(buf: &mut [u8], params: &FractalParams) {
  let width = params.width as usize;
  let height = params.height as usize;
  debug_assert_eq!(buf.len(), width * height * 4);

  let half_h = params.scale;
  let half_w = half_h * (params.width as f64 / params.height as f64);
  let left = params.center_x - half_w;
  let top = params.center_y - half_h;
  let step_x = (2.0 * half_w) / params.width as f64;
  let step_y = (2.0 * half_h) / params.height as f64;
  let max_iter = params.max_iter;
  let max_iter_f = max_iter as f64;
  let interior = [8_u8, 10, 22];

  for py in 0..height {
    let ci = top + (py as f64 + 0.5) * step_y;
    let mut offset = py * width * 4;

    for px in 0..width {
      let cr = left + (px as f64 + 0.5) * step_x;
      let (iterations, modulus) = escape_time(cr, ci, max_iter);

      let (r, g, b) = if iterations >= max_iter {
        (interior[0], interior[1], interior[2])
      } else {
        // Smooth coloring: fractional iteration count derived from the escape
        // modulus removes visible color banding between iteration levels.
        let smooth = f64::from(iterations) + 1.0 - modulus.ln().ln() / std::f64::consts::LN_2;
        let [r, g, b] = params.palette.sample(smooth / max_iter_f);
        (r, g, b)
      };

      buf[offset] = r;
      buf[offset + 1] = g;
      buf[offset + 2] = b;
      buf[offset + 3] = 255;
      offset += 4;
    }
  }
}

/// Iterates `z = z² + c` until `|z|² > 4` or `max_iter` is reached. Returns the
/// iteration count and `|z|` at escape for smooth coloring.
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

  (iterations, (zr2 + zi2).sqrt())
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
  let mut buf = vec![0_u8; width as usize * height as usize * 4];
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
