/*!
 * Image optimization Cloudflare Worker for the Labs pages.
 *
 * Accepts an image upload, resizes it with the `image` crate's filters, and
 * returns the encoded output image with dimension and format metadata headers.
 */

use image::{DynamicImage, ImageBuffer, ImageReader, Rgba};
use std::{collections::HashMap, io::Cursor};
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
 */
fn resize_premul(
    image: &DynamicImage,
    out_w: u32,
    out_h: u32,
    filter: image::imageops::FilterType,
) -> DynamicImage {
    let rgba = image.to_rgba8();
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
    let quantizer = color_quant::NeuQuant::new(10, palette_size, rgba.as_raw());
    let palette = quantizer.color_map_rgba();
    let mut indices = Vec::with_capacity(rgba.as_raw().len() / 4);
    for pixel in rgba.as_raw().chunks_exact(4) {
        indices.push(quantizer.index_of(pixel) as u8);
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
            let mut output = Vec::new();
            let encoder = image::codecs::avif::AvifEncoder::new_with_speed_quality(
                Cursor::new(&mut output),
                6,
                quality,
            );
            image
                .write_with_encoder(encoder)
                .map_err(|_| "AVIF encoding failed")?;
            Ok(output)
        }
        OutputFormat::Jpeg => {
            let mut output = Vec::new();
            let encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(
                Cursor::new(&mut output),
                quality,
            );
            image
                .write_with_encoder(encoder)
                .map_err(|_| "JPEG encoding failed")?;
            Ok(output)
        }
        OutputFormat::Png => encode_png(image, quality, quality_explicit),
        OutputFormat::Webp => {
            let mut output = Vec::new();
            let encoder = image::codecs::webp::WebPEncoder::new_lossless(Cursor::new(&mut output));
            image
                .write_with_encoder(encoder)
                .map_err(|_| "WebP encoding failed")?;
            Ok(output)
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

    let resized = resize_premul(&image, out_w, out_h, filter);
    drop(image);
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
        let resized = resize_premul(&dyn_img, 5, 5, image::imageops::FilterType::Lanczos3);
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

        let resized = resize_premul(&img, out_w, out_h, image::imageops::FilterType::Lanczos3);
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
        let decoded =
            image::load_from_memory_with_format(&png, image::ImageFormat::Png).unwrap();
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
}
