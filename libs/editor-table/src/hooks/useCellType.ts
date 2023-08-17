import {
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useNodePath } from '@decipad/editor-hooks';
import { useEditorTableContext } from '@decipad/react-contexts';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): CellValueType | undefined => {
  const cellPath = useNodePath(element);
  const { cellTypes } = useEditorTableContext();
  if (cellPath === undefined) return undefined;
  const columnIndex = cellPath[cellPath.length - 1];
  return cellTypes[columnIndex];
};
