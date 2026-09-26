/*!
 * Image optimization Cloudflare Worker for the Labs pages.
 *
 * Accepts an image upload, resizes it with the `image` crate's filters, and
 * returns the encoded output image with dimension and format metadata headers.
 */

use image::{DynamicImage, ImageBuffer, ImageReader, Rgba};
use std::{borrow::Cow, collections::HashMap, io::Cursor};
use worker::*;

const MAX_UPLOAD_BYTES: usize = 32 * 1024 * 1024;
const MAX_PIXELS: u64 = 3840 * 2160;
const MAX_DIMENSION: u32 = 3840;
const DEFAULT_QUALITY: u8 = 85;
const FIT_SCALE_DOWN: &str = "scale-down";

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum OutputFormat {
    Avif,
    Jpeg,
    Png,
    Webp,
}

impl OutputFormat {
    fn parse(value: &str, accept: Option<&str>) -> Option<Self> {
        match value.to_ascii_lowercase().as_str() {
            "auto" => Some(Self::from_accept(accept)),
            "avif" => Some(Self::Avif),
            "jpeg" | "jpg" => Some(Self::Jpeg),
            "png" => Some(Self::Png),
            "webp" => Some(Self::Webp),
            _ => None,
        }
    }

    fn from_accept(accept: Option<&str>) -> Self {
        let accept = accept.unwrap_or_default().to_ascii_lowercase();
        if accept.contains("image/avif") {
            Self::Avif
        } else if accept.contains("image/webp") {
            Self::Webp
        } else if accept.contains("image/jpeg") {
            Self::Jpeg
        } else {
            Self::Png
        }
    }

    fn content_type(self) -> &'static str {
        match self {
            Self::Avif => "image/avif",
            Self::Jpeg => "image/jpeg",
            Self::Png => "image/png",
            Self::Webp => "image/webp",
        }
    }

    fn name(self) -> &'static str {
        match self {
            Self::Avif => "avif",
            Self::Jpeg => "jpeg",
            Self::Png => "png",
            Self::Webp => "webp",
        }
    }
}

#[event(fetch)]
pub async fn main(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    match req.path().as_str() {
        "/image-optimize/resize" => handle_resize(req).await,
        _ => Response::error("Not Found", 404),
    }
}

/**
 * Resize an RGBA image using premultiplied alpha.
 *
 * The `image` crate's `resize()` interpolates all channels uniformly,
 * including alpha. At the boundary between opaque and transparent pixels,
 * this creates semi-transparent fringe with incorrect colors because RGB
 * values bleed through transparent regions. Cloudflare avoids this by
 * using premultiplied alpha internally.
 *
 * This function: (1) premultiplies RGB by alpha, (2) resizes all 4
 * channels with the requested filter, (3) unpremultiplies the result.
 * The interpolation now happens on correctly weighted color values,
 * eliminating color bleed at transparent edges.
 *
 * The source is consumed: `into_rgba8()` drops a high-depth (16-bit)
 * frame as soon as the 8-bit copy exists, so the source never
 * coexists with the two RGBA8 working buffers below. A borrowed
 * source plus both frames is 126.6 MiB for a 4K RGBA16 input, which
 * is over the Cloudflare Worker's 128 MB isolate limit.
 */
fn resize_premul(
    image: DynamicImage,
    out_w: u32,
    out_h: u32,
    filter: image::imageops::FilterType,
) -> DynamicImage {
    let rgba = image.into_rgba8();
    let (w, h) = (rgba.width(), rgba.height());

    /* Premultiply: store RGB * (alpha / 255). */
    let mut buf = ImageBuffer::new(w, h);
    for (src, dst) in rgba.pixels().zip(buf.pixels_mut()) {
        let a = src[3] as f64 / 255.0;
        *dst = Rgba([
            (src[0] as f64 * a).round() as u8,
            (src[1] as f64 * a).round() as u8,
            (src[2] as f64 * a).round() as u8,
            src[3],
        ]);
    }
    drop(rgba);

    /* Resize the premultiplied image. */
    let resized = image::imageops::resize(&buf, out_w, out_h, filter);
    drop(buf);

    /* Unpremultiply: restore RGB from premultiplied values. */
    let mut out = ImageBuffer::new(out_w, out_h);
    for (src, dst) in resized.pixels().zip(out.pixels_mut()) {
        let a = src[3] as f64;
        if a > 0.0 {
            let inv = 255.0 / a;
            *dst = Rgba([
                (src[0] as f64 * inv).min(255.0).round() as u8,
                (src[1] as f64 * inv).min(255.0).round() as u8,
                (src[2] as f64 * inv).min(255.0).round() as u8,
                src[3],
            ]);
        } else {
            *dst = Rgba([0, 0, 0, 0]);
        }
    }
    DynamicImage::ImageRgba8(out)
}

/**
 * Composite an RGBA image onto a white background.
 *
 * Used before JPEG encoding because JPEG cannot represent alpha.
 * Transparent pixels in our resize pipeline carry RGB=(0,0,0); letting the
 * encoder drop alpha would paint them black and bleed a dark halo into
 * semi-transparent edge pixels. Cloudflare Images flattens the same source
 * onto white, so this keeps our JPEG output visually consistent with it.
 */
fn flatten_on_white(image: &DynamicImage) -> DynamicImage {
    let rgba = image.to_rgba8();
    let mut out = ImageBuffer::new(rgba.width(), rgba.height());
    for (src, dst) in rgba.pixels().zip(out.pixels_mut()) {
        let a = src[3] as f64 / 255.0;
        *dst = Rgba([
            (src[0] as f64 * a + 255.0 * (1.0 - a)).round() as u8,
            (src[1] as f64 * a + 255.0 * (1.0 - a)).round() as u8,
            (src[2] as f64 * a + 255.0 * (1.0 - a)).round() as u8,
            255,
        ]);
    }
    DynamicImage::ImageRgba8(out)
}

fn parse_filter(name: &str) -> Option<image::imageops::FilterType> {
    match name.to_ascii_lowercase().as_str() {
        "nearest" => Some(image::imageops::FilterType::Nearest),
        "triangle" | "bilinear" => Some(image::imageops::FilterType::Triangle),
        "catmullrom" | "bicubic" => Some(image::imageops::FilterType::CatmullRom),
        "lanczos3" => Some(image::imageops::FilterType::Lanczos3),
        _ => None,
    }
}

/**
 * Compute output dimensions that fit within a bounding box while preserving
 * aspect ratio and never upscaling the source image.
 */
