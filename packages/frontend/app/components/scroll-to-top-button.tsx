import type { JSX } from 'react';

import * as m from '../paraglide/messages.js';
import { button, hidden, visible } from './scroll-to-top-button.css.ts';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ isVisible, onClick }: ScrollToTopButtonProps): JSX.Element {
  return (
    <button
      aria-hidden={!isVisible}
      aria-label={m.home_scroll_to_top()}
      className={`${button} ${isVisible ? visible : hidden}`}
      disabled={!isVisible}
      onClick={onClick}
      tabIndex={isVisible ? 0 : -1}
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
