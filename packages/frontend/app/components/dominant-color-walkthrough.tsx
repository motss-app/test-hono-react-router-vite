import type { JSX, MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useId, useMemo, useState } from 'react';

import * as c from './dominant-color-walkthrough.css.ts';

type Pixel = {
  readonly a: number;
  readonly b: number;
  readonly g: number;
  readonly id: string;
  readonly name: string;
  readonly r: number;
};

type Marker = readonly [
  number,
  number,
  number,
];

type Bin = {
  a: number;
  b: number;
  g: number;
  pixels: Pixel[];
  r: number;
  samples: number;
};

type Cluster = {
  alphaWeight: number;
  b: number;
  g: number;
  pixels: Pixel[];
  r: number;
  samples: number;
};

type Assignment = {
  assignments: number[];
  clusters: Cluster[];
};

type Family = Cluster & {
  members: number[];
};

type Model = {
  bins: Bin[];
  families: Family[];
  finalAssignment: Assignment;
  finalCentroids: Marker[];
  firstAssignment: Assignment;
  seeds: Marker[];
  winnerFamily: Family;
  winnerHex: string;
  winnerRgb: Marker;
};

const PIXELS: Pixel[] = [
  {
    a: 255,
    b: 58,
    g: 76,
    id: 'P1',
    name: 'coral',
    r: 232,
  },
  {
    a: 255,
    b: 63,
    g: 79,
    id: 'P2',
    name: 'coral light',
    r: 239,
  },
  {
    a: 255,
    b: 164,
    g: 182,
    id: 'P3',
    name: 'teal',
    r: 44,
  },
  {
    a: 255,
    b: 78,
    g: 193,
    id: 'P4',
    name: 'gold',
    r: 242,
  },
];

const STEPS = [
  {
    label: 'Input',
    title: 'A pixel is four numbers',
  },
  {
    label: 'Address',
    title: 'Give each pixel a drawer',
  },
  {
    label: 'Collect',
    title: 'Accumulate each drawer',
  },
  {
    label: 'Seeds',
    title: 'Make starting markers',
  },
  {
    label: 'Match',
    title: 'Match colors to markers',
  },
  {
    label: 'Repeat',
    title: 'Repeat the K-Means update',
  },
  {
    label: 'Winner',
    title: 'Choose the biggest family',
  },
  {
    label: 'Output',
    title: 'Return one color',
  },
];

function binFor(pixel: Pixel): {
  b: number;
  g: number;
  r: number;
} {
  return {
    b: Math.floor(pixel.b / 8),
    g: Math.floor(pixel.g / 8),
    r: Math.floor(pixel.r / 8),
  };
}

function binIndex(bin: { b: number; g: number; r: number }): number {
  return bin.r * 1024 + bin.g * 32 + bin.b;
}