fn resize_dimensions(orig_w: u32, orig_h: u32, max_w: u32, max_h: u32) -> (u32, u32) {
    if max_w > 0 && max_h > 0 {
        let scale = (max_w as f64 / orig_w as f64)
            .min(max_h as f64 / orig_h as f64)
            .min(1.0);
        let w = (orig_w as f64 * scale).round() as u32;
        let h = (orig_h as f64 * scale).round() as u32;
        (w.max(1), h.max(1))
    } else if max_w > 0 {
        let scale = (max_w as f64 / orig_w as f64).min(1.0);
        let w = (orig_w as f64 * scale).round() as u32;
        let h = (orig_h as f64 * scale).round() as u32;
        (w.max(1), h.max(1))
    } else {
        let scale = (max_h as f64 / orig_h as f64).min(1.0);
        let w = (orig_w as f64 * scale).round() as u32;
        let h = (orig_h as f64 * scale).round() as u32;
        (w.max(1), h.max(1))
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

fn query_value<'a>(
    query: &'a HashMap<String, String>,
    short: &str,
    long: &str,
) -> Result<Option<&'a str>, &'static str> {
    match (query.get(short), query.get(long)) {
        (Some(short_value), Some(long_value)) if short_value != long_value => {
            Err("Conflicting query aliases")
        }
        (Some(short_value), _) => Ok(Some(short_value)),
        (_, Some(long_value)) => Ok(Some(long_value)),
        (None, None) => Ok(None),
    }
}

fn parse_dimension(
    query: &HashMap<String, String>,
    short: &str,
    long: &str,
) -> Result<u32, &'static str> {
    let Some(value) = query_value(query, short, long)? else {
        return Ok(0);
    };
    let parsed = value
        .parse::<u32>()
        .map_err(|_| "Dimensions must be positive integers")?;
    if parsed == 0 {
        return Err("Dimensions must be positive integers");
    }
    Ok(parsed)
}

fn parse_quality(query: &HashMap<String, String>) -> Result<(u8, bool), &'static str> {
    let Some(value) = query_value(query, "q", "quality")? else {
        return Ok((DEFAULT_QUALITY, false));
    };
    let quality = value
        .parse::<u8>()
        .map_err(|_| "Quality must be an integer from 1 to 100")?;
    if !(1..=100).contains(&quality) {
        return Err("Quality must be an integer from 1 to 100");
    }
    Ok((quality, true))
}

/**
 * Choose the NeuQuant sampling factor for a given pixel count.
 *
 * Full-pixel sampling (samplefac=1) is what lifts palette quality from
 * 27.7 dB to 31.0 dB on small outputs, but NeuQuant training is linear
 * in samples: at the maximum allowed 3840x2160 output (8,294,400 px)
 * samplefac=1 measured 4.7 s native, versus 436 ms at samplefac=10.
 * That would exhaust the Cloudflare Worker CPU budget once wasm
 * overhead is added. Cap total training samples at one million so
 * small images keep full sampling while large ones degrade to the
 * pre-existing cost envelope.
 */
fn training_samplefac(pixel_count: usize) -> i32 {
    const MAX_TRAINING_SAMPLES: usize = 1_000_000;
    let fac = pixel_count.div_ceil(MAX_TRAINING_SAMPLES).max(1);
    i32::try_from(fac).unwrap_or(i32::MAX)
}

/**
 * Refine a NeuQuant palette with bounded Lloyd iterations.
 *
 * NeuQuant trains with a self-organizing map that converges quickly but
 * leaves the palette a few dB away from optimal: on the 100x71 reference
 * the raw palette measured 32.3 dB against the Cloudflare Images output,
 * while a Lloyd-refined palette of the same size measured 35.2 dB, right
 * at the lossless-resize ceiling (36.6 dB). Cost is bounded by sampling
 * at most max_samples pixels per iteration, so 4K outputs pay the same
 * fixed price as small ones.
 */
fn refine_palette(palette: &mut [u8], pixels: &[u8], iterations: usize, max_samples: usize) {
    let ncolors = palette.len() / 4;
    let total = pixels.len() / 4;
    if ncolors == 0 || total == 0 {
        return;
    }
    let stride = total.div_ceil(max_samples).max(1);
    let mut centroids: Vec<[i64; 4]> = palette
        .chunks_exact(4)
        .map(|c| [c[0] as i64, c[1] as i64, c[2] as i64, c[3] as i64])
        .collect();
    let mut sums = vec![[0i64; 4]; ncolors];
    let mut counts = vec![0i64; ncolors];
    for _ in 0..iterations {
        for s in &mut sums {
            *s = [0; 4];
        }
        for c in &mut counts {
            *c = 0;
        }
        let mut i = 0;
        while i < total {
            let px = &pixels[i * 4..i * 4 + 4];
            let mut best = 0usize;
            let mut best_d = i64::MAX;
            for (ci, c) in centroids.iter().enumerate() {
                let dr = c[0] - px[0] as i64;
                let dg = c[1] - px[1] as i64;
                let db = c[2] - px[2] as i64;
                let da = c[3] - px[3] as i64;
                let d = dr * dr + dg * dg + db * db + da * da;
                if d < best_d {
                    best_d = d;
                    best = ci;
                }
            }
            for ch in 0..4 {
                sums[best][ch] += px[ch] as i64;
            }
            counts[best] += 1;
            i += stride;
        }
        for (ci, c) in centroids.iter_mut().enumerate() {
            if counts[ci] > 0 {
                for ch in 0..4 {
                    c[ch] = sums[ci][ch] / counts[ci];
                }
            }
        }
    }
    for (c, quad) in centroids.iter().zip(palette.chunks_exact_mut(4)) {
        for ch in 0..4 {
            quad[ch] = c[ch].clamp(0, 255) as u8;
        }
    }
}

/** Nearest palette entry for an RGBA pixel (integer distance). */
fn nearest_palette_index(palette: &[u8], px: &[u8]) -> u8 {
    let mut best = 0usize;
    let mut best_d = i64::MAX;
    for (ci, c) in palette.chunks_exact(4).enumerate() {
        let dr = c[0] as i64 - px[0] as i64;
        let dg = c[1] as i64 - px[1] as i64;
        let db = c[2] as i64 - px[2] as i64;
        let da = c[3] as i64 - px[3] as i64;
        let d = dr * dr + dg * dg + db * db + da * da;
        if d < best_d {
            best_d = d;
            best = ci;
        }
    }
    best as u8
}

/**
 * Indexed nearest-color lookup with a hard cost bound.
 *
 * Scanning the whole palette for every pixel costs
 * pixels x palette_size distance evaluations, which reaches about 1.87
 * billion comparisons for a permitted 3840x2160 q85 PNG with its 226
 * palette entries, and that can exhaust the Cloudflare Worker CPU
 * budget. The exact answer for the first pixel of each
 * 5-bit-per-channel RGBA bin (32^4 = 1,048,576 bins) is memoized
 * instead, so one image performs at most 1,048,576 full scans no
 * matter its pixel count, which is far below the 8.29M pixels of a
 * 3840x2160 frame (at most 268M distance evaluations for a 256-entry
 * palette, about 237M at q85's 226 entries against the 1.87B naive
 * figure) and every later pixel in a filled bin costs a single probe.
 * Bin-mates differ by at most 7 per channel, so reusing the first
 * exact answer stays within the measured floor of the
 * palette_png_quality_stays_above_33db gate.
 */
