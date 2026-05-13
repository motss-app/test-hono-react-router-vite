import { create, keyframes, props } from '@stylexjs/stylex';
import { type ComponentProps, type JSX, useEffect, useRef, useState } from 'react';

const DELAY_BEFORE_SHOWING_SKELETON_MS = 100;
const MIN_DISPLAY_DURATION_MS = 1000;

function isSlowNetwork() {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }
  const connection = (
    navigator as Navigator & {
      connection: {
        saveData: boolean;
        effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
      };
    }
  ).connection;
  return (
    connection?.saveData ||
    (connection?.effectiveType &&
      [
        'slow-2g',
        '2g',
        '3g',
      ].includes(connection.effectiveType))
  );
}

const pulse = keyframes({
  '0%': {
    opacity: 1,
  },
  '50%': {
    opacity: 0.5,
  },
  '100%': {
    opacity: 1,
  },
});

const s = create({
  base: {
    animationDuration: '2s',
    animationIterationCount: 'infinite',
    animationName: pulse,
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
    backgroundColor: 'rgba(212, 212, 212, 0.25)', // bg-neutral-300/25
    borderRadius: '0.5rem', // rounded-lg
    display: 'inline-block',
    lineHeight: '1.5rem', // leading-24 (assuming 24px)
    verticalAlign: 'middle',
  },
});

interface SkeletonProps extends ComponentProps<'span'> {
  isLoading?: boolean;
}

export function Skeleton({
  children,
  className,
  isLoading,
  style,
  ...rest
}: SkeletonProps): JSX.Element {
  const loading = isLoading !== false;
  const [shouldRenderSkeleton, setShouldRenderSkeleton] = useState(loading);
  const lastShowTime = useRef<number>(loading ? performance.now() : 0);

  useEffect(() => {
    let timeoutId: number;

    if (loading) {
      if (!shouldRenderSkeleton) {
        // Check for slow connection to avoid delaying feedback
        const delay = isSlowNetwork() ? 0 : DELAY_BEFORE_SHOWING_SKELETON_MS;

        timeoutId = setTimeout(() => {
          setShouldRenderSkeleton(true);
          lastShowTime.current = performance.now();
        }, delay);
      }
    } else if (shouldRenderSkeleton) {
      const elapsed = performance.now() - lastShowTime.current;
      const remaining = MIN_DISPLAY_DURATION_MS - elapsed;

      timeoutId = setTimeout(() => setShouldRenderSkeleton(false), Math.max(0, remaining));
    }

    return () => clearTimeout(timeoutId);
  }, [
    loading,
    shouldRenderSkeleton,
  ]);

  if (!shouldRenderSkeleton) {
    return <>{children}</>;
  }

  const skeletonProps = props(s.base);
  const mergedClassName = `${skeletonProps.className || ''} ${className || ''}`.trim() || undefined;
  const mergedStyle =
    skeletonProps.style || style
      ? {
          ...skeletonProps.style,
          ...style,
        }
      : undefined;

  return (
    <span
      {...rest}
      className={mergedClassName}
      style={mergedStyle}
    >
      &nbsp;
    </span>
  );
}
