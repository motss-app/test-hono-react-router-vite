import { props } from '@stylexjs/stylex';
import type { ComponentProps, JSX } from 'react';

import { utilities } from '../app.styles.ts';

export interface TextProps extends ComponentProps<'p'> {
  as?: Extract<keyof JSX.IntrinsicElements, 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
}

export function Text({ as: Component = 'p', children, className, style, ...rest }: TextProps) {
  const paragraphStyles = props(utilities.paragraphSpacing);
  const mergedClassName =
    `${paragraphStyles.className || ''} ${className || ''}`.trim() || undefined;
  const mergedStyle =
    paragraphStyles.style || style
      ? {
          ...paragraphStyles.style,
          ...style,
        }
      : undefined;

  return (
    <Component
      {...rest}
      className={mergedClassName}
      style={mergedStyle}
    >
      {children}
    </Component>
  );
}
