use color_wasm::dominant_color;

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
