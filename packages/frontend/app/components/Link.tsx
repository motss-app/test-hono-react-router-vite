import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';

import { utilities } from '../app.css.ts';
import { localizeHref } from '../paraglide/runtime.js';

export interface LinkProps extends ComponentProps<typeof RouterLink> {}

export function Link({ to, style, className, ...rest }: LinkProps) {
  const localizedTo = typeof to === 'string' ? localizeHref(to) : to;

  return (
    <RouterLink
      {...rest}
      className={`${utilities.linkReset} ${className || ''}`.trim() || undefined}
      style={style}
      to={localizedTo}
    />
  );
}
