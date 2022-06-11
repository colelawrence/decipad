import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { selectedCellsAtom, TElement } from '@udecode/plate';
import { tableScope } from '../Table/index';

export const useIsCellSelected = (element: TElement) => {
  const [selectedCells] = useAtom(selectedCellsAtom, tableScope);

  return useMemo(
    () => selectedCells?.includes(element),
    [element, selectedCells]
  );
};
