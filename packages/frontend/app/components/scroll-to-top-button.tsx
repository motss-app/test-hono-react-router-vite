import type { JSX } from 'react';

import { button } from './scroll-to-top-button.css.ts';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ isVisible, onClick }: ScrollToTopButtonProps): JSX.Element {
  return (
    <button
      aria-label="Scroll to top"
      className={button}
      onClick={onClick}
      style={{
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
        transform: isVisible ? 'translateY(0)' : 'translateY(1rem)',
      }}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="20"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
