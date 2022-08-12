import { Result } from '@decipad/computer';
import aggregations from '../aggregators';
import { AggregationKind, SmartRowElement } from '../types';

export const maybeAggregate = (
  input: SmartRowElement['column'],
  aggregation: AggregationKind | undefined
): Result.Result | Error | undefined => {
  try {
    if (!aggregation) {
      return undefined;
    }
    const aggregator = aggregations[aggregation];
    if (!aggregator) {
      throw new Error(`No aggregator named ${aggregation} found`);
    }
    return aggregator(input);
  } catch (err) {
    return err as Error;
  }
};
