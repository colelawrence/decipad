import {
  TableCellElement,
  CellValueType,
  TableHeaderElement,
} from '@decipad/editor-types';
import { useNodePath } from '@decipad/editor-hooks';
import { useColumnInferredType } from '../contexts/ColumnInferredTypeContext';

export const useCellType = (
  element: TableCellElement | TableHeaderElement
): CellValueType | undefined => {
  const cellPath = useNodePath(element);
  return useColumnInferredType(cellPath?.[cellPath.length - 1]);
};
