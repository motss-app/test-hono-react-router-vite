/**
 * Pure-TypeScript Mandelbrot renderer used as the JS baseline in the Rust Lab
 * race. Mirrors the math in `packages/fractal-wasm/src/lib.rs` so both
 * implementations produce identical pixels for the same viewport.
 */

export type FractalPaletteName = 'fire' | 'ice' | 'mono' | 'viridis';

export interface FractalView {
  centerX: number;
  centerY: number;
  /**
   * Vertical half-span of the view, in complex-plane units. The horizontal
   * span is derived from the aspect ratio so pixels stay square.
   */
  scale: number;
  maxIter: number;
  palette: FractalPaletteName;
}

type Rgb = readonly [
  number,
  number,
  number,
];

const PALETTE_STOPS: Record<FractalPaletteName, readonly Rgb[]> = {
  fire: [
    [
      8,
      6,
      18,
    ],
    [
      122,
      15,
      20,
    ],
    [
      232,
      92,
      22,
    ],
    [
      255,
      205,
      70,
    ],
    [
      255,
      252,
      224,
    ],
  ],
  ice: [
    [
      6,
      8,
      20,
    ],
    [
      18,
      60,
      130,
    ],
    [
      40,
      150,
      210,
    ],
    [
      140,
      225,
      245,
    ],
    [
      245,
      252,
      255,
    ],
  ],
  mono: [
    [
      10,
      10,
      12,
    ],
    [
      90,
      90,
      96,
    ],
    [
      180,
      180,
      188,
    ],
    [
      245,
      245,
      248,
    ],
  ],
  viridis: [
    [
      68,
      1,
      84,
    ],
    [
      59,
      82,
      139,
    ],
    [
      33,
      145,
      140,
    ],
    [
      94,
      201,
      98,
    ],
    [
      253,
      231,
      37,
    ],
  ],
};

const INTERIOR: Rgb = [
  8,
  10,
  22,
];

function samplePalette(palette: FractalPaletteName, t: number): Rgb {
  const stops = PALETTE_STOPS[palette];
  const last = stops.length - 1;
  const scaled = Math.min(Math.max(t, 0), 1) * last;
  const index = Math.min(Math.trunc(scaled), last - 1);
  const frac = scaled - index;
  const start = stops[index] as Rgb;
  const end = stops[index + 1] as Rgb;
  const lerp = (from: number, to: number): number => Math.round(from + (to - from) * frac);
  return [
    lerp(start[0], end[0]),
    lerp(start[1], end[1]),
    lerp(start[2], end[2]),
  ];
}

/**
 * Renders the Mandelbrot set into `buf` as packed RGBA8 bytes
 * (`buf.length === width * height * 4`).
 */
export function renderMandelbrotJs(
  buf: Uint8ClampedArray,
  width: number,
  height: number,
  view: FractalView
): void {
  const halfH = view.scale;
  const halfW = halfH * (width / height);
  const left = view.centerX - halfW;
  const top = view.centerY - halfH;
  const stepX = (2 * halfW) / width;
  const stepY = (2 * halfH) / height;
  const { maxIter } = view;

  for (let py = 0; py < height; py += 1) {
    const ci = top + (py + 0.5) * stepY;
    let offset = py * width * 4;

    for (let px = 0; px < width; px += 1) {
      const cr = left + (px + 0.5) * stepX;
      let zr = 0;
      let zi = 0;
      let zr2 = 0;
      let zi2 = 0;
      let iterations = 0;

      while (iterations < maxIter && zr2 + zi2 <= 4) {
        zi = 2 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        zr2 = zr * zr;
        zi2 = zi * zi;
        iterations += 1;
      }

      if (iterations >= maxIter) {
        buf[offset] = INTERIOR[0];
        buf[offset + 1] = INTERIOR[1];
        buf[offset + 2] = INTERIOR[2];
      } else {
        // Smooth coloring: fractional iteration count derived from the escape
        // modulus removes visible color banding between iteration levels.
        const modulus = Math.sqrt(zr2 + zi2);
        const smooth = iterations + 1 - Math.log(Math.log(modulus)) / Math.LN2;
        const [r, g, b] = samplePalette(view.palette, smooth / maxIter);
        buf[offset] = r;
        buf[offset + 1] = g;
        buf[offset + 2] = b;
      }

      buf[offset + 3] = 255;
      offset += 4;
    }
  }
}
