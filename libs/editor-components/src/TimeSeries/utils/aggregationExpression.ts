import { zip } from 'lodash';
import { textify } from '@decipad/parse';
import { getDefined } from '@decipad/utils';
import {
  type SerializedType,
  type Result,
  type Value,
} from '@decipad/remote-computer';
import { getAggregationById } from '@decipad/language-aggregations';
import {
  type TimeSeriesFilter,
  type TableCellType,
} from '@decipad/editor-types';
import { getFilterExpression } from '@decipad/language-filters';

const fixColumnName = (columnName?: string): string => {
  if (!columnName) {
    return 'Unknown';
  }
  const match = columnName.match(/.*(_[0-9]+)$/);
  if (match && match[1]) {
    return columnName.slice(0, columnName.indexOf(match[1]));
  }
  return columnName;
};

const isComplexExpression = (expr: string): boolean =>
  expr.includes('.') || expr.includes('(');
const maybeEncloseExpression = (expr: string): string =>
  isComplexExpression(expr) ? `(${expr})` : expr;

const maybeAggregateExpression = (
  expr: string,
  aggregationId: string | undefined
): string => {
  if (!aggregationId) {
    return expr;
  }
  const aggregation = getAggregationById(aggregationId);
  if (!aggregation) {
    return expr;
  }
  return aggregation.expression(expr, {
    sum: `sum(${expr})`,
  });
};

const maybeFilterExpression = (
  tableName: string,
  columnName: string | undefined,
  filter: TimeSeriesFilter | undefined,
  columnType: TableCellType
): string => {
  if (!filter || !columnName) {
    return tableName;
  }

  const filterExpression = getFilterExpression(
    filter.operation,
    `${tableName}.${columnName}`,
    filter.valueOrValues,
    columnType
  );

  if (!filterExpression) {
    return tableName;
  }

  return `filter(${tableName}, ${filterExpression})`;
};

export const aggregationExpression = (
  tableName: string,
  columns: Array<Value.TreeColumn>,
  columnTypes: Array<SerializedType>,
  valuePath: Array<Result.OneResult>,
  filters: Array<TimeSeriesFilter | undefined>,
  aggregationName: string | undefined,
  rounding: string | undefined,
  filter: TimeSeriesFilter | undefined
): string | undefined => {
  // console.log('aggregationExpression', {
  //   tableName,
  //   columns,
  //   columnTypes,
  //   valuePath,
  //   aggregationName,
  // });
  if (!aggregationName) {
    return undefined;
  }
  const fixedColumnNames = columns.map((col) => fixColumnName(col.name));

  const filteredTableExpression = zip(fixedColumnNames, [
    ...filters,
    filter,
  ]).reduce((expr, [columnName, columnFilter], iter) => {
    return maybeFilterExpression(
      expr,
      columnName,
      columnFilter,
      columnTypes[iter] as TableCellType
    );
  }, tableName);

  // filter
  const zipped = zip(fixedColumnNames, columnTypes, valuePath);
  const tableExpression = zipped.reduce(
    (expr, [columnName, columnType, value], iter) => {
      const fixedColumnName = fixColumnName(columnName);
      if (value != null) {
        const columnExpression = `${
          iter === 0 ? expr : `(${expr})`
        }.${fixedColumnName}`;

        return `filter(${expr}, ${columnExpression} == ${textify(
          value,
          getDefined(columnType)
        )})`;
      }
      return expr;
    },
    filteredTableExpression
  );

  const columnName = fixedColumnNames[fixedColumnNames.length - 1];
  const columnExpression = `${maybeEncloseExpression(
    tableExpression
  )}.${columnName}`;
  const roundedColumnExpression = rounding
    ? `round(${columnExpression}, ${rounding})`
    : columnExpression;

  return maybeAggregateExpression(roundedColumnExpression, aggregationName);
};
