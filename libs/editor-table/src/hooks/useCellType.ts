import {
  TableCellElement,
  TableCellType,
  TableHeaderElement,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  useEditorChange,
  useEditorTableContext,
} from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { dequal } from 'dequal';
import { useEffect, useState } from 'react';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): TableCellType | undefined => {
  const table = useEditorTableContext();
  const [cellType, setCellType] = useState<TableCellType | undefined>();
  const editor = useTEditorRef();

  useEditorChange(
    (newCellType) => {
      if (!dequal(cellType, newCellType)) {
        setCellType(newCellType);
      }
    },
    () => {
      const cellPath = findNodePath(editor, element);
      if (cellPath) {
        const columnIndex = cellPath[cellPath.length - 1];
        return table.cellTypes[columnIndex];
      }
      return undefined;
    }
  );

  useEffect(() => {}, [editor, element, table.cellTypes]);

  return cellType;
};
