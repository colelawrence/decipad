import { ColumnLike, Comparable } from '@decipad/column';
import { Result, SerializedType, Unknown } from '@decipad/remote-computer';
import { useEffect, useState } from 'react';
import { useComputer } from '@decipad/react-contexts';
import { PreviousColumns } from '../types';
import { aggregate } from '../utils/aggregate';

export interface UseAggregationProps {
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

export interface UseAggregationResult {
  result: Result.Result;
  expression?: string | Error;
}

const unknownResult: Result.Result = {
  type: {
    kind: 'pending',
  },
  value: Unknown,
};

export const useAggregation = ({
  tableName,
  aggregationType,
  column,
  previousColumns,
  roundings,
}: UseAggregationProps): UseAggregationResult => {
  const computer = useComputer();
  const [result, setResult] = useState<Result.Result>(unknownResult);
  const [expression, setExpression] = useState<string | Error | undefined>();

  useEffect(() => {
    aggregate({
      computer,
      tableName,
      aggregationType,
      column,
      previousColumns,
      roundings,
    }).then(({ result: newResult, expression: newExpression }) => {
      if (newResult) {
        setResult(newResult);
      }
      setExpression(newExpression);
    });
  }, [
    aggregationType,
    column,
    computer,
    previousColumns,
    roundings,
    tableName,
  ]);

  return {
    result,
    expression: typeof expression === 'string' ? expression : undefined,
  };
};
