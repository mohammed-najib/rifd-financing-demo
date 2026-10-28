import type { KeyboardEvent } from 'react';

// Native modal dialogs can still move Tab focus into the browser chrome.
export function containDialogFocus(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab' || event.defaultPrevented) return;
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, summary, object, iframe, [tabindex]',
    ),
  ).filter(
    element =>
      element.tabIndex >= 0 &&
      !element.matches(':disabled') &&
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden',
  );
  const first = controls[0],
    last = controls.at(-1);
  if (!first) {
    event.preventDefault();
    event.currentTarget.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
