import { useState, useEffect, useRef, RefObject, useCallback } from 'react';

// Used to align comments with their blocks
export const useVerticalOffset = (
  containerRef: RefObject<HTMLElement>,
  childRef: RefObject<HTMLElement>
): number => {
  const [offset, setOffset] = useState<number>(0);
  const observer = useRef<MutationObserver | null>(null);

  const calculateOffset = useCallback((): void => {
    if (containerRef.current && childRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const childRect = childRef.current.getBoundingClientRect();
      setOffset(childRect.top - containerRect.top);
    }
  }, [containerRef, childRef, setOffset]);

  useEffect(() => {
    calculateOffset();

    // Setting up the observer to listen for DOM changes
    observer.current = new MutationObserver(calculateOffset);
    if (containerRef.current) {
      observer.current.observe(containerRef.current, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    // Clean up
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [containerRef, childRef, calculateOffset]);

  return offset;
};
