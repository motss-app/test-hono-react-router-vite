import type { JSX, ChangeEvent as ReactChangeEvent, DragEvent as ReactDragEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { DominantColorWalkthrough } from '../components/dominant-color-walkthrough.tsx';
import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import * as m from '../paraglide/messages.js';
import type { Route } from './+types/labs-dominant-color.ts';
import * as c from './labs-dominant-color.css.ts';

const MAX_BYTES = 32 * 1024 * 1024;
const ACCEPT = 'image/avif,image/jpeg,image/png,image/webp,image/gif,image/tiff,image/jxl,.jxl';

interface ColorResponse {
  coverage: number;
  css: {
    color_4: string;
    srgb: string;
  };
  hex: string;
  hsl: {
    h: number;
    l: number;
    s: number;
  };
  hsv: {
    h: number;
    s: number;
    v: number;
  };
  lab: {
    a: number;
    b: number;
    l: number;
  };
  lch: {
    c: number;
    h: number;
    l: number;
  };
  oklab: {
    a: number;
    b: number;
    l: number;
  };
  oklch: {
    c: number;
    h: number;
    l: number;
  };
  pixel_count: number;
  rgba: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  width: number;
  height: number;
  format: string;
  time_ms: number;
}

type OutputMode = 'formatted' | 'raw';

type FormatRow = {
  cssColor: string | null;
  id: string;
  label: string;
  value: string;
};

function formatAlpha(alpha: number): string {
  return (alpha / 255).toFixed(3);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function buildFormatRows(result: ColorResponse): FormatRow[] {
  const alpha = formatAlpha(result.rgba.a);
  return [
    {
      cssColor: result.css.srgb,
      id: 'rgb',
      label: m.dominant_color_output_rgb(),
      value: `rgb(${result.rgba.r} ${result.rgba.g} ${result.rgba.b} / ${alpha})`,
    },
    {
      cssColor: `hsl(${result.hsl.h.toFixed(2)} ${formatPercent(result.hsl.s)} ${formatPercent(result.hsl.l)} / ${alpha})`,
      id: 'hsl',
      label: m.dominant_color_output_hsl(),
      value: `hsl(${result.hsl.h.toFixed(2)}°, ${formatPercent(result.hsl.s)}, ${formatPercent(result.hsl.l)} / ${alpha})`,
    },
    {
      cssColor: null,
      id: 'hsv',
      label: m.dominant_color_output_hsv(),
      value: `hsv(${result.hsv.h.toFixed(2)}°, ${formatPercent(result.hsv.s)}, ${formatPercent(result.hsv.v)} / ${alpha})`,
    },
    {
      cssColor: `lab(${result.lab.l.toFixed(2)}% ${result.lab.a.toFixed(2)} ${result.lab.b.toFixed(2)} / ${alpha})`,
      id: 'lab',
      label: m.dominant_color_output_lab(),
      value: `lab(${result.lab.l.toFixed(2)}% ${result.lab.a.toFixed(2)} ${result.lab.b.toFixed(2)} / ${alpha})`,
    },
    {
      cssColor: `lch(${result.lch.l.toFixed(2)}% ${result.lch.c.toFixed(2)} ${result.lch.h.toFixed(2)} / ${alpha})`,
      id: 'lch',
      label: m.dominant_color_output_lch(),
      value: `lch(${result.lch.l.toFixed(2)}% ${result.lch.c.toFixed(2)} ${result.lch.h.toFixed(2)} / ${alpha})`,
    },
    {
      cssColor: `oklab(${result.oklab.l.toFixed(5)} ${result.oklab.a.toFixed(5)} ${result.oklab.b.toFixed(5)} / ${alpha})`,
      id: 'oklab',
      label: m.dominant_color_output_oklab(),
      value: `oklab(${result.oklab.l.toFixed(5)} ${result.oklab.a.toFixed(5)} ${result.oklab.b.toFixed(5)} / ${alpha})`,
    },
    {
      cssColor: `oklch(${result.oklch.l.toFixed(5)} ${result.oklch.c.toFixed(5)} ${result.oklch.h.toFixed(2)} / ${alpha})`,
      id: 'oklch',
      label: m.dominant_color_output_oklch(),
      value: `oklch(${result.oklch.l.toFixed(5)} ${result.oklch.c.toFixed(5)} ${result.oklch.h.toFixed(2)} / ${alpha})`,
    },
    {
      cssColor: result.css.srgb,
      id: 'css-srgb',
      label: m.dominant_color_output_css_srgb(),
      value: result.css.srgb,
    },
    {
      cssColor: result.css.color_4,
      id: 'css-color-4',
      label: m.dominant_color_output_css_color4(),
      value: result.css.color_4,
    },
  ];
}

function supportsCssColor(value: string): boolean {
  return typeof globalThis.CSS !== 'undefined' && globalThis.CSS.supports('color', value);
}

function FormattedOutput({ result }: { result: ColorResponse }): JSX.Element {
  const rows = buildFormatRows(result);
  return (
    <div className={c.formattedOutput}>
      <div className={c.formattedIntro}>
        <p className={c.formattedTitle}>{m.dominant_color_output_formats_title()}</p>
        <p className={c.formattedNote}>{m.dominant_color_output_formats_note()}</p>
      </div>
      <div className={c.formatList}>
        {rows.map(row => {
          const native = row.cssColor !== null && supportsCssColor(row.cssColor);
          return (
            <div
              className={c.formatRow}
              key={row.id}
            >
              <span
                className={c.formatSwatch}
                style={{
                  backgroundColor: native && row.cssColor ? row.cssColor : result.hex,
                }}
              />
              <div className={c.formatCopy}>
                <div className={c.formatHeader}>
                  <span className={c.formatLabel}>{row.label}</span>
                  <span className={c.formatSupport}>
                    {native ? m.dominant_color_output_native() : m.dominant_color_output_numeric()}
                  </span>
                </div>
                <code className={c.formatValue}>{row.value}</code>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: m.meta_dominant_color_title(),
    },
    {
      content: m.meta_dominant_color_desc(),
      name: 'description',
    },
  ];
}

function formatBytes(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.ceil(bytes / 1024)} KB`;
}

export default function DominantColorLab(): JSX.Element {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ColorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [outputMode, setOutputMode] = useState<OutputMode>('formatted');

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
    setOutputMode('formatted');
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/') && !nextFile.name.toLowerCase().endsWith('.jxl')) {
      setError(m.dominant_color_error_invalid_file());
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError(m.dominant_color_error_size());
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
    (event: ReactDragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setDragging(false);
      chooseFile(event.dataTransfer.files[0] ?? null);
    },
    [
      chooseFile,
    ]
  );
  const onDragEnter = useCallback((event: ReactDragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDragOver = useCallback(
    (event: ReactDragEvent<HTMLLabelElement>) => event.preventDefault(),
    []
  );
  const showFormattedOutput = useCallback(() => setOutputMode('formatted'), []);
  const showRawOutput = useCallback(() => setOutputMode('raw'), []);

  const analyze = useCallback(async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/rust/color/dominant', {
        body: file,
        headers: {
          'content-type': file.type || 'application/octet-stream',
        },
        method: 'POST',
      });
      if (!response.ok)
        throw new Error((await response.text()) || `Request failed (${response.status})`);
      setResult((await response.json()) as ColorResponse);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The edge analysis failed.');
    } finally {
      setBusy(false);
    }
  }, [
    file,
  ]);

  return (
    <main className={c.page}>
      <section className={c.hero}>
        <div className={c.heroInner}>
          <div>
            <Link
              className={c.backLink}
              to="/labs"
            >
              {m.labs_mandelbrot_cta_back_home()}
            </Link>
            <div className={c.eyebrow}>{m.dominant_color_hero_eyebrow()}</div>
            <h1 className={c.title}>{m.dominant_color_title()}</h1>
            <p className={c.heroLead}>{m.dominant_color_hero_lead()}</p>
          </div>
        </div>
      </section>

      <DominantColorWalkthrough />

      <section className={c.inner}>
        <div className={c.workspace}>
          <div className={c.uploadColumn}>
            <p className={c.sectionLabel}>{m.dominant_color_input_label()}</p>
            <h2 className={c.sectionTitle}>{m.dominant_color_input_title()}</h2>
            <p className={c.sectionBody}>{m.dominant_color_input_desc()}</p>
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
                type="file"
              />
              {previewUrl ? (
                <div className={c.previewWrap}>
                  <img
                    alt="Selected upload preview"
                    className={c.preview}
                    src={previewUrl}
                  />
                </div>
              ) : (
                <div className={c.dropContent}>
                  <span className={c.dropIcon}>◌</span>
                  <p className={c.dropTitle}>{m.dominant_color_drop_title()}</p>
                  <p className={c.dropNote}>{m.dominant_color_formats()}</p>
                </div>
              )}
            </label>
            {file ? (
              <div className={c.actionRow}>
                <button
                  className={c.action}
                  disabled={busy}
                  onClick={analyze}
                  type="button"
                >
                  {busy ? m.dominant_color_analyzing() : m.dominant_color_analyze()}
                </button>
                <span className={c.dropNote}>
                  {file.name} · {formatBytes(file.size)}
                </span>
              </div>
            ) : null}
            {error ? (
              <div
                className={c.error}
                role="alert"
              >
                {error}
              </div>
            ) : null}
          </div>
          <div className={c.resultColumn}>
            <p className={c.sectionLabel}>{m.dominant_color_output_label()}</p>
            <h2 className={c.sectionTitle}>{m.dominant_color_output_title()}</h2>
            <p className={c.sectionBody}>{m.dominant_color_output_desc()}</p>
            <div className={c.result}>
              {result ? (
                <>
                  <div className={c.resultHeader}>
                    <div>
                      <p className={c.resultTitle}>{result.hex}</p>
                      <div className={c.resultMeta}>
                        <span>
                          {result.width} × {result.height} · {result.pixel_count}{' '}
                          {m.dominant_color_output_pixel_count()} · {m.dominant_color_output_took()}{' '}
                          {result.time_ms} ms
                        </span>
                        <span>
                          {result.format} · {(result.coverage * 100).toFixed(1)}%{' '}
                          {m.dominant_color_output_coverage()} · {result.rgba.a}{' '}
                          {m.dominant_color_output_alpha()}
                        </span>
                      </div>
                    </div>
                    <span
                      className={c.swatch}
                      style={{
                        backgroundColor: `rgba(${result.rgba.r}, ${result.rgba.g}, ${result.rgba.b}, ${result.rgba.a / 255})`,
                      }}
                    />
                  </div>
                  <div
                    aria-label={m.dominant_color_output_toggle()}
                    className={c.outputToggle}
                    role="tablist"
                  >
                    <button
                      aria-selected={outputMode === 'formatted'}
                      className={`${c.outputTab} ${outputMode === 'formatted' ? c.outputTabActive : ''}`.trim()}
                      onClick={showFormattedOutput}
                      role="tab"
                      type="button"
                    >
                      {m.dominant_color_output_formatted()}
                    </button>
                    <button
                      aria-selected={outputMode === 'raw'}
                      className={`${c.outputTab} ${outputMode === 'raw' ? c.outputTabActive : ''}`.trim()}
                      onClick={showRawOutput}
                      role="tab"
                      type="button"
                    >
                      {m.dominant_color_output_raw_json()}
                    </button>
                  </div>
                  <div className={c.outputContent}>
                    {outputMode === 'formatted' ? (
                      <FormattedOutput result={result} />
                    ) : (
                      <pre className={c.json}>{JSON.stringify(result, null, 2)}</pre>
                    )}
                  </div>
                </>
              ) : (
                <div className={c.emptyResult}>{m.dominant_color_empty_result()}</div>
              )}
            </div>
          </div>
        </div>
        <p className={c.footer}>{m.dominant_color_footer_note()}</p>
      </section>

      <PageFooter />
    </main>
  );
}
