import type { JSX } from 'react';
import {
  type ChangeEvent as ReactChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import {
  type FractalPaletteName,
  type FractalView,
  renderMandelbrotJs,
} from '../utils/fractal-render.ts';
import {
  FRACTAL_PALETTE_IDS,
  type FractalWasmModule,
  loadFractalWasm,
  wasmFrameView,
} from '../utils/fractal-wasm.ts';
import { createFractalWebglRenderer, type FractalWebglRenderer } from '../utils/fractal-webgl.ts';
import type { Route } from './+types/labs-mandelbrot.ts';
import * as c from './labs-mandelbrot.css.ts';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const EDGE_WIDTH = 1920;
const EDGE_HEIGHT = 1080;

const DEFAULT_VIEW: FractalView = {
  centerX: -0.7,
  centerY: 0,
  maxIter: 200,
  palette: 'fire',
  scale: 1.35,
};

const PALETTES: readonly FractalPaletteName[] = [
  'fire',
  'ice',
  'mono',
  'viridis',
];
const BASE_SCALE = DEFAULT_VIEW.scale;

/**
 * Quiet period before an iteration-slider change triggers a render. A full
 * render blocks the main thread for ~100ms, so slider drags must not render
 * per tick.
 */
const RENDER_DEBOUNCE_MS = 150;

const PALETTE_LABELS: Record<FractalPaletteName, () => string> = {
  fire: m.labs_mandelbrot_palette_fire,
  ice: m.labs_mandelbrot_palette_ice,
  mono: m.labs_mandelbrot_palette_mono,
  viridis: m.labs_mandelbrot_palette_viridis,
};

const ENGINE_LABELS: Record<FractalEngine, () => string> = {
  js: m.labs_mandelbrot_engine_javascript,
  wasm: m.labs_mandelbrot_engine_wasm,
  webgl2: m.labs_mandelbrot_engine_webgl2,
};

const ENGINES: readonly FractalEngine[] = [
  'js',
  'wasm',
  'webgl2',
];

type WasmStatus = 'loading' | 'ready' | 'error';
type EdgeStatus = 'idle' | 'loading' | 'ready' | 'error';
type FractalEngine = 'js' | 'wasm' | 'webgl2';

interface EdgeResult {
  bytes: number;
  ms: number;
  url: string;
}

interface RaceResult {
  gpuMs: number | null;
  jsMs: number;
  wasmMs: number;
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_labs_mandelbrot_title(),
    },
    {
      content: m.meta_labs_mandelbrot_desc(),
      name: 'description',
    },
  ];
}

