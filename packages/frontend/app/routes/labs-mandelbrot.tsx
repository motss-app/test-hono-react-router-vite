import { assignInlineVars } from '@vanilla-extract/dynamic';
import type {
  JSX,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import {
  type ChangeEvent as ReactChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import { Breadcrumbs } from '../components/breadcrumbs.tsx';
import * as chrome from '../components/page-chrome.css.ts';
import * as footerStyles from '../components/page-footer.css.ts';
import {
  PagePreferences,
  SiteBrand,
  SiteNavigation,
  SkipToContent,
} from '../components/page-navigation.tsx';
import { PoweredByTools } from '../components/powered-by-tools.tsx';
import * as m from '../paraglide/messages.js';
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
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCloudArrowDown,
  IconDownload,
  IconMinus,
  IconPlus,
  IconRotateLeft,
  IconStopwatch,
} from './labs-mandelbrot.icons.ts';

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

export const links: Route.LinksFunction = () => [
  {
    as: 'image',
    href: '/assets/mandelbrot-expressive.svg',
    rel: 'preload',
    type: 'image/svg+xml',
  },
];

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
  children: ReactNode;
  engine: FractalEngine | null;
  maxIter: number;
  onIterationsChange: (event: ReactChangeEvent<HTMLInputElement>) => void;
  onEngineChange: (event: ReactChangeEvent<HTMLSelectElement>) => void;
  onPaletteChange: (event: ReactChangeEvent<HTMLSelectElement>) => void;
  palette: FractalPaletteName;
  webgl2Available: boolean;
}

function ViewControls({
  children,
  engine,
  maxIter,
  onEngineChange,
  onIterationsChange,
  onPaletteChange,
  palette,
  webgl2Available,
}: ViewControlsProps): JSX.Element {
  const controlsId = useId();
  const engineId = `${controlsId}-engine`;
  const settingsIterationsId = `${controlsId}-iterations`;
  const paletteId = `${controlsId}-palette`;
  const settingsId = `${controlsId}-settings`;
  return (
    <aside
      aria-labelledby={settingsId}
      className={c.controlsPanel}
    >
      <h2
        className={c.controlTitle}
        id={settingsId}
      >
        {m.labs_mandelbrot_settings_title()}
      </h2>
      <div className={c.controlGroup}>
        <label
          className={c.controlLabel}
          htmlFor={engineId}
        >
          {m.labs_mandelbrot_label_engine()}
        </label>
        <div className={c.controlsGrid}>
          <div className={c.controlFields}>
            <div className={c.controlGroup}>
              <select
                className={c.selectInput}
                disabled={engine === null}
                id={engineId}
                onChange={onEngineChange}
                value={engine ?? ''}
              >
                <option
                  disabled
                  hidden
                  value=""
                >
                  {m.labs_mandelbrot_status_preparing()}
                </option>
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
            <div className={c.settingsIterations}>
              <div className={c.controlGroup}>
                <div className={c.controlHeading}>
                  <label
                    className={c.controlLabel}
                    htmlFor={settingsIterationsId}
                  >
                    {m.labs_mandelbrot_label_iterations()}
                  </label>
                  <output
                    className={c.raceValue}
                    htmlFor={settingsIterationsId}
                  >
                    {maxIter}
                  </output>
                </div>
                <input
                  className={c.rangeInput}
                  id={settingsIterationsId}
                  max={1000}
                  min={50}
                  onChange={onIterationsChange}
                  step={10}
                  type="range"
                  value={maxIter}
                />
              </div>
            </div>
          </div>
          <div className={c.navigationCell}>{children}</div>
        </div>
      </div>
    </aside>
  );
}

