// eslint-disable-next-line no-restricted-imports
import { type Type, buildType, serializeType } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { type BuiltinContextUtils } from '../../types';

export const maybeAggregateColumn = async (
  ctx: BuiltinContextUtils,
  fullTable: Value.TableValue,
  columnName: string,
  columnValue: Value.ColumnLikeValue,
  columnType?: Type,
  aggregations?: Type
): Promise<Result.Result | undefined> => {
  if (!aggregations || !columnType) {
    return;
  }

  if (!columnType.cellType) {
    columnType = buildType.column(columnType);
  }

  const columnIndexInFullTable = fullTable.columnNames.findIndex(
    (name) => name === columnName
  );
  if (columnIndexInFullTable < 0) {
    return;
  }
  const fullColumnValue = getDefined(fullTable.columns[columnIndexInFullTable]);

  const aggregationColumnIndex = getDefined(aggregations.columnNames).indexOf(
    columnName
  );
  if (aggregationColumnIndex >= 0) {
    const columnCellType = getDefined(aggregations.columnTypes)[
      aggregationColumnIndex
    ];
    const body = getDefined(
      columnCellType.functionBody,
      'aggregation column should be of type function'
    );
    const argNames = getDefined(
      columnCellType.functionArgNames,
      'function arg names'
    );
    const argCount = getDefined(columnCellType.functionArgNames).length;
    const resultType = await ctx.callFunctor(
      body,
      argNames,
      [columnType, columnType].slice(0, argCount)
    );
    if (resultType.errorCause) {
      throw resultType.errorCause;
    }
    const value = await (
      await ctx.callValue(
        body,
        argNames,
        [columnValue, fullColumnValue].slice(0, argCount)
      )
    ).getData();

    return {
      type: serializeType(resultType),
      value,
      meta: undefined,
    };
  }
  return undefined;
};
