import { getDefined } from '@decipad/utils';
import produce from 'immer';
import { dequal } from 'dequal';
import { getInstanceof, zip } from '../../utils';
import { Column, Table, Row } from '../../interpreter/Value';
import { RuntimeError } from '../../interpreter/RuntimeError';
import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';

export const tableOperators: { [fname: string]: BuiltinSpec } = {
  lookup: {
    argCount: 2,
    functorNoAutomap: ([table, cond]) => {
      return table
        .isTable()
        .withMinimumColumnCount(1)
        .mapType((table) => {
          const columnTypes = getDefined(table.columnTypes);
          const columnNames = getDefined(table.columnNames);

          return Type.either(
            cond.isColumn().reduced().isScalar('boolean'),
            columnTypes[0].sameAs(cond)
          ).mapType(() => t.row(columnTypes, columnNames));
        });
    },
    fnValuesNoAutomap: ([_table, needle]) => {
      const table = getInstanceof(_table, Table);
      let rowIndex: number;
      if (needle instanceof Column) {
        rowIndex = needle.getData().findIndex(Boolean);
      } else {
        const needleVal = needle.getData();
        const firstColumn = table.columns[0];

        rowIndex = firstColumn.values.findIndex(
          (value) => value.getData() === needleVal
        );
      }

      if (rowIndex === -1) {
        throw new RuntimeError(`Could not find a row with the given condition`);
      }

      return Row.fromNamedCells(
        table.columns.map((column) => column.values[rowIndex]),
        table.columnNames
      );
    },
  },
  concatenate: {
    argCount: 2,
    functor: ([tab1, tab2]) =>
      Type.combine(tab1.isTable(), tab2.isTable()).mapType(() => {
        if (
          !dequal(tab1.columnNames, tab2.columnNames) ||
          !dequal(tab1.columnTypes, tab2.columnTypes)
        ) {
          return t.impossible('Incompatible tables');
        } else {
          return produce(tab1, (tab1) => {
            if (
              typeof tab1.tableLength === 'number' &&
              typeof tab2.tableLength === 'number'
            ) {
              tab1.tableLength += tab2.tableLength;
            } else {
              tab1.tableLength = 'unknown';
            }
          });
        }
      }),
    fnValues: ([tab1, tab2]) => {
      const { columns: columns1, columnNames } = getInstanceof(tab1, Table);
      const { columns: columns2 } = getInstanceof(tab2, Table);

      return Table.fromNamedColumns(
        zip(columns1, columns2).map(([c1, c2]) =>
          Column.fromValues([...c1.values, ...c2.values])
        ),
        getDefined(columnNames)
      );
    },
  },

  sortby: {
    argCount: 2,
    functorNoAutomap: ([table, column]) =>
      Type.combine(column.isColumn().withAtParentIndex(), table.isTable()),
    fnValuesNoAutomap: ([_table, _column]) => {
      const column = getInstanceof(_column, Column);
      const sortMap = column.sortMap();
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) => col.applyMap(sortMap));
    },
  },

  filter: {
    argCount: 2,
    functorNoAutomap: ([table, column]) =>
      Type.combine(
        column.isColumn().reduced().isScalar('boolean'),
        table.isTable(),
        (table) =>
          produce(table, (table) => {
            table.tableLength = 'unknown';
          })
      ),
    fnValuesNoAutomap: ([_table, _column]) => {
      const filterMap = getInstanceof(_column, Column).getData() as boolean[];
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) => col.applyFilterMap(filterMap));
    },
  },
};
