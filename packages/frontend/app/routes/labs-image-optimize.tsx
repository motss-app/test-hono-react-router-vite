import type {
  JSX,
  ChangeEvent as ReactChangeEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

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
import type { Route } from './+types/labs-image-optimize.ts';
import * as c from './labs-image-optimize.css.ts';
import {
  IconDownload,
  IconImage,
  IconRotateLeft,
  IconTriangleExclamation,
  IconWandMagicSparkles,
} from './labs-image-optimize.icons.ts';

const MAX_BYTES = 32 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff';

type FilterId = 'nearest' | 'triangle' | 'catmullrom' | 'lanczos3';
type OutputFormat = 'avif' | 'jpeg' | 'png' | 'webp';

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

const OUTPUT_FORMATS: readonly OutputFormat[] = [
  'webp',
  'avif',
  'jpeg',
  'png',
];

interface ResizeResult {
  compression_ratio: string;
  content_type: string;
  filter: string;
  fit: string;
  format: OutputFormat;
  output_url: string;
  quality: number;
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
  total_ms: number | null;
}

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

const PRESET_GROUPS = [
  PRESETS.slice(0, 2),
  PRESETS.slice(2),
];

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

async function createPixelPlaceholder(file: File): Promise<string | null> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.height = 1;
    canvas.width = 1;
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.drawImage(image, 0, 0, 1, 1);
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function requiredImageHeader(headers: Headers, name: string): string {
  const value = headers.get(name);
  if (!value) throw new Error(`Image response is missing ${name}.`);
  return value;
}

function imageHeaderInteger(headers: Headers, name: string): number {
  const value = Number.parseInt(requiredImageHeader(headers, name), 10);
  if (!Number.isFinite(value)) throw new Error(`Image response has invalid ${name}.`);
  return value;
}

function parseOutputFormat(value: string): OutputFormat {
  if (value === 'avif' || value === 'jpeg' || value === 'png' || value === 'webp') {
    return value;
  }
  throw new Error(`Image response has unsupported format: ${value}.`);
}

function readResizeResult(response: Response, outputUrl: string): ResizeResult {
  const headers = response.headers;
  const totalMs = headers.get('x-image-total-ms');
  const parsedTotalMs = totalMs === null ? null : Number.parseFloat(totalMs);
  if (parsedTotalMs !== null && !Number.isFinite(parsedTotalMs)) {
    throw new Error('Image response has invalid x-image-total-ms.');
  }

  return {
    compression_ratio: requiredImageHeader(headers, 'x-image-compression-ratio'),
    content_type: requiredImageHeader(headers, 'content-type'),
    filter: requiredImageHeader(headers, 'x-image-filter'),
    fit: requiredImageHeader(headers, 'x-image-fit'),
    format: parseOutputFormat(requiredImageHeader(headers, 'x-image-format')),
    original: {
      bytes: imageHeaderInteger(headers, 'x-image-original-bytes'),
      height: imageHeaderInteger(headers, 'x-image-original-height'),
      width: imageHeaderInteger(headers, 'x-image-original-width'),
    },
    output_url: outputUrl,
    quality: imageHeaderInteger(headers, 'x-image-quality'),
    resized: {
      bytes: imageHeaderInteger(headers, 'x-image-resized-bytes'),
      height: imageHeaderInteger(headers, 'x-image-resized-height'),
      width: imageHeaderInteger(headers, 'x-image-resized-width'),
    },
    total_ms: parsedTotalMs,
  };
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

// biome-ignore lint/complexity/noExcessiveLinesPerFunction: route hook
function useImageOptimize() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewUnavailable, setPreviewUnavailable] = useState(false);
  const [filter, setFilter] = useState<FilterId>('lanczos3');
  const [format, setFormat] = useState<OutputFormat>('webp');
  const [quality, setQuality] = useState<number>(85);
  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const resetFileInput = useCallback(() => {
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [
      previewUrl,
    ]
  );

  useEffect(
    () => () => {
      if (result?.output_url) URL.revokeObjectURL(result.output_url);
    },
    [
      result?.output_url,
    ]
  );

  const chooseFile = useCallback(
    (nextFile: File | null) => {
      setError(null);
      setResult(null);
      setPlaceholderUrl(null);
      setPreviewUnavailable(false);
      // Invalidate any in-flight request when the selection changes.
      ++requestIdRef.current;
      setBusy(false);
      if (!nextFile) {
        setFile(null);
        setPreviewUrl(null);
        resetFileInput();
        return;
      }
      if (!nextFile.type.startsWith('image/')) {
        setError(m.image_optimize_error_invalid_file());
        setFile(null);
        setPreviewUrl(null);
        resetFileInput();
        return;
      }
      if (nextFile.size > MAX_BYTES) {
        setError(m.image_optimize_error_size());
        setFile(null);
        setPreviewUrl(null);
        resetFileInput();
        return;
      }
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
      if (fileInputRef.current) fileInputRef.current.value = '';
      const selectionId = requestIdRef.current;
      void createPixelPlaceholder(nextFile).then(placeholder => {
        if (selectionId === requestIdRef.current) setPlaceholderUrl(placeholder);
      });
    },
    [
      resetFileInput,
    ]
  );

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
    ++requestIdRef.current;
    setBusy(false);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setActivePreset(`${preset.width}x${preset.height}`);
  }, []);

  const onWidthChange = useCallback((event: ReactChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    ++requestIdRef.current;
    setBusy(false);
    setTargetWidth(Number.isFinite(value) ? value : 0);
    setActivePreset(null);
  }, []);

  const onHeightChange = useCallback((event: ReactChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    ++requestIdRef.current;
    setBusy(false);
    setTargetHeight(Number.isFinite(value) ? value : 0);
    setActivePreset(null);
  }, []);

  const onQualityChange = useCallback((event: ReactChangeEvent<HTMLInputElement>) => {
    ++requestIdRef.current;
    setBusy(false);
    setQuality(Number(event.target.value));
  }, []);

  const invalidateFilter = useCallback((id: FilterId) => {
    ++requestIdRef.current;
    setBusy(false);
    setFilter(id);
  }, []);

  const invalidateFormat = useCallback((fmt: OutputFormat) => {
    ++requestIdRef.current;
    setBusy(false);
    setFormat(fmt);
  }, []);

  const optimize = useCallback(async () => {
    if (!file) return;
    if (
      !Number.isInteger(targetWidth) ||
      !Number.isInteger(targetHeight) ||
      targetWidth < 0 ||
      targetHeight < 0 ||
      targetWidth > 3840 ||
      targetHeight > 3840 ||
      (targetWidth === 0 && targetHeight === 0)
    ) {
      setError(m.image_optimize_error_dimensions());
      return;
    }
    const id = ++requestIdRef.current;
    setBusy(true);
    setError(null);
    setResult(null);
    let outputUrl: string | null = null;
    try {
      const params = new URLSearchParams();
      if (targetWidth > 0) params.set('w', String(targetWidth));
      if (targetHeight > 0) params.set('h', String(targetHeight));
      params.set('f', format);
      params.set('fit', 'scale-down');
      params.set('q', String(quality));
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
      outputUrl = URL.createObjectURL(await response.blob());
      const nextResult = readResizeResult(response, outputUrl);
      if (id !== requestIdRef.current) {
        URL.revokeObjectURL(outputUrl);
        outputUrl = null;
        return;
      }
      setResult(nextResult);
      outputUrl = null;
    } catch (cause) {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (id !== requestIdRef.current) return;
      setError(cause instanceof Error ? cause.message : m.image_optimize_error_failed());
    } finally {
      if (id === requestIdRef.current) setBusy(false);
    }
  }, [
    file,
    filter,
    format,
    quality,
    targetHeight,
    targetWidth,
  ]);

  const clearAll = useCallback(() => {
    // Invalidate in-flight requests.
    ++requestIdRef.current;
    setBusy(false);
    setFile(null);
    setPreviewUrl(null);
    setPlaceholderUrl(null);
    setResult(null);
    setError(null);
    /*
     * Reset the file input so selecting the same file triggers change.
     */
    resetFileInput();
  }, [
    resetFileInput,
  ]);

  const onPreviewError = useCallback(() => setPreviewUnavailable(true), []);
  const onFilterChange = useCallback(
    (event: ReactChangeEvent<HTMLSelectElement>) => {
      const option = FILTERS.find(choice => choice.id === event.currentTarget.value);
      if (option) invalidateFilter(option.id);
    },
    [
      invalidateFilter,
    ]
  );
  const onFormatChange = useCallback(
    (event: ReactChangeEvent<HTMLSelectElement>) => {
      const option = OUTPUT_FORMATS.find(choice => choice === event.currentTarget.value);
      if (option) invalidateFormat(option);
    },
    [
      invalidateFormat,
    ]
  );
  const onPresetClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      const selectedPreset = PRESETS.find(
        preset => `${preset.width}x${preset.height}` === event.currentTarget.dataset.preset
      );
      if (selectedPreset) selectPreset(selectedPreset);
    },
    [
      selectPreset,
    ]
  );
  const download = useCallback(() => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.output_url;
    link.download = `optimized-${result.resized.width}x${result.resized.height}.${result.format === 'jpeg' ? 'jpg' : result.format}`;
    link.click();
  }, [
    result,
  ]);

  const optimizedSrc = result?.output_url ?? null;

  return {
    activePreset,
    busy,
    chooseFile,
    clearAll,
    download,
    dragging,
    error,
    file,
    fileInputRef,
    filter,
    format,
    invalidateFilter,
    invalidateFormat,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onFilterChange,
    onFormatChange,
    onHeightChange,
    onInput,
    onPresetClick,
    onPreviewError,
    onQualityChange,
    onWidthChange,
    optimize,
    optimizedSrc,
    placeholderUrl,
    previewUnavailable,
    previewUrl,
    quality,
    result,
    selectPreset,
    setDragging,
    targetHeight,
    targetWidth,
  };
}

