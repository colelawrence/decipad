import { FC, useEffect, useMemo, useState } from 'react';
import { SmartCell as UISmartCell } from '@decipad/ui';
import { useComputer } from '@decipad/react-contexts';
import { Result, SerializedType } from '@decipad/computer';
import { debounceTime, EMPTY } from 'rxjs';
import { css } from '@emotion/react';
import { textify } from '@decipad/parse';
import { maybeAggregate } from '../../utils/maybeAggregate';
import { AggregationKind, PreviousColumns } from '../../types';

const DEBOUNCE_RESULT_MS = 500;

const emptyCellStyles = css({
  borderBottom: 0,
});

interface SmartProps {
  tableName: string;
  column: {
    type: SerializedType;
    value: Result.ColumnLike<Result.Comparable>;
    name: string;
  };
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  previousColumns: PreviousColumns;
  alignRight?: boolean;
  global?: boolean;
}

export const SmartCell: FC<SmartProps> = ({
  column,
  tableName,
  aggregationType,
  rowSpan,
  colSpan,
  onHover,
  hover,
  alignRight,
  previousColumns,
  global = false,
}: SmartProps) => {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);

  const expressionFilter = useMemo(() => {
    return (
      (column &&
        previousColumns.reduce((previous, current) => {
          const escapedValue = textify({
            type: current.type,
            value: current.value as Result.Result['value'],
          });
          return previous === ``
            ? `filter(${tableName}, ${tableName}.${current.name} == ${escapedValue})`
            : `filter(${previous}, ${previous}.${current.name} == ${escapedValue})`;
        }, '')) ||
      tableName
    );
  }, [column, previousColumns, tableName]);

  const expression = useMemo(() => {
    return (
      column &&
      expressionFilter &&
      maybeAggregate(
        `${expressionFilter}.${column.name}`,
        column.type,
        aggregationType
      )
    );
  }, [aggregationType, column, expressionFilter]);

  useEffect(() => {
    const sub = (
      (typeof expression === 'string' &&
        expression &&
        computer
          .expressionResultFromText$(expression)
          .pipe(debounceTime(DEBOUNCE_RESULT_MS))) ||
      EMPTY
    ).subscribe(setResult);
    return () => sub.unsubscribe();
  }, [computer, expression]);

  return result == null || aggregationType == null ? (
    <td css={emptyCellStyles} />
  ) : (
    <UISmartCell
      aggregationType={aggregationType}
      result={result}
      rowSpan={rowSpan}
      colSpan={colSpan}
      onHover={onHover}
      hover={hover}
      alignRight={alignRight}
      global={global}
    ></UISmartCell>
  );
};
