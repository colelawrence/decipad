import { TableCellType } from '@decipad/editor-types';
import { TotalAggregationExpressions } from '../types';

export interface AggregationType {
  name: string;
  shortName?: string;
  expression: (
    colRef: string,
    totalAggregationExpressions: TotalAggregationExpressions
  ) => string;
}

const aggregationTypes: { [type: string]: AggregationType[] } = {
  boolean: [
    {
      name: 'count true',
      expression: (colRef) => `countif(${colRef} == true)`,
    },
    {
      name: 'count false',
      expression: (colRef) => `countif(${colRef} == false)`,
    },
    {
      name: '% true',
      expression: (colRef) =>
        `countif(${colRef} == true) / count(${colRef}) in %`,
    },
    {
      name: '% false',
      expression: (colRef) =>
        `countif(${colRef} == false) / count(${colRef}) in %`,
    },
  ],

  date: [
    {
      name: 'min',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      name: 'max',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      name: `span`,
      shortName: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
  ],
  number: [
    {
      name: 'sum',
      expression: (colRef) => `sum(${colRef})`,
    },
    {
      name: 'max',
      shortName: 'Max',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      name: 'min',
      shortName: 'Min',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      name: 'avg',
      expression: (colRef) => `average(${colRef})`,
    },
    {
      name: 'median',
      expression: (colRef) => `median(${colRef})`,
    },
    {
      name: 'stddev',
      expression: (colRef) => `stddev(${colRef})`,
    },
    {
      name: 'span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
    {
      name: 'count uniq',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      name: 'count',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
    },
    {
      name: '% of total',
      shortName: 'Percent',
      expression: (colDef, totalAggregationExpressions) =>
        `sum(${colDef}) / (${totalAggregationExpressions.sum}) in %`,
    },
  ],
  string: [
    {
      name: 'count uniq',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      name: 'count',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
    },
  ],
};

export const columnAggregationTypes = (
  type: TableCellType
): AggregationType[] => {
  const kind = type.kind === 'series' ? type.seriesType : type.kind;
  return aggregationTypes[kind] ?? [];
};