function rgbCss(rgb: Marker): string {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

function rgbHex(rgb: Marker): string {
  return `#${rgb
    .map(channel => Math.round(channel).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function markerFor(bin: Bin): Marker {
  return [
    bin.r / bin.a,
    bin.g / bin.a,
    bin.b / bin.a,
  ];
}

function distanceSquared(marker: Marker, rgb: Marker): number {
  return (marker[0] - rgb[0]) ** 2 + (marker[1] - rgb[1]) ** 2 + (marker[2] - rgb[2]) ** 2;
}

function createCluster(): Cluster {
  return {
    alphaWeight: 0,
    b: 0,
    g: 0,
    pixels: [],
    r: 0,
    samples: 0,
  };
}

function buildBins(pixels: Pixel[]): Bin[] {
  const bins = new Map<number, Bin>();
  for (const pixel of pixels) {
    if (pixel.a < 16) continue;
    const address = binFor(pixel);
    const index = binIndex(address);
    const bin = bins.get(index) ?? {
      a: 0,
      b: 0,
      g: 0,
      pixels: [],
      r: 0,
      samples: 0,
    };
    bin.a += pixel.a;
    bin.b += pixel.b * pixel.a;
    bin.g += pixel.g * pixel.a;
    bin.pixels.push(pixel);
    bin.r += pixel.r * pixel.a;
    bin.samples += 1;
    bins.set(index, bin);
  }
  return [
    ...bins.values(),
  ].sort((left, right) => right.a - left.a);
}

function assignBins(bins: Bin[], centroids: Marker[], pixels: Pixel[]): Assignment {
  const clusters = centroids.map(() => createCluster());
  const assignmentsByBin = new Map<number, number>();
  for (const bin of bins) {
    const marker = markerFor(bin);
    let best = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    centroids.forEach((centroid, index) => {
      const nextDistance = distanceSquared(centroid, marker);
      if (nextDistance < bestDistance) {
        best = index;
        bestDistance = nextDistance;
      }
    });
    const cluster = clusters[best];
    if (!cluster) continue;
    cluster.alphaWeight += bin.a;
    cluster.b += bin.b;
    cluster.g += bin.g;
    cluster.pixels.push(...bin.pixels);
    cluster.r += bin.r;
    cluster.samples += bin.samples;
    const firstPixel = bin.pixels[0];
    if (firstPixel) assignmentsByBin.set(binIndex(binFor(firstPixel)), best);
  }
  return {
    assignments: pixels.map(pixel => assignmentsByBin.get(binIndex(binFor(pixel))) ?? 0),
    clusters,
  };
}

function nextCentroids(assignment: Assignment, centroids: Marker[]): Marker[] {
  return centroids.map((centroid, index) => {
    const cluster = assignment.clusters[index];
    if (!cluster || cluster.alphaWeight === 0) return centroid;
    return [
      cluster.r / cluster.alphaWeight,
      cluster.g / cluster.alphaWeight,
      cluster.b / cluster.alphaWeight,
    ];
  });
}

function findRoot(parent: number[], value: number): number {
  let root = value;
  while (parent[root] !== root) {
    root = parent[root] ?? root;
  }
  while (parent[value] !== value) {
    const next = parent[value] ?? value;
    parent[value] = root;
    value = next;
  }
  return root;
}

function buildFamilies(centroids: Marker[], assignment: Assignment): Family[] {
  const parent = centroids.map((_, index) => index);
  for (let left = 0; left < centroids.length; left += 1) {
    const leftCluster = assignment.clusters[left];
    if (!leftCluster || leftCluster.alphaWeight === 0) continue;
    for (let right = left + 1; right < centroids.length; right += 1) {
      const rightCluster = assignment.clusters[right];
      if (!rightCluster || rightCluster.alphaWeight === 0) continue;
      if (
        distanceSquared(
          centroids[left] ?? [
            0,
            0,
            0,
          ],
          centroids[right] ?? [
            0,
            0,
            0,
          ]
        ) >
        60 * 60
      )
        continue;
      const leftRoot = findRoot(parent, left);
      const rightRoot = findRoot(parent, right);
      if (leftRoot !== rightRoot) parent[rightRoot] = leftRoot;
    }
  }

  const families = new Map<number, Family>();
  assignment.clusters.forEach((cluster, index) => {
    if (cluster.alphaWeight === 0) return;
    const root = findRoot(parent, index);
    const family = families.get(root) ?? {
      alphaWeight: 0,
      b: 0,
      g: 0,
      members: [],
      pixels: [],
      r: 0,
      samples: 0,
    };
    family.alphaWeight += cluster.alphaWeight;
    family.b += cluster.b;
    family.g += cluster.g;
    family.members.push(index);
    family.pixels.push(...cluster.pixels);
    family.r += cluster.r;
    family.samples += cluster.samples;
    families.set(root, family);
  });
  return [
    ...families.values(),
  ];
}

function buildModel(): Model {
  const bins = buildBins(PIXELS);
  const seeds = bins.slice(0, 8).map(markerFor);
  let centroids = seeds;
  const firstAssignment = assignBins(bins, centroids, PIXELS);
  for (let iteration = 0; iteration < 5; iteration += 1) {
    centroids = nextCentroids(assignBins(bins, centroids, PIXELS), centroids);
  }
  const finalAssignment = assignBins(bins, centroids, PIXELS);
  const families = buildFamilies(centroids, finalAssignment);
  const winnerFamily = families.reduce((winner, family) =>
    family.alphaWeight > winner.alphaWeight ? family : winner
  );
  const winnerRgb: Marker = [
    winnerFamily.r / winnerFamily.alphaWeight,
    winnerFamily.g / winnerFamily.alphaWeight,
    winnerFamily.b / winnerFamily.alphaWeight,
  ];
  return {
    bins,
    families,
    finalAssignment,
    finalCentroids: centroids,
    firstAssignment,
    seeds,
    winnerFamily,
    winnerHex: rgbHex(winnerRgb),
    winnerRgb,
  };
}

function PixelTile({
  dimmed,
  highlighted,
  pixel,
}: {
  dimmed: boolean;
  highlighted: boolean;
  pixel: Pixel;
}): JSX.Element {
  return (
    <div
      className={`${c.pixel} ${highlighted ? c.pixelHighlighted : ''} ${dimmed ? c.pixelDimmed : ''}`.trim()}
      style={{
        backgroundColor: rgbCss([
          pixel.r,
          pixel.g,
          pixel.b,
        ]),
      }}
    >
      <div className={c.pixelTop}>
        <span>{pixel.id}</span>
        <span>α {pixel.a}</span>
      </div>
      <div>
        <div className={c.pixelName}>{pixel.name}</div>
        <div className={c.pixelValue}>
          {pixel.r}, {pixel.g}, {pixel.b}
        </div>
      </div>
    </div>
  );
}

function WalkthroughScene({ model, step }: { model: Model; step: number }): JSX.Element {
  const busiest = model.bins[0];
  if (!busiest) return <div className={c.stable}>No visible pixels.</div>;
  if (step === 0) {
    return (
      <div>
        <div className={c.stageHeader}>the starting picture · 4 pixels</div>
        <div className={c.pixelGrid}>
          {PIXELS.map(pixel => (
            <PixelTile
              dimmed={false}
              highlighted={false}
              key={pixel.id}
              pixel={pixel}
            />
          ))}
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div>
        <div className={c.stageHeader}>every pixel gets one address</div>
        <div className={c.addressList}>
          {PIXELS.map(pixel => {
            const address = binFor(pixel);
            return (
              <div
                className={c.addressRow}
                key={pixel.id}
              >
                <span
                  className={c.swatch}
                  style={{
                    backgroundColor: rgbCss([
                      pixel.r,
                      pixel.g,
                      pixel.b,
                    ]),
                  }}
                />
                <div className={c.rowMain}>
                  <div className={c.rowTitle}>
                    {pixel.id} → ({address.r}, {address.g}, {address.b})
                  </div>
                  <div className={c.rowNote}>divide each channel by 8 and round down</div>
                </div>
                <span className={c.rowValue}>bins[{binIndex(address)}]</span>
              </div>
            );
          })}
        </div>
        <div className={c.mathBlock}>
          <span className={c.mathLabel}>one-dimensional address</span>
          <span className={c.mathValue}>29 × 1024 + 9 × 32 + 7 = 29991</span>
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div>
        <div className={c.stageHeader}>the busiest drawer receives two contributions</div>
        <div className={c.mathBlock}>
          <span className={c.mathLabel}>drawer bins[29991]</span>
          <span className={c.mathValue}>starts at (0, 0, 0)</span>
        </div>
        {busiest.pixels.map(pixel => (
          <div
            className={c.addressRow}
            key={pixel.id}
          >
            <span
              className={c.swatch}
              style={{
                backgroundColor: rgbCss([
                  pixel.r,
                  pixel.g,
                  pixel.b,
                ]),
              }}
            />
            <div className={c.rowMain}>
              <div className={c.rowTitle}>
                {pixel.id} adds ({pixel.r}, {pixel.g}, {pixel.b}) × {pixel.a}
              </div>
              <div className={c.rowNote}>
                weighted sum ({pixel.r * pixel.a}, {pixel.g * pixel.a}, {pixel.b * pixel.a})
              </div>
            </div>
            <span className={c.rowValue}>+ 1 sample</span>
          </div>
        ))}
        <div className={c.mathBlock}>
          <span className={c.mathLabel}>drawer total</span>
          <span className={c.mathValue}>
            ({busiest.r}, {busiest.g}, {busiest.b}) ÷ {busiest.a} = (
            {markerFor(busiest)
              .map(value => value.toFixed(1))
              .join(', ')}
            )
          </span>
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div>
        <div className={c.stageHeader}>non-empty drawers become starting markers</div>
        <div className={c.markerList}>
          {model.bins.map((bin, index) => {
            const marker = markerFor(bin);
            return (
              <div
                className={c.markerRow}
                key={binIndex(
                  bin.pixels[0]
                    ? binFor(bin.pixels[0])
                    : {
                        b: 0,
                        g: 0,
                        r: 0,
                      }
                )}
              >
                <span
                  className={c.swatch}
                  style={{
                    backgroundColor: rgbCss(marker),
                  }}
                />
                <span className={c.markerName}>
                  marker {index + 1}
                  <br />
                  {bin.pixels.map(pixel => pixel.id).join(' + ')}
                </span>
                <span className={c.rowNote}>
                  ({bin.r}, {bin.g}, {bin.b}) ÷ {bin.a}
                  <br />= ({marker.map(value => value.toFixed(1)).join(', ')})
                </span>
              </div>
            );
          })}
        </div>
        <p className={c.stable}>
          Rust keeps at most K = 8 markers. This fixture has three non-empty drawers.
        </p>
      </div>
    );
  }
  if (step === 4) {
    return (
      <div>
        <div className={c.stageHeader}>nearest squared RGB distance decides each match</div>
        <div className={c.matchList}>
          {PIXELS.map((pixel, index) => (
            <div
              className={c.matchRow}
              key={pixel.id}
            >
              <span className={c.matchLabel}>{pixel.id}</span>
              <span className={c.matchArrow}>smallest distance</span>
              <span className={c.rowValue}>
                marker {(model.firstAssignment.assignments[index] ?? 0) + 1}
              </span>
            </div>
          ))}
        </div>
        <div className={c.mathBlock}>
          <span className={c.mathLabel}>worked example · P1 to marker 1</span>
          <span className={c.mathValue}>
            d = (235.5 − 232)² + (77.5 − 76)² + (60.5 − 58)² = 20.75
          </span>
        </div>
      </div>
    );
  }
  if (step === 5) {
    return (
      <div>
        <div className={c.stageHeader}>recalculate each marker from its assigned pixels</div>
        <div className={c.repeatList}>
          {model.finalCentroids.map((centroid, index) => {
            const group = model.finalAssignment.clusters[index];
            if (!group) return null;
            return (
              <div
                className={c.repeatRow}
                key={centroid.join('-')}
              >
                <span className={c.repeatMarker}>marker {index + 1}</span>
                <span className={c.repeatText}>
                  {group.pixels.map(pixel => pixel.id).join(' + ') || 'no pixels'}
                  <br />({group.r}, {group.g}, {group.b}) ÷ {group.alphaWeight}
                  <br />= ({centroid.map(value => value.toFixed(1)).join(', ')})
                </span>
                <span className={c.rowValue}>stable</span>
              </div>
            );
          })}
        </div>
        <p className={c.stable}>
          The loop runs five passes. These markers do not move, so passes 2 to 5 repeat the same
          assignments.
        </p>
      </div>
    );
  }
  if (step === 6) {
    const maxWeight = Math.max(...model.families.map(family => family.alphaWeight));
    return (
      <div>
        <div className={c.stageHeader}>nearby markers become color families</div>
        <div className={c.familyList}>
          {model.families.map((family, index) => {
            const winner = family === model.winnerFamily;
            return (
              <div
                className={c.familyRow}
                key={family.members.join('-')}
              >
                <div className={c.familyHeader}>
                  <span className={c.familyName}>
                    family {index + 1} · markers{' '}
                    {family.members.map(member => member + 1).join(' + ')}
                  </span>
                  <span className={c.familyWeight}>
                    {family.samples} pixels · α {family.alphaWeight}
                  </span>
                </div>
                <div className={c.familyTrack}>
                  <div
                    className={`${c.familyBar} ${winner ? c.familyBarWinner : ''}`.trim()}
                    style={{
                      width: `${(family.alphaWeight / maxWeight) * 100}%`,
                    }}
                  />
                </div>
                <div className={c.familyMembers}>
                  {family.pixels.map(pixel => pixel.id).join(' + ')}
                  {winner ? ' · winner' : ''}
                </div>
              </div>
            );
          })}
        </div>
        <p className={c.stable}>
          Rust merges centroids within RGB distance 60, then votes by total alpha weight. In this
          fixture, the P1 + P2 marker is already the largest family.
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className={c.stageHeader}>the answer</div>
      <div className={c.mathBlock}>
        <span className={c.mathLabel}>winning family mean</span>
        <span className={c.mathValue}>
          ({model.winnerFamily.r}, {model.winnerFamily.g}, {model.winnerFamily.b}) ÷{' '}
          {model.winnerFamily.alphaWeight} = (
          {model.winnerRgb.map(value => value.toFixed(1)).join(', ')})
        </span>
      </div>
      <div className={c.winner}>
        <span
          className={c.winnerSwatch}
          style={{
            backgroundColor: rgbCss(model.winnerRgb),
          }}
        />
        <div>
          <div className={c.winnerHex}>{model.winnerHex}</div>
          <div className={c.familyMembers}>
            rounded RGB ({model.winnerRgb.map(value => Math.round(value)).join(', ')}) · P1 + P2
          </div>
        </div>
      </div>
    </div>
  );
}

function stepCopy(step: number): string {
  if (step === 0)
    return 'Each square is one pixel. Its color is four bytes: red, green, blue, and opacity.';
  if (step === 1)
    return 'Divide each channel by 8 and round down to form a compact drawer address.';
  if (step === 2)
    return 'Pixels in one drawer add their alpha-weighted channel values to the same running total.';
  if (step === 3)
    return 'The busiest non-empty drawers provide the initial color markers for K-Means.';
  if (step === 4)
    return 'Every drawer joins the marker with the smallest squared distance in RGB space.';
  if (step === 5)
    return 'Recompute marker means from their assigned pixels and repeat the pass five times.';
  if (step === 6)
    return 'The production Rust path merges nearby markers before selecting the alpha-weighted winner.';
  return 'Round the winning family mean to RGB bytes and format it as HEX.';
}

export function DominantColorWalkthrough(): JSX.Element {
  const [step, setStep] = useState(0);
  const model = useMemo(buildModel, []);
  const lastStep = STEPS.length - 1;
  const activeStep = STEPS[step] ?? STEPS[0];
  const titleId = useId();
  const handleStepSelect = useCallback((event: ReactMouseEvent<HTMLButtonElement>) => {
    const nextStep = Number(event.currentTarget.getAttribute('data-step'));
    setStep(Number.isFinite(nextStep) ? nextStep : 0);
  }, []);
  const handlePrevious = useCallback(() => {
    setStep(current => Math.max(0, current - 1));
  }, []);
  const handleNext = useCallback(() => {
    setStep(current => (current === lastStep ? 0 : current + 1));
  }, [
    lastStep,
  ]);

  return (
    <section
      aria-labelledby={titleId}
      className={c.section}
    >
      <div className={c.intro}>
        <p className={c.kicker}>Interactive walkthrough</p>
        <h2
          className={c.title}
          id={titleId}
        >
          Watch four pixels become one color.
        </h2>
        <p className={c.lead}>
          Move through the same bins, weighted means, K-Means passes, and family vote used by the
          Rust color kernel.
        </p>
      </div>
      <div className={`${c.shell} ${c.reducedMotion}`.trim()}>
        <div className={c.shellBar}>
          <span className={c.shellLabel}>
            dominant color · step {step + 1} of {STEPS.length}
          </span>
          <nav
            aria-label="Walkthrough steps"
            className={c.stepRail}
          >
            {STEPS.map((item, index) => (
              <button
                aria-current={step === index ? 'step' : undefined}
                aria-label={`${index + 1}. ${item.label}`}
                className={`${c.stepButton} ${step === index ? c.stepButtonActive : ''}`.trim()}
                data-step={index}
                key={item.label}
                onClick={handleStepSelect}
                type="button"
              >
                <span className={c.stepDot}>{index + 1}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className={c.body}>
          <div
            aria-live="polite"
            className={c.stage}
          >
            <WalkthroughScene
              model={model}
              step={step}
            />
          </div>
          <aside className={c.side}>
            <div>
              <span className={c.sideLabel}>{activeStep?.label}</span>
              <h3 className={c.stepTitle}>{activeStep?.title}</h3>
              <p className={c.stepCopy}>{stepCopy(step)}</p>
            </div>
            <div>
              <div className={c.controls}>
                <button
                  className={c.controlButton}
                  disabled={step === 0}
                  onClick={handlePrevious}
                  type="button"
                >
                  Back
                </button>
                <button
                  className={`${c.controlButton} ${c.controlButtonPrimary}`.trim()}
                  onClick={handleNext}
                  type="button"
                >
                  {step === lastStep ? 'Start again' : 'Next step'}
                </button>
              </div>
              <p className={c.sourceNote}>
                The fixture returns <span className={c.sourceCode}>{model.winnerHex}</span>.
                Production Rust also applies the same alpha cutoff, family merge, and coverage
                accounting to full images.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
