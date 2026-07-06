import type { JSX } from 'react';

import { LocaleSwitcher } from './locale-switcher.tsx';
import * as s from './page-footer.css.ts';

export function PageFooter(): JSX.Element {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <LocaleSwitcher />
        <p className={s.footerNote}>React Router + Hono Demo</p>
      </div>
    </footer>
  );
}
