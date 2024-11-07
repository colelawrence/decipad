import type { TableCellType } from '@decipad/editor-types';
import { SerializedType } from '@decipad/language-interfaces';
import { identity, once } from '@decipad/utils';

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
  requiresSum?: boolean;
  // Use null only when the result type cannot be predicted
  getResultType: ((cellType: SerializedType) => SerializedType) | null;
}

const getResultTypeNumber = (): SerializedType => ({
  kind: 'number',
  unit: null,
});

const aggregationTypes: { [type: string]: AggregationType[] } = {
  boolean: [
    {
      id: 'boolean:count-true',
      name: 'Count true',
      expression: (colRef) => `countif(${colRef} == true)`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'boolean:count-false',
      name: 'Count false',
      expression: (colRef) => `countif(${colRef} == false)`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'boolean:percent-true',
      name: 'Percent true',
      expression: (colRef) =>
        `countif(${colRef} == true) / count(${colRef}) in %`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'boolean:percent-false',
      name: 'Percent false',
      expression: (colRef) =>
        `countif(${colRef} == false) / count(${colRef}) in %`,
      getResultType: getResultTypeNumber,
    },
  ],

  date: [
    {
      id: 'date:earliest',
      name: 'Earliest',
      expression: (colRef) => `min(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'date:latest',
      name: 'Latest',
      expression: (colRef) => `max(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'date:span',
      name: `Time span`,
      shortName: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
      getResultType: null,
    },
  ],
  number: [
    {
      id: 'number:sum',
      name: 'Sum',
      expression: (colRef) => `sum(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:max',
      name: 'Maximum value',
      shortName: 'Max',
      expression: (colRef) => `max(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:min',
      name: 'Minimum value',
      shortName: 'Min',
      expression: (colRef) => `min(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:average',
      name: 'Average',
      expression: (colRef) => `average(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:median',
      name: 'Median',
      expression: (colRef) => `median(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:stddev',
      name: 'Standard deviation',
      shortName: 'Stddev',
      expression: (colRef) => `stddev(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:span',
      name: 'Span',
      expression: (colRef) => `max(${colRef}) - min(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:count-unique',
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'number:count-entries',
      name: 'Count values',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'number:percent-of-total',
      name: '% of total',
      shortName: 'Percent',
      expression: (colDef, totalAggregationExpressions) =>
        `sum(${colDef}) / (${totalAggregationExpressions.sum}) in %`,
      requiresSum: true,
      getResultType: getResultTypeNumber,
    },
  ],
  string: [
    {
      id: 'string:count-unique',
      name: 'Count unique values',
      shortName: 'Unique',
      expression: (colRef) => `count(unique(${colRef}))`,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'string:count',
      name: 'Count values',
      shortName: 'Count',
      expression: (colRef) => `count(${colRef})`,
      getResultType: getResultTypeNumber,
    },
  ],
  trend: [
    {
      id: 'number:sum',
      name: 'Sum',
      expression: (colRef) => `sum(${colRef})`,
      getResultType: identity,
    },
    {
      id: 'number:percent-of-total',
      name: '% of total',
      shortName: 'Percent',
      expression: (colDef, totalAggregationExpressions) =>
        `sum(${colDef}) / (${totalAggregationExpressions.sum}) in %`,
      requiresSum: true,
      getResultType: getResultTypeNumber,
    },
    {
      id: 'number:average',
      name: 'Average',
      expression: (colRef) => `avg(${colRef})`,
      getResultType: identity,
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
  typeOrKind: TableCellType | SerializedType | SerializedType['kind']
): AggregationType[] => {
  const kind = (() => {
    if (typeof typeOrKind === 'string') return typeOrKind;
    return typeOrKind.kind === 'series'
      ? typeOrKind.seriesType
      : typeOrKind.kind;
  })();
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