struct NearestPaletteLookup {
    /** Per-bin memo, None until the bin's first pixel resolves it. */
    bin: Vec<Option<u8>>,
}

impl NearestPaletteLookup {
    const BINS: usize = 1 << 20;

    fn new() -> Self {
        Self {
            bin: vec![None; Self::BINS],
        }
    }

    fn index(&mut self, palette: &[u8], px: &[u8]) -> u8 {
        let key = (usize::from(px[0]) >> 3) << 15
            | (usize::from(px[1]) >> 3) << 10
            | (usize::from(px[2]) >> 3) << 5
            | (usize::from(px[3]) >> 3);
        match self.bin[key] {
            Some(idx) => idx,
            None => {
                let idx = nearest_palette_index(palette, px);
                self.bin[key] = Some(idx);
                idx
            }
        }
    }
}

/**
 * Choose the AVIF encoder speed (1 = slowest/best, 10 = fastest) for a
 * given pixel count.
 *
 * Slower speeds improve both size and fidelity: on the 100x71 reference
 * speed 4 produced 3100 bytes at 36.66 dB versus lossless, while speed 6
 * produced 3520 bytes at 36.11 dB. The Cloudflare Images reference for
 * the same parameters is 2951 bytes, so speed 4 closes the size gap from
 * +19% to +5%. The cost is CPU: ravif time grows with pixel count
 * (measured ~10 us/px at speed 4 versus ~3.5 us/px at speed 6), hitting
 * 82.7 s for a 4K frame versus 31.5 s at speed 6. Keep speed 4 only for
 * outputs at or below 300,000 pixels (the 512x512 preset and smaller,
 * worst case ~3 s) and stay on speed 6 above that.
 */
fn avif_speed(pixel_count: usize) -> u8 {
    const FAST_SPEED_MAX_PIXELS: usize = 300_000;
    if pixel_count <= FAST_SPEED_MAX_PIXELS {
        4
    } else {
        6
    }
}

fn encode_png(
    image: &DynamicImage,
    quality: u8,
    quality_explicit: bool,
) -> std::result::Result<Vec<u8>, &'static str> {
    if !quality_explicit {
        let mut output = Vec::new();
        image
            .write_to(Cursor::new(&mut output), image::ImageFormat::Png)
            .map_err(|_| "PNG encoding failed")?;
        return Ok(output);
    }

    let rgba = image.to_rgba8();
    let palette_size = 64 + (usize::from(quality.saturating_sub(1)) * 192 / 99);
    /* Full sampling for small outputs (measured: 27.7 dB -> 31.0 dB on
     * the 100x71 reference), bounded to 1M training samples so max-size
     * outputs stay within the Worker CPU budget. */
    let samplefac = training_samplefac(rgba.as_raw().len() / 4);
    let quantizer = color_quant::NeuQuant::new(samplefac, palette_size, rgba.as_raw());
    let mut palette = quantizer.color_map_rgba();
    /* Lloyd refinement closes most of the remaining gap to the
     * Cloudflare reference: 32.3 dB -> 35.2 dB on the 100x71
     * output, against a lossless ceiling of 36.6 dB. */
    refine_palette(&mut palette, rgba.as_raw(), 3, 150_000);
    let mut indices = Vec::with_capacity(rgba.as_raw().len() / 4);
    let mut lookup = NearestPaletteLookup::new();
    for pixel in rgba.as_raw().chunks_exact(4) {
        indices.push(lookup.index(&palette, pixel));
    }

    let mut palette_rgb = Vec::with_capacity(palette.len() / 4 * 3);
    let mut palette_alpha = Vec::with_capacity(palette.len() / 4);
    for color in palette.chunks_exact(4) {
        palette_rgb.extend_from_slice(&color[..3]);
        palette_alpha.push(color[3]);
    }

    let mut output = Vec::new();
    {
        let mut encoder = png::Encoder::new(&mut output, rgba.width(), rgba.height());
        encoder.set_color(png::ColorType::Indexed);
        encoder.set_depth(png::BitDepth::Eight);
        encoder.set_palette(palette_rgb);
        if palette_alpha.iter().any(|alpha| *alpha < u8::MAX) {
            encoder.set_trns(palette_alpha);
        }
        let mut writer = encoder.write_header().map_err(|_| "PNG encoding failed")?;
        writer
            .write_image_data(&indices)
            .map_err(|_| "PNG encoding failed")?;
    }
    Ok(output)
}

fn encode_output(
    image: &DynamicImage,
    format: OutputFormat,
    quality: u8,
    quality_explicit: bool,
) -> std::result::Result<Vec<u8>, &'static str> {
    match format {
        OutputFormat::Avif => {
            let pixel_count = image.width() as usize * image.height() as usize;
            let mut output = Vec::new();
            let encoder = image::codecs::avif::AvifEncoder::new_with_speed_quality(
                Cursor::new(&mut output),
                avif_speed(pixel_count),
                quality,
            );
            image
                .write_with_encoder(encoder)
                .map_err(|_| "AVIF encoding failed")?;
            Ok(output)
        }
        OutputFormat::Jpeg => {
            /* JPEG carries no alpha channel. Transparent pixels in our
             * pipeline hold RGB=(0,0,0), so letting the encoder drop alpha
             * paints the background black and bleeds dark fringe into the
             * image edges. Flatten against white first, matching how
             * Cloudflare Images renders the same source. */
            let flattened = flatten_on_white(image);
            let mut output = Vec::new();
            let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(
                Cursor::new(&mut output),
                quality,
            );
            flattened
                .write_with_encoder(encoder)
                .map_err(|_| "JPEG encoding failed")?;
            Ok(output)
        }
        OutputFormat::Png => encode_png(image, quality, quality_explicit),
        OutputFormat::Webp => {
            /*
             * Borrow the resize buffer. The encoder already copies RGBA for
             * YUV conversion, so another full frame wastes the Worker budget.
             * webp-rust 0.3.2 includes the saturated-chroma rounding fix.
             */
            let rgba = match image.as_rgba8() {
                Some(rgba) => Cow::Borrowed(rgba),
                None => Cow::Owned(image.to_rgba8()),
            };
            let config = webp_rust::LossyEncodingConfig {
                quality: f32::from(quality),
                alpha_quality: 100,
                /*
                 * Compressed alpha runs a second lossless encoder with
                 * multiple full-frame working buffers. Use raw exact alpha
                 * above 300K pixels to stay within the Worker memory budget.
                 */
                alpha_method: if u64::from(rgba.width()) * u64::from(rgba.height()) > 300_000 {
                    0
                } else {
                    1
                },
                ..Default::default()
            };
            webp_rust::encoder::encode_lossy_rgba_to_webp_with_config(
                rgba.width() as usize,
                rgba.height() as usize,
                rgba.as_raw(),
                &config,
            )
            .map_err(|_| "WebP encoding failed")
        }
    }
}

