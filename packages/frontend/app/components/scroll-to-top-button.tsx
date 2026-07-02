import type { JSX } from 'react';

import { hidden, visible } from './scroll-to-top-button.css.ts';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ isVisible, onClick }: ScrollToTopButtonProps): JSX.Element {
  return (
    <button
      aria-label="Scroll to top"
      className={isVisible ? visible : hidden}
      onClick={onClick}
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
