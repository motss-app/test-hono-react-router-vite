//! Fractal rendering Cloudflare Worker for the Rust Lab pages.
//!
//! Serves `/fractal/render`, which renders the Mandelbrot set server-side via
//! the shared kernel in `packages/fractal-wasm` and returns a PNG. The Rust
//! Lab page calls it through the gateway's `/api/rust/*` proxy.

use fractal_wasm::{render_into, FractalParams, Palette};
use serde::Deserialize;
use worker::*;

fn json_response(body: &serde_json::Value) -> Result<Response> {
  let resp = Response::from_json(body)?;
  resp.headers().set("cache-control", "no-store")?;
  Ok(resp)
}

/// Query parameters for `/fractal/render`. Every field has a default so a
/// bare request renders the full set; out-of-range values are clamped below.
#[derive(Deserialize)]
struct FractalQuery {
  #[serde(default = "default_center_x")]
  cx: f64,
  #[serde(default)]
  cy: f64,
  #[serde(default = "default_scale")]
  scale: f64,
  #[serde(default = "default_width")]
  width: u32,
  #[serde(default = "default_height")]
  height: u32,
  #[serde(default = "default_max_iter")]
  max_iter: u32,
  #[serde(default = "default_palette")]
  palette: String,
}

fn default_center_x() -> f64 {
  -0.7
}

fn default_scale() -> f64 {
  1.35
}

fn default_width() -> u32 {
  1920
}

fn default_height() -> u32 {
  1080
}

fn default_max_iter() -> u32 {
  256
}

fn default_palette() -> String {
  "fire".to_string()
}

/// Guards the CPU budget: a 2048×2048 render at 1000 iterations stays well
/// inside the Workers CPU limit while still producing a 4K-class image.
const MIN_SIZE: u32 = 64;
const MAX_SIZE: u32 = 2048;
const MIN_ITER: u32 = 16;
const MAX_ITER: u32 = 1000;

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
  match req.path().as_str() {
    "/healthz" => Response::ok("fractal rust ok"),
    "/fractal/render" => handle_fractal_render(req),
    _ => Response::error("Not Found", 404),
  }
}

/// Renders the Mandelbrot set server-side and returns a PNG. The wall-clock
/// render time is reported via `x-render-time-ms` so the Rust Lab page can
/// display how fast the edge worker is.
fn handle_fractal_render(req: Request) -> Result<Response> {
  let query = match req.query::<FractalQuery>() {
    Ok(query) => query,
    Err(_) => return Response::error("Invalid query parameters", 400),
  };

  let width = query.width.clamp(MIN_SIZE, MAX_SIZE);
  let height = query.height.clamp(MIN_SIZE, MAX_SIZE);
  let max_iter = query.max_iter.clamp(MIN_ITER, MAX_ITER);
  let scale = query.scale.clamp(1e-6, 4.0);
  let palette = Palette::parse(&query.palette);

  let started = js_sys::Date::now();

  let mut rgba = vec![0_u8; width as usize * height as usize * 4];
  render_into(
    &mut rgba,
    &FractalParams {
      width,
      height,
      center_x: query.cx,
      center_y: query.cy,
      scale,
      max_iter,
      palette,
    },
  );

  let mut png_bytes = Vec::with_capacity(256 * 1024);
  {
    let mut encoder = png::Encoder::new(&mut png_bytes, width, height);
    encoder.set_color(png::ColorType::Rgba);
    encoder.set_depth(png::BitDepth::Eight);
    let mut writer = encoder
      .write_header()
      .map_err(|_| worker::Error::from("PNG header encoding failed"))?;
    writer
      .write_image_data(&rgba)
      .map_err(|_| worker::Error::from("PNG body encoding failed"))?;
  }

  let elapsed_ms = js_sys::Date::now() - started;

  let resp = Response::from_bytes(png_bytes)?;
  resp.headers().set("content-type", "image/png")?;
  // Deterministic render for a given viewport: safe to cache at the edge.
  resp.headers().set("cache-control", "public, max-age=86400")?;
  resp.headers().set("x-render-time-ms", &format!("{elapsed_ms:.1}"))?;
  Ok(resp)
}
