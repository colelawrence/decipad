import { getDefined } from '@decipad/utils';
import { dequal } from 'dequal';
import produce from 'immer';
import {
  compare,
  getColumnLike,
  isColumnLike,
  Row,
  Table,
  ValueTransforms,
  RuntimeError,
} from '../../value';
import { OneResult } from '../../interpreter/interpreter-types';
import { ConcatenatedColumn } from '../../lazy/ConcatenatedColumn';
import { build as t, Type } from '../../type';
import { getInstanceof, zip } from '../../utils';
import { BuiltinSpec } from '../interfaces';

export const tableOperators: { [fname: string]: BuiltinSpec } = {
  lookup: {
    argCount: 2,
    functorNoAutomap: ([table, cond]) => {
      const isBoolColumn = cond.isColumn().reduced().isScalar('boolean');

      const whenTable = (table: Type) =>
        table
          .isTable()
          .withMinimumColumnCount(1)
          .mapType((table) => {
            const columnTypes = getDefined(table.columnTypes);
            const columnNames = getDefined(table.columnNames);

            return Type.either(
              isBoolColumn,
              columnTypes[0].sameAs(cond)
            ).mapType(() => t.row(columnTypes, columnNames));
          });

      if (table.cellType != null) {
        return table.isColumn().reduced();
      } else {
        return whenTable(table);
      }
    },
    // eslint-disable-next-line default-param-last
    fnValuesNoAutomap: ([tableOrColumn, needle], [tableType] = [], realm) => {
      const getNeedleIndexAtTable = (table: Table) => {
        const needleVal = needle.getData();
        const firstColumn = table.columns[0];

        return firstColumn.values.findIndex(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (value) => compare(value.getData() as any, needleVal as any) === 0
        );
      };

      if (isColumnLike(tableOrColumn)) {
        const originalTable = getInstanceof(
          getDefined(realm).stack.get(
            getDefined(tableType.indexedBy),
            'global'
          ),
          Table
        );

        const index = getNeedleIndexAtTable(originalTable);
        if (index === -1) {
          throw new RuntimeError(
            `Could not find a row with the given condition`
          );
        }

        return tableOrColumn.atIndex(index);
      }

      const table = getInstanceof(tableOrColumn, Table);

      let rowIndex: number;
      if (isColumnLike(needle)) {
        rowIndex = (needle.getData() as OneResult[]).findIndex(Boolean);
      } else {
        rowIndex = getNeedleIndexAtTable(table);
      }

      if (rowIndex === -1) {
        throw new RuntimeError(`Could not find a row with the given condition`);
      }

      return Row.fromNamedCells(
        table.columns.map((column) => column.atIndex(rowIndex)),
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
          return tab1;
        }
      }),
    fnValues: ([tab1, tab2]) => {
      const { columns: cols1, columnNames } = getInstanceof(tab1, Table);
      const { columns: cols2 } = getInstanceof(tab2, Table);

      return Table.fromNamedColumns(
        zip(cols1, cols2).map(([c1, c2]) => new ConcatenatedColumn(c1, c2)),
        getDefined(columnNames)
      );
    },
  },

  sortby: {
    argCount: 2,
    argCardinalities: [1, 2],
    functor: ([table, column]) =>
      Type.combine(column.isColumn().withAtParentIndex(), table.isTable()),
    fnValues: ([_table, _column]) => {
      const column = getColumnLike(_column);
      const sortMap = ValueTransforms.sortMap(column);
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) => ValueTransforms.applyMap(col, sortMap));
    },
  },

  filter: {
    argCount: 2,
    functorNoAutomap: ([table, column]) =>
      Type.combine(
        column.isColumn().reduced().isScalar('boolean'),
        table.isTable(),
        produce((table) => {
          table.indexName = null;
        })
      ),
    fnValuesNoAutomap: ([_table, _column]) => {
      const filterMap = getColumnLike(_column).getData() as boolean[];
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) =>
        ValueTransforms.applyFilterMap(col, filterMap)
      );
    },
  },
  grab: {
    aliasFor: 'filter',
  },
};
