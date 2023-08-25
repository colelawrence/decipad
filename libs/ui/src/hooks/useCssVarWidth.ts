import { RefObject, useEffect, useRef } from 'react';
import { cssVarName } from '../primitives';
import { CssVariables } from '../primitives/CssVariables';

/**
 * Hook to observe the width of an element (ref), and set its width
 * at the <html> to be used as a CSS Var later down the line.
 * @returns the ref
 */
export function useSetCssVarWidth<T extends HTMLElement>(
  varName: keyof CssVariables
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const refWidth = entry.contentRect.width;
        const root = document.documentElement;
        root.style.setProperty(cssVarName(varName), `${refWidth}px`);
      }
    });

    if (ref.current) {
      resizeObserver.observe(ref.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  });

  return ref;
}
