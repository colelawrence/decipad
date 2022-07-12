import { Path } from 'slate';
import { useTableColumnFormulaResultForColumn } from '@decipad/react-contexts';
import { useMemo } from 'react';
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

const cellType = (column: TableColumn, result: Result.Result): TableColumn => {
  if (result.type.kind === 'column') {
    return {
      ...column,
      cellType: result.type.cellType as TableColumn['cellType'],
    };
  }
  return column;
};

export const useColumnAggregationTypes = ({
  column,
  columnIndex,
}: UseAggregationTypeProps): AggregationType[] => {
  const formulaResult = useTableColumnFormulaResultForColumn(columnIndex);
  return useMemo(
    () =>
      formulaResult
        ? columnAggregationTypes(cellType(column, formulaResult))
        : columnAggregationTypes(column),
    [column, formulaResult]
  );
};
