/**
 * One-off benchmark: NeuQuant training cost at samplefac=1 vs bounded
 * sampling on a max-size 3840x2160 buffer. Deleted after measuring.
 */
use std::time::Instant;

fn main() {
    let w = 3840usize;
    let h = 2160usize;
    let mut pixels = Vec::with_capacity(w * h * 4);
    for y in 0..h {
        for x in 0..w {
            pixels.push((x % 256) as u8);
            pixels.push((y % 256) as u8);
            pixels.push(((x + y) % 256) as u8);
            pixels.push(255);
        }
    }
    let pixel_count = w * h;
    println!("pixel_count = {pixel_count}");

    for samplefac in [1, 5, 9, 10] {
        let start = Instant::now();
        let q = color_quant::NeuQuant::new(samplefac, 226, &pixels);
        let elapsed = start.elapsed();
        let samples = pixel_count / samplefac as usize;
        /* Touch the palette so the optimizer cannot elide the work. */
        let palette = q.color_map_rgba();
        println!(
            "samplefac={samplefac}: samples={samples}, train+palette={:?} (palette len {})",
            elapsed,
            palette.len()
        );
    }
}
