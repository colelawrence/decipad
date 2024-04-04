import type { Path } from 'slate';
import { useMemo } from 'react';
import { useTableColumnFormulaResultForColumn } from '@decipad/editor-hooks';
import type { TableCellType } from '@decipad/editor-types';
import type { AggregationType } from '@decipad/language-aggregations';
import { availableAggregations } from '@decipad/language-aggregations';
import type { TableColumn } from '../types';

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
      availableAggregations(
        formulaResult
          ? (formulaResult.type.cellType as TableCellType)
          : (column.cellType as TableCellType)
      ),
    [column, formulaResult]
  );
};
