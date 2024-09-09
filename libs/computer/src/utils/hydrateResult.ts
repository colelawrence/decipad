import {
  type SerializedTypes,
  type Result,
  Unknown,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import {
  buildResult,
  getResultGenerator,
  hydrateType,
} from '@decipad/language';
import { fromNumber } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { map } from '@decipad/generator-utils';
import { isColumn } from '@decipad/computer-utils';

// eslint-disable-next-line complexity
export const hydrateResult = <T extends Result.Result>(
  result: T | undefined
): T | undefined => {
  if (result == null || result.value == null) {
    return undefined;
  }
  const { type, value } = result;
  let replaceValue: Result.OneResult | undefined;
  let replaceType = hydrateType(type);
  switch (type.kind) {
    case 'number':
      replaceValue = fromNumber(value);
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
      const valueGen = getResultGenerator(value);
      replaceValue = (start = 0, end = Infinity) =>
        map(
          valueGen(start, end),
          (value) =>
            hydrateResult({ type: type.cellType, value, meta: result.meta })
              ?.value
        );

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
          meta: result.meta,
        })
      );
      replaceType = {
        ...type,
        kind: type.kind,
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
