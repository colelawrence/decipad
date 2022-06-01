import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedCellsAtom, TElement } from '@udecode/plate';

export const useIsCellSelected = (element: TElement) => {
  const [selectedCells] = useAtom(selectedCellsAtom);

  return useMemo(
    () => selectedCells?.includes(element),
    [element, selectedCells]
  );
};
