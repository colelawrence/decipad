import { useContext, useEffect } from 'react';
import { TableHeaderElement } from '@decipad/editor-types';
import { ColumnInferredTypeContext } from '../contexts/ColumnInferredTypeContext';
import { useColumnInferredType } from './useColumnInferredType';

export const useTableHeaderCellColumnInferredType = (
  element: TableHeaderElement,
  columnIndex?: number
) => {
  const inferredType = useColumnInferredType(element);
  const columnInferredTypeContext = useContext(ColumnInferredTypeContext);

  useEffect(() => {
    if (columnIndex != null) {
      columnInferredTypeContext.setColumnType(columnIndex, inferredType);
    }
  }, [columnInferredTypeContext, columnIndex, inferredType]);

  return inferredType;
};
