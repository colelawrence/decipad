import { createAtomStore, TElement } from '@udecode/plate-common';

export const { useTableStore, TableProvider } = createAtomStore(
  {
    selectedCells: null as TElement[] | null,
    hoveredRowId: null as string | null,
    hoveredRowBottomId: null as string | null,
  },
  { name: 'table' }
);

export const { useTableRowStore, TableRowProvider } = createAtomStore(
  {
    // Drop line direction for rows (horizontal)
    dropLine: '',
    rowWidth: null as number | null,
  },
  { name: 'tableRow' }
);
