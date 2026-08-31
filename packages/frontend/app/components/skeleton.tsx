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

import { skeletonStyles } from './skeleton.css.ts';

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
        }, delay) as unknown as number;
      }
    } else if (shouldRenderSkeleton) {
      const elapsed = performance.now() - lastShowTime.current;
      const remaining = MIN_DISPLAY_DURATION_MS - elapsed;

      timeoutId = setTimeout(
        () => setShouldRenderSkeleton(false),
        Math.max(0, remaining)
      ) as unknown as number;
    }

    return () => clearTimeout(timeoutId);
  }, [
    loading,
    shouldRenderSkeleton,
  ]);

  if (!shouldRenderSkeleton) {
    return <>{children}</>;
  }

  return (
    <span
      {...rest}
      className={`${skeletonStyles.base} ${className || ''}`.trim() || undefined}
      style={style}
    >
      &nbsp;
    </span>
  );
}
