import {
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorChange } from '@decipad/react-contexts';
import { findNodePath, getNode } from '@udecode/plate';
import { useState } from 'react';
import { useColumnInferredType } from './useColumnInferredType';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): CellValueType | undefined => {
  const [header, setHeader] = useState<TableHeaderElement | undefined>();

  useEditorChange(setHeader, (editor) => {
    const cellPath = findNodePath(editor, element);
    if (cellPath) {
      const colIndex = cellPath[cellPath.length - 1];
      const tablePath = cellPath.slice(0, -2);
      const headerPath = [...tablePath, 1, colIndex];
      return getNode<TableHeaderElement>(editor, headerPath) ?? undefined;
    }
    return undefined;
  });

  return useColumnInferredType(header)?.type;
};
