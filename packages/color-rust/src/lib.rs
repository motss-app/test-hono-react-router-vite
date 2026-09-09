//! Dominant-color Cloudflare Worker for the Rust Lab pages.
//!
//! This Worker isolates image decoding and color analysis from fractal
//! rendering, so AVIF and JPEG XL decoder code is loaded only for color jobs.

use color_wasm::dominant_color;
use image::ImageReader;
use std::io::Cursor;
use worker::*;

const MAX_UPLOAD_BYTES: usize = 32 * 1024 * 1024;
const MAX_PIXELS: u64 = 3840 * 2160;
const MAX_DIMENSION: u32 = 3840;

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
  match req.path().as_str() {
    "/color/dominant" => handle_dominant_color(req).await,
    _ => Response::error("Not Found", 404),
  }
}

async fn handle_dominant_color(mut req: Request) -> Result<Response> {
  let bytes = req.bytes().await?;
  if bytes.len() > MAX_UPLOAD_BYTES {
    return Response::error("Image exceeds the 32 MB upload limit", 413);
  }

  let started = js_sys::Date::now();
  let format = detect_format(&bytes);
  let image = match decode_image(&bytes) {
    Ok(image) => image,
    Err(_) => return Response::error("Unsupported or invalid image format", 415),
  };
  let (width, height) = (image.width(), image.height());
  if width > MAX_DIMENSION
    || height > MAX_DIMENSION
    || u64::from(width) * u64::from(height) > MAX_PIXELS
  {
    return Response::error("Image dimensions exceed the 4K limit", 413);
  }

  // Consume the decoded image to avoid retaining a second 4K RGBA buffer.
  let rgba = image.into_rgba8();
  let color = match dominant_color(&rgba, width, height) {
    Ok(color) => color,
    Err(message) => return Response::error(message, 422),
  };
  /*
   * Cloudflare freezes runtime clocks during CPU-only execution in deployed
   * Workers, so a zero delta is unavailable timing rather than zero work.
   */
  let decode_ms = available_elapsed_ms(started, js_sys::Date::now());
  let timing_available = decode_ms.is_some();
  let mut response =
    serde_json::to_value(color).map_err(|_| Error::from("JSON serialization failed"))?;
  if let Some(object) = response.as_object_mut() {
    object.insert("width".to_string(), serde_json::json!(width));
    object.insert("height".to_string(), serde_json::json!(height));
    object.insert("format".to_string(), serde_json::json!(format));
    object.insert("decode_ms".to_string(), serde_json::json!(decode_ms));
    object.insert(
      "decode_timing".to_string(),
      serde_json::json!(if timing_available {
        "runtime-clock"
      } else {
        "unavailable"
      }),
    );
    object.insert(
      "engine".to_string(),
      serde_json::json!("Rust WASM at the edge"),
    );
  }
  let response = Response::from_json(&response)?;
  response.headers().set("cache-control", "no-store")?;
  Ok(response)
}

fn available_elapsed_ms(started: f64, ended: f64) -> Option<f64> {
  let elapsed = ended - started;
  (elapsed > 0.0).then_some(elapsed)
}

fn detect_format(bytes: &[u8]) -> String {
  if is_avif(bytes) {
    return "avif".to_string();
  }
  if is_jxl(bytes) {
    return "jxl".to_string();
  }
  image::guess_format(bytes)
    .map(format_extension)
    .unwrap_or_else(|_| "unknown".to_string())
}

fn format_extension(format: image::ImageFormat) -> String {
  match format {
    image::ImageFormat::Bmp => "bmp",
    image::ImageFormat::Gif => "gif",
    image::ImageFormat::Jpeg => "jpeg",
    image::ImageFormat::Png => "png",
    image::ImageFormat::Tiff => "tiff",
    image::ImageFormat::WebP => "webp",
    _ => "unknown",
  }
  .to_string()
}

fn is_avif(bytes: &[u8]) -> bool {
  if bytes.get(4..8) != Some(b"ftyp") {
    return false;
  }
  bytes
    .get(8..)
    .unwrap_or_default()
    .chunks_exact(4)
    .any(|brand| brand == b"avif" || brand == b"avis")
}

fn is_jxl(bytes: &[u8]) -> bool {
  bytes.starts_with(&[0xff, 0x0a]) || bytes.get(4..12) == Some(b"JXL \x0d\x0a\x87\x0a")
}

#[cfg(test)]
mod tests {
  use super::available_elapsed_ms;

  #[test]
  fn zero_delta_is_unavailable() {
    assert_eq!(available_elapsed_ms(42.0, 42.0), None);
  }

  #[test]
  fn positive_delta_is_preserved() {
    assert_eq!(available_elapsed_ms(42.0, 54.5), Some(12.5));
  }
}

fn decode_image(bytes: &[u8]) -> std::result::Result<image::DynamicImage, ()> {
  if is_avif(bytes) {
    use zenpixels_convert::PixelBufferConvertTypedExt;

    let decoded = zenavif::decode(bytes).map_err(|_| ())?;
    let rgba = decoded.to_rgba8();
    let width = rgba.width();
    let height = rgba.height();
    let pixels = rgba.copy_to_contiguous_bytes();
    let image = image::RgbaImage::from_raw(width, height, pixels).ok_or(())?;
    return Ok(image::DynamicImage::ImageRgba8(image));
  }

  if is_jxl(bytes) {
    let decoder = jxl_oxide::integration::JxlDecoder::new(Cursor::new(bytes)).map_err(|_| ())?;
    return image::DynamicImage::from_decoder(decoder).map_err(|_| ());
  }

  ImageReader::new(Cursor::new(bytes))
    .with_guessed_format()
    .map_err(|_| ())?
    .decode()
    .map_err(|_| ())
}
