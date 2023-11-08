import { useComputer } from '@decipad/react-contexts';
import { useEffect, useMemo, useState } from 'react';
import { isColumn } from '@decipad/computer';
import { Column } from '../../types';

interface UserReplacingColumnsProps {
  tableName: string;
  columns: Column[];
  roundings: Array<string | undefined>;
}

export const useReplacingColumns = ({
  tableName,
  columns,
  roundings,
}: UserReplacingColumnsProps): Column[] => {
  const computer = useComputer();

  const replacingColumnObservables = useMemo(
    () =>
      roundings.map((rounding, columnIndex) => {
        if (!rounding) {
          return undefined;
        }
        const column = columns[columnIndex];
        if (!column) {
          return;
        }
        const observeExpression = `round(${tableName}.${column.name}, ${rounding})`;
        return computer.expressionResultFromText$(observeExpression);
      }),
    [columns, computer, roundings, tableName]
  );

  const [replacingColumns, setReplacingColumns] = useState<Column[]>([]);

  useEffect(() => {
    const subscriptions = replacingColumnObservables.map((obs, colIndex) =>
      obs?.subscribe((result) => {
        const originalColumn = columns[colIndex];
        if (originalColumn) {
          setReplacingColumns((previousColumns) => {
            const replaceBy = [...previousColumns];
            replaceBy[colIndex] = {
              ...originalColumn,
              type: isColumn(result.type) ? result.type.cellType : result.type,
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
