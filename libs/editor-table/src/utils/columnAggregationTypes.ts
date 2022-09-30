import { TableColumn } from '../hooks';

export interface AggregationType {
  name: string;
  shortName?: string;
  expression: (colRef: string) => string;
}

export const columnAggregationTypes = (
  column: TableColumn
): AggregationType[] => {
  const { cellType } = column;
  switch (cellType?.kind) {
    case 'boolean':
      return [
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
      ];

    case 'date':
      return [
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
      ];
    case 'number':
      return [
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
      ];
    case 'string':
      return [
        {
          name: 'Count unique values',
          shortName: 'Unique',
          expression: (colRef) => `count(unique(${colRef}))`,
        },
      ];
    case 'series': {
      return columnAggregationTypes({
        ...column,
        cellType: { ...cellType, kind: 'date', date: 'day' },
      });
    }
    default:
      return [];
  }
};
