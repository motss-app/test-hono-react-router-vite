import { props } from '@stylexjs/stylex';
import type { ComponentProps } from 'react';
import { Link as RouterLink } from 'react-router';

import { utilities } from '../app.styles.ts';

export interface LinkProps extends ComponentProps<typeof RouterLink> {}

export function Link({ to, style, className, ...rest }: LinkProps) {
  const linkReset = props(utilities.linkReset);

  return (
    <RouterLink
      {...rest}
      className={`${linkReset.className || ''} ${className || ''}`.trim() || undefined}
      style={{
        ...linkReset.style,
        ...style,
      }}
      to={to}
    />
  );
}
