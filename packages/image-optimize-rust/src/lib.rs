//! Image optimization Cloudflare Worker for the Labs pages.
//!
//! Accepts an image upload, resizes it using the `image` crate's built-in
//! filters, and returns the result as base64-encoded PNG along with timing
//! and dimension metadata.

use image::ImageReader;
use std::io::Cursor;
use wasm_bindgen::prelude::wasm_bindgen;
use worker::*;

const MAX_UPLOAD_BYTES: usize = 32 * 1024 * 1024;
const MAX_PIXELS: u64 = 3840 * 2160;
const MAX_DIMENSION: u32 = 3840;

#[wasm_bindgen]
extern "C" {
  #[wasm_bindgen(js_namespace = performance, js_name = now)]
  fn performance_now() -> f64;
}

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
  match req.path().as_str() {
    "/image-optimize/resize" => handle_resize(req).await,
    _ => Response::error("Not Found", 404),
  }
}

fn parse_filter(name: &str) -> image::imageops::FilterType {
  match name.to_ascii_lowercase().as_str() {
    "nearest" => image::imageops::FilterType::Nearest,
    "triangle" | "bilinear" => image::imageops::FilterType::Triangle,
    "catmullrom" | "bicubic" => image::imageops::FilterType::CatmullRom,
    "lanczos3" => image::imageops::FilterType::Lanczos3,
    _ => image::imageops::FilterType::Lanczos3,
  }
}

fn filter_name(filter: image::imageops::FilterType) -> &'static str {
  match filter {
    image::imageops::FilterType::Nearest => "nearest",
    image::imageops::FilterType::Triangle => "triangle",
    image::imageops::FilterType::CatmullRom => "catmullrom",
    image::imageops::FilterType::Lanczos3 => "lanczos3",
    _ => "unknown",
  }
}

async fn handle_resize(mut req: Request) -> Result<Response> {
  let url = req.url().map_err(|_| Error::from("Invalid URL"))?;
  let mut params = url.query_pairs();

  let target_width: u32 = params
    .find(|(key, _)| key == "width")
    .and_then(|(_, v)| v.parse().ok())
    .unwrap_or(0);
  let target_height: u32 = params
    .find(|(key, _)| key == "height")
    .and_then(|(_, v)| v.parse().ok())
    .unwrap_or(0);
  let filter_str: String = params
    .find(|(key, _)| key == "filter")
    .map(|(_, v)| v.into_owned())
    .unwrap_or_else(|| "lanczos3".to_string());

  if target_width == 0 && target_height == 0 {
    return Response::error("Provide at least one of width or height", 400);
  }
  if target_width > MAX_DIMENSION || target_height > MAX_DIMENSION {
    return Response::error("Target dimensions exceed the 4K limit", 400);
  }
  // Reject output pixel count for explicit two-dimension requests.
  // For single-axis resizes the output pixel count is checked after decoding
  // (see validate_output_pixels below).
  if target_width > 0 && target_height > 0 {
    let pixels = u64::from(target_width) * u64::from(target_height);
    if pixels > MAX_PIXELS {
      return Response::error("Output pixel count exceeds the 4K limit", 400);
    }
  }

  // Reject oversized uploads before reading the body. Chunked or missing
  // Content-Length is allowed through, but the read is capped below.
  if let Ok(Some(len)) = req.headers().get("content-length") {
    if let Ok(n) = len.parse::<u64>() {
      if n > MAX_UPLOAD_BYTES as u64 {
        return Response::error("Image exceeds the 32 MB upload limit", 413);
      }
    }
  }

  let bytes = req.bytes().await?;
  if bytes.len() > MAX_UPLOAD_BYTES {
    return Response::error("Image exceeds the 32 MB upload limit", 413);
  }

  let started = performance_now();
  let image = match ImageReader::new(Cursor::new(&bytes))
    .with_guessed_format()
    .map_err(|_| Error::from("Could not detect image format"))?
    .decode()
  {
    Ok(img) => img,
    Err(_) => return Response::error("Unsupported or invalid image format", 415),
  };

  let orig_width = image.width();
  let orig_height = image.height();
  if orig_width > MAX_DIMENSION
    || orig_height > MAX_DIMENSION
    || u64::from(orig_width) * u64::from(orig_height) > MAX_PIXELS
  {
    return Response::error("Image dimensions exceed the 4K limit", 413);
  }

  let filter = parse_filter(&filter_str);

  // For single-axis resizes, compute the derived dimension and validate the
  // output pixel count before allocating the resize buffer.
  let (effective_width, effective_height) = if target_width > 0 && target_height > 0 {
    (target_width, target_height)
  } else if target_width > 0 {
    let ratio = target_width as f64 / orig_width as f64;
    let derived_height = (orig_height as f64 * ratio).round() as u32;
    let pixels = u64::from(target_width) * u64::from(derived_height);
    if pixels > MAX_PIXELS {
      return Response::error("Output pixel count exceeds the 4K limit", 400);
    }
    (target_width, derived_height)
  } else {
    let ratio = target_height as f64 / orig_height as f64;
    let derived_width = (orig_width as f64 * ratio).round() as u32;
    let pixels = u64::from(derived_width) * u64::from(target_height);
    if pixels > MAX_PIXELS {
      return Response::error("Output pixel count exceeds the 4K limit", 400);
    }
    (derived_width, target_height)
  };

  let resize_start = performance_now();

  let resized = image.resize_exact(effective_width, effective_height, filter);

  let resize_ms = performance_now() - resize_start;
  let total_ms = performance_now() - started;

  let out_width = resized.width();
  let out_height = resized.height();

  let mut png_buf: Vec<u8> = Vec::new();
  resized
    .write_to(&mut Cursor::new(&mut png_buf), image::ImageFormat::Png)
    .map_err(|_| Error::from("PNG encoding failed"))?;

  let original_size = bytes.len();
  let output_size = png_buf.len();
  let ratio = if original_size > 0 {
    (1.0 - output_size as f64 / original_size as f64) * 100.0
  } else {
    0.0
  };

  use base64::Engine;
  let encoded = base64::engine::general_purpose::STANDARD.encode(&png_buf);

  let response = serde_json::json!({
    "original": {
      "width": orig_width,
      "height": orig_height,
      "bytes": original_size,
    },
    "resized": {
      "width": out_width,
      "height": out_height,
      "bytes": output_size,
    },
    "filter": filter_name(filter),
    "resize_ms": resize_ms,
    "total_ms": total_ms,
    "compression_ratio": format!("{:.1}%", ratio),
    "output_png_base64": encoded,
    "engine": "Rust image crate at the edge",
  });

  let resp = Response::from_json(&response)?;
  resp.headers().set("cache-control", "no-store")?;
  Ok(resp)
}
