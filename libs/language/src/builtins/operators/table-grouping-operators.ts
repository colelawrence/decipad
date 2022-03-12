import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { BuiltinSpec } from '../interfaces';
import { Type, build as t, InferError } from '../../type';
import {
  Column,
  getColumnLike,
  Table,
  ValueTransforms,
} from '../../interpreter/Value';
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

          const [columnIndex, columnName] = columnIndexAndName(table, column);

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
    fnValuesNoAutomap: ([_table, _byColumn], [tableType, colType] = []) => {
      const table = getInstanceof(_table, Table);
      const byColumn = getColumnLike(_byColumn);

      const sortMap = ValueTransforms.sortMap(byColumn);
      const sortedColumn = ValueTransforms.applyMap(byColumn, sortMap);
      const slices = ValueTransforms.contiguousSlices(sortedColumn);
      const slicedTables = slices.map(([sliceStartIndex, sliceEndIndex]) =>
        table
          .filterColumns((_colName, col) => col !== byColumn)
          .mapColumns((col) => {
            const sorted = ValueTransforms.applyMap(col, sortMap);
            return ValueTransforms.slice(
              sorted,
              sliceStartIndex,
              sliceEndIndex
            );
          })
      );
      const uniqueIndexes = slices.map(([uniqueIndex]) => uniqueIndex);
      const uniqueSortedColumn = ValueTransforms.applyMap(
        sortedColumn,
        uniqueIndexes
      );
      const columnsForNewTable = [
        uniqueSortedColumn,
        Column.fromValues(slicedTables, []),
      ];

      const [, columnName] = columnIndexAndName(tableType, colType);
      return Table.fromNamedColumns(columnsForNewTable, [columnName, 'Values']);
    },
  },
};

const columnIndexAndName = (tableType: Type, colType: Type) => {
  const columnIndex = getDefined(colType.atParentIndex);
  const columnName = getDefined(tableType.columnNames?.[columnIndex]);

  return [columnIndex, columnName] as const;
};
