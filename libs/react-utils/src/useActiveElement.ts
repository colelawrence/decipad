import { useRef, useCallback } from 'react';
import { useWindowListener } from './event-listener';

/**
 * Detects when the user clicks outside of the element.
 * @param {() => void} onClickOutside - The callback function when the user clicks outside the element
 */
export function useActiveElement(onClickOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback(
    function handleClickOutside(event: Event) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    },
    [onClickOutside]
  );
  useWindowListener('mousedown', handleClickOutside);
  return ref;
}
