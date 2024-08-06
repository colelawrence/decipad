import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import {
  Type,
  buildType as t,
  Value,
  RuntimeError,
  getResultGenerator,
  compare,
  Comparable,
} from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import type { FullBuiltinSpec } from '../../types';
import { getColumnLike } from 'libs/language-types/src/Value';

export const lookupFunctorNoAutomap: FullBuiltinSpec['functorNoAutomap'] =
  async ([tableOrColumn, cond, defaultValue]) => {
    const isBoolColumn = await (
      await (await cond.isColumn()).reduced()
    ).isScalar('boolean');

    let resultType: Type;
    if (tableOrColumn.cellType != null) {
      resultType = await (await tableOrColumn.isColumn()).reduced();
    } else {
      resultType = await (
        await (await tableOrColumn.isTable()).withMinimumColumnCount(1)
      ).mapType(async (table) => {
        const columnTypes = getDefined(table.columnTypes);
        const columnNames = getDefined(table.columnNames);

        return (
          await Type.either(isBoolColumn, columnTypes[0].sameAs(cond))
        ).mapType(() => t.row(columnTypes, columnNames, table.indexName));
      });
    }

    if (defaultValue != null && !resultType.errorCause) {
      return resultType.sameAs(defaultValue);
    }

    return resultType;
  };

export const lookupValuesNoAutomap: FullBuiltinSpec['fnValuesNoAutomap'] =
  async (
    [tableOrColumn, needle, defaultValue],
    // eslint-disable-next-line default-param-last
    [, needleType] = []
  ): Promise<ValueTypes.Value> => {
    let rowIndex = -1;
    if (needleType.cellType != null) {
      // needle is column
      const needleValue = getColumnLike(needle);
      let currentIndex = -1;
      for await (const value of getResultGenerator(
        await needleValue.getData()
      )()) {
        currentIndex += 1;
        if (value) {
          rowIndex = currentIndex;
          break;
        }
      }
    } else {
      // needle is scalar
      const needleValue = (await needle.getData()) as Comparable;
      const targetColumn = Value.isColumnLike(tableOrColumn)
        ? tableOrColumn
        : Value.getTableValue(tableOrColumn).columns[0];

      let currentIndex = -1;
      for await (const value of getResultGenerator(
        await targetColumn.getData()
      )()) {
        currentIndex += 1;
        if ((await compare(value as Comparable, needleValue)) === 0) {
          rowIndex = currentIndex;
          break;
        }
      }
    }

    if (rowIndex === -1) {
      if (defaultValue != null) {
        return defaultValue;
      }
      throw new RuntimeError(`Could not find a row with the given condition`);
    }

    if (Value.isColumnLike(tableOrColumn)) {
      return getDefined(
        await tableOrColumn.atIndex(rowIndex),
        `could not find element at row ${rowIndex}`
      );
    } else {
      const table = Value.getTableValue(tableOrColumn);
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
