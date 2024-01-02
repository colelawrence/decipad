import { useMemo } from 'react';
import { useElement } from '@udecode/plate-common';
import { useTableStore } from '../contexts/tableStore';

export const useCellSelected = () => {
  const element = useElement();
  const selectedCells = useTableStore().get.selectedCells();

  return useMemo(
    () => selectedCells?.includes(element),
    [element, selectedCells]
  );
};
