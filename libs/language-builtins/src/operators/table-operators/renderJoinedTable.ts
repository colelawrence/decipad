/* eslint-disable no-await-in-loop */
import {
  from,
  slice,
  fromGeneratorPromise,
  all,
  zip,
} from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
import {
  Unknown,
  type Result,
  type Value as ValueTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { getDefined, getTrue } from '@decipad/utils';

const validateRenderJoinedTableParams = (
  sourceTables: ValueTypes.Value[],
  sourceTableTypes: Type[]
) => {
  const expectedLength = sourceTables.length;
  if (expectedLength !== sourceTableTypes.length) {
    throw new Error(
      `Mismatch length between sourceTables (${expectedLength}) and sourceTableTypes (${sourceTableTypes.length})`
    );
  }
};

const toGen = (result: Result.OneResult): AsyncGenerator<Result.OneResult> => {
  if (Array.isArray(result)) {
    return from(result);
  }
  if (typeof result === 'function') {
    return result();
  }
  return from([result]);
};

const valueToGen = async (
  value: ValueTypes.Value
): Promise<AsyncGenerator<Result.OneResult>> => {
  return toGen(await value.getData());
};

async function* renderUnknownColumnValues(
  sourceTableTypes: Type[]
): AsyncGenerator<Result.OneResult[]> {
  for (const sourceTablesType of sourceTableTypes) {
    yield getDefined(sourceTablesType.columnNames).map(() => Unknown);
  }
}

const renderJoinedColumns = async (
  sourceTables: Value.TableValue[],
  sourceTableTypes: Type[],
  conditions: Result.OneResult,
  indent = 0
): Promise<AsyncGenerator<Result.OneResult[]>> => {
  const [firstTable, ...restTables] = sourceTables;
  const [firstTableType, ...restTableTypes] = sourceTableTypes;

  const firstTableColumnGens = (await all(valueToGen(firstTable))).map(toGen);
  if (
    getDefined(firstTableType.columnNames).length !==
    firstTableColumnGens.length
  ) {
    // here we are refusing to emit a table that has mismatched columns
    return renderUnknownColumnValues(sourceTableTypes);
  }
  const firstTableRows = zip(...firstTableColumnGens);
  const conditionsGen = await toGen(conditions);

  return (async function* generateJoinedColumns() {
    // eslint-disable-next-line no-constant-condition
    for await (const conditionValue of conditionsGen) {
      const row = await firstTableRows.next();
      if (row.done) {
        break;
      }

      const isFinalCondition = restTables.length === 0;
      getTrue(
        !isFinalCondition || typeof conditionValue === 'boolean',
        'Expected boolean value for non-final condition'
      );
      if (!conditionValue) {
        getTrue(
          isFinalCondition,
          'Unexpected falsy condition value for non-final condition'
        );
        continue;
      }

      if (isFinalCondition) {
        const terminalRow = await all(toGen(row.value));
        if (terminalRow.length !== firstTableColumnGens.length) {
          yield* renderUnknownColumnValues(sourceTableTypes);
          return;
        }
        yield terminalRow;
        continue;
      }

      const restColumnsGen = await renderJoinedColumns(
        restTables,
        restTableTypes,
        conditionValue,
        indent + 1
      );

      for await (const restRow of restColumnsGen) {
        yield [...(await all(toGen(row.value))), ...restRow];
      }
    }
  })();
};
export const joinedTable = async (
  _sourceTables: ValueTypes.Value[],
  sourceTableTypes: Type[],
  targetColumnType: Type,
  condition: ValueTypes.ColumnLikeValue
): Promise<Value.TableValue> => {
  const sourceTables = _sourceTables.map((table) => Value.getTableValue(table));
  validateRenderJoinedTableParams(sourceTables, sourceTableTypes);

  return Value.GeneratorTable.fromNamedColumns(
    (start = 0, end = Infinity) => {
      const genP = condition.getData().then(async (conditionData) => {
        return renderJoinedColumns(
          sourceTables,
          sourceTableTypes,
          conditionData
        );
      });
      return slice(fromGeneratorPromise(genP), start, end);
    },
    sourceTables[0]?.meta?.bind(sourceTables[0]),
    getDefined(targetColumnType.columnNames),
    getDefined(targetColumnType.columnTypes)
  );
};
