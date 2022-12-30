import { columnAggregationTypes } from '@decipad/editor-table';
import { SerializedType } from '@decipad/computer';
import { TableCellType } from '@decipad/editor-types';
import { AggregationKind } from '../types';

export const maybeAggregate = (
  expressionFilter: string,
  columnType: SerializedType,
  aggregation: AggregationKind | undefined
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

    return aggregator.expression(expressionFilter);
  } catch (err) {
    return err as Error;
  }
};
