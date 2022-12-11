import { Result } from '@decipad/computer';
import { AggregationKind } from '../types';

export const availableAggregationTypesForColumnOf = (
  columnType: Result.Result['type']
): AggregationKind[] => {
  switch (columnType.kind) {
    case 'date':
      return ['min', 'max', 'span'];
    case 'number':
      return ['sum', 'average', 'min', 'max', 'median', 'span'];

    default:
      return [];
  }
};
