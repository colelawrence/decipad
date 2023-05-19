import { getDefined, dequal } from '@decipad/utils';
import produce from 'immer';
import { all, findIndex, map } from '@decipad/generator-utils';
import { sortMap } from '@decipad/column';
import {
  getColumnLike,
  isColumnLike,
  Row,
  Table,
  RuntimeError,
  applyMap,
  applyFilterMap,
  Value,
} from '../../value';
import { createConcatenatedColumn } from '../../lazy/ConcatenatedColumn';
import { buildType as t, Type } from '../../type';
import { getInstanceof, zip } from '../../utils';
import { BuiltinSpec } from '../interfaces';
import { Comparable, compare } from '../../compare';
import { valueToResultValue } from '../../value/valueToResultValue';

export const tableOperators: { [fname: string]: BuiltinSpec } = {
  lookup: {
    argCount: 2,
    functorNoAutomap: async ([table, cond]) => {
      const isBoolColumn = await (
        await (await cond.isColumn()).reduced()
      ).isScalar('boolean');

      const whenTable = async (table: Type) =>
        (await (await table.isTable()).withMinimumColumnCount(1)).mapType(
          async (table) => {
            const columnTypes = getDefined(table.columnTypes);
            const columnNames = getDefined(table.columnNames);

            return (
              await Type.either(isBoolColumn, columnTypes[0].sameAs(cond))
            ).mapType(() => t.row(columnTypes, columnNames, table.indexName));
          }
        );

      if (table.cellType != null) {
        return (await table.isColumn()).reduced();
      } else {
        return whenTable(table);
      }
    },
    fnValuesNoAutomap: async (
      [tableOrColumn, needle],
      // eslint-disable-next-line default-param-last
      [tableType] = [],
      realm
    ): Promise<Value> => {
      const needleVal = await needle.getData();
      const getNeedleIndexAtTable = async (table: Table): Promise<number> => {
        const firstColumn = table.columns[0];

        return findIndex(
          map(firstColumn.values(), valueToResultValue),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (value) => compare(value as Comparable, needleVal as Comparable) === 0
        );
      };

      let rowIndex: number;
      let table: Table;
      if (isColumnLike(tableOrColumn)) {
        table = getInstanceof(
          getDefined(realm).stack.get(
            getDefined(tableType.indexedBy),
            'global'
          ),
          Table
        );
        rowIndex = await getNeedleIndexAtTable(table);
      } else {
        table = getInstanceof(tableOrColumn, Table);

        if (isColumnLike(needle)) {
          rowIndex = await findIndex(
            map(needle.values(), valueToResultValue),
            Boolean
          );
        } else {
          rowIndex = await getNeedleIndexAtTable(table);
        }
      }

      if (rowIndex === -1) {
        throw new RuntimeError(`Could not find a row with the given condition`);
      }

      if (isColumnLike(tableOrColumn)) {
        return getDefined(
          await tableOrColumn.atIndex(rowIndex),
          `could not find element at row ${rowIndex}`
        );
      } else {
        return Row.fromNamedCells(
          await Promise.all(
            table.columns.map(async (column) =>
              getDefined(
                await column.atIndex(rowIndex),
                `could not find element at row ${rowIndex}`
              )
            )
          ),
          table.columnNames
        );
      }
    },
    explanation: 'Lookup first row that matches a condition.',
    formulaGroup: 'Tables',
    syntax: 'lookup(Table, Column Condition)',
    example: 'lookup(Prices, Prices.Discount == 10%)',
  },

  concatenate: {
    argCount: 2,
    functor: async ([tab1, tab2]) =>
      (await Type.combine(tab1.isTable(), tab2.isTable())).mapType(() => {
        if (!dequal(new Set(tab1.columnNames), new Set(tab2.columnNames))) {
          return t.impossible('Incompatible tables');
        }
        if (tab1.columnTypes?.length !== tab2.columnTypes?.length) {
          return t.impossible('Incompatible tables');
        }

        // Check that column types match, even though we don't care about column order
        for (const tab1ColIndex in tab1.columnNames as string[]) {
          if (typeof tab1ColIndex === 'number') {
            const tab1ColName = (tab1.columnNames as string[])[tab1ColIndex];
            const tab2ColIndex = tab2.columnNames?.indexOf(tab1ColName);
            if (tab2ColIndex === undefined) {
              throw new Error('Something went wrong comparing tables.');
            }
            const tab1ColType = (tab1.columnTypes as Type[])[tab1ColIndex];
            const tab2ColType = (tab2.columnTypes as Type[])[tab2ColIndex];

            if (!dequal(tab1ColType, tab2ColType)) {
              return t.impossible('Incompatible tables');
            }
          }
        }

        return tab1;
      }),
    fnValues: async ([tab1, tab2]) => {
      const { columns: cols1, columnNames: names1 } = getInstanceof(
        tab1,
        Table
      );
      const { columns: cols2, columnNames: names2 } = getInstanceof(
        tab2,
        Table
      );

      const tab2Sorted = zip(names2, cols2).sort((a, b) => {
        const aIndex = names1.indexOf(a[0]);
        const bIndex = names1.indexOf(b[0]);
        if (aIndex < bIndex) return -1;
        if (aIndex > bIndex) return 1;
        return 0;
      });

      return Table.fromNamedColumns(
        await Promise.all(
          zip(
            cols1,
            tab2Sorted.map((x) => x[1])
          ).map(async ([c1, c2]) => createConcatenatedColumn(c1, c2))
        ),
        getDefined(names1)
      );
    },
    explanation: 'Joins two tables or columns into one.',
    syntax: 'concatenate(Table1.Col1, Table2.Col2)',
    example: 'concatenate(Day1.Sales, Day2.Sales)',
    formulaGroup: 'Tables or Columns',
  },

  sortby: {
    argCount: 2,
    argCardinalities: [1, 2],
    functor: async ([table, column]) =>
      Type.combine(
        (await column.isColumn()).withAtParentIndex(),
        table.isTable()
      ),
    fnValues: async ([_table, _column]) => {
      const column = getColumnLike(_column);
      const map = await sortMap(column, compare);
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) => applyMap(col, map));
    },
    explanation: 'Reorder table rows based on a column.',
    syntax: 'sortby(Table, Table.Column)',
    formulaGroup: 'Tables',
    example: 'sortby(Prices, Prices.Discount)',
  },

  filter: {
    argCount: 2,
    functorNoAutomap: async ([table, column]) =>
      Type.combine(
        (await (await column.isColumn()).reduced()).isScalar('boolean'),
        table.isTable(),
        produce((table) => {
          table.indexName = null;
        })
      ),
    fnValuesNoAutomap: async ([_table, _column]) => {
      const filterMap = (await all(
        map(getColumnLike(_column).values(), valueToResultValue)
      )) as boolean[];
      const table = getInstanceof(_table, Table);
      return table.mapColumns((col) => applyFilterMap(col, filterMap));
    },
    explanation: 'Filter table rows based on column values.',
    syntax: 'filter(Table, Column Condition)',
    formulaGroup: 'Tables',
    example: 'filter(Prices, Prices.Discount > 20%)',
  },
  grab: {
    aliasFor: 'filter',
  },
};
