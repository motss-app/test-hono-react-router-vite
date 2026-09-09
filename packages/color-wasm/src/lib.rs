use serde::Serialize;
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Debug, Serialize)]
pub struct DominantColor {
  pub pixel_count: u64,
  pub coverage: f64,
  pub rgba: Rgba,
  pub hex: String,
  pub hsl: Hsl,
  pub hsv: Hsv,
  pub lab: Lab,
  pub lch: Lch,
  pub oklab: Oklab,
  pub oklch: Oklch,
  pub css: CssColor,
}

#[derive(Debug, Serialize)]
pub struct Rgba {
  pub r: u8,
  pub g: u8,
  pub b: u8,
  pub a: u8,
}
#[derive(Debug, Serialize)]
pub struct Hsl {
  pub h: f64,
  pub s: f64,
  pub l: f64,
}
#[derive(Debug, Serialize)]
pub struct Hsv {
  pub h: f64,
  pub s: f64,
  pub v: f64,
}
#[derive(Debug, Serialize)]
pub struct Lab {
  pub l: f64,
  pub a: f64,
  pub b: f64,
}
#[derive(Debug, Serialize)]
pub struct Lch {
  pub l: f64,
  pub c: f64,
  pub h: f64,
}
#[derive(Debug, Serialize)]
pub struct Oklab {
  pub l: f64,
  pub a: f64,
  pub b: f64,
}
#[derive(Debug, Serialize)]
pub struct Oklch {
  pub l: f64,
  pub c: f64,
  pub h: f64,
}
#[derive(Debug, Serialize)]
pub struct CssColor {
  pub srgb: String,
  pub color_4: String,
}

#[derive(Default, Clone, Copy)]
struct Bin {
  samples: u64,
  r: u64,
  g: u64,
  b: u64,
  a: u64,
}

#[derive(Default, Clone, Copy)]
struct ClusterStats {
  samples: u64,
  alpha_weight: u64,
  r: f64,
  g: f64,
  b: f64,
}

/*
 * Union-find root lookup for the post K-Means merge.
 * Path compression keeps the tiny cluster set flat.
 */
fn find_root(parent: &mut [usize], mut x: usize) -> usize {
  while parent[x] != x {
    parent[x] = parent[parent[x]];
    x = parent[x];
  }
  x
}

/*
 * Assign histogram bins to their nearest centroid and accumulate the
 * statistics needed by both K-Means updates and the final color result.
 * Iterating bins keeps the work bounded by the 32x32x32 histogram instead
 * of rescanning every image pixel for every centroid on every iteration.
 */
fn assign_bins(bins: &[Bin], centroids: &[[f64; 3]]) -> Vec<ClusterStats> {
  let mut clusters = vec![ClusterStats::default(); centroids.len()];
  for bin in bins.iter().filter(|bin| bin.a > 0) {
    let r = bin.r as f64 / bin.a as f64;
    let g = bin.g as f64 / bin.a as f64;
    let b = bin.b as f64 / bin.a as f64;
    let best = centroids
      .iter()
      .enumerate()
      .min_by(|(_, ca), (_, cb)| {
        let da = (ca[0] - r).powi(2) + (ca[1] - g).powi(2) + (ca[2] - b).powi(2);
        let db = (cb[0] - r).powi(2) + (cb[1] - g).powi(2) + (cb[2] - b).powi(2);
        da.partial_cmp(&db).unwrap_or(std::cmp::Ordering::Equal)
      })
      .map(|(i, _)| i)
      .unwrap();
    clusters[best].samples += bin.samples;
    clusters[best].alpha_weight += bin.a;
    clusters[best].r += bin.r as f64;
    clusters[best].g += bin.g as f64;
    clusters[best].b += bin.b as f64;
  }
  clusters
}

