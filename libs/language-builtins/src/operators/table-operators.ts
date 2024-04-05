import { getDefined, produce, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Comparable } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Type,
  Value,
  buildType as t,
  valueToResultValue,
  compare,
  RuntimeError,
} from '@decipad/language-types';
import { all, findIndex, map } from '@decipad/generator-utils';
import { sortMap } from '@decipad/column';
import type { BuiltinSpec } from '../interfaces';
import { applyFilterMap, applyMap } from '../utils/valueTransforms';
import { tree } from './tree';

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
      ctx
    ): Promise<Value.Value> => {
      const needleVal = await needle.getData();
      const getNeedleIndexAtTable = async (
        table: Value.Table
      ): Promise<number> => {
        const firstColumn = table.columns[0];

        return findIndex(
          map(firstColumn.values(), valueToResultValue),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (value) => compare(value as Comparable, needleVal as Comparable) === 0
        );
      };

      let rowIndex: number;
      let table: Value.Table;
      if (Value.isColumnLike(tableOrColumn)) {
        const tableName = getDefined(tableType.indexedBy);
        [, table] = Value.sortValue(
          tableType,
          getInstanceof(
            ctx.retrieveVariableValueByGlobalVariableName(tableName),
            Value.Table
          )
        );
        rowIndex = await getNeedleIndexAtTable(table);
      } else {
        table = getInstanceof(tableOrColumn, Value.Table);

        if (Value.isColumnLike(needle)) {
          rowIndex = await findIndex(
            map(needle.values(), valueToResultValue),
            Boolean
          );
        } else {
          rowIndex = await getNeedleIndexAtTable(
            Value.sortValue(tableType, table)[1]
          );
        }
      }

      if (rowIndex === -1) {
        throw new RuntimeError(`Could not find a row with the given condition`);
      }

      if (Value.isColumnLike(tableOrColumn)) {
        return getDefined(
          await tableOrColumn.atIndex(rowIndex),
          `could not find element at row ${rowIndex}`
        );
      } else {
        return Value.Row.fromNamedCells(
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

  sortby: {
    argCount: 2,
    argCardinalities: [1, 2],
    functor: async ([table, column]) =>
      Type.combine(
        (await column.isColumn()).withAtParentIndex(),
        table.isTable()
      ),
    fnValues: async ([_table, _column]) => {
      const column = Value.getColumnLike(_column);
      const map = await sortMap(column, compare);
      const table = getInstanceof(_table, Value.Table);
      return table.mapColumns((col) => applyMap(col, map));
    },
    explanation: 'Reorder table rows based on a column.',
    syntax: 'sortby(Table, Table.Column)',
    formulaGroup: 'Tables',
    example: 'sortby(Prices, Prices.Discount)',
  },

  filter: {
    argCount: 2,
    functorNoAutomap: async ([subject, column]) =>
      Type.either(
        Type.combine(
          (await (await column.isColumn()).reduced()).isScalar('boolean'),
          subject.isTable(),
          produce((table) => {
            table.indexName = null;
          })
        ),
        Type.combine(
          (await (await column.isColumn()).reduced()).isScalar('boolean'),
          subject.isColumn()
        )
      ),
    fnValuesNoAutomap: async ([subject, _column]) => {
      const filterMap = (await all(
        map(Value.getColumnLike(_column).values(), valueToResultValue)
      )) as boolean[];
      if (subject instanceof Value.Column) {
        return applyFilterMap(subject, filterMap);
      }
      const table = getInstanceof(subject, Value.Table);
      return table.mapColumns((col) => applyFilterMap(col, filterMap));
    },
    explanation: 'Filter table rows based on column values.',
    syntax: 'filter(Table, Column Condition)',
    formulaGroup: 'Tables',
    example: 'filter(Prices, Prices.Discount > 20%)',
  },
  grab: {
    aliasFor: 'filter',
    explanation: 'Filter table rows based on column values.',
    syntax: 'grab(Table, Column Condition)',
    formulaGroup: 'Tables',
    example: 'grab(Prices, Prices.Discount > 20%)',
  },
  tree,
};
