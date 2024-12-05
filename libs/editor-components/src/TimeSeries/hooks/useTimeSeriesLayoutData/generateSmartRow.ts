import {
  Unknown,
  type Result,
  type SerializedType,
  type Value,
} from '@decipad/remote-computer';
import { type TimeSeriesFilter } from '@decipad/editor-types';
import { type DataGroup } from '../../types';
import { aggregationExpression as createAggregationExpression } from '../../utils/aggregationExpression';

export interface GenerateSmartRowProps {
  aggregation: Result.Result | undefined;
  tableName: string;
  columnTypes: SerializedType[];
  columns: Value.TreeColumn[];
  previousColumns: Value.TreeColumn[];
  previousColumnTypes: SerializedType[];
  previousFilters: Array<TimeSeriesFilter | undefined>;
  valuePath: Array<Result.OneResult>;
  aggregations: Array<string | undefined>;
  roundings: Array<string | undefined>;
  filters: Array<TimeSeriesFilter | undefined>;
  global?: boolean;
  indent?: number;
}

export type GenerateSmartRow = (props: GenerateSmartRowProps) => DataGroup;

export const generateSmartRow: GenerateSmartRow = ({
  aggregation,
  tableName,
  columnTypes,
  columns,
  previousColumns,
  previousColumnTypes,
  previousFilters,
  valuePath,
  aggregations,
  roundings,
  filters,
  global = false,
  indent = 0,
}): DataGroup => {
  const [firstColumn, ...rest] = columns;

  const newPreviousColumns = [...previousColumns, firstColumn];
  const newPreviousColumnTypes = [...previousColumnTypes, columnTypes[0]];
  const newPreviousFilters = [...previousFilters, filters[0]];

  const children =
    rest.length > 0
      ? [
          generateSmartRow({
            aggregation: rest[0].aggregation,
            tableName,
            columnTypes: columnTypes.slice(1),
            columns: rest,
            previousColumns: newPreviousColumns,
            previousColumnTypes: newPreviousColumnTypes,
            previousFilters: newPreviousFilters,
            valuePath,
            aggregations: aggregations.slice(1),
            roundings: roundings.slice(1),
            filters: filters.slice(1),
            global,
            indent: indent + 1,
          }),
        ]
      : [];

  const aggregationExpression = createAggregationExpression(
    tableName,
    newPreviousColumns,
    newPreviousColumnTypes,
    valuePath,
    previousFilters,
    aggregations[0],
    roundings[0],
    filters[0]
  );

  return {
    elementType: 'smartrow',
    children,
    global,
    type: aggregation?.type,
    value: aggregation?.value ?? Unknown,
    aggregationExpression,
  };
};
