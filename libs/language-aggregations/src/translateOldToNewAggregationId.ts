import { CellValueType } from '@decipad/editor-types';

type AggregationTypeMap = { [type: string]: { [key: string]: string } };

const aggregationTypes: AggregationTypeMap = {
  boolean: {
    'Count true': 'boolean:count-true',
    'Count false': 'boolean:count-false',
    'Percent true': 'boolean:percent-true',
    'Percent false': 'boolean:percent-false',
  },
  date: {
    Earliest: 'date:earliest',
    Latest: 'date:latest',
    'Time span': 'date:span',
  },
  number: {
    Sum: 'number:sum',
    'Maximum value': 'number:max',
    'Minimum value': 'number:min',
    Average: 'number:average',
    Median: 'number:median',
    'Standard deviation': 'number:stddev',
    Span: 'number:span',
    'Count unique values': 'number:count-unique',
    'Count values': 'number:count-entries',
    '% of total': 'number:percent-of-total',
  },
  string: {
    'Count unique values': 'string:count-unique',
    'Count values': 'string:count',
  },
};

export const translateOldToNewAggregationId = (
  oldAggregationId: string,
  type: CellValueType
): string | undefined => {
  const aggregationMap = aggregationTypes[type.kind];
  if (!aggregationMap) {
    return undefined;
  }
  return aggregationMap[oldAggregationId];
};
