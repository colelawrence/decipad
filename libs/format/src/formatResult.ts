import util from 'util';
import Fraction from '@decipad/fraction';
import { getDefined, zip } from '@decipad/utils';
import {
  buildType,
  Interpreter,
  stringifyDate,
  Type,
  convertToMultiplierUnit,
  serializeType,
} from '@decipad/language';
import { formatType } from './formatType';

export const formatResult = (
  locale: string,
  result: Interpreter.OneResult | undefined | null,
  type: Type,
  color = (s: string) => s
): string => {
  if (type.rangeOf != null) {
    const [start, end] = result as Interpreter.OneResult[];
    return `range(${formatResult(
      locale,
      start,
      type.rangeOf,
      color
    )} to ${formatResult(locale, end, type.rangeOf, color)})`;
  }

  if (type.date != null) {
    return `${type.date} ${color(stringifyDate(result as bigint, type.date))}`;
  }

  if (type.type === 'number') {
    const numStr = convertToMultiplierUnit(
      result as Fraction,
      type.unit
    ).toString(4);
    if (type.unit == null) return color(numStr);
    return [color(numStr), formatType(locale, serializeType(type))].join(' ');
  }

  if (type.type === 'string' || type.type === 'boolean') {
    return color(util.inspect(result));
  }

  if (
    type.columnSize != null &&
    type.cellType != null &&
    Array.isArray(result)
  ) {
    return `[ ${result
      .map((item) =>
        formatResult(locale, item, getDefined(type.cellType), color)
      )
      .join(', ')} ]`;
  }

  if (
    type.columnTypes != null &&
    type.columnNames != null &&
    type.tableLength != null &&
    Array.isArray(result)
  ) {
    const { tableLength } = type;
    const cols = zip(result, zip(type.columnTypes, type.columnNames))
      .map(
        ([col, [t, name]]) =>
          `  ${name} = ${formatResult(
            locale,
            col,
            buildType.column(t, tableLength),
            color
          )}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  if (
    type.rowCellTypes != null &&
    type.rowCellNames != null &&
    Array.isArray(result)
  ) {
    const cols = zip(result, zip(type.rowCellTypes, type.rowCellNames))
      .map(
        ([col, [t, name]]) =>
          `  ${name} = ${formatResult(locale, col, t, color)}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  return [
    color(util.inspect(result)),
    type && formatType(locale, serializeType(type)),
  ].join(' ');
};