type OptimizeState = ReturnType<typeof useImageOptimize>;

function SourceMetadata({ file, limitsId }: { file: File | null; limitsId: string }): JSX.Element {
  const dot = file?.name.lastIndexOf('.') ?? -1;
  const extension = file
    ? dot > 0 && dot < file.name.length - 1
      ? file.name.slice(dot + 1).toUpperCase()
      : file.type
    : '';
  return (
    <div
      aria-atomic="true"
      aria-live="polite"
      className={c.caption}
      id={limitsId}
    >
      {file ? (
        <>
          <section
            aria-label={file.name}
            className={c.fileName}
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Scroll region.
            tabIndex={0}
            title={file.name}
          >
            {file.name}
          </section>
          <span className={c.fileDetails}>
            {extension} · {formatBytes(file.size)}
          </span>
        </>
      ) : (
        <>
          <span className={c.fileName}>{m.image_optimize_formats()}</span>
          <span className={c.fileDetails}>{m.image_optimize_input_desc()}</span>
        </>
      )}
    </div>
  );
}

function SourcePreview({
  state,
  limitsId,
}: {
  state: OptimizeState;
  limitsId: string;
}): JSX.Element {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={`${c.previewPane} ${c.sourcePane}`}
    >
      <div className={c.previewHeader}>
        <h2
          className={c.sectionTitle}
          id={titleId}
        >
          {m.image_optimize_input_title()}
        </h2>
        <button
          aria-label={m.image_optimize_reset()}
          className={c.previewAction}
          disabled={!state.file}
          onClick={state.clearAll}
          type="button"
        >
          <IconRotateLeft
            aria-hidden="true"
            className={c.actionIcon}
          />
          <span className={c.previewActionLabel}>{m.image_optimize_reset()}</span>
        </button>
      </div>
      {/*
       * biome-ignore lint/a11y/noNoninteractiveElementInteractions: Drop.
       */}
      <label
        className={`${c.dropzone} ${state.dragging ? c.dropzoneActive : ''}`.trim()}
        onDragEnter={state.onDragEnter}
        onDragLeave={state.onDragLeave}
        onDragOver={state.onDragOver}
        onDrop={state.onDrop}
      >
        <input
          accept={ACCEPT}
          aria-describedby={limitsId}
          aria-label={m.image_optimize_drop_title()}
          className={c.input}
          onChange={state.onInput}
          ref={state.fileInputRef}
          type="file"
        />
        {state.previewUrl && !state.previewUnavailable ? (
          <div className={c.previewWrap}>
            {/*
             * biome-ignore lint/a11y/noNoninteractiveElementInteractions: Load.
             */}
            <img
              alt={m.image_optimize_preview_alt()}
              className={c.preview}
              onError={state.onPreviewError}
              src={state.previewUrl}
            />
          </div>
        ) : (
          <div className={c.dropContent}>
            <span className={c.dropIcon}>
              <IconImage aria-hidden="true" />
            </span>
            <p className={c.dropTitle}>
              {state.previewUnavailable
                ? m.image_optimize_preview_unavailable()
                : m.image_optimize_drop_title()}
            </p>
          </div>
        )}
      </label>
      <SourceMetadata
        file={state.file}
        limitsId={limitsId}
      />
    </section>
  );
}

