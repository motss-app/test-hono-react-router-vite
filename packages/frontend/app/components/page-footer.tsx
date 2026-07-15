import type { JSX } from 'react';

import * as m from '../paraglide/messages.js';
import { LocaleSwitcher } from './locale-switcher.tsx';
import * as s from './page-footer.css.ts';

export function PageFooter(): JSX.Element {
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <LocaleSwitcher />
        <p className={s.footerNote}>{m.footer_note()}</p>
      </div>
    </footer>
  );
}
