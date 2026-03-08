import { props } from '@stylexjs/stylex';
import type { StyleXStyles } from '@stylexjs/stylex/lib/types/StyleXTypes';
import type { ComponentProps, JSX } from 'react';

import { utilities } from '../app.styles.ts';

export interface TextProps extends Omit<ComponentProps<'p'>, 'style'> {
  as?: Extract<keyof JSX.IntrinsicElements, 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'>;
  style?: StyleXStyles<{
    marginBlockEnd?: string;
    marginBlockStart?: string;
    marginInlineEnd?: string;
    marginInlineStart?: string;
  }>;
}

export function Text({ as: Component = 'p', children, style, ...rest }: TextProps) {
  const paragraphStyles = props(utilities.paragraphSpacing, style);

  return (
    <Component
      {...paragraphStyles}
      {...rest}
    >
      {children}
    </Component>
  );
}
