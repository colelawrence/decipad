import type { TableCellType } from '@decipad/editor-types';
import { once } from '@decipad/utils';

export interface TotalAggregationExpressions {
  sum: string;
}

export interface AggregationType {
  id: string;
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
      id: 'boolean:count-true',
      name: 'Count true',
      expression: (colRef) => `countif(${colRef} == true)`,
    },
    {
      id: 'boolean:count-false',
      name: 'Count false',
      expression: (colRef) => `countif(${colRef} == false)`,
    },
    {
      id: 'boolean:percent-true',
      name: 'Percent true',
      expression: (colRef) =>
        `countif(${colRef} == true) / count(${colRef}) in %`,
    },
    {
      id: 'boolean:percent-false',
      name: 'Percent false',
      expression: (colRef) =>
        `countif(${colRef} == false) / count(${colRef}) in %`,
    },
  ],

  date: [
    {
      id: 'date:earliest',
      name: 'Earliest',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      id: 'date:latest',
      name: 'Latest',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      id: 'date:span',
      name: `Time span`,
      shortName: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
  ],
  number: [
    {
      id: 'number:sum',
      name: 'Sum',
      expression: (colRef) => `sum(${colRef})`,
    },
    {
      id: 'number:max',
      name: 'Maximum value',
      shortName: 'Max',
      expression: (colRef) => `max(${colRef})`,
    },
    {
      id: 'number:min',
      name: 'Minimum value',
      shortName: 'Min',
      expression: (colRef) => `min(${colRef})`,
    },
    {
      id: 'number:average',
      name: 'Average',
      expression: (colRef) => `average(${colRef})`,
    },
    {
      id: 'number:median',
      name: 'Median',
      expression: (colRef) => `median(${colRef})`,
    },
    {
      id: 'number:stddev',
      name: 'Standard deviation',
      shortName: 'Stddev',
      expression: (colRef) => `stddev(${colRef})`,
    },
    {
      id: 'number:span',
      name: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
    },
    {
      id: 'number:count-unique',
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      id: 'number:count-entries',
      name: 'Count values',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
    },
    {
      id: 'number:percent-of-total',
      name: '% of total',
      shortName: 'Percent',
      expression: (colDef, totalAggregationExpressions) =>
        `sum(${colDef}) / (${totalAggregationExpressions.sum}) in %`,
    },
  ],
  string: [
    {
      id: 'string:count-unique',
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
    },
    {
      id: 'string:count',
      name: 'Count values',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
    },
  ],
  trend: [
    {
      id: 'number:sum',
      name: 'Sum',
      expression: (colRef) => `sum(${colRef})`,
    },
    {
      id: 'number:percent-of-total',
      name: '% of total',
      shortName: 'Percent',
      expression: (colDef, totalAggregationExpressions) =>
        `sum(${colDef}) / (${totalAggregationExpressions.sum}) in %`,
    },
    {
      id: 'number:average',
      name: 'Average',
      expression: (colRef) => `avg(${colRef})`,
    },
  ],
};

const typeById = once(() => {
  const types: { [id: string]: AggregationType } = {};
  for (const type of Object.values(aggregationTypes).flat()) {
    types[type.id] = type;
  }
  return types;
});

export const availableAggregations = (
  type: TableCellType
): AggregationType[] => {
  const kind = type.kind === 'series' ? type.seriesType : type.kind;
  return aggregationTypes[kind] ?? [];
};

export const hasAggregationId = (id: string): boolean =>
  Object.hasOwn(typeById(), id);

export const getAggregationById = (id: string): AggregationType | undefined => {
  return typeById()[id];
};

export const getAggregationShortName = (id?: string): string | undefined => {
  if (id == null) {
    return undefined;
  }
  const agg = getAggregationById(id);
  if (agg) {
    return agg.shortName ?? agg.name;
  }
  return undefined;
};