function formatMs(ms: number): string {
  return `${ms.toFixed(1)} ms`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

interface ViewControlsProps {
  engine: FractalEngine | null;
  maxIter: number;
  onEngineChange: (event: ReactChangeEvent<HTMLSelectElement>) => void;
  onIterationsChange: (event: ReactChangeEvent<HTMLInputElement>) => void;
  onPaletteChange: (event: ReactChangeEvent<HTMLSelectElement>) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  palette: FractalPaletteName;
  webgl2Available: boolean;
}

function ViewControls({
  engine,
  maxIter,
  onEngineChange,
  onIterationsChange,
  onPaletteChange,
  onReset,
  onZoomIn,
  onZoomOut,
  palette,
  webgl2Available,
}: ViewControlsProps): JSX.Element {
  // Static, page-scoped ids: useId() produces different values between the
  // dev SSR pass and the client bundle, which breaks hydration.
  const engineId = 'labs-mandelbrot-engine';
  const iterationsId = 'labs-mandelbrot-iterations';
  const paletteId = 'labs-mandelbrot-palette';

  return (
    <div className={c.controlsRow}>
      {/* Rendered only once the client picked the default engine, so SSR and
          hydration always agree. */}
      {engine === null ? null : (
        <div className={c.controlGroup}>
          <label
            className={c.controlLabel}
            htmlFor={engineId}
          >
            {m.labs_mandelbrot_label_engine()}
          </label>
          <select
            className={c.selectInput}
            id={engineId}
            onChange={onEngineChange}
            value={engine}
          >
            {ENGINES.map(name => (
              <option
                disabled={name === 'webgl2' && !webgl2Available}
                key={name}
                value={name}
              >
                {ENGINE_LABELS[name]()}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={c.controlGroup}>
        <label
          className={c.controlLabel}
          htmlFor={iterationsId}
        >
          {m.labs_mandelbrot_label_iterations()}
        </label>
        <input
          className={c.rangeInput}
          id={iterationsId}
          max={1000}
          min={50}
          onChange={onIterationsChange}
          step={10}
          type="range"
          value={maxIter}
        />
        <span className={c.raceValue}>{maxIter}</span>
      </div>

      <div className={c.controlGroup}>
        <label
          className={c.controlLabel}
          htmlFor={paletteId}
        >
          {m.labs_mandelbrot_label_palette()}
        </label>
        <select
          className={c.selectInput}
          id={paletteId}
          onChange={onPaletteChange}
          value={palette}
        >
          {PALETTES.map(name => (
            <option
              key={name}
              value={name}
            >
              {PALETTE_LABELS[name]()}
            </option>
          ))}
        </select>
      </div>

      <div className={c.controlGroup}>
        <button
          className={c.zoomButton}
          onClick={onZoomIn}
          type="button"
        >
          {m.labs_mandelbrot_action_zoom_in()}
        </button>
        <button
          className={c.zoomButton}
          onClick={onZoomOut}
          type="button"
        >
          {m.labs_mandelbrot_action_zoom_out()}
        </button>
        <button
          className={c.zoomButton}
          onClick={onReset}
          type="button"
        >
          {m.labs_mandelbrot_action_reset()}
        </button>
      </div>
    </div>
  );
}

interface ViewStatusBarProps {
  centerX: number;
  centerY: number;
  engine: FractalEngine | null;
  renderMs: number | null;
  scale: number;
}

function ViewStatusBar({
  centerX,
  centerY,
  engine,
  renderMs,
  scale,
}: ViewStatusBarProps): JSX.Element {
  return (
    <div className={c.statusBar}>
      <div className={c.statusItem}>
        <p className={c.statusLabel}>
          {engine === 'webgl2'
            ? m.labs_mandelbrot_label_render_ms_gpu()
            : engine === 'js'
              ? m.labs_mandelbrot_label_render_ms_js()
              : m.labs_mandelbrot_label_render_ms()}
        </p>
        <p className={c.statusValue}>{renderMs === null ? '-' : formatMs(renderMs)}</p>
      </div>
      <div className={c.statusItem}>
        <p className={c.statusLabel}>{m.labs_mandelbrot_label_resolution()}</p>
        <p className={c.statusValue}>
          {CANVAS_WIDTH}×{CANVAS_HEIGHT}
        </p>
      </div>
      <div className={c.statusItem}>
        <p className={c.statusLabel}>{m.labs_mandelbrot_label_center()}</p>
        <p className={c.statusValue}>
          {centerX.toFixed(6)}, {centerY.toFixed(6)}i
        </p>
      </div>
      <div className={c.statusItem}>
        <p className={c.statusLabel}>{m.labs_mandelbrot_label_zoom()}</p>
        <p className={c.statusValue}>{(BASE_SCALE / scale).toFixed(1)}×</p>
      </div>
    </div>
  );
}

function RaceResults({ race }: { race: RaceResult }): JSX.Element {
  const slowest = Math.max(race.jsMs, race.wasmMs, race.gpuMs ?? 0);
  const speedupOf = (ms: number): string => (ms > 0 ? ` (${(race.jsMs / ms).toFixed(1)}×)` : '');

  return (
    <div>
      <div className={c.raceRow}>
        <span className={c.raceName}>{m.labs_mandelbrot_label_javascript()}</span>
        <div className={c.raceTrack}>
          <div
            className={`${c.raceFill} ${c.raceFillJs}`}
            style={{
              width: `${(race.jsMs / slowest) * 100}%`,
            }}
          />
        </div>
        <span className={c.raceValue}>{formatMs(race.jsMs)}</span>
      </div>
      <div className={c.raceRow}>
        <span className={c.raceName}>{m.labs_mandelbrot_label_wasm()}</span>
        <div className={c.raceTrack}>
          <div
            className={`${c.raceFill} ${c.raceFillWasm}`}
            style={{
              width: `${(race.wasmMs / slowest) * 100}%`,
            }}
          />
        </div>
        <span className={c.raceValue}>
          {formatMs(race.wasmMs)}
          {speedupOf(race.wasmMs)}
        </span>
      </div>
      {race.gpuMs === null ? null : (
        <div className={c.raceRow}>
          <span className={c.raceName}>{m.labs_mandelbrot_label_webgl()}</span>
          <div className={c.raceTrack}>
            <div
              className={`${c.raceFill} ${c.raceFillGpu}`}
              style={{
                width: `${(race.gpuMs / slowest) * 100}%`,
              }}
            />
          </div>
          <span className={c.raceValue}>
            {formatMs(race.gpuMs)}
            {speedupOf(race.gpuMs)}
          </span>
        </div>
      )}
    </div>
  );
}

function EdgeResultView({ edge }: { edge: EdgeResult }): JSX.Element {
  return (
    <div className={c.edgeResult}>
      <img
        alt={m.labs_mandelbrot_edge_title()}
        className={c.edgeImage}
        src={edge.url}
      />
      <div className={c.edgeMeta}>
        <div className={c.statusItem}>
          <p className={c.statusLabel}>{m.labs_mandelbrot_label_edge_time()}</p>
          <p className={c.statusValue}>{formatMs(edge.ms)}</p>
        </div>
        <div className={c.statusItem}>
          <p className={c.statusLabel}>{m.labs_mandelbrot_label_file_size()}</p>
          <p className={c.statusValue}>{formatBytes(edge.bytes)}</p>
        </div>
        <a
          className={c.edgeDownload}
          download="mandelbrot-edge.png"
          href={edge.url}
        >
          {m.labs_mandelbrot_action_download()}
        </a>
      </div>
    </div>
  );
}

function RustLabHero(): JSX.Element {
  return (
    <section className={c.hero}>
      <div className={c.heroInner}>
        <div className={c.heroCopy}>
          <Text
            as="h1"
            className={c.title}
          >
            {m.labs_mandelbrot_title()}
            <span className={c.titleAccent}>{m.labs_mandelbrot_title_accent()}</span>
          </Text>

          <Text
            as="p"
            className={c.heroLead}
          >
            {m.labs_mandelbrot_hero_lead()}
          </Text>

          <p className={c.heroBody}>{m.labs_mandelbrot_hero_body()}</p>

          <div className={c.heroActions}>
            <Link
              className={c.ctaSecondary}
              to="/labs"
            >
              <IconArrowLeft className={iconStyles.base} />
              <span>{m.labs_mandelbrot_cta_back_home()}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ intro, title }: { intro: string; title: string }): JSX.Element {
  return (
    <>
      <Text
        as="h2"
        className={c.sectionTitle}
      >
        {title}
      </Text>
      <p className={c.sectionIntro}>{intro}</p>
    </>
  );
}

/**
 * Runs the three engines back to back on the current viewport and keeps the
 * latest timings.
 */
function useRace(
  glRendererRef: React.RefObject<FractalWebglRenderer | null>,
  view: FractalView,
  wasmModuleRef: React.RefObject<FractalWasmModule | null>
): {
  race: RaceResult | null;
  runRace: () => void;
} {
  const [race, setRace] = useState<RaceResult | null>(null);

  const runRace = useCallback(() => {
    const mod = wasmModuleRef.current;
    if (!mod) {
      return;
    }

    const jsBuffer = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
    const jsStarted = performance.now();
    renderMandelbrotJs(jsBuffer, CANVAS_WIDTH, CANVAS_HEIGHT, view);
    const jsMs = performance.now() - jsStarted;

    const wasmStarted = performance.now();
    if (typeof mod.render_fast === 'function' && typeof mod.wasm_memory === 'function') {
      // Zero-copy path: compute lands in the module's persistent buffer, so
      // this times the same work JS does (compute + writes) with no per-frame
      // allocation and no boundary copy.
      mod.render_fast(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        view.centerX,
        view.centerY,
        view.scale,
        view.maxIter,
        FRACTAL_PALETTE_IDS[view.palette]
      );
    } else {
      mod.render(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        view.centerX,
        view.centerY,
        view.scale,
        view.maxIter,
        view.palette
      );
    }
    const wasmDuration = performance.now() - wasmStarted;

    const glRenderer = glRendererRef.current;
    let gpuMs: number | null = null;
    if (glRenderer) {
      const gpuStarted = performance.now();
      glRenderer.render(view);
      glRenderer.finish();
      gpuMs = performance.now() - gpuStarted;
    }

    setRace({
      gpuMs,
      jsMs,
      wasmMs: wasmDuration,
    });
  }, [
    view,
    // The ref objects are stable. They are listed to satisfy
    // useExhaustiveDependencies.
    glRendererRef,
    wasmModuleRef,
  ]);

  return {
    race,
    runRace,
  };
}

/**
 * Renders the current viewport on the fractal-rust worker at 1920×1080 and
 * keeps the returned PNG (as a blob URL) plus its timing.
 */
function useEdgeRender(view: FractalView): {
  edge: EdgeResult | null;
  edgeError: string | null;
  edgeStatus: EdgeStatus;
  renderOnEdge: () => Promise<void>;
} {
  const [edgeStatus, setEdgeStatus] = useState<EdgeStatus>('idle');
  const [edgeError, setEdgeError] = useState<string | null>(null);
  const [edge, setEdge] = useState<EdgeResult | null>(null);

  const renderOnEdge = useCallback(async () => {
    setEdgeStatus('loading');
    setEdgeError(null);

    try {
      const params = new URLSearchParams({
        cx: String(view.centerX),
        cy: String(view.centerY),
        height: String(EDGE_HEIGHT),
        max_iter: String(view.maxIter),
        palette: view.palette,
        scale: String(view.scale),
        width: String(EDGE_WIDTH),
      });
      const response = await fetch(`/api/rust/fractal/render?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const ms = Number(response.headers.get('x-render-time-ms') ?? '0');

      setEdge(prev => {
        if (prev) {
          URL.revokeObjectURL(prev.url);
        }
        return {
          bytes: blob.size,
          ms,
          url,
        };
      });
      setEdgeStatus('ready');
    } catch (error) {
      setEdgeError(error instanceof Error ? error.message : String(error));
      setEdgeStatus('error');
    }
  }, [
    view,
  ]);

  // Revoke the object URL when the page unloads.
  useEffect(() => {
    return () => {
      setEdge(prev => {
        if (prev) {
          URL.revokeObjectURL(prev.url);
        }
        return null;
      });
    };
  }, []);

  return {
    edge,
    edgeError,
    edgeStatus,
    renderOnEdge,
  };
}

interface CanvasPanelProps {
  canvas2dRef: React.RefObject<HTMLCanvasElement | null>;
  canvasGlRef: React.RefObject<HTMLCanvasElement | null>;
  engine: FractalEngine | null;
  handlePointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  shellRef: React.RefObject<HTMLDivElement | null>;
  wasmStatus: WasmStatus;
}

function CanvasPanel({
  canvas2dRef,
  canvasGlRef,
  engine,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  shellRef,
  wasmStatus,
}: CanvasPanelProps): JSX.Element {
  return (
    <div
      className={c.canvasShell}
      ref={shellRef}
    >
      {/* One canvas per context type because a canvas cannot host both 2D and
          WebGL2. Only the active engine's canvas is shown. */}
      <canvas
        className={`${c.canvas} ${engine === 'webgl2' ? c.canvasHidden : ''}`.trim()}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvas2dRef}
        width={CANVAS_WIDTH}
      />
      <canvas
        className={`${c.canvas} ${engine === 'webgl2' ? '' : c.canvasHidden}`.trim()}
        height={CANVAS_HEIGHT}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvasGlRef}
        width={CANVAS_WIDTH}
      />
      {engine === 'wasm' && wasmStatus !== 'ready' ? (
        <div className={c.canvasOverlay}>
          {wasmStatus === 'loading'
            ? m.labs_mandelbrot_status_loading()
            : m.labs_mandelbrot_status_error()}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Paints one CPU frame (`js` or `wasm` engine) into the 2D context. Owns the
 * WASM fast-path wiring (persistent-buffer render plus zero-copy view) with a
 * legacy-`render` fallback for older cached glue. Split out so
 * `useFractalCanvas` stays under the line-count lint. Pure paint with no timing.
 */
function paintCpuFrame(
  context: CanvasRenderingContext2D,
  engine: 'js' | 'wasm',
  mod: FractalWasmModule | null,
  view: FractalView
): void {
  if (engine === 'js') {
    const buffer = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
    renderMandelbrotJs(buffer, CANVAS_WIDTH, CANVAS_HEIGHT, view);
    context.putImageData(new ImageData(buffer, CANVAS_WIDTH, CANVAS_HEIGHT), 0, 0);
  } else if (mod) {
    const byteLength = CANVAS_WIDTH * CANVAS_HEIGHT * 4;
    if (typeof mod.render_fast === 'function' && typeof mod.wasm_memory === 'function') {
      // Zero-copy path: one view over WASM memory straight into `ImageData`,
      // replacing the legacy `render` round-trip of a 2MB `.slice()` copy
      // plus a second `Uint8ClampedArray` copy. `wasmFrameView` aliases WASM
      // memory, so it must be consumed synchronously before the next render
      // reuses the buffer.
      const ptr = mod.render_fast(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        view.centerX,
        view.centerY,
        view.scale,
        view.maxIter,
        FRACTAL_PALETTE_IDS[view.palette]
      );
      const frame = wasmFrameView(mod, ptr, byteLength);
      context.putImageData(new ImageData(frame, CANVAS_WIDTH, CANVAS_HEIGHT), 0, 0);
    } else {
      const rgba = mod.render(
        CANVAS_WIDTH,
        CANVAS_HEIGHT,
        view.centerX,
        view.centerY,
        view.scale,
        view.maxIter,
        view.palette
      );
      context.putImageData(
        new ImageData(new Uint8ClampedArray(rgba), CANVAS_WIDTH, CANVAS_HEIGHT),
        0,
        0
      );
    }
  }
}

/**
 * Owns the interactive canvases: rendering engine selection, WASM module
 * loading, viewport state, and the pointer/wheel interaction handlers. Keeps
 * the page component presentational.
 */
function useFractalCanvas(): {
  canvas2dRef: React.RefObject<HTMLCanvasElement | null>;
  canvasGlRef: React.RefObject<HTMLCanvasElement | null>;
  engine: FractalEngine | null;
  glRendererRef: React.RefObject<FractalWebglRenderer | null>;
  handlePointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  renderMs: number | null;
  resetView: () => void;
  setEngine: React.Dispatch<React.SetStateAction<FractalEngine | null>>;
  setView: React.Dispatch<React.SetStateAction<FractalView>>;
  shellRef: React.RefObject<HTMLDivElement | null>;
  view: FractalView;
  wasmModuleRef: React.RefObject<FractalWasmModule | null>;
  wasmStatus: WasmStatus;
  webgl2Available: boolean;
} {
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const canvasGlRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const wasmModuleRef = useRef<FractalWasmModule | null>(null);
  const glRendererRef = useRef<FractalWebglRenderer | null>(null);
  const context2dRef = useRef<CanvasRenderingContext2D | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  const [wasmStatus, setWasmStatus] = useState<WasmStatus>('loading');
  const [wasmModule, setWasmModule] = useState<FractalWasmModule | null>(null);
  const [engine, setEngine] = useState<FractalEngine | null>(null);
  const [webgl2Available, setWebgl2Available] = useState(false);
  const [view, setView] = useState<FractalView>(DEFAULT_VIEW);
  const [renderMs, setRenderMs] = useState<number | null>(null);
  const lastScheduledRef = useRef<FractalView>(DEFAULT_VIEW);

  // Load the Rust WASM module once, on the client only.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mod = await loadFractalWasm();
        if (cancelled) {
          return;
        }
        wasmModuleRef.current = mod;
        setWasmModule(mod);
        setWasmStatus('ready');
      } catch {
        if (!cancelled) {
          setWasmStatus('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Set up both rendering contexts once, on the client only. The canvases
  // are separate because a canvas supports only one context type: the 2D
  // canvas serves the CPU engines (JavaScript and WASM), the WebGL2 canvas
  // serves the GPU.
  useEffect(() => {
    const canvas2d = canvas2dRef.current;
    const canvasGl = canvasGlRef.current;
    if (!canvas2d || !canvasGl) {
      return;
    }

    context2dRef.current = canvas2d.getContext('2d');
    const glRenderer = createFractalWebglRenderer(canvasGl);
    glRendererRef.current = glRenderer;
    setWebgl2Available(glRenderer !== null);
    // Default to the fastest available engine.
    setEngine(glRenderer ? 'webgl2' : 'wasm');
  }, []);

  // Render the current viewport whenever the engine or view changes. The GPU
  // engine draws in ~1-2ms, so it renders immediately. The CPU engines block
  // the main thread for ~100-160ms, so iteration-slider drags are debounced
  // while pan, zoom, and palette changes stay immediate.
  useEffect(() => {
    const mod = wasmModule;
    if (engine === null || (engine === 'wasm' && !mod)) {
      return;
    }

    const previous = lastScheduledRef.current;
    lastScheduledRef.current = view;
    const onlyIterationsChanged =
      previous.centerX === view.centerX &&
      previous.centerY === view.centerY &&
      previous.scale === view.scale &&
      previous.palette === view.palette &&
      previous.maxIter !== view.maxIter;
    const delay = engine === 'webgl2' || !onlyIterationsChanged ? 0 : RENDER_DEBOUNCE_MS;

    const timer = setTimeout(() => {
      const started = performance.now();

      if (engine === 'webgl2') {
        const renderer = glRendererRef.current;
        if (!renderer) {
          return;
        }
        renderer.render(view);
        renderer.finish();
      } else {
        const context = context2dRef.current;
        if (!context) {
          return;
        }
        paintCpuFrame(context, engine, mod, view);
      }

      setRenderMs(performance.now() - started);
    }, delay);

    return () => clearTimeout(timer);
  }, [
    engine,
    wasmModule,
    view,
  ]);

  // Zoom with the wheel, but only while Ctrl (or Cmd) is held. Plain scroll
  // must keep scrolling the page (a11y). The listener lives on the shell so
  // it keeps working no matter which canvas is active. A native non-passive
  // listener is required so `preventDefault` can block the browser's own
  // ctrl+wheel page zoom while zooming the fractal.
  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const handleWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      const rect = shell.getBoundingClientRect();
      const pointX = (event.clientX - rect.left) / rect.width;
      const pointY = (event.clientY - rect.top) / rect.height;
      const factor = event.deltaY > 0 ? 1.25 : 0.8;

      setView(prev => {
        const nextScale = Math.min(Math.max(prev.scale * factor, 1e-6), 4);
        const zoomRatio = nextScale / prev.scale;
        const halfW = prev.scale * (CANVAS_WIDTH / CANVAS_HEIGHT);
        const pointCx = prev.centerX - halfW + pointX * 2 * halfW;
        const pointCy = prev.centerY - prev.scale + pointY * 2 * prev.scale;

        return {
          ...prev,
          centerX: pointCx + (prev.centerX - pointCx) * zoomRatio,
          centerY: pointCy + (prev.centerY - pointCy) * zoomRatio,
          scale: nextScale,
        };
      });
    };

    shell.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    return () => shell.removeEventListener('wheel', handleWheel);
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const deltaX = (event.clientX - drag.x) / rect.width;
    const deltaY = (event.clientY - drag.y) / rect.height;
    drag.x = event.clientX;
    drag.y = event.clientY;

    setView(prev => {
      const halfW = prev.scale * (CANVAS_WIDTH / CANVAS_HEIGHT);
      return {
        ...prev,
        centerX: prev.centerX - deltaX * 2 * halfW,
        centerY: prev.centerY - deltaY * 2 * prev.scale,
      };
    });
  }, []);

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const resetView = useCallback(() => {
    setView(DEFAULT_VIEW);
  }, []);

  return {
    canvas2dRef,
    canvasGlRef,
    engine,
    glRendererRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    renderMs,
    resetView,
    setEngine,
    setView,
    shellRef,
    view,
    wasmModuleRef,
    wasmStatus,
    webgl2Available,
  };
}

export default function RustLab(): JSX.Element {
  const {
    canvas2dRef,
    canvasGlRef,
    engine,
    glRendererRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    renderMs,
    setEngine,
    setView,
    shellRef,
    view,
    wasmModuleRef,
    wasmStatus,
    webgl2Available,
  } = useFractalCanvas();

  const { race, runRace } = useRace(glRendererRef, view, wasmModuleRef);
  const { edge, edgeError, edgeStatus, renderOnEdge } = useEdgeRender(view);

  const zoomCanvas = useCallback(
    (factor: number) => {
      setView(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * factor, 1e-6), 4),
      }));
    },
    [
      setView,
    ]
  );

  const resetView = useCallback(() => {
    setView(DEFAULT_VIEW);
  }, [
    setView,
  ]);

  const handleIterationsChange = useCallback(
    (event: ReactChangeEvent<HTMLInputElement>) => {
      const maxIter = Number(event.target.value);
      setView(prev => ({
        ...prev,
        maxIter,
      }));
    },
    [
      setView,
    ]
  );

  const handlePaletteChange = useCallback(
    (event: ReactChangeEvent<HTMLSelectElement>) => {
      const palette = event.target.value as FractalPaletteName;
      setView(prev => ({
        ...prev,
        palette,
      }));
    },
    [
      setView,
    ]
  );

  const handleEngineChange = useCallback(
    (event: ReactChangeEvent<HTMLSelectElement>) => {
      setEngine(event.target.value as FractalEngine);
    },
    [
      setEngine,
    ]
  );

  const zoomIn = useCallback(() => {
    zoomCanvas(0.8);
  }, [
    zoomCanvas,
  ]);

  const zoomOut = useCallback(() => {
    zoomCanvas(1.25);
  }, [
    zoomCanvas,
  ]);

  return (
    <main className={c.page}>
      <RustLabHero />

      <section>
        <div className={c.labInner}>
          <SectionHeading
            intro={m.labs_mandelbrot_canvas_desc()}
            title={m.labs_mandelbrot_canvas_title()}
          />

          <div className={c.panel}>
            <CanvasPanel
              canvas2dRef={canvas2dRef}
              canvasGlRef={canvasGlRef}
              engine={engine}
              handlePointerDown={handlePointerDown}
              handlePointerMove={handlePointerMove}
              handlePointerUp={handlePointerUp}
              shellRef={shellRef}
              wasmStatus={wasmStatus}
            />

            <ViewControls
              engine={engine}
              maxIter={view.maxIter}
              onEngineChange={handleEngineChange}
              onIterationsChange={handleIterationsChange}
              onPaletteChange={handlePaletteChange}
              onReset={resetView}
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              palette={view.palette}
              webgl2Available={webgl2Available}
            />

            <ViewStatusBar
              centerX={view.centerX}
              centerY={view.centerY}
              engine={engine}
              renderMs={renderMs}
              scale={view.scale}
            />

            {engine === 'webgl2' ? (
              <p className={c.gpuNote}>{m.labs_mandelbrot_gpu_note()}</p>
            ) : null}
          </div>

          <SectionHeading
            intro={m.labs_mandelbrot_race_desc()}
            title={m.labs_mandelbrot_race_title()}
          />

          <div className={c.panel}>
            <div className={c.edgeActions}>
              <button
                className={`${c.actionButton} ${wasmStatus !== 'ready' ? c.actionButtonLoading : ''}`.trim()}
                disabled={wasmStatus !== 'ready'}
                onClick={runRace}
                type="button"
              >
                {m.labs_mandelbrot_action_run_race()}
              </button>
            </div>

            {race ? <RaceResults race={race} /> : null}
          </div>

          <SectionHeading
            intro={m.labs_mandelbrot_edge_desc()}
            title={m.labs_mandelbrot_edge_title()}
          />

          <div className={c.panel}>
            <div className={c.edgeActions}>
              <button
                className={`${c.actionButton} ${edgeStatus === 'loading' ? c.actionButtonLoading : ''}`.trim()}
                disabled={edgeStatus === 'loading'}
                onClick={renderOnEdge}
                type="button"
              >
                {m.labs_mandelbrot_action_render_edge()}
              </button>
            </div>

            {edgeError ? <div className={c.errorBox}>{edgeError}</div> : null}

            {edge ? <EdgeResultView edge={edge} /> : null}
          </div>

          <p className={c.footerNote}>
            {m.labs_mandelbrot_footer_note_1()}{' '}
            <span className={c.codeInline}>packages/fractal-wasm</span>
            {m.labs_mandelbrot_footer_note_2()}{' '}
            <span className={c.codeInline}>packages/fractal-rust</span>
            {m.labs_mandelbrot_footer_note_3()}
          </p>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
