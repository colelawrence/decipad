import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const debounceTimeMs = 200;

export const useIsDragging = () => {
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart = useDebouncedCallback(
    useCallback(() => {
      setIsDragging(true);
    }, []),
    debounceTimeMs
  );

  const onDragEnd = useDebouncedCallback(
    useCallback(() => {
      setIsDragging(false);
    }, []),
    debounceTimeMs
  );

  useEffect(() => {
    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);

    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, [onDragEnd, onDragStart]);

  return isDragging;
};
