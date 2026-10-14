import { createHash, randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';

/**
 * Generate static, reproducible artwork with a quiet center for page content.
 * Home keeps its original composition. Each other decorative page gets a
 * different random stream derived from its name and the requested seed.
 */
const pages = [
  'about',
  'holy-grail',
  'ssr',
  'hono-rpc',
  'labs',
  'mandelbrot',
  'dominant-color',
  'image-optimize',
  'not-found',
  'application-error',
] as const;

const { values } = parseArgs({
  options: {
    mirror: {
      type: 'boolean',
    },
    page: {
      type: 'string',
    },
    random: {
      type: 'boolean',
    },
    seed: {
      type: 'string',
    },
  },
});
if (values.random && values.seed !== undefined) {
  throw new Error('Choose --seed or --random.');
}
if (values.page && !pages.some(page => page === values.page)) {
  throw new Error(`Unknown page. Choose one of: ${pages.join(', ')}.`);
}
const seed = values.random ? randomUUID() : (values.seed ?? 'issue-97-v1');
const selectedPages = values.page ? pages.filter(page => page === values.page) : pages;

function artwork(page: string): string {
  const digest = createHash('sha256').update(`${seed}:${page}`).digest('hex');
  let state = Number.parseInt(digest.slice(0, 8), 16);
  const random = (min: number, max: number) => {
    state = (state * 1664525 + 1013904223) % 0x100000000;
    return Math.round(min + (state / 0x100000000) * (max - min));
  };
  const paths: string[] = [];
  const transform = values.mirror ? 'translate(1440 0) scale(-1 1)' : '';
  const colors = [
    'violet',
    'pink',
    'blue',
  ];

  /** Broad overlapping curls use constrained randomness, never arbitrary noise. */
  for (let layer = 0; layer < 3; layer++) {
    const start = random(1080, 1190) + layer * 50;
    const depth = random(430, 650) - layer * 60;
    const bend = random(180, 250);
    const tip = random(1120, 1230);
    paths.push(
      `<path d="M${start} -80 C${start - 150} 30 ${start - 110} ${bend} ${start + 20} ${bend + 60} C${start + 220} ${bend + 90} ${tip + 210} ${depth - 90} ${tip} ${depth} C${tip + 220} ${depth + 10} 1540 ${depth - 90} 1540 ${bend} L1540 -80Z" fill="url(#${colors[layer]})" opacity=".${random(55, 78)}"/>`
    );
  }
  for (let layer = 0; layer < 3; layer++) {
    const top = random(580, 690) + layer * 65;
    const breadth = random(230, 350) - layer * 35;
    paths.push(
      `<path d="M-60 ${top} C${random(50, 110)} ${top - 80} ${random(90, 160)} ${top + 15} ${random(70, 120)} ${top + 100} C${random(70, 120)} ${top + 220} ${breadth} ${top + 100} ${breadth} 980 L-60 980Z" fill="url(#${colors[(layer + 2) % 3]})" opacity=".${random(50, 72)}"/>`
    );
  }
  const bottom = random(1170, 1260);
  paths.push(
    `<path d="M1540 640 C${bottom + 60} 650 ${bottom - 30} 760 ${bottom} 840 C${bottom + 20} 920 ${bottom - 90} 940 ${bottom - 130} 980 H1540Z" fill="url(#pink)" opacity=".48"/>`
  );

  if (page === 'labs') {
    paths.length = 0;
    /** Faceted cells form two edge clusters unique to the Labs catalog. */
    const radius = random(90, 110);
    const spacing = radius + 8;
    const offsets = [
      [
        0,
        0,
      ],
      [
        Math.sqrt(3) * spacing,
        0,
      ],
      [
        -Math.sqrt(3) * spacing,
        0,
      ],
      [
        (Math.sqrt(3) * spacing) / 2,
        1.5 * spacing,
      ],
      [
        (-Math.sqrt(3) * spacing) / 2,
        1.5 * spacing,
      ],
      [
        (Math.sqrt(3) * spacing) / 2,
        -1.5 * spacing,
      ],
      [
        (-Math.sqrt(3) * spacing) / 2,
        -1.5 * spacing,
      ],
    ] as const;
    for (const [clusterX, clusterY] of [
      [
        1440,
        120,
      ],
      [
        0,
        660,
      ],
    ] as const) {
      for (const [index, [offsetX, offsetY]] of offsets.entries()) {
        const x = clusterX + offsetX;
        const y = clusterY + offsetY;
        const points = Array.from(
          {
            length: 6,
          },
          (_, corner) => {
            const angle = (Math.PI / 3) * corner - Math.PI / 6;
            return `${Math.round(x + Math.cos(angle) * radius)},${Math.round(y + Math.sin(angle) * radius)}`;
          }
        ).join(' ');
        paths.push(
          `<polygon points="${points}" fill="url(#${colors[index % 3]})" opacity=".${random(28, 48)}"/>`
        );
      }
    }
  }

  if (page === 'hono-rpc') {
    paths.length = 0;
    /** Open orbital arcs and small nodes are reserved for the RPC composition. */
    for (let layer = 0; layer < 3; layer++) {
      const radius = random(145, 175) + layer * 76;
      const topX = random(1430, 1480);
      const topY = random(25, 70);
      const bottomX = random(-65, -25);
      const bottomY = random(865, 910);
      const stroke = random(28, 40);
      paths.push(
        `<path d="M${topX + radius} ${topY} A${radius} ${radius} 0 1 1 ${topX} ${topY - radius}" stroke="url(#${colors[layer]})" stroke-width="${stroke}" stroke-linecap="round" opacity=".${random(50, 68)}"/>`
      );
      paths.push(
        `<path d="M${bottomX - radius} ${bottomY} A${radius} ${radius} 0 1 1 ${bottomX} ${bottomY + radius}" stroke="url(#${colors[(layer + 2) % 3]})" stroke-width="${stroke}" stroke-linecap="round" opacity=".${random(48, 64)}"/>`
      );
    }
    for (const [x, y, color] of [
      [
        1415,
        470,
        'pink',
      ],
      [
        20,
        475,
        'blue',
      ],
    ] as const) {
      const size = random(54, 78);
      paths.push(
        `<rect x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}" rx="16" transform="rotate(45 ${x} ${y})" fill="url(#${color})" opacity=".40"/>`
      );
    }
  }

  if (page === 'ssr') {
    paths.length = 0;
    for (let layer = 0; layer < 3; layer++) {
      paths.push(
        `<ellipse cx="${random(1350, 1490)}" cy="${random(100, 220)}" rx="${random(280, 370)}" ry="${random(250, 360)}" fill="url(#${colors[layer]})" opacity=".${random(55, 72)}"/>`
      );
      paths.push(
        `<ellipse cx="${random(-80, 30)}" cy="${random(800, 970)}" rx="${random(200, 280)}" ry="${random(180, 250)}" fill="url(#${colors[(layer + 2) % 3]})" opacity=".${random(50, 65)}"/>`
      );
    }
  }

  const aspectRatio = page === 'hono-rpc' || page === 'labs' ? 'xMidYMin meet' : 'none';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 960" preserveAspectRatio="${aspectRatio}" fill="none">
  <!-- Generated by pnpm backgrounds:generate. Composition ${digest.slice(0, 16)}. -->
  <defs>
    <linearGradient id="violet" x1="1000" y1="0" x2="1440" y2="700" gradientUnits="userSpaceOnUse"><stop stop-color="#B193FF"/><stop offset=".5" stop-color="#8A4BED"/><stop offset="1" stop-color="#EF83D0"/></linearGradient>
    <linearGradient id="pink" x1="1440" y1="0" x2="1060" y2="960" gradientUnits="userSpaceOnUse"><stop stop-color="#FFB4DB"/><stop offset=".6" stop-color="#D766E9"/><stop offset="1" stop-color="#FFBC98"/></linearGradient>
    <linearGradient id="blue" x1="0" y1="500" x2="1440" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#82DCF2"/><stop offset=".45" stop-color="#638CFF"/><stop offset="1" stop-color="#A36DEF"/></linearGradient>
    <linearGradient id="edges"><stop stop-color="white"/><stop offset=".22" stop-color="black"/><stop offset=".68" stop-color="black"/><stop offset="1" stop-color="white"/></linearGradient>
    <mask id="reading-space"><path fill="url(#edges)" d="M0 0H1440V960H0Z"/></mask>
  </defs>
  <g mask="url(#reading-space)"${transform ? ` transform="${transform}"` : ''}>
    ${paths.join('\n    ')}
  </g>
</svg>
`;
}

for (const page of selectedPages) {
  await writeFile(
    new URL(`../packages/frontend/public/assets/${page}-expressive.svg`, import.meta.url),
    artwork(page)
  );
  console.log(`Generated ${page}-expressive.svg`);
}
const pageOption = values.page ? ` --page ${values.page}` : '';
const mirrorOption = values.mirror ? ' --mirror' : '';
console.log(
  `Seed: ${seed}. Reproduce with pnpm backgrounds:generate${pageOption}${mirrorOption} --seed ${seed}`
);
