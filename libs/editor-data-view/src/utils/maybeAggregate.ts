import aggregations from '../aggregators';
import { AggregationKind } from '../types';

export const maybeAggregate = (
  expressionFilter: string,
  columnType: string,
  aggregation: AggregationKind | undefined
): string | Error | undefined => {
  try {
    if (!aggregation) {
      return undefined;
    }
    const aggregator = aggregations[aggregation];
    if (!aggregator) {
      throw new Error(`No aggregator named ${aggregation} found`);
    }

    return aggregator({ expressionFilter, columnType });
  } catch (err) {
    return err as Error;
  }
};
