import { dequal } from '@decipad/utils';
import { useEffect, useState } from 'react';

export const useDeepMemo = <T>(
  factory: () => T,
  deps: Array<unknown> = []
): T => {
  const [value, setValue] = useState(() => factory());

  useEffect(() => {
    const newValue = factory();
    if (!dequal(value, newValue)) {
      setValue(newValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [factory, value, ...deps]);

  return value;
};
