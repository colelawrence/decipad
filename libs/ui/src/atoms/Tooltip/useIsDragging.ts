import { useEffect, useState } from 'react';

export const useIsDragging = () => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const onDragStart = () => {
      setIsDragging(true);
    };
    const onDragEnd = () => {
      setIsDragging(false);
    };

    document.addEventListener('dragstart', onDragStart);
    document.addEventListener('dragend', onDragEnd);

    return () => {
      document.removeEventListener('dragstart', onDragStart);
      document.removeEventListener('dragend', onDragEnd);
    };
  }, [setIsDragging]);

  return isDragging;
};