fn set_resize_headers(
    response: &Response,
    format: OutputFormat,
    original_width: u32,
    original_height: u32,
    original_bytes: usize,
    resized_width: u32,
    resized_height: u32,
    resized_bytes: usize,
    filter: image::imageops::FilterType,
    quality: u8,
    compression_ratio: &str,
) -> Result<()> {
    let original_width = original_width.to_string();
    let original_height = original_height.to_string();
    let original_bytes = original_bytes.to_string();
    let resized_width = resized_width.to_string();
    let resized_height = resized_height.to_string();
    let resized_bytes = resized_bytes.to_string();
    let quality = quality.to_string();

    response
        .headers()
        .set("content-type", format.content_type())?;
    response
        .headers()
        .set("x-image-original-width", &original_width)?;
    response
        .headers()
        .set("x-image-original-height", &original_height)?;
    response
        .headers()
        .set("x-image-original-bytes", &original_bytes)?;
    response
        .headers()
        .set("x-image-resized-width", &resized_width)?;
    response
        .headers()
        .set("x-image-resized-height", &resized_height)?;
    response
        .headers()
        .set("x-image-resized-bytes", &resized_bytes)?;
    response
        .headers()
        .set("x-image-filter", filter_name(filter))?;
    response.headers().set("x-image-fit", FIT_SCALE_DOWN)?;
    response.headers().set("x-image-format", format.name())?;
    response.headers().set("x-image-quality", &quality)?;
    if format == OutputFormat::Webp {
        response.headers().set("x-image-encoding", "lossy")?;
    }
    response
        .headers()
        .set("x-image-compression-ratio", compression_ratio)?;
    Ok(())
}

async fn handle_resize(mut req: Request) -> Result<Response> {
    let url = req.url().map_err(|_| Error::from("Invalid URL"))?;

    let mut query = HashMap::new();
    for (key, value) in url.query_pairs() {
        if query.insert(key.into_owned(), value.into_owned()).is_some() {
            return Response::error("Duplicate query parameter", 400);
        }
    }
    const SUPPORTED_QUERY_KEYS: [&str; 10] = [
        "f", "fit", "filter", "format", "h", "height", "q", "quality", "w", "width",
    ];
    if query
        .keys()
        .any(|key| !SUPPORTED_QUERY_KEYS.contains(&key.as_str()))
    {
        return Response::error("Unsupported query parameter", 400);
    }

    let target_width = match parse_dimension(&query, "w", "width") {
        Ok(value) => value,
        Err(message) => return Response::error(message, 400),
    };
    let target_height = match parse_dimension(&query, "h", "height") {
        Ok(value) => value,
        Err(message) => return Response::error(message, 400),
    };
    if target_width == 0 && target_height == 0 {
        return Response::error("Provide at least one of w or h", 400);
    }
    if target_width > MAX_DIMENSION || target_height > MAX_DIMENSION {
        return Response::error("Target dimensions exceed the 4K limit", 400);
    }

    if let Some(fit) = query.get("fit") {
        if !fit.eq_ignore_ascii_case(FIT_SCALE_DOWN) {
            return Response::error("Only fit=scale-down is supported", 400);
        }
    }

    let accept = req.headers().get("accept").ok().flatten();
    let format_value = match query_value(&query, "f", "format") {
        Ok(Some(value)) => value,
        Ok(None) => "png",
        Err(message) => return Response::error(message, 400),
    };
    let format = match OutputFormat::parse(format_value, accept.as_deref()) {
        Some(format) => format,
        None => return Response::error("Unsupported output format", 400),
    };

    let (quality, quality_explicit) = match parse_quality(&query) {
        Ok(value) => value,
        Err(message) => return Response::error(message, 400),
    };
    let filter_str = query
        .get("filter")
        .map(String::as_str)
        .unwrap_or("lanczos3");
    let filter = match parse_filter(filter_str) {
        Some(filter) => filter,
        None => return Response::error("Unsupported resize filter", 400),
    };

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
    let original_bytes = bytes.len();

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
    drop(bytes);

    let (out_w, out_h) = resize_dimensions(orig_width, orig_height, target_width, target_height);
    if u64::from(out_w) * u64::from(out_h) > MAX_PIXELS {
        return Response::error("Output pixel count exceeds the 4K limit", 400);
    }

    let resized = resize_premul(image, out_w, out_h, filter);
    let output = match encode_output(&resized, format, quality, quality_explicit) {
        Ok(output) => output,
        Err(message) => return Response::error(message, 500),
    };
    let output_size = output.len();
    let ratio = if original_bytes == 0 {
        0.0
    } else {
        (1.0 - output_size as f64 / original_bytes as f64) * 100.0
    };

    let compression_ratio = format!("{:.1}%", ratio);
    let resp = Response::from_bytes(output)?;
    resp.headers().set("cache-control", "no-store")?;
    set_resize_headers(
        &resp,
        format,
        orig_width,
        orig_height,
        original_bytes,
        resized.width(),
        resized.height(),
        output_size,
        filter,
        quality,
        &compression_ratio,
    )?;
    Ok(resp)
}

#[cfg(test)]
mod tests {
    use image::{Rgba, RgbaImage};

    use super::*;

    #[test]
    fn fits_a_wide_image_inside_a_square_without_upscaling() {
        assert_eq!(resize_dimensions(1520, 1080, 100, 100), (100, 71));
        assert_eq!(resize_dimensions(100, 71, 256, 256), (100, 71));
    }

    #[test]
    fn scales_from_one_axis_without_upscaling() {
        assert_eq!(resize_dimensions(1520, 1080, 100, 0), (100, 71));
        assert_eq!(resize_dimensions(1520, 1080, 0, 100), (141, 100));
        assert_eq!(resize_dimensions(100, 71, 256, 0), (100, 71));
    }

    #[test]
    fn parses_quality_and_tracks_explicit_png_quality() {
        let mut query = HashMap::new();
        assert_eq!(parse_quality(&query).unwrap(), (85, false));
        query.insert("q".to_string(), "42".to_string());
        assert_eq!(parse_quality(&query).unwrap(), (42, true));
        query.insert("q".to_string(), "101".to_string());
        assert!(parse_quality(&query).is_err());
    }

    #[test]
    fn parses_supported_output_formats() {
        assert_eq!(OutputFormat::parse("jpeg", None), Some(OutputFormat::Jpeg));
        assert_eq!(OutputFormat::parse("png", None), Some(OutputFormat::Png));
        assert_eq!(OutputFormat::parse("webp", None), Some(OutputFormat::Webp));
        assert_eq!(OutputFormat::parse("avif", None), Some(OutputFormat::Avif));
        assert_eq!(
            OutputFormat::parse("auto", Some("image/avif,image/webp")),
            Some(OutputFormat::Avif)
        );
        assert_eq!(OutputFormat::parse("jxl", None), None);
    }

