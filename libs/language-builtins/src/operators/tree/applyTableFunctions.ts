import pSeries from 'p-series';
// eslint-disable-next-line no-restricted-imports
import { Type, Value } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import { BuiltinContextUtils } from '../../types';

export const applyTableFunctions = async (
  ctx: BuiltinContextUtils,
  table: Value.Table,
  functions: Type
) =>
  Value.Table.fromNamedColumns(
    await pSeries(
      table.columns.map((column, index) => async () => {
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
