import util from 'util';
import DeciNumber, { N } from '@decipad/number';
import { getDefined, identity, zip } from '@decipad/utils';
import {
  Result,
  SerializedType,
  Time,
  Type,
  Unit,
  serializeType,
} from '@decipad/remote-computer';
import { formatType } from './formatType';

export type FormatResult = (
  locale: string,
  result: Result.OneResult | undefined | null,
  type: Type | SerializedType,
  color?: (s: string) => string,
  recurse?: FormatResult
) => string;

export const formatResult: FormatResult = (
  locale,
  result,
  _type,
  color = identity,
  recurse = formatResult
): string => {
  const type = serializeType(_type);

  if (type.kind === 'range') {
    const [start, end] = result as Result.OneResult[];
    return `range(${recurse(locale, start, type.rangeOf, color)} to ${recurse(
      locale,
      end,
      type.rangeOf,
      color
    )})`;
  }

  if (type.kind === 'date') {
    return color(Time.stringifyDate(result as bigint, type.date));
  }

  if (type.kind === 'number') {
    if (type.numberFormat === 'percentage') {
      return `${color((result as DeciNumber).mul(N(100)).toString())}%`;
    }
    const numStr = Unit.convertToMultiplierUnit(
      result as DeciNumber,
      type.unit
    ).toString(4);
    if (type.unit == null) return color(numStr);
    return [color(numStr), formatType(locale, serializeType(type))].join(' ');
  }

  if (type.kind === 'string' || type.kind === 'boolean') {
    return color(util.inspect(result));
  }

  if (
    (type.kind === 'column' || type.kind === 'materialized-column') &&
    Array.isArray(result)
  ) {
    return `[ ${result
      .map((item) => recurse(locale, item, getDefined(type.cellType), color))
      .join(', ')} ]`;
  }

  if (
    (type.kind === 'table' || type.kind === 'materialized-table') &&
    Array.isArray(result)
  ) {
    const cols = zip(result, zip(type.columnTypes, type.columnNames))
      .map(
        ([col, [t, name]]) =>
          `  ${name} = ${recurse(
            locale,
            col,
            {
              kind: 'column',
              cellType: t,
              indexedBy: null,
            },
            color
          )}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  if (type.kind === 'row' && Array.isArray(result)) {
    const cols = zip(result, zip(type.rowCellTypes, type.rowCellNames))
      .map(
        ([col, [t, name]]) => `  ${name} = ${recurse(locale, col, t, color)}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  return [color(util.inspect(result)), formatType(locale, type)].join(' ');
};
