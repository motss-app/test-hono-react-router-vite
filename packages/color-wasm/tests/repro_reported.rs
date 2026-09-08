use color_wasm::dominant_color;
use image::{ImageReader, RgbImage};
use std::io::Cursor;

fn build_receipt_rgb(width: u32, height: u32) -> RgbImage {
  // Layout mirrors the reported receipt: white card band on top (~31%),
  // red gradient background below (~69%) with CIMB-style darker reds.
  let mut img = RgbImage::new(width, height);
  let card_h = height * 31 / 100;
  for y in 0..height {
    for x in 0..width {
      let px = if y < card_h {
        [254, 254, 254]
      } else {
        // Vertical red gradient with slight horizontal variation,
        // like the photographed background shapes.
        let t = f64::from(y - card_h) / f64::from(height - card_h);
        let wobble = ((f64::from(x) * 0.05).sin() * 8.0) as i16;
        let r = (200.0 + t * 30.0) as i16 + wobble / 4;
        let g = (18.0 + t * 14.0) as i16 + wobble / 8;
        let b = (22.0 + t * 12.0) as i16;
        [
          r.clamp(0, 255) as u8,
          g.clamp(0, 255) as u8,
          b.clamp(0, 255) as u8,
        ]
      };
      img.put_pixel(x, y, image::Rgb(px));
    }
  }
  img
}

fn jpeg_bytes(img: &RgbImage) -> Vec<u8> {
  let mut buf = Vec::new();
  let mut enc = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut buf, 90);
  enc.encode_image(img).expect("jpeg encode");
  buf
}

fn decode_rgba(bytes: &[u8]) -> (Vec<u8>, u32, u32) {
  // Same decode path shape as packages/color-rust: bytes -> DynamicImage -> RGBA.
  let dyn_img = ImageReader::new(Cursor::new(bytes))
    .with_guessed_format()
    .expect("guess")
    .decode()
    .expect("decode");
  let (w, h) = (dyn_img.width(), dyn_img.height());
  (dyn_img.into_rgba8().into_raw(), w, h)
}

#[test]
fn repro_reported_receipt_ratio() {
  // Mimic reported JPEG: 1260x2800 = 3528000 px, white card 1094934 (31%),
  // red background 2433066 (69%) split across gradient shades.
  // Scaled 100x: 31 white + 69 red shades.
  let mut px: Vec<u8> = Vec::with_capacity(100 * 4);
  for _ in 0..31 {
    px.extend_from_slice(&[254, 254, 254, 255]);
  }
  for _ in 0..23 {
    px.extend_from_slice(&[200, 20, 20, 255]);
  }
  for _ in 0..23 {
    px.extend_from_slice(&[220, 30, 30, 255]);
  }
  for _ in 0..23 {
    px.extend_from_slice(&[180, 10, 10, 255]);
  }
  let out = dominant_color(&px, 10, 10).expect("dominant");
  println!(
    "REPRO hex={} rgba=({},{},{}) pixel_count={} coverage={:.3}",
    out.hex, out.rgba.r, out.rgba.g, out.rgba.b, out.pixel_count, out.coverage
  );
  // Old single-cluster vote picked #FEFEFE white here. Fixed family vote must pick red.
  assert!(out.rgba.r > 150, "expected red family, got {}", out.hex);
  assert!(out.rgba.g < 80, "expected red family, got {}", out.hex);
  assert_eq!(out.pixel_count, 69);
}

#[test]
fn repro_reported_receipt_jpeg_roundtrip() {
  // End to end through real JPEG bytes: encode a receipt-like
  // 126x280 image (same 31/69 split as the reported 1260x2800),
  // decode it exactly like the worker, then run dominant_color.
  let rgb = build_receipt_rgb(126, 280);
  let bytes = jpeg_bytes(&rgb);
  let (rgba, w, h) = decode_rgba(&bytes);
  let out = dominant_color(&rgba, w, h).expect("dominant");
  println!(
    "JPEG hex={} rgba=({},{},{}) pixels={} {}x{} bytes={}",
    out.hex,
    out.rgba.r,
    out.rgba.g,
    out.rgba.b,
    out.pixel_count,
    w,
    h,
    bytes.len()
  );
  // The reported bug returned #FEFEFE white. Fixed code must return the red family.
  assert!(out.rgba.r > 150, "expected red family, got {}", out.hex);
  assert!(out.rgba.g < 80, "expected red family, got {}", out.hex);
  assert!(out.rgba.b < 80, "expected red family, got {}", out.hex);
}
