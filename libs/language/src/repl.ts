import repl from 'repl';
import util from 'util';
import chalk from 'chalk';
import { enableMapSet } from 'immer';
import { parse } from './parser';
import { prettyPrintAST } from './parser/utils';
import { runOne, Realm } from './interpreter';
import { inferStatement, makeContext as makeInferContext } from './infer';
import { stringifyDate } from './date';
import { Type } from './type';

enableMapSet();

export const stringifyResult = (
  result: Interpreter.OneResult,
  type: Type | null
): string => {
  if (type instanceof Type && type.rangeness) {
    const contentT = Type.extend(type, { rangeness: false });

    return `range [ ${stringifyResult(
      (result as any)[0],
      contentT
    )} through ${stringifyResult((result as any)[1], contentT)} ]`;
  }

  if (type instanceof Type && type.date != null) {
    return `${type.date} ${chalk.blue(
      stringifyDate((result as number[])[0], type.date)
    )}`;
  }

  if (
    type instanceof Type &&
    type.columnSize != null &&
    type.cellType != null &&
    Array.isArray(result)
  ) {
    return `[ ${result
      .map((item) => stringifyResult(item, type.cellType))
      .join(', ')} ]`;
  }

  return [chalk.blue(util.inspect(result)), type?.toString()].join(' ');
};

const wrappedParse = (source: string): AST.Statement | null => {
  const parsed = parse([
    {
      id: '<repl>',
      source,
    },
  ])[0];

  /* istanbul ignore if */
  if (parsed.solutions.length > 1) {
    console.error('Ambiguous parsed syntax!');

    for (let i = 0; i < parsed.solutions.length; i++) {
      console.error(`Solution ${i + 1}: `, prettyPrintAST(parsed.solutions[i]));
    }
  }

  return parsed.solutions[0]?.args?.[0] ?? null;
};

let accumulatedSource = '';
let realm = new Realm();
let inferContext = makeInferContext();

const reset = () => {
  accumulatedSource = '';
  realm = new Realm();
  inferContext = makeInferContext();
};

async function execDeci(ast: AST.Statement) {
  try {
    const type = inferStatement(inferContext, ast);

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
  if (!cmd.trim()) return callback(null, undefined);

  const ast = wrappedParse(cmd);

  if (ast == null) {
    const pleaseContinueTyping = new repl.Recoverable(new Error('continue'));
    callback(pleaseContinueTyping, null);
  } else {
    accumulatedSource += '\n' + cmd;

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
