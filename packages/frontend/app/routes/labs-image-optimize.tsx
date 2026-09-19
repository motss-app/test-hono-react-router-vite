import type { JSX, ChangeEvent as ReactChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import { Text } from '../components/text.tsx';
import { IconArrowLeft } from '../icons.ts';
import * as m from '../paraglide/messages.js';
import { iconStyles } from '../styles/icon.css.ts';
import type { Route } from './+types/labs-image-optimize.ts';
import * as c from './labs-image-optimize.css.ts';

const MAX_BYTES = 32 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff';

type FilterId = 'nearest' | 'triangle' | 'catmullrom' | 'lanczos3';

interface FilterOption {
  id: FilterId;
  labelKey: () => string;
}

const FILTERS: readonly FilterOption[] = [
  {
    id: 'lanczos3',
    labelKey: m.image_optimize_filter_lanczos3,
  },
  {
    id: 'catmullrom',
    labelKey: m.image_optimize_filter_bicubic,
  },
  {
    id: 'triangle',
    labelKey: m.image_optimize_filter_bilinear,
  },
  {
    id: 'nearest',
    labelKey: m.image_optimize_filter_nearest,
  },
];

interface ResizeResult {
  compression_ratio: string;
  engine: string;
  filter: string;
  output_png_base64: string;
  original: {
    bytes: number;
    height: number;
    width: number;
  };
  resized: {
    bytes: number;
    height: number;
    width: number;
  };
  resize_ms: number;
  time_ms: number;
  total_ms: number;
}

const RECOMMENDED_FILTER: FilterId = 'lanczos3';

interface Preset {
  height: number;
  label: () => string;
  width: number;
}

const PRESETS: readonly Preset[] = [
  {
    height: 256,
    label: m.image_optimize_preset_thumb,
    width: 256,
  },
  {
    height: 480,
    label: m.image_optimize_preset_sd,
    width: 640,
  },
  {
    height: 720,
    label: m.image_optimize_preset_hd,
    width: 1280,
  },
  {
    height: 512,
    label: m.image_optimize_preset_square,
    width: 512,
  },
];

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

function ResultMetadata({ result }: { result: ResizeResult }): JSX.Element {
  return (
    <div className={c.metadataGrid}>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_algorithm()}</span>
        <span className={c.metadataValue}>{result.filter}</span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_dimensions()}</span>
        <span className={c.metadataValue}>
          {result.original.width}×{result.original.height} → {result.resized.width}×
          {result.resized.height}
        </span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_original_size()}</span>
        <span className={c.metadataValue}>{formatBytes(result.original.bytes)}</span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_output_size()}</span>
        <span className={c.metadataValue}>{formatBytes(result.resized.bytes)}</span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_ratio()}</span>
        <span className={c.metadataValue}>{result.compression_ratio}</span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_resize_time()}</span>
        <span className={c.metadataValue}>{result.resize_ms.toFixed(1)} ms</span>
      </div>
      <div className={c.metadataRow}>
        <span className={c.metadataLabel}>{m.image_optimize_label_total_time()}</span>
        <span className={c.metadataValue}>{(result.time_ms ?? result.total_ms).toFixed(1)} ms</span>
      </div>
    </div>
  );
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_image_optimize_title(),
    },
    {
      content: m.meta_image_optimize_desc(),
      name: 'description',
    },
  ];
}

