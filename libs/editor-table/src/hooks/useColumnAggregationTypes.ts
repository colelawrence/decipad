import { Path } from 'slate';
import { useMemo } from 'react';
import { useTableColumnFormulaResultForColumn } from '@decipad/editor-utils';
import { TableCellType } from '@decipad/editor-types';
import {
  AggregationType,
  columnAggregationTypes,
} from '../utils/columnAggregationTypes';
import { TableColumn } from '../types';

interface UseAggregationTypeProps {
  column: TableColumn;
  tablePath?: Path;
  columnIndex: number;
}

export const useColumnAggregationTypes = ({
  column,
  columnIndex,
}: UseAggregationTypeProps): AggregationType[] => {
  const formulaResult = useTableColumnFormulaResultForColumn(columnIndex);
  return useMemo(
    () =>
      columnAggregationTypes(
        formulaResult
          ? (formulaResult.type.cellType as TableCellType)
          : (column.cellType as TableCellType)
      ),
    [column, formulaResult]
  );
};