pub fn dominant_color(rgba: &[u8], width: u32, height: u32) -> Result<DominantColor, &'static str> {
  let expected = width as usize * height as usize * 4;
  if expected == 0 || rgba.len() != expected {
    return Err("invalid RGBA buffer");
  }

  /*
   * Phase 1: bin pixels into a 32x32x32 color histogram.
   * Each bin accumulates alpha-weighted channel sums.
   * This is a fast single-pass O(n) quantization that
   * gives us good initial centroids for K-Means.
   */
  let mut bins = vec![Bin::default(); 32 * 32 * 32];
  for px in rgba.chunks_exact(4) {
    let alpha = px[3];
    if alpha < 16 {
      continue;
    }
    let index = ((usize::from(px[0]) >> 3) * 1024)
      + ((usize::from(px[1]) >> 3) * 32)
      + (usize::from(px[2]) >> 3);
    let bin = &mut bins[index];
    bin.samples += 1;
    bin.r += u64::from(px[0]) * u64::from(alpha);
    bin.g += u64::from(px[1]) * u64::from(alpha);
    bin.b += u64::from(px[2]) * u64::from(alpha);
    bin.a += u64::from(alpha);
  }

  /*
   * Extract top centroids from the binning phase.
   * Sort by alpha-weighted count descending, take the top K.
   * Empty bins (alpha weight == 0) are skipped.
   */
  const K: usize = 8;
  const KMEANS_ITERS: usize = 5;
  let mut centroid_entries: Vec<(f64, f64, f64, u64)> = bins
    .iter()
    .filter(|bin| bin.a > 0)
    .map(|bin| {
      (
        bin.r as f64 / bin.a as f64,
        bin.g as f64 / bin.a as f64,
        bin.b as f64 / bin.a as f64,
        bin.a,
      )
    })
    .collect();
  centroid_entries.sort_by(|a, b| b.3.cmp(&a.3));
  centroid_entries.truncate(K);
  let mut centroids: Vec<[f64; 3]> = centroid_entries.iter().map(|c| [c.0, c.1, c.2]).collect();
  if centroids.is_empty() {
    return Err("no visible pixels");
  }

  /*
   * Phase 2: refine centroids with K-Means.
   * Each iteration assigns every non-empty histogram bin to
   * the nearest centroid, then recomputes centroids as the
   * alpha-weighted mean of their assigned pixels.
   * 5 iterations converge quickly from good bin seeds.
   */
  for _ in 0..KMEANS_ITERS {
    let clusters = assign_bins(&bins, &centroids);
    for (i, centroid) in centroids.iter_mut().enumerate() {
      if clusters[i].alpha_weight > 0 {
        let weight = clusters[i].alpha_weight as f64;
        centroid[0] = clusters[i].r / weight;
        centroid[1] = clusters[i].g / weight;
        centroid[2] = clusters[i].b / weight;
      }
    }
  }

  /*
   * Reassign bins after the last centroid update so the final family
   * statistics describe the final centroids rather than the previous
   * iteration's Voronoi regions.
   */
  let clusters = assign_bins(&bins, &centroids);

  /*
   * Final pass: merge nearby centroids into color families,
   * then pick the family with the greatest alpha weight.
   * K-Means splits gradients across seeds, so a divided
   * majority can lose to one tight minority cluster.
   * Union clusters within RGB distance 60 and vote by
   * family totals instead of single cluster counts.
   */
  const MERGE_DIST2: f64 = 60.0 * 60.0;
  let n = centroids.len();
  let mut parent: Vec<usize> = (0..n).collect();
  for i in 0..n {
    for j in (i + 1)..n {
      let d2 = (centroids[i][0] - centroids[j][0]).powi(2)
        + (centroids[i][1] - centroids[j][1]).powi(2)
        + (centroids[i][2] - centroids[j][2]).powi(2);
      if d2 <= MERGE_DIST2 {
        let ri = find_root(&mut parent, i);
        let rj = find_root(&mut parent, j);
        if ri != rj {
          parent[rj] = ri;
        }
      }
    }
  }
  let mut families = vec![ClusterStats::default(); n];
  for (i, cluster) in clusters.iter().enumerate() {
    let root = find_root(&mut parent, i);
    families[root].samples += cluster.samples;
    families[root].alpha_weight += cluster.alpha_weight;
    families[root].r += cluster.r;
    families[root].g += cluster.g;
    families[root].b += cluster.b;
  }
  let dominant_root = families
    .iter()
    .enumerate()
    .max_by_key(|(_, family)| family.alpha_weight)
    .map(|(i, _)| i)
    .ok_or("no visible pixels")?;
  let dominant = families[dominant_root];
  let alpha_weight = dominant.alpha_weight as f64;
  let r = (dominant.r / alpha_weight).round().clamp(0.0, 255.0) as u8;
  let g = (dominant.g / alpha_weight).round().clamp(0.0, 255.0) as u8;
  let b = (dominant.b / alpha_weight).round().clamp(0.0, 255.0) as u8;
  let a = (dominant.alpha_weight as f64 / dominant.samples as f64)
    .round()
    .clamp(0.0, 255.0) as u8;
  let (hsl, hsv) = rgb_hsl_hsv(r, g, b);
  let lab = rgb_lab(r, g, b);
  let lch = Lch {
    l: lab.l,
    c: (lab.a * lab.a + lab.b * lab.b).sqrt(),
    h: lab.b.atan2(lab.a).to_degrees().rem_euclid(360.0),
  };
  let oklab = rgb_oklab(r, g, b);
  let oklch = Oklch {
    l: oklab.l,
    c: (oklab.a * oklab.a + oklab.b * oklab.b).sqrt(),
    h: oklab.b.atan2(oklab.a).to_degrees().rem_euclid(360.0),
  };
  Ok(DominantColor {
    pixel_count: dominant.samples,
    coverage: (dominant.alpha_weight as f64 / (expected as f64 / 4.0 * 255.0)).min(1.0),
    rgba: Rgba { r, g, b, a },
    hex: format!("#{r:02X}{g:02X}{b:02X}"),
    hsl,
    hsv,
    lab,
    lch,
    oklab,
    oklch,
    css: CssColor {
      srgb: format!("rgb({r} {g} {b} / {:.3})", f64::from(a) / 255.0),
      color_4: format!(
        "color(srgb {:.5} {:.5} {:.5} / {:.5})",
        f64::from(r) / 255.0,
        f64::from(g) / 255.0,
        f64::from(b) / 255.0,
        f64::from(a) / 255.0
      ),
    },
  })
}