function ImageOptimizeHero(): JSX.Element {
  return (
    <section className={c.hero}>
      <div className={c.heroInner}>
        <div>
          <div className={c.eyebrow}>{m.image_optimize_hero_eyebrow()}</div>
          <h1 className={c.title}>{m.image_optimize_input_title()}</h1>
          <p className={c.heroLead}>{m.image_optimize_hero_lead()}</p>
          <div className={c.heroActions}>
            <Link
              className={c.ctaSecondary}
              to="/"
            >
              <IconArrowLeft className={iconStyles.base} />
              <span>{m.labs_cta_back_home()}</span>
            </Link>
            <Link
              className={c.ctaSecondary}
              to="/labs"
            >
              <IconArrowLeft className={iconStyles.base} />
              <span>{m.image_optimize_back()}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function useImageOptimize() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>('lanczos3');
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [
      previewUrl,
    ]
  );

  const chooseFile = useCallback((nextFile: File | null) => {
    setError(null);
    setResult(null);
    // Invalidate any in-flight request when the selection changes.
    ++requestIdRef.current;
    setBusy(false);
    if (!nextFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!nextFile.type.startsWith('image/')) {
      setError(m.image_optimize_error_invalid_file());
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError(m.image_optimize_error_size());
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }, []);

  const onInput = useCallback(
    (event: ReactChangeEvent<HTMLInputElement>) => chooseFile(event.target.files?.[0] ?? null),
    [
      chooseFile,
    ]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      chooseFile(event.dataTransfer.files[0] ?? null);
    },
    [
      chooseFile,
    ]
  );
  const onDragEnter = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDragOver = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => event.preventDefault(),
    []
  );

  const selectPreset = useCallback((preset: Preset) => {
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setActivePreset(`${preset.width}x${preset.height}`);
  }, []);

  const onWidthChange = useCallback((event: ReactChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    setTargetWidth(Number.isFinite(value) ? value : 0);
    setActivePreset(null);
  }, []);

  const onHeightChange = useCallback((event: ReactChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    setTargetHeight(Number.isFinite(value) ? value : 0);
    setActivePreset(null);
  }, []);

  const optimize = useCallback(async () => {
    if (!file) return;
    if (targetWidth === 0 && targetHeight === 0) {
      setError('Set at least one target dimension.');
      return;
    }
    const id = ++requestIdRef.current;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (targetWidth > 0) params.set('width', String(targetWidth));
      if (targetHeight > 0) params.set('height', String(targetHeight));
      params.set('filter', filter);

      const response = await fetch(`/api/rust/image-optimize/resize?${params}`, {
        body: file,
        headers: {
          'content-type': file.type || 'application/octet-stream',
        },
        method: 'POST',
      });
      if (!response.ok)
        throw new Error((await response.text()) || `Request failed (${response.status})`);
      if (id !== requestIdRef.current) return;
      setResult((await response.json()) as ResizeResult);
    } catch (cause) {
      if (id !== requestIdRef.current) return;
      setError(cause instanceof Error ? cause.message : 'The edge optimization failed.');
    } finally {
      if (id === requestIdRef.current) setBusy(false);
    }
  }, [
    file,
    filter,
    targetHeight,
    targetWidth,
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearAll = useCallback(() => {
    // Invalidate in-flight requests.
    ++requestIdRef.current;
    setBusy(false);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    // Reset the file input DOM value so re-selecting the same file triggers change.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const optimizedSrc = result?.output_png_base64
    ? `data:image/png;base64,${result.output_png_base64}`
    : null;

  return {
    activePreset,
    busy,
    chooseFile,
    clearAll,
    dragging,
    error,
    file,
    fileInputRef,
    filter,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onHeightChange,
    onInput,
    onWidthChange,
    optimize,
    optimizedSrc,
    previewUrl,
    result,
    selectPreset,
    setDragging,
    setFilter,
    targetHeight,
    targetWidth,
  };
}

export default function ImageOptimizeLab(): JSX.Element {
  const {
    activePreset,
    busy,
    clearAll,
    dragging,
    error,
    file,
    fileInputRef,
    filter,
    onDrop,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onHeightChange,
    onInput,
    onWidthChange,
    optimize,
    optimizedSrc,
    previewUrl,
    result,
    selectPreset,
    setFilter,
    targetHeight,
    targetWidth,
  } = useImageOptimize();

  return (
    <main className={c.page}>
      <ImageOptimizeHero />

      <section className={c.inner}>
        <div className={c.workspace}>
          <div className={c.uploadColumn}>
            <p className={c.sectionLabel}>{m.image_optimize_input_label()}</p>
            <h2 className={c.sectionTitle}>{m.image_optimize_input_title()}</h2>
            <p className={c.sectionBody}>{m.image_optimize_input_desc()}</p>

            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: the label is the keyboard-accessible file picker and drag target. */}
            <label
              className={`${c.dropzone} ${dragging ? c.dropzoneActive : ''}`.trim()}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <input
                accept={ACCEPT}
                className={c.input}
                onChange={onInput}
                ref={fileInputRef}
                type="file"
              />
              {previewUrl ? (
                <div
                  className={c.previewWrap}
                  style={{
                    backgroundColor: '#111827',
                  }}
                >
                  <img
                    alt="Selected upload preview"
                    className={c.preview}
                    src={previewUrl}
                  />
                </div>
              ) : (
                <div className={c.dropContent}>
                  <span className={c.dropIcon}>◇</span>
                  <p className={c.dropTitle}>{m.image_optimize_drop_title()}</p>
                  <p className={c.dropNote}>{m.image_optimize_formats()}</p>
                </div>
              )}
            </label>

            {/* Presets */}
            <p className={c.sectionLabel}>{m.image_optimize_preset_title()}</p>
            <div className={c.presetGroup}>
              {PRESETS.map(preset => (
                <button
                  className={`${c.presetChip} ${activePreset === `${preset.width}x${preset.height}` ? c.presetChipActive : ''}`.trim()}
                  key={`${preset.width}x${preset.height}`}
                  /* biome-ignore lint/performance/noJsxPropsBind: preset is a stable const, no re-render concern */
                  onClick={() => selectPreset(preset)}
                  type="button"
                >
                  {preset.label()}
                </button>
              ))}
            </div>

            {/* Target dimensions */}
            <p className={c.sectionLabel}>{m.image_optimize_label_dimensions()}</p>
            <div className={c.dimensionRow}>
              <input
                className={c.dimensionInput}
                min={1}
                onChange={onWidthChange}
                placeholder={m.image_optimize_width_placeholder()}
                type="number"
                value={targetWidth || ''}
              />
              <span className={c.dimensionSeparator}>×</span>
              <input
                className={c.dimensionInput}
                min={1}
                onChange={onHeightChange}
                placeholder={m.image_optimize_height_placeholder()}
                type="number"
                value={targetHeight || ''}
              />
            </div>

            {/* Filter selection */}
            <p className={c.sectionLabel}>{m.image_optimize_filter_title()}</p>
            <div className={c.filterGroup}>
              {FILTERS.map(f => (
                <label
                  className={`${c.filterOption} ${filter === f.id ? c.filterOptionSelected : ''}`.trim()}
                  key={f.id}
                >
                  <input
                    checked={filter === f.id}
                    className={c.filterRadio}
                    name="filter"
                    /* biome-ignore lint/performance/noJsxPropsBind: filter id is a stable const */
                    onChange={() => setFilter(f.id)}
                    type="radio"
                    value={f.id}
                  />
                  <span className={c.filterLabel}>
                    {f.labelKey()}
                    {f.id === RECOMMENDED_FILTER ? ' ★' : ''}
                  </span>
                </label>
              ))}
            </div>

            {/* Actions */}
            {file ? (
              <div className={c.actionRow}>
                <button
                  className={c.action}
                  disabled={busy}
                  onClick={optimize}
                  type="button"
                >
                  {busy ? m.image_optimize_analyzing() : m.image_optimize_action_optimize()}
                </button>
                <button
                  className={c.subtleAction}
                  onClick={clearAll}
                  type="button"
                >
                  {m.image_optimize_back()}
                </button>
              </div>
            ) : null}

            {error ? <div className={c.error}>{error}</div> : null}
          </div>

          {/* Result column */}
          <div className={c.resultColumn}>
            <div className={c.result}>
              <div className={c.resultHeader}>
                <Text
                  as="h3"
                  className={c.resultTitle}
                >
                  {result ? m.image_optimize_optimized_title() : m.image_optimize_empty_result()}
                </Text>
              </div>

              {result ? (
                <>
                  {optimizedSrc ? (
                    <img
                      alt="Resized output"
                      className={c.optimizedImage}
                      src={optimizedSrc}
                    />
                  ) : null}
                  <ResultMetadata result={result} />
                </>
              ) : (
                <div className={c.emptyResult}>
                  <p>{m.image_optimize_empty_result()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <PageFooter />
    </main>
  );
}
