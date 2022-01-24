import util from 'util';
import chalk from 'chalk';
import Fraction from '@decipad/fraction';

import { buildType, Interpreter } from '..';
import { getDefined, zip } from '../utils';
import { stringifyDate } from '../date';
import { Type } from '../type';
import { validateResult } from '.';

type Colorizer = (s: string) => string;
export const stringifyResult = (
  result: Interpreter.OneResult,
  type: Type,
  color: Colorizer = chalk.blue
): string => {
  validateResult(type, result);

  if (type.rangeOf != null) {
    const [start, end] = result as Interpreter.OneResult[];
    return `range(${stringifyResult(
      start,
      type.rangeOf,
      color
    )} to ${stringifyResult(end, type.rangeOf, color)})`;
  }

  if (type.date != null) {
    return `${type.date} ${color(stringifyDate(result as bigint, type.date))}`;
  }

  if (type.type === 'number') {
    const numStr = (result as Fraction).toString(4);
    if (type.unit == null) return color(numStr);
    return [color(numStr), type.toString()].join(' ');
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
      .map((item) => stringifyResult(item, getDefined(type.cellType), color))
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
        ([col, [type, name]]) =>
          `  ${name} = ${stringifyResult(
            col,
            buildType.column(type, tableLength),
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
        ([col, [type, name]]) =>
          `  ${name} = ${stringifyResult(col, type, color)}`
      )
      .join(',\n');
    return `{\n${cols}\n}`;
  }

  return [color(util.inspect(result)), type?.toString()].join(' ');
};
