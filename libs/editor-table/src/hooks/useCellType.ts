import {
  TableCellElement,
  TableCellType,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { useState } from 'react';
import { useEditorTableContext } from '../contexts/EditorTableContext';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): TableCellType | undefined => {
  const table = useEditorTableContext();
  const [cellType, setCellType] = useState<TableCellType | undefined>();
  const editor = useTEditorRef();

  useEditorChange(setCellType, () => {
    const cellPath = findNodePath(editor, element);
    if (cellPath) {
      const columnIndex = cellPath[cellPath.length - 1];
      return table.cellTypes[columnIndex];
    }
    return undefined;
  });

  return cellType;
};
