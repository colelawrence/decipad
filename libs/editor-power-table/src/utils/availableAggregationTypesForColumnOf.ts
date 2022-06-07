import { Result } from '@decipad/computer';
import { AggregationKind } from '../types';

export const availableAggregationTypesForColumnOf = (
  columnType: Result.Result['type']
): AggregationKind[] => {
  switch (columnType.kind) {
    case 'boolean':
      return ['frequency'];
    case 'date':
    case 'number':
      return ['sum', 'average', 'min', 'max', 'median', 'span', 'frequency'];
    case 'string':
      return ['frequency'];
    default:
      return [];
  }
};