    #[test]
    fn rejects_invalid_filters_and_conflicting_aliases() {
        assert!(parse_filter("unknown").is_none());
        let mut query = HashMap::new();
        query.insert("w".to_string(), "100".to_string());
        query.insert("width".to_string(), "200".to_string());
        assert!(query_value(&query, "w", "width").is_err());
    }

    #[test]
    fn encodes_each_supported_output_format() {
        let image = DynamicImage::ImageRgba8(RgbaImage::from_pixel(2, 2, Rgba([40, 80, 120, 255])));
        let jpeg = encode_output(&image, OutputFormat::Jpeg, 85, true).unwrap();
        let png = encode_output(&image, OutputFormat::Png, 85, false).unwrap();
        let png8 = encode_output(&image, OutputFormat::Png, 40, true).unwrap();
        let webp = encode_output(&image, OutputFormat::Webp, 85, true).unwrap();
        let avif = encode_output(&image, OutputFormat::Avif, 85, true).unwrap();

        assert_eq!(&jpeg[..2], &[0xff, 0xd8]);
        assert_eq!(&png[..8], b"\x89PNG\r\n\x1a\n");
        assert_eq!(&png8[..8], b"\x89PNG\r\n\x1a\n");
        assert_eq!(&webp[..4], b"RIFF");
        assert_eq!(&webp[8..12], b"WEBP");
        let decoded_webp = image::load_from_memory_with_format(&webp, image::ImageFormat::WebP)
            .unwrap()
            .to_rgba8();
        let webp_pixel = decoded_webp.get_pixel(0, 0);
        assert_ne!(webp_pixel[0], webp_pixel[1]);
        assert!(avif.windows(4).any(|chunk| chunk == b"avif"));
    }

    /**
     * Verify that premultiplied alpha resize preserves correct colors
     * at opaque/transparent boundaries (the hand-in-image scenario).
     *
     * Creates a 20x20 image with a 10x10 opaque red (200,0,0) block in
     * the center surrounded by fully transparent pixels. After resizing
     * to 5x5 with Lanczos3, pixels that are fully opaque should retain
     * the original red color (200,0,0), not bleed toward gray.
     *
     * Without premultiplied alpha, Lanczos3 interpolates RGB=(200,0,0)
     * with RGB=(0,0,0) at the boundary, producing RGB=(100,0,0) with
     * alpha=127. After unpremultiplying, this becomes RGB=(200,0,0) --
     * the correct color. Without premultiplied alpha, the result would
     * be the wrong color.
     */
    #[test]
    fn premul_preserves_color_at_opaque_transparent_boundary() {
        let mut img = RgbaImage::new(20, 20);
        for y in 5..15 {
            for x in 5..15 {
                img.put_pixel(x, y, Rgba([200, 0, 0, 255]));
            }
        }
        let dyn_img = DynamicImage::ImageRgba8(img);
        let resized = resize_premul(dyn_img, 5, 5, image::imageops::FilterType::Lanczos3);
        let rgba = resized.to_rgba8();

        /* The center pixel (2,2) of the 5x5 output should be fully
         * opaque red, not a grayish blend. */
        let center = *rgba.get_pixel(2, 2);
        assert_eq!(center[3], 255, "center pixel should be fully opaque");
        assert!(
            center[0] > 180,
            "center pixel red channel should be close to 200, got {}",
            center[0]
        );
        assert_eq!(center[1], 0, "center pixel green should be 0");
        assert_eq!(center[2], 0, "center pixel blue should be 0");
    }

    /**
     * High-depth inputs must not keep three full frames alive.
     *
     * `resize_premul` consumes the source, so a 16-bit frame is dropped
     * once the 8-bit copy exists and before the second RGBA8 buffer is
     * allocated. The old `&DynamicImage` signature kept the source alive
     * next to both frames: 126.6 MiB for a 4K RGBA16 input, over the
     * Cloudflare Worker's 128 MB isolate limit.
     */
    #[test]
    fn consumes_high_depth_source() {
        let src = ImageBuffer::from_pixel(64, 64, Rgba([u16::MAX, 0, 0, u16::MAX]));
        let resized = resize_premul(
            DynamicImage::ImageRgba16(src),
            32,
            32,
            image::imageops::FilterType::Triangle,
        );

        assert!(matches!(resized, DynamicImage::ImageRgba8(_)));
        assert_eq!(resized.width(), 32);
        assert_eq!(resized.height(), 32);

        /* Opaque red must survive 16-to-8 conversion and the premul
         * round-trip: R stays saturated, G and B stay zero, and alpha
         * stays opaque. */
        for pixel in resized.to_rgba8().pixels() {
            assert!(pixel[0] >= 250, "red channel lost: {pixel:?}");
            assert_eq!(pixel[1], 0, "green must stay 0: {pixel:?}");
            assert_eq!(pixel[2], 0, "blue must stay 0: {pixel:?}");
            assert!(pixel[3] >= 254, "alpha must stay opaque: {pixel:?}");
        }
    }

    /**
     * Integration test using the real iphone-duo.png sample image
     * (1520x1080 RGBA with transparent background).
     *
     * Resizes to 100x100 with AVIF output, matching the Kaligo
     * Cloudflare Images parameters (f=avif&w=100&h=100). Verifies:
     * - Output dimensions are 100x71 (aspect-ratio preserved by
     *   resize_dimensions)
     * - Output is valid AVIF
     * - AVIF encode completes without error
     * - Premultiplied resize produces no panic on real RGBA data
     */
    #[test]
    fn resize_iphone_duo_to_100x100_avif() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");

        assert_eq!(img.width(), 1520);
        assert_eq!(img.height(), 1080);