function OutputPreview({ state }: { state: OptimizeState }): JSX.Element {
  const titleId = useId();
  const appliedFilter = state.result?.filter ?? state.filter;
  const filterLabel =
    FILTERS.find(option => option.id === appliedFilter)?.labelKey() ?? appliedFilter;
  return (
    <section
      aria-labelledby={titleId}
      className={`${c.previewPane} ${c.outputPane}`}
    >
      <div className={c.previewHeader}>
        <h2
          className={c.sectionTitle}
          id={titleId}
        >
          {m.image_optimize_output_title()}
        </h2>
        <button
          aria-label={m.image_optimize_download()}
          className={c.previewAction}
          disabled={!state.result || state.busy}
          onClick={state.download}
          type="button"
        >
          <IconDownload
            aria-hidden="true"
            className={c.actionIcon}
          />
          <span className={c.previewActionLabel}>{m.image_optimize_download()}</span>
        </button>
      </div>
      <div
        aria-busy={state.busy}
        className={c.previewFrame}
      >
        {state.busy ? (
          <div
            aria-live="polite"
            className={c.loadingResult}
            role="status"
          >
            {state.placeholderUrl ? (
              <img
                alt=""
                className={c.loadingPlaceholder}
                src={state.placeholderUrl}
              />
            ) : null}
            <div className={c.loadingOverlay}>
              <span
                aria-hidden="true"
                className={c.loadingSpinner}
              />
              <span>{m.image_optimize_analyzing()}</span>
            </div>
          </div>
        ) : state.optimizedSrc ? (
          <img
            alt={m.image_optimize_output_alt()}
            className={c.preview}
            src={state.optimizedSrc}
          />
        ) : (
          <div
            className={c.dropContent}
            role="status"
          >
            <span className={c.dropIcon}>
              <IconImage aria-hidden="true" />
            </span>
            <p className={c.note}>{m.image_optimize_empty_result()}</p>
          </div>
        )}
      </div>
      <div
        aria-live="polite"
        className={c.outputCaption}
      >
        <span>
          {state.result ? (
            <>
              {state.result.format.toUpperCase()} · {state.result.resized.width}×
              {state.result.resized.height}
            </>
          ) : (
            state.format.toUpperCase()
          )}
        </span>
        <span>{filterLabel}</span>
        <span>
          {m.image_optimize_quality_title()} {state.result?.quality ?? state.quality}
        </span>
      </div>
    </section>
  );
}

