import { usePlateSelection } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';
import { Selection } from 'slate';

export const useSelection = (): Selection => {
  const plateSelection = usePlateSelection();
  const [selection, setSelection] = useState<Selection>(plateSelection);
  useEffect(() => {
    if (!dequal(plateSelection, selection)) {
      setSelection(plateSelection);
    }
  }, [plateSelection, selection]);

  return selection;
};
