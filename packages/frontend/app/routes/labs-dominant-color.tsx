import type { JSX, ChangeEvent as ReactChangeEvent, DragEvent as ReactDragEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { DominantColorWalkthrough } from '../components/dominant-color-walkthrough.tsx';
import { Link } from '../components/Link.tsx';
import { PageFooter } from '../components/page-footer.tsx';
import type { Route } from './+types/labs-dominant-color.ts';
import * as c from './labs-dominant-color.css.ts';

const MAX_BYTES = 32 * 1024 * 1024;
const ACCEPT = 'image/avif,image/jpeg,image/png,image/webp,image/gif,image/tiff,image/jxl,.jxl';

interface ColorResponse {
  hex: string;
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
  [key: string]: unknown;
}

export function meta(): Route.MetaDescriptors {
  return [
    {
      title: 'Dominant Color · WASM Labs',
    },
    {
      content: 'Extract dominant image colors with Rust WASM at the edge.',
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
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/') && !nextFile.name.toLowerCase().endsWith('.jxl')) {
      setError('Choose an image file.');
      return;
    }
    if (nextFile.size > MAX_BYTES) {
      setError('This image is larger than the 32 MB upload limit.');
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
              ← Back to labs
            </Link>
            <div className={c.eyebrow}>Lab 02 · Rust + image decoding</div>
            <h1 className={c.title}>Dominant color.</h1>
            <p className={c.heroLead}>
              Drop in an image. The edge decodes it, samples its palette, and returns one color
              expressed across the color systems designers actually use.
            </p>
          </div>
        </div>
      </section>
      <section className={c.inner}>
        <div className={c.workspace}>
          <div className={c.uploadColumn}>
            <p className={c.sectionLabel}>Input</p>
            <h2 className={c.sectionTitle}>Give it a frame.</h2>
            <p className={c.sectionBody}>
              Images up to 4K and 32 MB are accepted. AVIF, JPEG XL, JPEG, PNG, WebP, GIF, and TIFF
              are decoded inside the Rust Worker.
            </p>
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
                  <p className={c.dropTitle}>Choose or drop an image</p>
                  <p className={c.dropNote}>AVIF · JXL · JPEG · PNG · WebP · TIFF</p>
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
                  {busy ? 'Analyzing at the edge…' : 'Extract dominant color'}
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
            <p className={c.sectionLabel}>Output</p>
            <h2 className={c.sectionTitle}>A color, unpacked.</h2>
            <p className={c.sectionBody}>
              The response stays intentionally inspectable: the full JSON is the artifact, with the
              dominant swatch as its visual checksum.
            </p>
            <div className={c.result}>
              {result ? (
                <>
                  <div className={c.resultHeader}>
                    <div>
                      <p className={c.resultTitle}>{result.hex}</p>
                      <p className={c.resultMeta}>
                        {result.width} × {result.height} · {result.format} · {result.time_ms} ms
                      </p>
                    </div>
                    <span
                      className={c.swatch}
                      style={{
                        backgroundColor: `rgba(${result.rgba.r}, ${result.rgba.g}, ${result.rgba.b}, ${result.rgba.a / 255})`,
                      }}
                    />
                  </div>
                  <pre className={c.json}>{JSON.stringify(result, null, 2)}</pre>
                </>
              ) : (
                <div className={c.emptyResult}>Your formatted color JSON will appear here.</div>
              )}
            </div>
          </div>
        </div>
        <p className={c.footer}>
          The analysis kernel is shared Rust code compiled into the Cloudflare Worker as WASM.
          Transparent pixels are ignored, and the winning color is selected from a quantized,
          alpha-weighted pixel histogram.
        </p>
      </section>

      <DominantColorWalkthrough />

      <PageFooter />
    </main>
  );
}
