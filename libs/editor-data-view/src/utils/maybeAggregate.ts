import {
  columnAggregationTypes,
  TotalAggregationExpressions,
} from '@decipad/editor-table';
import { type SerializedType } from '@decipad/remote-computer';
import { TableCellType } from '@decipad/editor-types';
import { AggregationKind } from '../types';

export const maybeAggregate = (
  expressionFilter: string,
  columnType: SerializedType,
  aggregation: AggregationKind | undefined,
  totalAggregationExpressions: TotalAggregationExpressions
): string | Error | undefined => {
  try {
    if (!aggregation) {
      return undefined;
    }
    const aggregations = columnAggregationTypes(columnType as TableCellType);
    const aggregator = aggregations.find((agg) => agg.name === aggregation);
    if (!aggregator) {
      throw new Error(
        `No aggregator named ${aggregation} for column type ${columnType.kind} found`
      );
    }

    return aggregator.expression(expressionFilter, totalAggregationExpressions);
  } catch (err) {
    return err as Error;
  }
};
