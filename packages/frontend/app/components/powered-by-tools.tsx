import * as m from '../paraglide/messages.js';
import * as s from './powered-by-tools.css.ts';
import { TechnologyLogo } from './technology-logo.tsx';

export function PoweredByTools() {
  return (
    <div>
      <p className={s.label}>{m.home_powered_by()}</p>
      <ul
        aria-label={m.home_powered_by()}
        className={s.tools}
      >
        <li>
          <TechnologyLogo brand="hono" />
          <span>Hono</span>
        </li>
        <li>
          <TechnologyLogo brand="react-router" />
          <span>React Router</span>
        </li>
        <li>
          <TechnologyLogo brand="vite" />
          <span>Vite</span>
        </li>
        <li>
          <TechnologyLogo brand="webassembly" />
          <span>WebAssembly</span>
        </li>
      </ul>
    </div>
  );
}
