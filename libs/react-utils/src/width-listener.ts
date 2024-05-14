import { type RefObject, useEffect, useRef, useState } from 'react';

export function useElementWidth<T extends HTMLElement>(): [
  RefObject<T>,
  number
] {
  const sizeRef = useRef<T>(null);
  const [width, setWidth] = useState<number>(640);

  useEffect(() => {
    if (sizeRef.current == null) {
      return;
    }

    const obs = new ResizeObserver((entries) => {
      if (entries.length !== 1) {
        return;
      }

      setWidth(entries[0].contentRect.width);
    });

    obs.observe(sizeRef.current);

    return () => {
      obs.disconnect();
    };
  });

  return [sizeRef, width];
}
