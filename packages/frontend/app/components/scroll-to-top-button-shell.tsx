import { type JSX, Suspense, useCallback, useEffect, useRef, useState } from 'react';

import { LazyScrollToTopButton } from './lazy-scroll-to-top-button.tsx';
import { ScrollToTopButtonSkeleton } from './scroll-to-top-button-skeleton.tsx';

const SCROLL_THRESHOLD = 0.2;

export function ScrollToTopButtonShell(): JSX.Element | null {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const scrollThresholdRef = useRef(0);

  const handleClick = useCallback(() => {
    globalThis.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
    setIsVisible(false);
  }, []);

  useEffect(() => {
    function updateScrollThreshold(): void {
      const docHeight = document.documentElement.scrollHeight;
      const viewHeight = globalThis.innerHeight;
      scrollThresholdRef.current = (docHeight - viewHeight) * SCROLL_THRESHOLD;
    }

    function handleScroll(): void {
      const scrollY = globalThis.scrollY;
      const pastThreshold = scrollY > scrollThresholdRef.current;
      if (!shouldLoad && pastThreshold) {
        setShouldLoad(true);
      }
      setIsVisible(pastThreshold);
    }

    updateScrollThreshold();

    globalThis.addEventListener('scroll', handleScroll, {
      passive: true,
    });
    globalThis.addEventListener('resize', updateScrollThreshold, {
      passive: true,
    });

    return () => {
      globalThis.removeEventListener('scroll', handleScroll);
      globalThis.removeEventListener('resize', updateScrollThreshold);
    };
  }, [
    shouldLoad,
  ]);

  if (!shouldLoad) {
    return null;
  }

  return (
    <Suspense fallback={<ScrollToTopButtonSkeleton />}>
      <LazyScrollToTopButton
        isVisible={isVisible}
        onClick={handleClick}
      />
    </Suspense>
  );
}
