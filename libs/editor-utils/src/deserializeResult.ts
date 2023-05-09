import {
  SerializedTypes,
  Unit,
  Result,
  Interpreter,
  isColumn,
} from '@decipad/computer';
import { fromNumber } from '@decipad/number';
import { getDefined } from '@decipad/utils';

const fixUnit = (unit: Unit[] | undefined | null): Unit[] | null =>
  unit?.map(
    (u) =>
      ({
        ...u,
        exp: fromNumber(u.exp),
        multiplier: fromNumber(u.multiplier),
        aliasFor: u.aliasFor && fixUnit(u.aliasFor),
      } as Unit)
  ) ?? null;

export const deserializeResult = <T extends Result.Result>(
  result: T | undefined
): T | undefined => {
  if (result == null) {
    return undefined;
  }
  const { type, value } = result;
  let replaceValue: typeof value | undefined;
  let replaceType: typeof type | undefined;
  switch (type.kind) {
    case 'number':
      replaceValue = fromNumber(value);
      replaceType = {
        ...type,
        unit: fixUnit(type.unit),
      } as typeof type;
      break;
    case 'date':
      if (
        value != null &&
        typeof value !== 'symbol' &&
        typeof value !== 'object' &&
        typeof value !== 'symbol'
      ) {
        replaceValue = BigInt(value as string | number | bigint | boolean);
      } else {
        replaceValue = Result.Unknown;
      }
      break;
    case 'column':
    case 'materialized-column':
      if (type.cellType.kind === 'number') {
        replaceValue = (value as Result.OneResult[])?.map(fromNumber);
        replaceType = {
          ...type,
          kind: 'materialized-column',
          cellType: {
            ...type.cellType,
            unit: fixUnit(type.cellType.unit),
          },
        } as typeof type;
        break;
      }
      const replacements = (value as Result.OneResult[])?.map((v) =>
        deserializeResult({
          type: type.cellType,
          value: v,
        })
      );
      replaceValue = replacements?.map((r) => r?.value) as
        | Result.OneResult
        | undefined;
      if (replacements?.length) {
        replaceType = {
          ...type,
          cellType: getDefined(replacements[0]?.type),
        };
      }
      break;
    case 'table':
    case 'materialized-table':
      const replacementColumns = type.columnTypes.map((colType, colIndex) => {
        return deserializeResult({
          type: {
            kind: 'materialized-column',
            cellType: colType,
          } as SerializedTypes.MaterializedColumn,
          value: (value as Interpreter.ResultMaterializedColumn)?.[colIndex],
        });
      });
      replaceType = {
        ...type,
        kind: 'materialized-table',
        columnTypes: replacementColumns.map((col) =>
          isColumn(col?.type) ? col?.type.cellType : undefined
        ) as SerializedTypes.Table['columnTypes'],
      };
      replaceValue = replacementColumns.map(
        (col) => col?.value
      ) as Result.OneResult;
  }
  if ((replaceType ?? type) != null || (replaceValue ?? value) != null) {
    return { type: replaceType ?? type, value: replaceValue ?? value } as T;
  }
  return result;
};
