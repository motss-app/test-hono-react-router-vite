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

interface SkeletonProps extends ComponentProps<'span'> {
  isLoading?: boolean;
}

export function Skeleton({ children, className, isLoading, ...props }: SkeletonProps): JSX.Element {
  const loading = isLoading !== false;
  const [shouldRenderSkeleton, setShouldRenderSkeleton] = useState(() => {
    return loading && isSlowNetwork();
  });
  const lastShowTime = useRef<number>(loading && isSlowNetwork() ? performance.now() : 0);

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

  return (
    <span
      className={`inline-block bg-green-700/50 animate-pulse align-middle leading-24 rounded-lg ${
        className || ''
      }`}
      {...props}
    >
      &nbsp;
    </span>
  );
}
