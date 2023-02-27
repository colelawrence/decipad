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
      name: 'Count true',
      expression: (colRef) => `countif(${colRef} == true)`,
    },
    {
      name: 'Count false',
      expression: (colRef) => `countif(${colRef} == false)`,
    },
    {
      name: 'Percent true',
      expression: (colRef) =>
        `countif(${colRef} == true) / count(${colRef}) in %`,
    },
    {
      name: 'Percent false',
      expression: (colRef) =>
        `countif(${colRef} == false) / count(${colRef}) in %`,
    },
  ],

  date: [
    {
      name: 'Earliest',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      name: 'Latest',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      name: `Time span`,
      shortName: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
  ],
  number: [
    {
      name: 'Sum',
      expression: (colRef) => `sum(${colRef})`,
    },
    {
      name: 'Maximum value',
      shortName: 'Max',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      name: 'Minimum value',
      shortName: 'Min',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      name: 'Average',
      expression: (colRef) => `average(${colRef})`,
    },
    {
      name: 'Median',
      expression: (colRef) => `median(${colRef})`,
    },
    {
      name: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
    {
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      name: 'Count values',
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
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      name: 'Count values',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
    },
  ],
};

export const columnAggregationTypes = (
  type: TableCellType
): AggregationType[] => {
  const kind = type.kind === 'series' ? 'date' : type.kind;
  return aggregationTypes[kind] ?? [];
};
