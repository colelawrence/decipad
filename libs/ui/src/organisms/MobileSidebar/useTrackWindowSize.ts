import { useState, useEffect } from 'react';
import { smallestDesktop } from '../../primitives/viewport';

export const useTrackWindowSize = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const update = () => {
      setIsLoading(false);
      setIsSmallScreen(window.innerWidth < smallestDesktop.portrait.width);
    };

    update();
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('resize', update);
    };
  }, []);

  return { isSmallScreen, isLoading };
};
