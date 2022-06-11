// @see https://github.com/jaredLunde/react-hook
import React from 'react';

export const useMergedRef =
  <T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> =>
  (element: T) =>
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(element);
      else if (ref && typeof ref === 'object')
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<T>).current = element;
    });
