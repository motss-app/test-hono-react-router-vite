import * as m from '../paraglide/messages.js';
import * as s from './breadcrumbs.css.ts';
import { IconChevronRight } from './expressive.icons.ts';
import { Link } from './Link.tsx';

export function Breadcrumbs({
  items,
}: {
  items: ReadonlyArray<{
    label: string;
    to?: string;
  }>;
}) {
  return (
    <nav aria-label={m.navigation_breadcrumbs()}>
      <ol className={s.list}>
        {items.map(({ label, to }, index) => (
          <li
            className={s.item}
            key={to ?? label}
          >
            {index > 0 ? (
              <IconChevronRight
                aria-hidden="true"
                className={s.separator}
              />
            ) : null}
            {to ? (
              <Link
                aria-current={index === items.length - 1 ? 'page' : undefined}
                className={s.link}
                to={to}
              >
                {label}
              </Link>
            ) : (
              <span
                aria-current={index === items.length - 1 ? 'page' : undefined}
                className={s.current}
              >
                {label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
