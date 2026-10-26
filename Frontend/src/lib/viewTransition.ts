import { startTransition } from 'react';
import { flushSync } from 'react-dom';

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const runViewTransition = (update: () => void) => {
  if (
    typeof document === 'undefined' ||
    prefersReducedMotion() ||
    !('startViewTransition' in document)
  ) {
    startTransition(update);
    return;
  }

  (document as ViewTransitionDocument).startViewTransition(() => {
    flushSync(update);
  });
};
