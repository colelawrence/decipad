import util from 'util';
import Fraction from '@decipad/fraction';
import { getDefined, zip } from '@decipad/utils';
import {
  Interpreter,
  stringifyDate,
  Type,
  convertToMultiplierUnit,
  serializeType,
  SerializedType,
} from '@decipad/language';
import { formatType } from './formatType';

export const formatResult = (
  locale: string,
  result: Interpreter.OneResult | undefined | null,
  _type: Type | SerializedType,
  color = (s: string) => s
): string => {
  const type = serializeType(_type);

  if (type.kind === 'range') {
    const [start, end] = result as Interpreter.OneResult[];
    return `range(${formatResult(
      locale,
      start,
      type.rangeOf,
      color
    )} to ${formatResult(locale, end, type.rangeOf, color)})`;
  }

  if (type.kind === 'date') {
    return `${type.date} ${color(stringifyDate(result as bigint, type.date))}`;
  }

  if (type.kind === 'number') {
    if (type.numberFormat === 'percentage') {
      return `${color((result as Fraction).mul(100).toString())}%`;
    }
    const numStr = convertToMultiplierUnit(
      result as Fraction,
      type.unit
    ).toString(4);
    if (type.unit == null) return color(numStr);
    return [color(numStr), formatType(locale, serializeType(type))].join(' ');
  }

  if (type.kind === 'string' || type.kind === 'boolean') {
    return color(util.inspect(result));
  }

  if (type.kind === 'column' && Array.isArray(result)) {
    return `[ ${result
      .map((item) =>
        formatResult(locale, item, getDefined(type.cellType), color)
      )
      .join(', ')} ]`;
  }

  if (type.kind === 'table' && Array.isArray(result)) {
    const { tableLength } = type;
    const cols = zip(result, zip(type.columnTypes, type.columnNames))
      .map(
        ([col, [t, name]]) =>
          `  ${name} = ${formatResult(
            locale,
            col,
            {
              kind: 'column',
              cellType: t,
              columnSize: tableLength,
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
        ([col, [t, name]]) =>
          `  ${name} = ${formatResult(locale, col, t, color)}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  return [color(util.inspect(result)), formatType(locale, type)].join(' ');
};