fn rgb_hsl_hsv(r: u8, g: u8, b: u8) -> (Hsl, Hsv) {
  let (r, g, b) = (
    f64::from(r) / 255.0,
    f64::from(g) / 255.0,
    f64::from(b) / 255.0,
  );
  let max = r.max(g).max(b);
  let min = r.min(g).min(b);
  let d = max - min;
  let h = if d == 0.0 {
    0.0
  } else if max == r {
    60.0 * ((g - b) / d).rem_euclid(6.0)
  } else if max == g {
    60.0 * ((b - r) / d + 2.0)
  } else {
    60.0 * ((r - g) / d + 4.0)
  };
  let l = (max + min) / 2.0;
  (
    Hsl {
      h,
      s: if d == 0.0 {
        0.0
      } else {
        d / (1.0 - (2.0 * l - 1.0).abs())
      },
      l,
    },
    Hsv {
      h,
      s: if max == 0.0 { 0.0 } else { d / max },
      v: max,
    },
  )
}

fn rgb_lab(r: u8, g: u8, b: u8) -> Lab {
  let [r, g, b] = [r, g, b].map(|v| {
    let x = f64::from(v) / 255.0;
    if x <= 0.04045 {
      x / 12.92
    } else {
      ((x + 0.055) / 1.055).powf(2.4)
    }
  });
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  let y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  let f = |v: f64| {
    if v > 0.008856 {
      v.powf(1.0 / 3.0)
    } else {
      7.787 * v + 16.0 / 116.0
    }
  };
  let (x, y, z) = (f(x), f(y), f(z));
  Lab {
    l: 116.0 * y - 16.0,
    a: 500.0 * (x - y),
    b: 200.0 * (y - z),
  }
}