        /* Match the query parameters: w=100, h=100, fit=scale-down */
        let (out_w, out_h) = resize_dimensions(1520, 1080, 100, 100);
        assert_eq!(out_w, 100);
        assert_eq!(out_h, 71);

        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);
        assert_eq!(resized.width(), 100);
        assert_eq!(resized.height(), 71);

        /* Encode to AVIF with default quality (85) */
        let avif = encode_output(&resized, OutputFormat::Avif, 85, true).unwrap();
        assert!(
            avif.windows(4).any(|chunk| chunk == b"avif"),
            "output should be valid AVIF"
        );
        assert!(
            avif.len() > 100,
            "AVIF output should be more than 100 bytes, got {}",
            avif.len()
        );

        /* Also encode to PNG to verify pixel content via decode */
        let png = encode_output(&resized, OutputFormat::Png, 85, false).unwrap();
        let decoded = image::load_from_memory_with_format(&png, image::ImageFormat::Png).unwrap();
        assert_eq!(decoded.width(), 100);
        assert_eq!(decoded.height(), 71);

        /*
         * Regression: color bleed at transparent edges.
         *
         * The iphone-duo.png has hands holding a phone against a fully
         * transparent background. Before premultiplied alpha, the resize
         * would bleed skin/hand colors into transparent regions, creating
         * visible gray/brown fringe around the hands.
         *
         * These checks verify:
         * 1. Fully transparent pixels are exactly (0,0,0,0).
         * 2. Semi-transparent pixels at hand boundaries have plausible
         *    RGB values that match the nearby opaque content, not
         *    corrupted/bleeded colors.
         * 3. No pixel has alpha > 0 with RGB values that are all equal
         *    (gray) when the source content is colorful -- this is the
         *    telltale sign of color bleed through transparent regions.
         */
        let rgba = resized.to_rgba8();

        /* Check: top-left should be fully transparent. */
        let tl = *rgba.get_pixel(0, 0);
        assert_eq!(tl[3], 0, "top-left should be transparent");

        /* Check: bottom-right should be fully transparent. */
        let br = *rgba.get_pixel(99, 70);
        assert_eq!(br[3], 0, "bottom-right should be transparent");

        /* Scan for color bleed: semi-transparent pixels with gray RGB
         * (where R == G == B) indicate bleed from transparent regions.
         * In the iphone-duo image, content is colorful (hands, phone),
         * so semi-transparent pixels at boundaries should also be
         * colorful, not gray. Count how many gray semi-transparent
         * pixels exist -- this should be zero or very few. */
        let mut gray_semi_transparent = 0u32;
        let mut total_semi_transparent = 0u32;
        for pixel in rgba.pixels() {
            let [r, g, b, a] = pixel.0;
            if a > 0 && a < 255 {
                total_semi_transparent += 1;
                /* Gray = R ~= G ~= B within tolerance of 15 */
                let max_diff = r.abs_diff(g).max(g.abs_diff(b)).max(r.abs_diff(b));
                if max_diff <= 15 {
                    gray_semi_transparent += 1;
                }
            }
        }
        assert!(
            total_semi_transparent > 0,
            "should have semi-transparent pixels at hand boundaries"
        );
        assert!(
            gray_semi_transparent < total_semi_transparent / 2,
            "too many gray semi-transparent pixels ({}/{}), \
             likely color bleed from transparent regions",
            gray_semi_transparent,
            total_semi_transparent,
        );
    }

    /**
     * Regression: JPEG background must be white, not black.
     *
     * JPEG carries no alpha channel. Our resize pipeline stores fully
     * transparent pixels as RGB=(0,0,0,a=0). If the encoder simply drops
     * alpha, the transparent background becomes black and bleeds a dark
     * halo into semi-transparent edges. Cloudflare Images flattens the
     * same source onto white (measured corners: 255,255,255), so our
     * corners must also be near-white.
     */
    #[test]
    fn jpeg_flattens_transparent_background_to_white() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);

        let jpeg = encode_output(&resized, OutputFormat::Jpeg, 85, true).unwrap();
        let decoded = image::load_from_memory_with_format(&jpeg, image::ImageFormat::Jpeg).unwrap();
        let rgb = decoded.to_rgb8();

        for (name, x, y) in [
            ("top-left", 0, 0),
            ("top-right", rgb.width() - 1, 0),
            ("bottom-left", 0, rgb.height() - 1),
            ("bottom-right", rgb.width() - 1, rgb.height() - 1),
        ] {
            let p = rgb.get_pixel(x, y);
            let min_channel = p[0].min(p[1]).min(p[2]);
            assert!(
                min_channel > 240,
                "JPEG {name} corner should be near-white after flatten, \
                 got ({}, {}, {})",
                p[0],
                p[1],
                p[2],
            );
        }
    }

    /** PSNR helper for palette quality tests (opaque pixels only). */
    fn psnr_opaque(a: &DynamicImage, b: &DynamicImage) -> f64 {
        let a = a.to_rgba8();
        let b = b.to_rgba8();
        let mut mse = 0.0f64;
        let mut count = 0u64;
        for (pa, pb) in a.pixels().zip(b.pixels()) {
            if pa[3] >= 250 && pb[3] >= 250 {
                for c in 0..3 {
                    let diff = pa[c] as f64 - pb[c] as f64;
                    mse += diff * diff;
                    count += 1;
                }
            }
        }
        assert!(count > 0, "no opaque pixels to compare");
        mse /= count as f64;
        if mse == 0.0 {
            f64::INFINITY
        } else {
            10.0 * (255.0 * 255.0 / mse).log10()
        }
    }

    /**
     * Regression: palette PNG quality must stay above 29 dB PSNR.
     *
     * The NeuQuant quantizer was trained with samplefac=10, which samples
     * only every 10th pixel. For a 100x71 output that is 710 samples to
     * train 226 palette colors, starving the network and producing
     * visible banding (measured 27.7 dB against a lossless reference).
     * Training on every pixel (samplefac=1) lifts this to 31.0 dB, and
     * Lloyd refinement of the trained palette lifts it again to 34.7 dB,
     * essentially matching Cloudflare's own palette PNG. 33 dB is a safe
     * floor that fails if sampling regresses to 10 or if the refinement
     * pass is removed.
     */
    #[test]
    fn palette_png_quality_stays_above_33db() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);

        /* Lossless reference. */
        let lossless = encode_output(&resized, OutputFormat::Png, 85, false).unwrap();
        let lossless_img =
            image::load_from_memory_with_format(&lossless, image::ImageFormat::Png).unwrap();

        /* Palette-quantized output at explicit quality (the lab default). */
        let quantized = encode_output(&resized, OutputFormat::Png, 85, true).unwrap();
        let quantized_img =
            image::load_from_memory_with_format(&quantized, image::ImageFormat::Png).unwrap();

        assert_eq!(
            quantized_img.width(),
            lossless_img.width(),
            "palette output must keep dimensions"
        );

        let psnr = psnr_opaque(&quantized_img, &lossless_img);
        assert!(
            psnr >= 33.0,
            "palette PNG PSNR dropped to {psnr:.2} dB (expected >= 33.0); \
             palette sampling or Lloyd refinement may have regressed",
        );
    }

    /** Flatten on white: transparent becomes white, opaque untouched. */
    #[test]
    fn flatten_on_white_composites_transparency() {
        let mut img = RgbaImage::new(3, 1);
        img.put_pixel(0, 0, Rgba([200, 100, 50, 255])); /* opaque */
        img.put_pixel(1, 0, Rgba([10, 20, 30, 0])); /* fully transparent */
        img.put_pixel(2, 0, Rgba([0, 0, 0, 128])); /* half transparent */

        let flat = flatten_on_white(&DynamicImage::ImageRgba8(img));
        let rgb = flat.to_rgb8();
        assert_eq!(rgb.get_pixel(0, 0).0, [200, 100, 50], "opaque unchanged");
        assert_eq!(
            rgb.get_pixel(1, 0).0,
            [255, 255, 255],
            "transparent -> white"
        );
        let half = rgb.get_pixel(2, 0).0;
        /* 0 * 0.502 + 255 * 0.498 ~= 127 */
        assert!(
            (half[0] as i32 - 127).abs() <= 1 && half[0] == half[1] && half[1] == half[2],
            "half alpha should blend halfway to white, got {half:?}",
        );
    }

    /** training_samplefac: full sampling for small, capped samples for large. */
    #[test]
    fn training_samplefac_bounds_samples() {
        assert_eq!(training_samplefac(0), 1, "degenerate input stays at 1");
        assert_eq!(training_samplefac(7_100), 1, "100x71 keeps full sampling");
        assert_eq!(training_samplefac(1_000_000), 1, "exactly at cap keeps 1");
        assert_eq!(training_samplefac(2_000_000), 2, "over cap halves samples");
        /* 3840x2160 = 8,294,400 px -> ceil(8.29) = 9 */
        assert_eq!(training_samplefac(3840 * 2160), 9, "4K stays in CPU budget");
        /* Never exceed ~1M samples at any supported size. */
        let px = 3840 * 2160;
        assert!(px / training_samplefac(px) as usize <= 1_000_000);
    }

    /** avif_speed: fast encoder for small outputs, safe speed for large. */
    #[test]
    fn avif_speed_trades_cpu_for_small_outputs() {
        assert_eq!(
            avif_speed(100 * 71),
            4,
            "small outputs use fast/better speed"
        );
        assert_eq!(avif_speed(512 * 512), 4, "512x512 preset uses speed 4");
        assert_eq!(avif_speed(300_000), 4, "boundary inclusive");
        assert_eq!(avif_speed(300_001), 6, "above boundary falls back");
        assert_eq!(avif_speed(3840 * 2160), 6, "4K never pays speed-4 CPU cost");
    }

    /**
     * NearestPaletteLookup: the first pixel of a bin must answer with
     * the exact nearest-color scan, and repeat visits must stay stable,
     * pinning the memoization contract behind the bounded remap cost.
     */
    #[test]
    fn nearest_palette_lookup_first_touch_is_exact_and_cached() {
        let palette: Vec<u8> = (0..=255u8)
            .flat_map(|i| [i, i.wrapping_mul(3), i ^ 0x5A, 255])
            .collect();
        let mut lookup = NearestPaletteLookup::new();
        let probes: [[u8; 4]; 4] = [
            [0, 0, 0, 255],
            [255, 255, 255, 255],
            [16, 32, 64, 255],
            [17, 33, 65, 200],
        ];
        /* Each probe touches a fresh bin, so every first answer must
         * match the exact per-pixel scan the cache replaces. */
        for px in probes {
            assert_eq!(
                lookup.index(&palette, &px),
                nearest_palette_index(&palette, &px),
                "first touch of a bin must answer with the exact scan",
            );
        }
        /* A repeat visit reuses the memoized slot deterministically. */
        let first = lookup.index(&palette, &[17, 33, 65, 200]);
        let again = lookup.index(&palette, &[17, 33, 65, 200]);
        assert_eq!(first, again, "cached answers must be stable");
    }

    /** refine_palette: Lloyd iterations must reduce quantization error. */
    #[test]
    fn refine_palette_reduces_quantization_error() {
        /* Pixels in two tight clusters around red and blue. */
        let mut pixels = Vec::with_capacity(4 * 512);
        for i in 0..256u16 {
            let (r, b) = if i % 2 == 0 { (200, 10) } else { (10, 200) };
            pixels.extend_from_slice(&[r as u8, 40, b as u8, 255]);
        }
        /* Deliberately bad initial palette: single gray entry duplicated. */
        let mut palette = vec![128u8, 128, 128, 255, 130, 130, 130, 255];

        let error = |pal: &[u8]| -> i64 {
            pixels
                .chunks_exact(4)
                .map(|px| {
                    let idx = nearest_palette_index(pal, px);
                    let (pr, pg, pb, pa) = (
                        pal[idx as usize * 4] as i64,
                        pal[idx as usize * 4 + 1] as i64,
                        pal[idx as usize * 4 + 2] as i64,
                        pal[idx as usize * 4 + 3] as i64,
                    );
                    let dr = pr - px[0] as i64;
                    let dg = pg - px[1] as i64;
                    let db = pb - px[2] as i64;
                    let da = pa - px[3] as i64;
                    dr * dr + dg * dg + db * db + da * da
                })
                .sum()
        };

        let before = error(&palette);
        refine_palette(&mut palette, &pixels, 3, usize::MAX);
        let after = error(&palette);
        assert!(
            after < before,
            "refinement must reduce error: before={before}, after={after}",
        );
        /* With only two entries and a gray init the centroids may not
         * fully specialize in 3 iterations, but each entry must move
         * toward the data: no entry may stay exactly at its init. */
        assert_ne!(
            palette[0..4],
            [128, 128, 128, 255],
            "centroid 0 should have moved toward the data",
        );
    }

    /** nearest_palette_index: exact and nearest matches. */
    #[test]
    fn nearest_palette_index_finds_closest_entry() {
        let palette = [
            255, 0, 0, 255, /* red */
            0, 0, 255, 255, /* blue */
            255, 255, 255, 0, /* white, transparent */
        ];
        assert_eq!(nearest_palette_index(&palette, &[250, 5, 5, 255]), 0);
        assert_eq!(nearest_palette_index(&palette, &[5, 5, 250, 255]), 1);
        assert_eq!(
            nearest_palette_index(&palette, &[240, 240, 240, 10]),
            2,
            "alpha participates in the distance",
        );
    }

    /**
     * CF parity: JPEG at Cloudflare's operating point must match its
     * size and beat its fidelity.
     *
     * On the opaque-pixel metric, Cloudflare's reference for
     * f=jpeg&w=100&h=100 is 2728 bytes at 28.80 dB against our lossless
     * resize. Our encoder at quality 75 produces 2792 bytes at 29.25 dB:
     * within 2.4% of Cloudflare's size while scoring higher. The lab
     * default of quality 85 (3530 bytes, 31.65 dB) deliberately exceeds
     * Cloudflare's fidelity and is exempt from the size bound.
     */
    #[test]
    fn jpeg_matches_cloudflare_at_matched_quality() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);

        let lossless = encode_output(&resized, OutputFormat::Png, 85, false).unwrap();
        let lossless_img =
            image::load_from_memory_with_format(&lossless, image::ImageFormat::Png).unwrap();
        let cf = std::fs::metadata("tests/fixtures/cf/iphone-duo_100x100.jpeg")
            .expect("cf jpeg fixture")
            .len();

        /* Quality 75 lands on the same size operating point as CF. */
        let jpeg = encode_output(&resized, OutputFormat::Jpeg, 75, true).unwrap();
        assert!(
            jpeg.len() as f64 <= cf as f64 * 1.15,
            "our JPEG at matched size ({}B) exceeds Cloudflare's {cf}B by more than 15%",
            jpeg.len(),
        );
        let decoded = image::load_from_memory_with_format(&jpeg, image::ImageFormat::Jpeg).unwrap();
        let psnr = psnr_opaque(&decoded, &lossless_img);
        assert!(
            psnr >= 28.8,
            "JPEG PSNR at matched size dropped to {psnr:.2} dB \
             (Cloudflare reference: 28.80 dB, expected >= 28.8)",
        );

        /* The lab default (q=85) must stay clearly above CF's fidelity. */
        let default_jpeg = encode_output(&resized, OutputFormat::Jpeg, 85, true).unwrap();
        let default_img =
            image::load_from_memory_with_format(&default_jpeg, image::ImageFormat::Jpeg).unwrap();
        let default_psnr = psnr_opaque(&default_img, &lossless_img);
        assert!(
            default_psnr >= 31.0,
            "default JPEG PSNR dropped to {default_psnr:.2} dB (expected >= 31.0)",
        );
    }

    /**
     * CF parity: AVIF adaptive speed keeps size within 15% of the
     * Cloudflare reference. Speed 6 produced 3520 bytes (+19% over
     * Cloudflare's 2951); speed 4 for small outputs closes it.
     */
    #[test]
    fn avif_size_stays_close_to_cloudflare_reference() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);

        let avif = encode_output(&resized, OutputFormat::Avif, 85, true).unwrap();
        let cf = std::fs::metadata("tests/fixtures/cf/iphone-duo_100x100.avif")
            .expect("cf avif fixture")
            .len();

        assert!(
            avif.len() as f64 <= cf as f64 * 1.15,
            "our AVIF {}B exceeds Cloudflare's {cf}B by more than 15%",
            avif.len(),
        );
        assert!(
            avif.windows(4).any(|chunk| chunk == b"avif"),
            "output must be valid AVIF",
        );
    }

    /**
     * CF parity: PNG palette output stays within 15% of Cloudflare's
     * reference size. Also guards against the palette path silently
     * reverting to full RGBA (which would be 4x larger).
     */
    #[test]
    fn png_size_stays_close_to_cloudflare_reference() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .expect("test fixture exists")
            .decode()
            .expect("valid PNG");
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);

        let png = encode_output(&resized, OutputFormat::Png, 85, true).unwrap();
        let cf = std::fs::metadata("tests/fixtures/cf/iphone-duo_100x100.png")
            .expect("cf png fixture")
            .len();

        assert!(
            png.len() as f64 <= cf as f64 * 1.15,
            "our palette PNG {}B exceeds Cloudflare's {cf}B by more than 15%",
            png.len(),
        );
    }

    #[test]
    fn webp_preserves_saturated_colors() {
        for color in [[255, 0, 0, 255], [0, 255, 0, 255], [0, 0, 255, 255]] {
            for (width, height) in [(16, 16), (17, 19), (1, 1)] {
                let image =
                    DynamicImage::ImageRgba8(RgbaImage::from_pixel(width, height, Rgba(color)));
                let webp = encode_output(&image, OutputFormat::Webp, 85, true).unwrap();
                let decoded = image::load_from_memory_with_format(&webp, image::ImageFormat::WebP)
                    .unwrap()
                    .to_rgba8();
                assert_eq!(decoded.dimensions(), (width, height));
                for pixel in decoded.pixels() {
                    for channel in 0..3 {
                        assert!(
                            pixel[channel].abs_diff(color[channel]) <= 16,
                            "saturated {color:?} decoded as {pixel:?}"
                        );
                    }
                    assert_eq!(pixel[3], 255);
                }
            }
        }
    }

    #[test]
    fn webp_preserves_alpha_at_quality_extremes() {
        let rgba = RgbaImage::from_fn(17, 19, |x, y| {
            Rgba([220, 40, 80, ((x + y * 17) % 256) as u8])
        });
        let image = DynamicImage::ImageRgba8(rgba.clone());
        for quality in [1, 85, 100] {
            let webp = encode_output(&image, OutputFormat::Webp, quality, true).unwrap();
            let decoded = image::load_from_memory_with_format(&webp, image::ImageFormat::WebP)
                .unwrap()
                .to_rgba8();
            assert_eq!(decoded.dimensions(), rgba.dimensions());
            for (actual, expected) in decoded.pixels().zip(rgba.pixels()) {
                assert_eq!(actual[3], expected[3], "WebP alpha must remain exact");
            }
        }
    }

    #[test]
    fn webp_preserves_large_alpha() {
        let image = DynamicImage::ImageRgba8(RgbaImage::from_fn(640, 480, |x, y| {
            Rgba([220, 40, 80, ((x + y) % 256) as u8])
        }));
        let webp = encode_output(&image, OutputFormat::Webp, 85, true).unwrap();
        let decoded = image::load_from_memory_with_format(&webp, image::ImageFormat::WebP)
            .unwrap()
            .to_rgba8();
        assert_eq!(decoded.dimensions(), (640, 480));
        for (x, y, pixel) in decoded.enumerate_pixels() {
            assert_eq!(pixel[3], ((x + y) % 256) as u8);
        }
    }

    #[test]
    fn webp_quality_controls_size_and_fidelity() {
        let img = ImageReader::open("tests/fixtures/iphone-duo.png")
            .unwrap()
            .decode()
            .unwrap();
        let (out_w, out_h) = resize_dimensions(img.width(), img.height(), 100, 100);
        let resized = resize_premul(img, out_w, out_h, image::imageops::FilterType::Lanczos3);
        let low = encode_output(&resized, OutputFormat::Webp, 20, true).unwrap();
        let high = encode_output(&resized, OutputFormat::Webp, 85, true).unwrap();
        let default = encode_output(&resized, OutputFormat::Webp, DEFAULT_QUALITY, false).unwrap();
        assert_eq!(default, high, "omitting q must use lossy quality 85");
        assert!(high.windows(4).any(|chunk| chunk == b"VP8 "));
        let low_img = image::load_from_memory_with_format(&low, image::ImageFormat::WebP).unwrap();
        let high_img =
            image::load_from_memory_with_format(&high, image::ImageFormat::WebP).unwrap();
        let low_psnr = psnr_opaque(&low_img, &resized);
        let high_psnr = psnr_opaque(&high_img, &resized);
        eprintln!(
            "WebP q20: {} B, {low_psnr:.2} dB. q85: {} B, {high_psnr:.2} dB",
            low.len(),
            high.len()
        );
        assert!(low.len() < high.len(), "quality must affect fixture size");
        assert!(high_psnr > low_psnr + 3.0, "quality must improve fidelity");
        assert!(
            high_psnr >= 28.0,
            "default WebP fidelity regressed: {high_psnr:.2}"
        );
        let mut lossless = Vec::new();
        resized
            .write_with_encoder(image::codecs::webp::WebPEncoder::new_lossless(Cursor::new(
                &mut lossless,
            )))
            .unwrap();
        assert!(
            high.len() < lossless.len(),
            "lossy WebP must shrink this fixture"
        );
    }
}
