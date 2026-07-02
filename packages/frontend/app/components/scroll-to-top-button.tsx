import { clsx } from 'clsx/lite';
import type { JSX } from 'react';

import { opacity0, opacity100 } from '../styles/atomic/layout/display-visibility/opacity.css.ts';
import {
  pointerEventsAuto,
  pointerEventsNone,
} from '../styles/atomic/layout/display-visibility/pointer-events.css.ts';
import { transformCenter, transformDown100 } from '../styles/atomic/other/transform.css.ts';
import { button } from './scroll-to-top-button.css.ts';

interface ScrollToTopButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ isVisible, onClick }: ScrollToTopButtonProps): JSX.Element {
  return (
    <button
      aria-label="Scroll to top"
      className={clsx(
        button,
        isVisible
          ? clsx(opacity100, pointerEventsAuto, transformCenter)
          : clsx(opacity0, pointerEventsNone, transformDown100)
      )}
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
