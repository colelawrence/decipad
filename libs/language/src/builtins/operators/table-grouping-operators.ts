import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { BuiltinSpec } from '../interfaces';
import { Type } from '../../type';
import { Column, Table } from '../../interpreter/Value';
import { getInstanceof } from '../../utils';

export const tableGroupingOperators: { [fname: string]: BuiltinSpec } = {
  splitby: {
    argCount: 2,
    functorNoAutomap: ([table, column]) =>
      Type.combine(
        table.isTableOrRow(),
        column.isColumn().withColumnSize(table.tableLength).withAtParentIndex(),
        table.withMinimumColumnCount(1),
        (table) =>
          produce(table, (t) => {
            const columnIndex = getDefined(column.atParentIndex);
            const columnName = table.columnNames?.[columnIndex] ?? 'index';
            t.tableLength = 'unknown';
            t.columnNames = [columnName, 'values'];
            const tableWithout = produce(table, (table) => {
              table.columnTypes =
                table.columnTypes?.filter(
                  (_ct, index) => index !== columnIndex
                ) ?? null;
              table.columnNames =
                table.columnNames?.filter(
                  (_, index) => index !== columnIndex
                ) ?? null;
            });

            const newIndexColumn = produce(column, (column) => {
              column.columnSize = 'unknown';
            });
            t.columnTypes = [newIndexColumn, tableWithout];
          })
      ),
    fnValuesNoAutomap: ([_table, _byColumn]) => {
      const table = getInstanceof(_table, Table);
      const byColumn = getInstanceof(_byColumn, Column);

      const sortMap = byColumn.sortMap();
      const sortedColumn = byColumn.applyMap(sortMap);
      const slices = sortedColumn.contiguousSlices();
      const slicedTables = slices.map(([sliceStartIndex, sliceEndIndex]) =>
        table
          .filterColumns((_colName, col) => col !== byColumn)
          .mapColumns((col) =>
            col.applyMap(sortMap).slice(sliceStartIndex, sliceEndIndex)
          )
      );
      const uniqueIndexes = slices.map(([uniqueIndex]) => uniqueIndex);
      const uniqueSortedColumn = sortedColumn.applyMap(uniqueIndexes);
      const columnsForNewTable = [
        uniqueSortedColumn,
        Column.fromValues(slicedTables),
      ];
      return Column.fromValues(columnsForNewTable);
    },
  },
};
