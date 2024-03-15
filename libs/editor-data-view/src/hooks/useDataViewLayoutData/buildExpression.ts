import { DataViewFilter } from '@decipad/editor-types';
import { Column } from '../../types';
import { SerializedType } from '@decipad/remote-computer';

const operatorMap: Record<string, string> = {
  eq: '==',
  ne: '!=',
  lt: '<',
  gt: '>',
};

/**
 * Generates expression to filter and apply roundings to a column
 */
export const buildExpression = (
  tableName: string,
  columnName: string,
  filters: Array<DataViewFilter | undefined>,
  columns: Column[],
  rounding?: string
): string => {
  let expression = `${tableName}.${columnName}`;

  const columnFilters: string[] = [];
  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];
    const column = columns[i];
    if (!filter) {
      continue;
    }

    if (filter.operation === 'in') {
      columnFilters.push(
        `(${filter.valueOrValues
          .map(
            (value) =>
              `${tableName}.${column.name} == ${formatValue(
                value,
                column.type
              )}`
          )
          .join(' or ')})`
      );
    } else if (
      (filter.operation === 'eq' || filter.operation === 'ne') &&
      filter.valueOrValues != null
    ) {
      columnFilters.push(
        `${tableName}.${column.name} ${
          operatorMap[filter.operation]
        } ${formatValue(filter.valueOrValues, column.type)}`
      );
    } else if (
      filter?.operation === 'bt' &&
      filter.valueOrValues != null &&
      Array.isArray(filter.valueOrValues) &&
      filter.valueOrValues.length === 2
    ) {
      const [from, to] = filter.valueOrValues;
      if (from) {
        columnFilters.push(
          `${tableName}.${column.name} >= ${formatValue(from, column.type)}`
        );
      }

      if (to) {
        columnFilters.push(
          `${tableName}.${column.name} <= ${formatValue(to, column.type)}`
        );
      }
    }
  }

  if (columnFilters.length > 0) {
    expression = `filter(${expression}, ${columnFilters.join(' and ')})`;
  }

  if (rounding) {
    return `round(${expression}, ${rounding})`;
  }

  return expression;
};

const formatValue = (
  value: string | boolean | number,
  type: SerializedType
) => {
  if (type.kind === 'string') {
    return `"${value}"`;
  }

  if (type.kind === 'date') {
    return `date(${value})`;
  }

  return value;
};
