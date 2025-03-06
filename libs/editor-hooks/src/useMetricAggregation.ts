import { useMemo } from 'react';
import { useResultType } from './useResultType';
import {
  availableAggregations,
  getAggregationById,
} from '@decipad/language-aggregations';

export interface UseMetricAggregationOptions {
  blockId: string;
  aggregationId?: string;
}

export const useMetricAggregation = ({
  blockId,
  aggregationId,
}: UseMetricAggregationOptions) => {
  const valueType = useResultType(blockId);
  const columnType =
    valueType?.kind === 'column' || valueType?.kind === 'materialized-column'
      ? valueType.cellType
      : null;

  const aggregationOptions = useMemo(
    () =>
      columnType
        ? availableAggregations(columnType).filter(
            ({ requiresSum = false }) => !requiresSum
          )
        : [],
    [columnType]
  );

  const safeAggregationId = useMemo(() => {
    if (aggregationOptions.length === 0) return null;

    // Make sure the selected option is available
    if (aggregationOptions.find(({ id }) => id === aggregationId)) {
      return aggregationId!;
    }

    return null;
  }, [aggregationOptions, aggregationId]);

  const aggregation = useMemo(() => {
    if (!safeAggregationId) return null;
    return getAggregationById(safeAggregationId) ?? null;
  }, [safeAggregationId]);

  const aggregationResultType = useMemo(() => {
    if (!aggregation || !columnType) return null;

    const { getResultType } = aggregation;
    if (!getResultType) return null;

    return getResultType(columnType);
  }, [aggregation, columnType]);

  const resultType = aggregationResultType ?? valueType;

  return {
    aggregation,
    safeAggregationId,
    aggregationOptions,
    resultType,
  };
};