function ViewNavigation({
  onPan,
  onKeyDown,
  onReset,
  onZoomIn,
  onZoomOut,
}: {
  onPan: (x: number, y: number) => void;
  onKeyDown: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}): JSX.Element {
  const navigationId = useId();
  const handlePan = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      onPan(Number(event.currentTarget.dataset.panX), Number(event.currentTarget.dataset.panY));
    },
    [
      onPan,
    ]
  );
  const controls = [
    {
      area: c.panAreas.zoomIn,
      Icon: IconPlus,
      label: m.labs_mandelbrot_action_zoom_in(),
      onClick: onZoomIn,
    },
    {
      area: c.panAreas.reset,
      Icon: IconRotateLeft,
      label: m.labs_mandelbrot_action_reset(),
      onClick: onReset,
    },
    {
      area: c.panAreas.zoomOut,
      Icon: IconMinus,
      label: m.labs_mandelbrot_action_zoom_out(),
      onClick: onZoomOut,
    },
    {
      area: c.panAreas.up,
      Icon: IconArrowUp,
      label: m.labs_mandelbrot_pan_up(),
      x: 0,
      y: -1,
    },
    {
      area: c.panAreas.left,
      Icon: IconArrowLeft,
      label: m.labs_mandelbrot_pan_left(),
      x: -1,
      y: 0,
    },
    {
      area: c.panAreas.down,
      Icon: IconArrowDown,
      label: m.labs_mandelbrot_pan_down(),
      x: 0,
      y: 1,
    },
    {
      area: c.panAreas.right,
      Icon: IconArrowRight,
      label: m.labs_mandelbrot_pan_right(),
      x: 1,
      y: 0,
    },
  ];
  const renderControl = (control: (typeof controls)[number]) => (
    <button
      aria-label={control.label}
      className={`${c.panButton} ${control.area}`}
      data-pan-x={'x' in control ? control.x : undefined}
      data-pan-y={'y' in control ? control.y : undefined}
      key={control.label}
      onClick={'onClick' in control ? control.onClick : handlePan}
      onKeyDown={onKeyDown}
      title={control.label}
      type="button"
    >
      <control.Icon
        aria-hidden="true"
        className={c.panIcon}
      />
    </button>
  );
  return (
    <div className={c.navigationPanel}>
      <h3
        className={c.navigationTitle}
        id={navigationId}
      >
        {m.labs_mandelbrot_view_controls_title()}
      </h3>
      <fieldset
        aria-labelledby={navigationId}
        className={c.panControls}
      >
        {controls.map(renderControl)}
      </fieldset>
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
        {/*
         * Render time is a wall-clock measurement, so it differs on every
         * run. `data-vrt-volatile` tells scripts/vrt.ts to mask this value so
         * the screenshot stays byte-stable. The readiness gate below still
         * waits on the real `renderMs`, so masking never captures a
         * half-rendered canvas.
         */}
        <p
          className={c.statusValue}
          data-vrt-volatile=""
        >
          {renderMs === null ? '-' : formatMs(renderMs)}
        </p>
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

function RaceResults({ race }: { race: RaceResult | null }): JSX.Element {
  const slowest = race ? Math.max(race.jsMs, race.wasmMs, race.gpuMs ?? 0, Number.EPSILON) : 1;
  const rows = [
    {
      id: 'js',
      label: m.labs_mandelbrot_label_javascript(),
      ms: race?.jsMs ?? null,
      tone: c.raceFillJs,
    },
    {
      id: 'wasm',
      label: m.labs_mandelbrot_label_wasm(),
      ms: race?.wasmMs ?? null,
      tone: c.raceFillWasm,
    },
    {
      id: 'gpu',
      label: m.labs_mandelbrot_label_webgl(),
      ms: race?.gpuMs ?? null,
      tone: c.raceFillGpu,
    },
  ];
  return (
    <div
      aria-live="polite"
      className={c.raceResults}
      data-vrt-volatile={race ? '' : undefined}
    >
      {rows.map(({ id, label, ms, tone }) => {
        const speedup =
          race !== null && id !== 'js' && ms !== null && ms > 0
            ? `${(race.jsMs / ms).toFixed(1)}×`
            : '';
        const value =
          ms === null
            ? race !== null && id === 'gpu'
              ? m.labs_mandelbrot_unavailable()
              : 'N/A'
            : formatMs(ms);
        return (
          <div
            className={c.raceRow}
            key={id}
          >
            <span className={c.raceName}>{label}</span>
            <div className={c.raceMetric}>
              <span className={c.raceValue}>{value}</span>
              <span
                aria-hidden={speedup === '' ? true : undefined}
                className={c.raceValue}
              >
                {speedup}
              </span>
            </div>
            <div
              aria-hidden="true"
              className={c.raceTrack}
            >
              <div
                className={`${c.raceFill} ${tone}`}
                style={assignInlineVars({
                  [c.raceWidth]: `${((ms ?? 0) / slowest) * 100}%`,
                })}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EdgeResultView({
  edge,
  error,
  status,
}: {
  edge: EdgeResult | null;
  error: string | null;
  status: EdgeStatus;
}): JSX.Element {
  const message = error
    ? `${m.labs_mandelbrot_status_edge_error()} ${error}`
    : status === 'loading'
      ? m.labs_mandelbrot_status_edge_loading()
      : edge === null
        ? m.labs_mandelbrot_export_empty()
        : null;
  return (
    <div className={c.edgeResult}>
      <div className={c.edgePreview}>
        {edge ? (
          <img
            alt={m.labs_mandelbrot_edge_title()}
            className={c.edgeImage}
            height={EDGE_HEIGHT}
            src={edge.url}
            width={EDGE_WIDTH}
          />
        ) : null}
        {message === null ? null : (
          <div
            className={c.edgeMessage}
            role={error ? 'alert' : 'status'}
          >
            {message}
          </div>
        )}
        <span
          className={c.visuallyHidden}
          role="status"
        >
          {status === 'ready' ? m.labs_mandelbrot_export_ready() : ''}
        </span>
      </div>
      <div className={c.edgeMeta}>
        <div className={c.statusItem}>
          <p className={c.statusLabel}>{m.labs_mandelbrot_label_edge_time()}</p>
          <p
            className={`${c.statusValue} ${c.edgeMetric}`}
            data-vrt-volatile={edge ? '' : undefined}
          >
            {edge ? formatMs(edge.ms) : 'N/A'}
          </p>
        </div>
        <div className={c.statusItem}>
          <p className={c.statusLabel}>{m.labs_mandelbrot_label_file_size()}</p>
          <p className={`${c.statusValue} ${c.edgeMetric}`}>
            {edge ? formatBytes(edge.bytes) : 'N/A'}
          </p>
        </div>
        {edge ? (
          <a
            className={c.edgeDownload}
            download="mandelbrot-edge.png"
            href={edge.url}
          >
            <IconDownload aria-hidden="true" />
            {m.labs_mandelbrot_action_download()}
          </a>
        ) : (
          <button
            className={c.edgeDownload}
            disabled
            type="button"
          >
            <IconDownload aria-hidden="true" />
            {m.labs_mandelbrot_action_download()}
          </button>
        )}
      </div>
    </div>
  );
}

function MandelbrotIntro(): JSX.Element {
  return (
    <header className={c.intro}>
      <h1 className={c.title}>
        {m.labs_mandelbrot_title()}{' '}
        <span className={c.titleAccent}>{m.labs_mandelbrot_title_accent()}</span>
      </h1>
      <p className={c.heroLead}>{m.labs_mandelbrot_hero_lead()}</p>
    </header>
  );
}

function SectionHeading({ intro, title }: { intro: string; title: string }): JSX.Element {
  return (
    <header className={c.sectionHeading}>
      <h2 className={c.sectionTitle}>{title}</h2>
      <p className={c.sectionIntro}>{intro}</p>
    </header>
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
  instructionsId: string;
  handlePointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  handlePointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  renderMs: number | null;
  shellRef: React.RefObject<HTMLDivElement | null>;
  wasmStatus: WasmStatus;
}

function CanvasPanel({
  canvas2dRef,
  canvasGlRef,
  engine,
  instructionsId,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  renderMs,
  shellRef,
  wasmStatus,
}: CanvasPanelProps): JSX.Element {
  return (
    <div
      className={c.canvasShell}
      /*
       * VRT readiness needs to cover every async signal on the page, not
       * just the canvas. `renderMs` alone is not enough: the WebGL2 engine
       * paints before the WASM module resolves, so the capture could land
       * while the "Run the race" button is still in its disabled loading
       * style. That produced a different button colour and a different
       * page height on roughly half of the runs. Waiting for the module to
       * settle as well makes the whole page quiescent before capture.
       *
       * A failed module load is also a settled state, and in that case the
       * canvas never renders, so the `engine === 'wasm'` branch keeps the
       * gate from hanging forever.
       */
      data-vrt-ready={
        wasmStatus !== 'loading' &&
        (renderMs !== null || (engine === 'wasm' && wasmStatus === 'error'))
          ? 'true'
          : 'false'
      }
      ref={shellRef}
    >
      {/* One canvas per context type because a canvas cannot host both 2D and
          WebGL2. Only the active engine's canvas is shown. */}
      <canvas
        aria-describedby={instructionsId}
        aria-label={m.labs_mandelbrot_canvas_alt()}
        className={`${c.canvas} ${engine === 'webgl2' ? c.canvasHidden : ''}`.trim()}
        height={CANVAS_HEIGHT}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvas2dRef}
        role="img"
        width={CANVAS_WIDTH}
      />
      <canvas
        aria-describedby={instructionsId}
        aria-label={m.labs_mandelbrot_canvas_alt()}
        className={`${c.canvas} ${engine === 'webgl2' ? '' : c.canvasHidden}`.trim()}
        height={CANVAS_HEIGHT}
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvasGlRef}
        role="img"
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
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }, []);

  const resetView = useCallback(() => {
    setView(previous => ({
      ...previous,
      centerX: DEFAULT_VIEW.centerX,
      centerY: DEFAULT_VIEW.centerY,
      scale: DEFAULT_VIEW.scale,
    }));
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
  const mainId = useId();
  const instructionsId = useId();
  const notesId = useId();
  const {
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

  const panView = useCallback(
    (x: number, y: number) => {
      setView(prev => ({
        ...prev,
        centerX: prev.centerX + x * prev.scale * 0.2 * (CANVAS_WIDTH / CANVAS_HEIGHT),
        centerY: prev.centerY + y * prev.scale * 0.2,
      }));
    },
    [
      setView,
    ]
  );
  const handleViewKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.target !== event.currentTarget)
      return;
    const directions: Record<
      string,
      [
        number,
        number,
      ]
    > = {
      ArrowDown: [
        0,
        1,
      ],
      ArrowLeft: [
        -1,
        0,
      ],
      ArrowRight: [
        1,
        0,
      ],
      ArrowUp: [
        0,
        -1,
      ],
    };
    const direction = directions[event.key];
    if (direction) panView(...direction);
    else if (event.key === '+' || event.key === '=') zoomIn();
    else if (event.key === '-') zoomOut();
    else if (event.key === 'Home') resetView();
    else return;
    event.preventDefault();
  };
  return (
    <MandelbrotLayout mainId={mainId}>
      <MandelbrotIntro />
      <section
        aria-label={m.labs_mandelbrot_canvas_title()}
        className={c.explorer}
      >
        <div className={c.canvasColumn}>
          <CanvasPanel
            canvas2dRef={canvas2dRef}
            canvasGlRef={canvasGlRef}
            engine={engine}
            handlePointerDown={handlePointerDown}
            handlePointerMove={handlePointerMove}
            handlePointerUp={handlePointerUp}
            instructionsId={instructionsId}
            renderMs={renderMs}
            shellRef={shellRef}
            wasmStatus={wasmStatus}
          />
          <div className={c.explorerDetails}>
            <p
              className={c.canvasHint}
              id={instructionsId}
            >
              {m.labs_mandelbrot_canvas_desc()}
            </p>
            <ViewStatusBar
              centerX={view.centerX}
              centerY={view.centerY}
              engine={engine}
              renderMs={renderMs}
              scale={view.scale}
            />
            <p className={c.gpuNote}>{m.labs_mandelbrot_gpu_note()}</p>
          </div>
        </div>
        <ViewControls
          engine={engine}
          maxIter={view.maxIter}
          onEngineChange={handleEngineChange}
          onIterationsChange={handleIterationsChange}
          onPaletteChange={handlePaletteChange}
          palette={view.palette}
          webgl2Available={webgl2Available}
        >
          <ViewNavigation
            onKeyDown={handleViewKeyDown}
            onPan={panView}
            onReset={resetView}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
          />
        </ViewControls>
      </section>
      <RenderingTools
        edge={edge}
        edgeError={edgeError}
        edgeStatus={edgeStatus}
        race={race}
        renderOnEdge={renderOnEdge}
        runRace={runRace}
        wasmStatus={wasmStatus}
      />
      <section
        aria-labelledby={notesId}
        className={c.implementation}
      >
        <h2
          className={c.sectionTitle}
          id={notesId}
        >
          {m.labs_mandelbrot_implementation_title()}
        </h2>
        <p className={c.footerNote}>{m.labs_mandelbrot_hero_body()}</p>
        <p className={c.footerNote}>
          {m.labs_mandelbrot_footer_note_1()}{' '}
          <code className={c.codeInline}>packages/fractal-wasm</code>
          {m.labs_mandelbrot_footer_note_2()}{' '}
          <code className={c.codeInline}>packages/fractal-rust</code>
          {m.labs_mandelbrot_footer_note_3()}
        </p>
      </section>
    </MandelbrotLayout>
  );
}

function RenderingTools({
  edge,
  edgeError,
  edgeStatus,
  race,
  renderOnEdge,
  runRace,
  wasmStatus,
}: {
  edge: EdgeResult | null;
  edgeError: string | null;
  edgeStatus: EdgeStatus;
  race: RaceResult | null;
  renderOnEdge: () => Promise<void>;
  runRace: () => void;
  wasmStatus: WasmStatus;
}): JSX.Element {
  return (
    <div className={c.renderingTools}>
      <section className={c.toolSection}>
        <SectionHeading
          intro={m.labs_mandelbrot_race_desc()}
          title={m.labs_mandelbrot_race_title()}
        />
        <button
          className={`${c.actionButton} ${wasmStatus !== 'ready' ? c.actionButtonLoading : ''}`.trim()}
          disabled={wasmStatus !== 'ready'}
          onClick={runRace}
          type="button"
        >
          <IconStopwatch aria-hidden="true" />
          {m.labs_mandelbrot_action_run_race()}
        </button>
        <RaceResults race={race} />
      </section>
      <section className={c.toolSection}>
        <SectionHeading
          intro={m.labs_mandelbrot_edge_desc()}
          title={m.labs_mandelbrot_edge_title()}
        />
        <button
          aria-busy={edgeStatus === 'loading'}
          className={`${c.actionButton} ${edgeStatus === 'loading' ? c.actionButtonLoading : ''}`.trim()}
          disabled={edgeStatus === 'loading'}
          onClick={renderOnEdge}
          type="button"
        >
          <IconCloudArrowDown aria-hidden="true" />
          {m.labs_mandelbrot_action_render_edge()}
        </button>
        <EdgeResultView
          edge={edge}
          error={edgeError}
          status={edgeStatus}
        />
      </section>
    </div>
  );
}

function MandelbrotLayout({
  children,
  mainId,
}: {
  children: ReactNode;
  mainId: string;
}): JSX.Element {
  return (
    <div className={`${c.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/labs" />
      </aside>
      <div className={c.workspace}>
        <MandelbrotHeader />
        <main
          className={c.page}
          id={mainId}
          tabIndex={-1}
        >
          <div
            aria-hidden="true"
            className={c.artwork}
          />
          <div className={c.content}>{children}</div>
        </main>
        <MandelbrotFooter />
      </div>
    </div>
  );
}

function MandelbrotFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function MandelbrotHeader() {
  return (
    <header className={chrome.header}>
      <div className={chrome.mobileBrand}>
        <SiteBrand />
      </div>
      <div className={chrome.breadcrumbSlot}>
        <Breadcrumbs
          items={[
            {
              label: m.holy_grail_nav_home(),
              to: '/',
            },
            {
              label: m.route_labs_title(),
              to: '/labs',
            },
            {
              label: m.route_labs_mandelbrot_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/labs" />
    </header>
  );
}