function ResizeSettings({ state }: { state: OptimizeState }): JSX.Element {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={c.settings}
    >
      <h2
        className={c.sectionTitle}
        id={titleId}
      >
        {m.image_optimize_settings_title()}
      </h2>
      <fieldset className={c.presetField}>
        <legend className={c.fieldLabel}>{m.image_optimize_preset_title()}</legend>
        <div className={c.presetGroup}>
          {PRESET_GROUPS.map(group => (
            <div
              className={c.presetPair}
              key={group[0]?.width}
            >
              {group.map(preset => (
                <button
                  aria-pressed={state.activePreset === `${preset.width}x${preset.height}`}
                  className={`${c.presetChip} ${state.activePreset === `${preset.width}x${preset.height}` ? c.presetChipActive : ''}`.trim()}
                  data-preset={`${preset.width}x${preset.height}`}
                  key={`${preset.width}x${preset.height}`}
                  onClick={state.onPresetClick}
                  type="button"
                >
                  {preset.label()}
                </button>
              ))}
            </div>
          ))}
        </div>
      </fieldset>
      <div className={c.fields}>
        <div className={c.fieldPair}>
          <label className={c.field}>
            <span className={c.fieldLabel}>{m.image_optimize_width_placeholder()}</span>
            <input
              className={c.fieldInput}
              max={3840}
              min={1}
              onChange={state.onWidthChange}
              placeholder={m.image_optimize_dimension_auto()}
              step={1}
              type="number"
              value={state.targetWidth || ''}
            />
          </label>
          <label className={c.field}>
            <span className={c.fieldLabel}>{m.image_optimize_height_placeholder()}</span>
            <input
              className={c.fieldInput}
              max={3840}
              min={1}
              onChange={state.onHeightChange}
              placeholder={m.image_optimize_dimension_auto()}
              step={1}
              type="number"
              value={state.targetHeight || ''}
            />
          </label>
        </div>
        <div className={c.fieldPair}>
          <label className={c.field}>
            <span className={c.fieldLabel}>{m.image_optimize_format_title()}</span>
            <select
              className={c.fieldInput}
              onChange={state.onFormatChange}
              value={state.format}
            >
              {OUTPUT_FORMATS.map(format => (
                <option
                  key={format}
                  value={format}
                >
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </label>
          <label className={c.field}>
            <span className={c.fieldLabel}>{m.image_optimize_filter_title()}</span>
            <select
              className={c.fieldInput}
              onChange={state.onFilterChange}
              value={state.filter}
            >
              {FILTERS.map(filter => (
                <option
                  key={filter.id}
                  value={filter.id}
                >
                  {filter.labelKey()}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <p className={c.note}>{m.image_optimize_dimensions_note()}</p>
      <div className={c.qualityActions}>
        <div>
          <div className={c.qualityHeader}>
            <label
              className={c.fieldLabel}
              htmlFor={`${titleId}-quality`}
            >
              {m.image_optimize_quality_title()}
            </label>
            <span className={c.qualityValue}>{state.quality}</span>
          </div>
          <input
            className={c.qualityInput}
            id={`${titleId}-quality`}
            max={100}
            min={1}
            onChange={state.onQualityChange}
            type="range"
            value={state.quality}
          />
        </div>
        <div className={c.actionRow}>
          <button
            aria-label={
              state.busy ? m.image_optimize_analyzing() : m.image_optimize_action_optimize()
            }
            className={c.action}
            disabled={!state.file || state.busy}
            onClick={state.optimize}
            type="button"
          >
            <IconWandMagicSparkles
              aria-hidden="true"
              className={c.actionIcon}
            />
            <span className={c.actionText}>
              <span
                aria-hidden={state.busy}
                className={state.busy ? c.actionTextHidden : c.actionTextLabel}
              >
                {m.image_optimize_action_optimize()}
              </span>
              <span
                aria-hidden={!state.busy}
                className={!state.busy ? c.actionTextHidden : c.actionTextLabel}
              >
                {m.image_optimize_analyzing()}
              </span>
            </span>
          </button>
        </div>
      </div>
      {state.error ? (
        <div
          className={c.error}
          role="alert"
        >
          <IconTriangleExclamation
            aria-hidden="true"
            className={c.errorIcon}
          />
          <span>{state.error}</span>
        </div>
      ) : null}
    </section>
  );
}

function ResultMetadata({ result }: { result: ResizeResult | null }): JSX.Element {
  const pending = m.image_optimize_value_pending();
  const totalMs = result?.total_ms;
  const cells = [
    [
      m.image_optimize_label_original_size(),
      result ? formatBytes(result.original.bytes) : pending,
    ],
    [
      m.image_optimize_label_output_size(),
      result ? formatBytes(result.resized.bytes) : pending,
    ],
    [
      m.image_optimize_label_ratio(),
      result?.compression_ratio ?? pending,
    ],
    [
      m.image_optimize_label_total_time(),
      typeof totalMs === 'number' ? `${totalMs.toFixed(1)} ms` : pending,
    ],
  ];
  return (
    <dl className={c.metadataGrid}>
      {cells.map(([label, value], index) => (
        <div
          className={c.metadataRow}
          key={label}
        >
          <dt className={c.metadataLabel}>{label}</dt>
          <dd
            className={c.metadataValue}
            data-vrt-volatile={index === 3 && typeof totalMs === 'number' ? '' : undefined}
          >
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ImageOptimizeLab(): JSX.Element {
  const state = useImageOptimize();
  const limitsId = useId();
  return (
    <ImageOptimizeLayout>
      <header className={c.intro}>
        <h1 className={c.title}>{m.labs_tool_image_optimize_title()}</h1>
        <p className={c.lead}>{m.image_optimize_hero_lead()}</p>
      </header>
      <div className={c.workbench}>
        <div className={c.workspace}>
          <SourcePreview
            limitsId={limitsId}
            state={state}
          />
          <ResizeSettings state={state} />
          <OutputPreview state={state} />
          <ResultMetadata result={state.result} />
        </div>
      </div>
      <section
        aria-labelledby={`${limitsId}-implementation`}
        className={c.implementation}
      >
        <h2
          className={c.sectionTitle}
          id={`${limitsId}-implementation`}
        >
          {m.labs_mandelbrot_implementation_title()}
        </h2>
        <p className={c.lead}>{m.image_optimize_implementation_body()}</p>
      </section>
    </ImageOptimizeLayout>
  );
}

function ImageOptimizeLayout({ children }: { children: ReactNode }): JSX.Element {
  const mainId = useId();
  return (
    <div className={`${c.layout} ${chrome.interactiveScope}`}>
      <SkipToContent mainId={mainId} />
      <aside className={chrome.sidebar}>
        <SiteBrand />
        <SiteNavigation activePath="/labs" />
      </aside>
      <div className={c.pageShell}>
        <ImageOptimizeHeader />
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
        <ImageOptimizeFooter />
      </div>
    </div>
  );
}

function ImageOptimizeFooter() {
  return (
    <footer className={footerStyles.footer}>
      <div className={footerStyles.footerInner}>
        <PoweredByTools />
      </div>
    </footer>
  );
}

function ImageOptimizeHeader() {
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
              label: m.labs_tool_image_optimize_title(),
            },
          ]}
        />
      </div>
      <PagePreferences activePath="/labs" />
    </header>
  );
}
