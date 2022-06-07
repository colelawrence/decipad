import { Result } from '@decipad/computer';
import { AggregationKind } from '../types';

export const defaultAggregationTypeForColumnOf = (
  columnType: Result.Result['type']
): AggregationKind | undefined => {
  switch (columnType.kind) {
    case 'boolean':
      return 'frequency';
    case 'date':
    case 'number':
      return 'sum';
    case 'string':
      return 'frequency';
    default:
      return undefined;
  }
};
