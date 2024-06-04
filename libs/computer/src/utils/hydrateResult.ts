import {
  type SerializedTypes,
  type Unit,
  type Result,
  Unknown,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { buildResult } from '@decipad/language';
import { fromNumber } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { isColumn } from './isColumn';

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

// eslint-disable-next-line complexity
export const hydrateResult = <T extends Result.Result>(
  result: T | undefined
): T | undefined => {
  if (result == null) {
    return undefined;
  }
  const { type, value } = result;
  let replaceValue: Result.OneResult | undefined;
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
        replaceValue = Unknown;
      }
      break;
    case 'column':
    case 'materialized-column':
      if (type.cellType.kind === 'number') {
        replaceValue = (value as Result.OneResult[])?.map((n) => fromNumber(n));
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
        hydrateResult({ type: type.cellType, value: v } as Result.Result)
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
    case 'materialized-table': {
      const replacementColumns = type.columnTypes.map((colType, colIndex) =>
        hydrateResult({
          type: {
            kind: 'materialized-column',
            cellType: colType,
            indexedBy:
              colType.kind === 'column' ||
              colType.kind === 'materialized-column'
                ? colType.indexedBy
                : '',
          },
          value: (value as Result.OneResult[])?.[colIndex],
        } as Result.Result)
      );
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
      break;
    }
    case 'string': {
      if (typeof value !== 'string') {
        replaceValue = value?.toString();
      }
    }
  }
  if ((replaceType ?? type) != null || (replaceValue ?? value) != null) {
    return buildResult(
      replaceType ?? type,
      getDefined(replaceValue ?? value)
    ) as T;
  }
  return result;
};
