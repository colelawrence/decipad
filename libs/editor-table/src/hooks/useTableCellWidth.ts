import { useNodePath } from '@decipad/editor-hooks';
import { TableCellElement, TableHeaderElement } from '@decipad/editor-types';
import { useEditorTableContext } from '@decipad/react-contexts';
import { useMemo } from 'react';

export const useTableCellWidth = (
  element: TableCellElement | TableHeaderElement
) => {
  const context = useEditorTableContext();
  const path = useNodePath(element);

  return useMemo(() => {
    const columnIndex = path?.[path.length - 1];
    return columnIndex && context.columnWidths[columnIndex];
  }, [context, path]);
};
