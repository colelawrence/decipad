import { zip } from 'lodash';
import {
  type SerializedType,
  type Result,
  type Value,
  identifierRegExpGlobal,
} from '@decipad/remote-computer';
import { labelize } from '@decipad/parse';
import { getDefined } from '@decipad/utils';

// extracts the fixColumnName from the columnName e.g. 'year_1' -> 'year'
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

export const aggregationVariableName = (
  columns: Array<Value.TreeColumn>,
  columnTypes: Array<SerializedType>,
  valuePath: Array<Result.OneResult>
): string | undefined => {
  try {
    const fixedColumnNames = columns.filter(Boolean).map((col) => {
      return fixColumnName(col.name);
    });

    const zipped = zip(fixedColumnNames, columnTypes, valuePath);
    const variableName = zipped.reduce(
      (expr, [columnName, columnType, value], iter) => {
        const fixedColumnName = fixColumnName(columnName);
        if (value != null && iter < fixedColumnNames.length - 1) {
          return expr === ''
            ? `${fixedColumnName}${labelize(value, getDefined(columnType))}`
            : `${expr}${fixedColumnName}${labelize(
                value,
                getDefined(columnType)
              )}`;
        } else if (value == null && iter === fixedColumnNames.length - 1) {
          return expr === '' ? fixedColumnName : `${fixedColumnName}${expr}`;
        }
        return expr;
      },
      ''
    ); // started with tableName but was too long
    return (
      variableName.match(new RegExp(identifierRegExpGlobal))?.join('') || ''
    );
  } catch (e) {
    console.error(e);
    return undefined;
  }
};
