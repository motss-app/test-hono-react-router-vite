import type { ComponentProps, JSX } from 'react';

import { utilities } from '../app.css.ts';

export interface TextProps extends ComponentProps<'p'> {
  as?: Extract<keyof JSX.IntrinsicElements, 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
}

export function Text({ as: Component = 'p', children, className, style, ...rest }: TextProps) {
  return (
    <Component
      {...rest}
      className={`${utilities.paragraphSpacing} ${className || ''}`.trim() || undefined}
      style={style}
    >
      {children}
    </Component>
  );
}
