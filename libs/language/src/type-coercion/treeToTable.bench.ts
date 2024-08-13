/* eslint-disable import/no-extraneous-dependencies */
import { bench, describe } from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { buildType, Value } from '@decipad/language-types';
import { from, slice } from '@decipad/generator-utils';
import { treeToTable } from './treeToTable';
import { tree } from 'libs/language-builtins/src/operators/tree';
import { ScopedInferContext, ScopedRealm } from '../scopedRealm';
import { identity } from '@decipad/utils';
import { BuiltinContextUtils } from '../../../language-builtins/src/types';
import { callBuiltinFunctor } from '../../../language-builtins/src/callBuiltinFunctor';
import { callBuiltin } from '../../../language-builtins/src/callBuiltin';

const randomWords = (count: number) =>
  Array.from({ length: count }, () => Math.random().toString(36).substring(7));

const generator = <T>(col: Array<T>) => {
  const colGen = from(col);
  return (start?: number, end?: number) => slice(colGen, start, end);
};

export const makeContext = (
  u?: Partial<BuiltinContextUtils>
): BuiltinContextUtils => ({
  ...u,
  retrieveIndexByName: () => null,
  retrieveVariableTypeByGlobalVariableName: () => null,
  retrieveHumanVariableNameByGlobalVariableName: identity,
  retrieveVariableValueByGlobalVariableName: () => null,
  simpleExpressionEvaluate: async () => Promise.resolve(Value.UnknownValue),
  callBuiltinFunctor,
  callBuiltin,
  callFunctor: async () => {
    throw new Error('Not implemented');
  },
  callValue: async () => {
    throw new Error('Not implemented');
  },
});

describe('treeToTable', async () => {
  const context = makeContext();
  const rowCount = 3000;
  const emptyMeta = () => ({
    labels: undefined,
  });

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

  const treeType = await tree.functorNoAutomap!(
    [
      buildType.table({
        columnNames: sourceTableOfStrings.columnNames,
        columnTypes: sourceTableOfStrings.columns.map(() => buildType.string()),
      }),
    ],
    [],
    context
  );

  const treeValue = await tree.fnValuesNoAutomap!(
    [sourceTableOfStrings],
    [
      buildType.table({
        columnNames: sourceTableOfStrings.columnNames,
        columnTypes: sourceTableOfStrings.columns.map(() => buildType.string()),
      }),
    ],
    context,
    []
  );

  const realm = new ScopedRealm(undefined, new ScopedInferContext({}));

  bench(
    `make table from data view that originated from table with 4 columns and ${rowCount} rows of strings and no options`,
    async () => {
      await treeToTable.value(realm, treeType, treeValue);
    },
    {
      throws: true,
    }
  );
});
