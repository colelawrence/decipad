/* eslint-disable import/no-extraneous-dependencies */
import { bench, describe } from 'vitest';
import { tree } from '../tree';
// eslint-disable-next-line no-restricted-imports
import { buildType, Value } from '@decipad/language-types';
import { makeContext } from '../../utils/testUtils';
import { BuiltinContextUtils } from '../../types';
import { from, slice } from '@decipad/generator-utils';
import { N } from '@decipad/number';

const randomWords = (count: number) =>
  Array.from({ length: count }, () => Math.random().toString(36).substring(7));

const randomNumbers = (count: number) =>
  Array.from({ length: count }, () => N(Math.random() * 1000));

const generator = <T>(col: Array<T>) => {
  const colGen = from(col);
  return (start?: number, end?: number) => slice(colGen, start, end);
};

describe('tree', () => {
  const emptyMeta = () => ({ labels: undefined });
  let context: BuiltinContextUtils;

  const rowCount = 500;

  const sourceTableOfStrings = Value.Table.fromMapping({
    Column1: Value.LeanColumn.fromGeneratorAndType(
      generator(randomWords(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column2: Value.LeanColumn.fromGeneratorAndType(
      generator(randomWords(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column3: Value.LeanColumn.fromGeneratorAndType(
      generator(randomWords(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column4: Value.LeanColumn.fromGeneratorAndType(
      generator(randomWords(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
  });

  const sourceTableOfNumbers = Value.Table.fromMapping({
    Column1: Value.LeanColumn.fromGeneratorAndType(
      generator(randomNumbers(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column2: Value.LeanColumn.fromGeneratorAndType(
      generator(randomNumbers(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column3: Value.LeanColumn.fromGeneratorAndType(
      generator(randomNumbers(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
    Column4: Value.LeanColumn.fromGeneratorAndType(
      generator(randomNumbers(rowCount)),
      { kind: 'string' },
      emptyMeta
    ),
  });

  bench(
    `make tree values from ${rowCount} rows table with 4 columns of strings and no options`,
    async () => {
      await tree.fnValuesNoAutomap!(
        [sourceTableOfStrings],
        [
          buildType.table({
            columnNames: sourceTableOfStrings.columnNames,
            columnTypes: sourceTableOfStrings.columns.map(() =>
              buildType.string()
            ),
          }),
        ],
        context,
        []
      );
    },
    {
      throws: true,
      setup: () => {
        context = makeContext();
      },
    }
  );

  bench(
    `make tree values from ${rowCount} rows table with 4 columns of numbers and no options`,
    async () => {
      await tree.fnValuesNoAutomap!(
        [sourceTableOfNumbers],
        [
          buildType.table({
            columnNames: sourceTableOfNumbers.columnNames,
            columnTypes: sourceTableOfNumbers.columns.map(() =>
              buildType.number()
            ),
          }),
        ],
        context,
        []
      );
    },
    {
      throws: true,
      setup: () => {
        context = makeContext();
      },
    }
  );
});
