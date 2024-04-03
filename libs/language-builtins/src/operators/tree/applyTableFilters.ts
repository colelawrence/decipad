import pReduce from 'p-reduce';
// eslint-disable-next-line no-restricted-imports
import { Type, Value, materializeOneResult } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import { BuiltinContextUtils } from '../../types';

export const applyTableFilters = async (
  ctx: BuiltinContextUtils,
  table: Value.Table,
  functions: Type
): Promise<Value.Table> =>
  pReduce(
    table.columns,
    async (resultTable, column, index) => {
      const functionColumnIndex = getDefined(
        functions.columnNames,
        'filter functions should have column names'
      ).indexOf(table.columnNames[index]);
      if (functionColumnIndex >= 0) {
        const columnCellType = getDefined(
          functions.columnTypes,
          'roundings should be a table'
        )[functionColumnIndex];

        const filterResult = await ctx.callValue(
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

        if (!Value.isColumnLike(filterResult)) {
          throw new Error('Filter function should return a column');
        }

        const mapColumn = await materializeOneResult(filterResult.getData());
        if (!Array.isArray(mapColumn)) {
          throw new Error('Filter function should return a column');
        }

        return Value.Table.fromNamedColumns(
          await Promise.all(
            resultTable.columns.map(async (column) =>
              Value.FilteredColumn.fromColumnValueAndMap(
                column,
                mapColumn as boolean[]
              )
            )
          ),
          resultTable.columnNames
        );
      }
      return resultTable;
    },
    table
  );
