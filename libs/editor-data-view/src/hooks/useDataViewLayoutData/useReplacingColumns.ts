import { useEffect, useMemo, useState } from 'react';
import { concatMap, distinctUntilChanged } from 'rxjs';
import { useComputer } from '@decipad/react-contexts';
import { isColumn, materializeResult } from '@decipad/remote-computer';
import { DataViewFilter } from '@decipad/editor-types';
import { dequal } from '@decipad/utils';
import { Column } from '../../types';
import { buildExpression } from './buildExpression';

interface UserReplacingColumnsProps {
  tableName: string;
  columns: Column[];
  roundings: Array<string | undefined>;
  filters: Array<DataViewFilter | undefined>;
}

export const useReplacingColumns = ({
  tableName,
  columns,
  roundings,
  filters,
}: UserReplacingColumnsProps): Column[] => {
  const computer = useComputer();
  const replacingColumnObservables = useMemo(
    () =>
      roundings.map((rounding, columnIndex) => {
        const column = columns[columnIndex];
        if (!column) {
          return;
        }
        const expression = buildExpression(
          tableName,
          column.name,
          filters,
          columns,
          rounding
        );
        return computer.expressionResultFromText$(expression);
      }),
    [columns, computer, filters, roundings, tableName]
  );

  const [replacingColumns, setReplacingColumns] = useState<Column[]>([]);

  useEffect(() => {
    const subscriptions = replacingColumnObservables.map((obs, colIndex) =>
      obs
        ?.pipe(
          concatMap(async (result) => materializeResult(result)),
          distinctUntilChanged((prev, curr) => dequal(prev, curr))
        )
        .subscribe((result) => {
          const originalColumn = columns[colIndex];
          if (originalColumn) {
            setReplacingColumns((previousColumns) => {
              const replaceBy = [...previousColumns];
              replaceBy[colIndex] = {
                ...originalColumn,
                type: isColumn(result.type)
                  ? result.type.cellType
                  : result.type,
                value: result.value as Column['value'],
              };
              return replaceBy;
            });
          }
        })
    );

    return () => {
      for (const subscription of subscriptions) {
        subscription?.unsubscribe();
      }
      setReplacingColumns([]);
    };
  }, [columns, replacingColumnObservables]);

  return useMemo(
    () =>
      columns.map(
        (originalColumn, colIndex) =>
          replacingColumns[colIndex] ?? originalColumn
      ),
    [columns, replacingColumns]
  );
};
