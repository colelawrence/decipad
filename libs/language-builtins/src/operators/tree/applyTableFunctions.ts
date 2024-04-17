// eslint-disable-next-line no-restricted-imports
import { type Type, Value } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import { type BuiltinContextUtils } from '../../types';

export const applyTableFunctions = async (
  ctx: BuiltinContextUtils,
  table: Value.Table,
  functions: Type
) =>
  Value.Table.fromNamedColumns(
    await Promise.all(
      table.columns.map(async (column, index) => {
        const functionColumnIndex = getDefined(
          functions.columnNames,
          'functions should be a table'
        ).indexOf(table.columnNames[index]);
        if (functionColumnIndex >= 0) {
          const columnCellType = getDefined(
            functions.columnTypes,
            'functions should be a table'
          )[functionColumnIndex];

          return ctx.callValue(
            getDefined(
              columnCellType.functionBody,
              'function cell type should be a function'
            ),
            getDefined(
              columnCellType.functionArgNames,
              'function cell type should be a function'
            ),
            [column]
          );
        }
        return column;
      })
    ),
    table.columnNames
  );