fn rgb_oklab(r: u8, g: u8, b: u8) -> Oklab {
  let [r, g, b] = [r, g, b].map(|v| {
    let x = f64::from(v) / 255.0;
    if x > 0.04045 {
      ((x + 0.055) / 1.055).powf(2.4)
    } else {
      x / 12.92
    }
  });
  let l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b).cbrt();
  let m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b).cbrt();
  let s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b).cbrt();
  Oklab {
    l: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  }
}

#[wasm_bindgen]
pub fn dominant_color_json(rgba: &[u8], width: u32, height: u32) -> String {
  serde_json::to_string(&dominant_color(rgba, width, height))
    .unwrap_or_else(|_| "{\"error\":\"serialization failed\"}".to_string())
}

#[cfg(test)]
mod tests {
  use super::*;

  fn push_alpha(px: &mut Vec<u8>, r: u8, g: u8, b: u8, a: u8, n: usize) {
    for _ in 0..n {
      px.extend_from_slice(&[r, g, b, a]);
    }
  }

  fn push(px: &mut Vec<u8>, r: u8, g: u8, b: u8, n: usize) {
    push_alpha(px, r, g, b, 255, n);
  }

  /*
   * Regression: a divided red majority (69%) split across
   * gradient shades must beat one tight white minority (31%).
   * Old single-cluster vote picked white.
   */
  #[test]
  fn split_majority_beats_tight_minority() {
    let mut px = Vec::with_capacity(10 * 10 * 4);
    push(&mut px, 254, 254, 254, 31);
    push(&mut px, 200, 20, 20, 23);
    push(&mut px, 220, 30, 30, 23);
    push(&mut px, 180, 10, 10, 23);
    let out = dominant_color(&px, 10, 10).expect("dominant");
    assert_eq!(out.pixel_count, 69);
    assert!(out.rgba.r > 150, "red channel {}", out.rgba.r);
    assert!(out.rgba.g < 80, "green channel {}", out.rgba.g);
    assert!(out.rgba.b < 80, "blue channel {}", out.rgba.b);
  }

  /*
   * Alpha-weighted selection must prefer fewer opaque pixels over more
   * nearly transparent pixels, and alpha and coverage must describe the
   * selected family rather than the whole image.
   */
  #[test]
  fn alpha_weighted_family_metrics_use_selected_family() {
    let mut px = Vec::with_capacity(30 * 4);
    push_alpha(&mut px, 20, 20, 220, 16, 20);
    push_alpha(&mut px, 220, 20, 20, 255, 10);
    let out = dominant_color(&px, 30, 1).expect("dominant");
    assert_eq!(out.pixel_count, 10);
    assert_eq!(out.rgba.r, 220);
    assert_eq!(out.rgba.g, 20);
    assert_eq!(out.rgba.b, 20);
    assert_eq!(out.rgba.a, 255);
    let expected_coverage = 2550.0 / (30.0 * 255.0);
    assert!((out.coverage - expected_coverage).abs() < f64::EPSILON);
  }

  /*
   * Nearby clusters must be merged using their accumulated alpha weight,
   * not their raw sample count, when producing the family color.
   */
  #[test]
  fn merged_family_uses_alpha_weighted_color() {
    let mut px = Vec::with_capacity(110 * 4);
    push_alpha(&mut px, 150, 0, 0, 16, 100);
    push_alpha(&mut px, 200, 0, 0, 255, 10);
    let out = dominant_color(&px, 110, 1).expect("dominant");
    assert_eq!(out.pixel_count, 110);
    assert_eq!(out.rgba.r, 181);
    assert_eq!(out.rgba.a, 38);
  }
}
