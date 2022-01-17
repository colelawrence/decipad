import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { BuiltinSpec } from '../interfaces';
import { Type, build as t, InferError } from '../../type';
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
        (table) => {
          if (column.indexedBy !== table.indexName) {
            return t.impossible(
              InferError.expectedTableAndAssociatedColumn(table, column)
            );
          }

          const columnIndex = getDefined(column.atParentIndex);
          const columnName = getDefined(table.columnNames?.[columnIndex]);

          const tableWithout = produce(table, (table) => {
            table.columnTypes?.splice(columnIndex, 1);
            table.columnNames?.splice(columnIndex, 1);
          });

          return t.table({
            length: 'unknown',
            columnNames: [columnName, 'Values'],
            columnTypes: [getDefined(column.cellType), tableWithout],
          });
        }
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
