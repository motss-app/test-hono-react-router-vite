import * as s from './technology-logo.css.ts';

const logos = {
  'base-ui': {
    dark: 'base-ui-dark.svg',
    light: 'base-ui-light.svg',
  },
  'cloudflare-workers': {
    dark: null,
    light: 'cloudflare-workers.svg',
  },
  'font-awesome': {
    dark: null,
    light: 'font-awesome.svg',
  },
  hono: {
    dark: null,
    light: 'hono.svg',
  },
  iconify: {
    dark: null,
    light: 'iconify.svg',
  },
  inlang: {
    dark: 'inlang-dark.svg',
    light: 'inlang-light.svg',
  },
  nodejs: {
    dark: null,
    light: 'nodejs.svg',
  },
  react: {
    dark: null,
    light: 'react.svg',
  },
  'react-router': {
    dark: 'react-router-dark.svg',
    light: 'react-router-light.svg',
  },
  rust: {
    dark: 'rust-dark.svg',
    light: 'rust-light.svg',
  },
  typescript: {
    dark: null,
    light: 'typescript.svg',
  },
  'vanilla-extract': {
    dark: null,
    light: 'vanilla-extract.svg',
  },
  vite: {
    dark: 'vite-dark.svg',
    light: 'vite-light.svg',
  },
  webassembly: {
    dark: null,
    light: 'webassembly.svg',
  },
};

export function TechnologyLogo({ brand, size }: { brand: keyof typeof logos; size?: 'small' }) {
  const logo = logos[brand];
  const sizeClass = size === 'small' ? s.small : '';
  return (
    <>
      <img
        alt=""
        className={`${s.logo} ${sizeClass} ${logo.dark ? s.light : ''}`}
        height={size === 'small' ? 20 : 24}
        src={`/assets/logos/${logo.light}`}
        width={size === 'small' ? 20 : 28}
      />
      {logo.dark ? (
        <img
          alt=""
          className={`${s.logo} ${sizeClass} ${s.dark}`}
          height={size === 'small' ? 20 : 24}
          src={`/assets/logos/${logo.dark}`}
          width={size === 'small' ? 20 : 28}
        />
      ) : null}
    </>
  );
}
