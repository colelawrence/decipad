import { Result } from '@decipad/computer';
import { AggregationKind, SmartRowElement } from '../types';
import { maybeAggregate } from '../utils/maybeAggregate';

export interface ColumnAggregation {
  type?: Result.Result['type'];
  value?: Result.Result['value'];
}

const useSmartColumnAggregation = maybeAggregate;

export interface UseSmartColumnReturn {
  columnAggregation: ColumnAggregation | Error | undefined;
}

export const useSmartColumn = (
  column: SmartRowElement['column'],
  selectedAggregationType: AggregationKind | undefined
): UseSmartColumnReturn | null => {
  const columnAggregation = useSmartColumnAggregation(
    column,
    selectedAggregationType
  );

  return selectedAggregationType !== undefined
    ? {
        columnAggregation,
      }
    : null;
};
