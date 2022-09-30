import {
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useEditorSelector } from '@decipad/react-contexts';
import { findNodePath, getNode } from '@udecode/plate';
import { useColumnInferredType } from './useColumnInferredType';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): CellValueType | undefined => {
  const header = useEditorSelector((editor) => {
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
