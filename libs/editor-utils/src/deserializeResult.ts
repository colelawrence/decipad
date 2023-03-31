import { SerializedTypes, Unit, Result } from '@decipad/computer';
import { fromNumber } from '@decipad/number';
import { OneResult } from 'libs/language/src/result';
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
      if (typeof value !== 'symbol' && typeof value !== 'object') {
        replaceValue = BigInt(value ?? 0);
      }
      break;
    case 'column':
      if (type.cellType.kind === 'number') {
        replaceValue = (value as OneResult[])?.map(fromNumber);
        replaceType = {
          ...type,
          cellType: {
            ...type.cellType,
            unit: fixUnit(type.cellType.unit),
          },
        } as typeof type;
        break;
      }
      const replacements = (value as OneResult[])?.map((v) =>
        deserializeResult({
          type: type.cellType,
          value: v,
        })
      );
      replaceValue = replacements?.map((r) => r?.value) as
        | OneResult
        | undefined;
      if (replacements?.length) {
        replaceType = {
          ...type,
          cellType: getDefined(replacements[0]?.type),
        };
      }
      break;
    case 'table':
      const replacementColumns = type.columnTypes.map((colType, colIndex) => {
        return deserializeResult({
          type: {
            kind: 'column',
            cellType: colType,
          } as SerializedTypes.Column,
          value: (value as OneResult[][])?.[colIndex],
        });
      });
      replaceType = {
        ...type,
        columnTypes: replacementColumns.map((col) =>
          col?.type.kind === 'column' ? col.type.cellType : undefined
        ) as SerializedTypes.Table['columnTypes'],
      };
      replaceValue = replacementColumns.map((col) => col?.value) as OneResult;
  }
  if ((replaceType ?? type) != null || (replaceValue ?? value) != null) {
    return { type: replaceType ?? type, value: replaceValue ?? value } as T;
  }
  return result;
};
