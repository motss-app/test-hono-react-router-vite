/**
 * WebGL2 Mandelbrot renderer.
 *
 * Runs the escape loop per-pixel in a fragment shader — the GPU evaluates
 * every pixel in parallel, so a frame costs ~1-2ms instead of the ~100ms the
 * CPU kernels need. The math mirrors `packages/fractal-wasm/src/lib.rs`
 * (pixel-center mapping, smooth coloring, identical palette stops) so both
 * backends produce visually identical frames.
 *
 * A canvas can hold only one context type, so the page must decide between
 * this renderer and the 2D/WASM path before touching the canvas.
 */

import type { FractalPaletteName, FractalView } from './fractal-render.ts';

const VERTEX_SHADER_SOURCE = `#version 300 es
// Fullscreen triangle generated from gl_VertexID — no vertex buffers needed.
void main() {
  vec2 position = vec2(
    float((gl_VertexID << 1) & 2),
    float(gl_VertexID & 2)
  );
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform float uScale;
uniform float uAspect;
uniform vec2 uResolution;
uniform int uMaxIter;
uniform int uPalette;

out vec4 outColor;

// Palette stops — must match packages/fractal-wasm/src/lib.rs.
const vec3 FIRE_STOPS[5] = vec3[5](
  vec3(8.0, 6.0, 18.0),
  vec3(122.0, 15.0, 20.0),
  vec3(232.0, 92.0, 22.0),
  vec3(255.0, 205.0, 70.0),
  vec3(255.0, 252.0, 224.0)
);

const vec3 ICE_STOPS[5] = vec3[5](
  vec3(6.0, 8.0, 20.0),
  vec3(18.0, 60.0, 130.0),
  vec3(40.0, 150.0, 210.0),
  vec3(140.0, 225.0, 245.0),
  vec3(245.0, 252.0, 255.0)
);

const vec3 MONO_STOPS[4] = vec3[4](
  vec3(10.0, 10.0, 12.0),
  vec3(90.0, 90.0, 96.0),
  vec3(180.0, 180.0, 188.0),
  vec3(245.0, 245.0, 248.0)
);

const vec3 VIRIDIS_STOPS[5] = vec3[5](
  vec3(68.0, 1.0, 84.0),
  vec3(59.0, 82.0, 139.0),
  vec3(33.0, 145.0, 140.0),
  vec3(94.0, 201.0, 98.0),
  vec3(253.0, 231.0, 37.0)
);

// Mirrors Palette::sample — lerp between neighboring stops.
vec3 samplePalette(float t, int palette) {
  float last;
  if (palette == 2) {
    last = 3.0;
  } else {
    last = 4.0;
  }

  float scaled = clamp(t, 0.0, 1.0) * last;
  int index = int(min(floor(scaled), last - 1.0));
  float frac = scaled - float(index);

  vec3 start;
  vec3 end;
  if (palette == 0) {
    start = FIRE_STOPS[index];
    end = FIRE_STOPS[index + 1];
  } else if (palette == 1) {
    start = ICE_STOPS[index];
    end = ICE_STOPS[index + 1];
  } else if (palette == 2) {
    start = MONO_STOPS[index];
    end = MONO_STOPS[index + 1];
  } else {
    start = VIRIDIS_STOPS[index];
    end = VIRIDIS_STOPS[index + 1];
  }

  return start + (end - start) * frac;
}

void main() {
  // Pixel-center mapping identical to the CPU kernels: gl_FragCoord already
  // sits at (px + 0.5, py + 0.5). The y flip matches the CPU row order
  // (canvas top row = lowest complex imaginary part).
  vec2 uv = gl_FragCoord.xy / uResolution;
  float cr = uCenter.x + (uv.x * 2.0 - 1.0) * uScale * uAspect;
  float ci = uCenter.y - (uv.y * 2.0 - 1.0) * uScale;

  // Escape loop — same iteration order as escape_time in the Rust kernel.
  vec2 z = vec2(0.0);
  float zr2 = 0.0;
  float zi2 = 0.0;
  int iterations = 0;

  for (int i = 0; i < uMaxIter; i++) {
    if (zr2 + zi2 > 4.0) {
      break;
    }
    z = vec2(zr2 - zi2 + cr, 2.0 * z.x * z.y + ci);
    zr2 = z.x * z.x;
    zi2 = z.y * z.y;
    iterations = i + 1;
  }

  if (iterations >= uMaxIter) {
    // Interior color [8, 10, 22] — matches the Rust kernel.
    outColor = vec4(8.0 / 255.0, 10.0 / 255.0, 22.0 / 255.0, 1.0);
    return;
  }

  // Smooth coloring: fractional iteration count removes banding. Note:
  // "smooth" itself is a reserved keyword in GLSL ES 3.00.
  float modulus = sqrt(zr2 + zi2);
  float smoothT = float(iterations) + 1.0 - log(log(modulus)) / 0.6931471805599453;
  vec3 color = samplePalette(smoothT / float(uMaxIter), uPalette);

  outColor = vec4(color / 255.0, 1.0);
}`;

const PALETTE_INDEX: Record<FractalPaletteName, number> = {
  fire: 0,
  ice: 1,
  mono: 2,
  viridis: 3,
};

export interface FractalWebglRenderer {
  /** Draws the current viewport. Returns immediately; the GPU runs async. */
  render(view: FractalView): void;
  /** Blocks until the GPU pipeline has fully executed — used to time races. */
  finish(): void;
  /** Releases the GL context and its resources. */
  dispose(): void;
}

function compileShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) {
    return null;
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    // biome-ignore lint/suspicious/noConsole: a failed shader silently falls back to WASM, so keep the reason visible
    console.warn('[fractal-webgl] shader compile failed:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
  if (!vertex || !fragment) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    return null;
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    // biome-ignore lint/suspicious/noConsole: a failed link silently falls back to WASM, so keep the reason visible
    console.warn('[fractal-webgl] program link failed:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Creates a WebGL2 renderer bound to `canvas`, or `null` when WebGL2 is
 * unavailable or shader compilation fails — callers fall back to the WASM
 * backend in that case.
 */
export function createFractalWebglRenderer(canvas: HTMLCanvasElement): FractalWebglRenderer | null {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    return null;
  }

  const program = createProgram(gl);
  if (!program) {
    return null;
  }

  const uniforms = {
    uAspect: gl.getUniformLocation(program, 'uAspect'),
    uCenter: gl.getUniformLocation(program, 'uCenter'),
    uMaxIter: gl.getUniformLocation(program, 'uMaxIter'),
    uPalette: gl.getUniformLocation(program, 'uPalette'),
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uScale: gl.getUniformLocation(program, 'uScale'),
  };

  // biome-ignore lint/correctness/useHookAtTopLevel: WebGL API call, not a React hook
  gl.useProgram(program);
  gl.viewport(0, 0, canvas.width, canvas.height);

  return {
    dispose() {
      gl.deleteProgram(program);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
    finish() {
      gl.finish();
    },
    render(view) {
      gl.uniform2f(uniforms.uCenter, view.centerX, view.centerY);
      gl.uniform1f(uniforms.uScale, view.scale);
      gl.uniform1f(uniforms.uAspect, canvas.width / canvas.height);
      gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
      gl.uniform1i(uniforms.uMaxIter, view.maxIter);
      gl.uniform1i(uniforms.uPalette, PALETTE_INDEX[view.palette]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}
