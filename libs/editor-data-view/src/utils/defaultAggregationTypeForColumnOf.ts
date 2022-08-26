import { Result } from '@decipad/computer';
import { AggregationKind } from '../types';

export const defaultAggregationTypeForColumnOf = (
  columnType: Result.Result['type']
): AggregationKind | undefined => {
  switch (columnType.kind) {
    case 'date':
    case 'number':
      return 'sum';

    default:
      return undefined;
  }
};
