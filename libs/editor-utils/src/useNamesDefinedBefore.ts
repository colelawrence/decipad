import { useEffect, useState } from 'react';
import type { AutocompleteName } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';

export const useNamesDefinedBefore = (
  blockId: string,
  stopIfNotFound = true
): AutocompleteName[] => {
  const [names, setNames] = useState<AutocompleteName[]>([]);
  const computer = useComputer();

  useEffect(() => {
    const subscription = computer
      .getNamesDefinedBefore$([blockId, 0], stopIfNotFound)
      .subscribe(setNames);

    return () => {
      subscription.unsubscribe();
    };
  }, [blockId, computer, stopIfNotFound]);

  return names;
};
