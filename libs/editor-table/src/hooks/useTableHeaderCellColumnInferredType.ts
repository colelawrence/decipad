import { useContext, useEffect } from 'react';
import { TableHeaderElement } from '@decipad/editor-types';
import { useColumnInferredType } from '.';
import { ColumnInferredTypeContext } from '../contexts/ColumnInferredTypeContext';

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
