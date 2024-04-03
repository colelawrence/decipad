import { useMemo, useState } from 'react';

export const useIsHovering = () => {
  const [isHovering, setIsHovering] = useState(false);
  return useMemo(
    () => ({
      isHovering,
      onMouseEnter: () => {
        setIsHovering(true);
      },
      onMouseLeave: () => {
        setIsHovering(false);
      },
    }),
    [isHovering]
  );
};
