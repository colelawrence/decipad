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
 * Until it's time to reveal an error, show the latest good thing.
 *
 * Used to delay showing type errors in language results.
 *
 * @example
 * const someValue = useSomeValueThatMayBeOk()
 *
 * // Return `someValue` if OK, otherwise returns current error after a delay
 * const delayedValue = useDelayedValue(someValue, !isOk(someValue));
 */
export const useDelayedValue = <T>(
  /** The value to be returned (now or later) */
  freshValue: T,
  /** When true, the value is shown later. When false, value is immediately shown */
  shouldDelayAtTheMoment: boolean
): T => {
  const latestValue = useRef(freshValue);

  useEffect(() => {
    if (!shouldDelayAtTheMoment) {
      latestValue.current = freshValue;
    }
  }, [freshValue, shouldDelayAtTheMoment]);

  const delayedBoolean = useDelayedTrue(shouldDelayAtTheMoment);

  if (shouldDelayAtTheMoment && !delayedBoolean) {
    return latestValue.current;
  }
  return freshValue;
};
