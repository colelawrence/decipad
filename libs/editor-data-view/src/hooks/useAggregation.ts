import { ColumnLike, Comparable } from '@decipad/column';
import { Result, SerializedType } from '@decipad/computer';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { textify } from '@decipad/parse';
import { useComputer } from '@decipad/react-contexts';
import { debounceTime } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { PreviousColumns } from '../types';
import { maybeAggregate } from '../utils/maybeAggregate';

const DEBOUNCE_EXPRESSION_MS = 500;
const DEBOUNCE_RESULT_MS = 100;

interface UseAggregationProps {
  tableName: string;
  aggregationType?: string;
  column?: {
    type: SerializedType;
    value: ColumnLike<Comparable>;
    name: string;
  };
  previousColumns: PreviousColumns;
  roundings: Array<string | undefined>;
}

interface UseAggregationResult {
  result: Result.Result | null;
  expression?: string;
}

export const useAggregation = ({
  tableName,
  aggregationType,
  column,
  previousColumns,
  roundings,
}: UseAggregationProps): UseAggregationResult => {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result | null>(null);

  const expressionFilter = useMemo(() => {
    return (
      (column &&
        previousColumns.reduce((previous, current, index) => {
          const rounding = roundings[index];
          const filterSubject = previous
            ? `${previous}.${current.name}`
            : `${tableName}.${current.name}`;
          const roundedFilterSubject = rounding
            ? `round(${filterSubject}, ${rounding})`
            : filterSubject;
          const escapedValue = textify({
            type: current.type,
            value: current.value as Result.Result['value'],
          });
          return previous === ''
            ? `filter(${tableName}, ${roundedFilterSubject} == ${escapedValue})`
            : `filter(${previous}, ${roundedFilterSubject} == ${escapedValue})`;
        }, '')) ||
      tableName
    );
  }, [column, previousColumns, roundings, tableName]);

  const [expression] = useDebounce(
    useMemo(() => {
      return (
        column &&
        expressionFilter &&
        maybeAggregate(
          `${expressionFilter}.${column.name}`,
          column.type,
          aggregationType,
          {
            sum: `sum(${tableName}.${column.name})`,
          }
        )
      );
    }, [aggregationType, column, expressionFilter, tableName]),
    DEBOUNCE_EXPRESSION_MS
  );

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

  return {
    result,
    expression: typeof expression === 'string' ? expression : undefined,
  };
};
