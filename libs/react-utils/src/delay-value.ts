import { useEffect, useState, useRef } from 'react';

export const DELAY_VALUE_TIMEOUT = 1000;

/**
 * Make `true` only appear 1 second later. Used for delaying the display of errors.
 */
export const useDelayedTrue = (
  currentBoolean: boolean,
  delayValueTimeout = DELAY_VALUE_TIMEOUT
) => {
  const [isTrue, setIsTrue] = useState(false);

  useEffect(() => {
    if (currentBoolean) {
      setIsTrue(false);
      const timeout = setTimeout(() => {
        setIsTrue(true);
      }, delayValueTimeout);

      return () => {
        clearTimeout(timeout);
      };
    }
    setIsTrue(false);
    return () => {};
  }, [currentBoolean, delayValueTimeout]);

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

  const delayedBoolean = useDelayedTrue(currentBoolean);

  if (currentBoolean && !delayedBoolean) {
    return latestValue.current;
  }
  return freshValue;
};
