import repl from 'repl';
import util from 'util';
import chalk from 'chalk';
import Fraction from '@decipad/fraction';

import { AST, buildType, Interpreter } from '.';
import { getDefined, zip } from './utils';
import { parseBlock } from './parser';
import { runOne, Realm } from './interpreter';
import { inferStatement, makeContext as makeInferContext } from './infer';
import { stringifyDate } from './date';
import { Type } from './type';

type Colorizer = (s: string) => string;
export const stringifyResult = (
  result: Interpreter.OneResult,
  type: Type,
  color: Colorizer = chalk.blue
): string => {
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

const wrappedParse = (source: string): AST.Statement | null => {
  const parsed = parseBlock({ id: '<repl>', source });

  return parsed.solutions[0]?.args?.[0] ?? null;
};

let accumulatedSource = '';
let inferContext = makeInferContext();
let realm = new Realm(inferContext);

export const reset = () => {
  accumulatedSource = '';
  inferContext = makeInferContext();
  realm = new Realm(inferContext);
};

async function execDeci(ast: AST.Statement) {
  try {
    const type = await inferStatement(inferContext, ast);

    if (type.errorCause != null) {
      return type.toString();
    }

    const value = await runOne(ast, realm);

    return stringifyResult(value, type);
  } catch (error) {
    console.error(error);
    return '< Crashed >';
  }
}

export const replEval = (
  cmd: string,
  _context: unknown,
  _filename: unknown,
  callback: (e: Error | null, result: string | null | undefined) => void
) => {
  if (!cmd.trim()) {
    callback(null, undefined);
    return;
  }

  const ast = wrappedParse(cmd);

  if (ast == null) {
    const pleaseContinueTyping = new repl.Recoverable(new Error('continue'));
    callback(pleaseContinueTyping, null);
  } else {
    accumulatedSource += `\n${cmd}`;

    execDeci(ast).then(
      (result) => callback(null, result),
      (error) => callback(error, null)
    );
  }
};

/* istanbul ignore if */
if (module.parent == null) {
  console.log('\nWelcome to the deci language REPL');
  const r = repl.start({
    prompt: '🐙 > ',
    eval: replEval,
    writer: (str) => str,
  });

  reset();
  r.on('reset', reset);

  r.defineCommand('print', () => {
    console.log(accumulatedSource);
  });
}
