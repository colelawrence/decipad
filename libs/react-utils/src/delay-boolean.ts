import { useEffect, useState, useRef } from 'react';

/**
 * Make `true` only appear 1 second later. Used for delaying the display of errors.
 */
export const useDelayedBoolean = (currentBoolean: boolean) => {
  const [isTrue, setIsTrue] = useState(false);

  useEffect(() => {
    if (currentBoolean) {
      setIsTrue(false);
      const timeout = setTimeout(() => {
        setIsTrue(true);
      }, 1000);

      return () => {
        clearTimeout(timeout);
      };
    }
    setIsTrue(false);
    return () => {};
  }, [currentBoolean]);

  return currentBoolean === false ? false : isTrue;
};

/**
 * Until it's time to reveal an error, show the latest good thing
 */
export const useDelayedValue = <T>(
  freshValue: T,
  currentBoolean: boolean
): T => {
  const latestValue = useRef(freshValue);

  useEffect(() => {
    if (!currentBoolean) {
      latestValue.current = freshValue;
    }
  }, [freshValue, currentBoolean]);

  const delayedBoolean = useDelayedBoolean(currentBoolean);

  if (currentBoolean && !delayedBoolean) {
    return latestValue.current;
  }
  return freshValue;
};
