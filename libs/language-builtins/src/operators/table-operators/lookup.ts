import { getDefined, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Comparable } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Type,
  buildType as t,
  Value,
  valueToResultValue,
  compare,
  RuntimeError,
} from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import type { FullBuiltinSpec } from '../../interfaces';
import { findIndex, map } from '@decipad/generator-utils';

export const lookupFunctorNoAutomap: FullBuiltinSpec['functorNoAutomap'] =
  async ([table, cond]) => {
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
  };

export const lookupValuesNoAutomap: FullBuiltinSpec['fnValuesNoAutomap'] =
  async (
    [tableOrColumn, needle],
    // eslint-disable-next-line default-param-last
    [tableType] = [],
    ctx
  ): Promise<ValueTypes.Value> => {
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
  };
