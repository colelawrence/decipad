import { Path } from 'slate';
import { useMemo } from 'react';
import { useTableColumnFormulaResultForColumn } from '@decipad/editor-utils';
import { TableCellType } from '@decipad/editor-types';
import { Result } from '@decipad/computer';
import {
  AggregationType,
  columnAggregationTypes,
} from '../utils/columnAggregationTypes';
import { TableColumn } from './useTable';

interface UseAggregationTypeProps {
  column: TableColumn;
  tablePath?: Path;
  columnIndex: number;
}

const cellType = (
  column: TableColumn,
  result: Result.Result
): TableCellType => {
  if (result.type.kind === 'column') {
    return result.type.cellType as TableCellType;
  }
  return column.cellType as TableCellType;
};

export const useColumnAggregationTypes = ({
  column,
  columnIndex,
}: UseAggregationTypeProps): AggregationType[] => {
  const formulaResult = useTableColumnFormulaResultForColumn(columnIndex);
  return useMemo(
    () =>
      columnAggregationTypes(
        formulaResult
          ? cellType(column, formulaResult)
          : (column.cellType as TableCellType)
      ),
    [column, formulaResult]
  );
};
