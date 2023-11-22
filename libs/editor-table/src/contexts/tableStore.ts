import { createAtomStore, TElement } from '@udecode/plate-common';
import { ELEMENT_TABLE, ELEMENT_TR } from '@decipad/editor-types';

export const { useTableStore } = createAtomStore(
  {
    selectedCells: null as TElement[] | null,
    hoveredRowId: null as string | null,
    hoveredRowBottomId: null as string | null,
  },
  { name: 'table', scope: ELEMENT_TABLE }
);

export const { useTableRowStore } = createAtomStore(
  {
    // Drop line direction for rows (horizontal)
    dropLine: '',
    rowWidth: null as number | null,
  },
  { name: 'tableRow', scope: ELEMENT_TR }
);
