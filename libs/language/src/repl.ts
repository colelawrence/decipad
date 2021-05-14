import repl from 'repl';
import util from 'util';
import chalk from 'chalk';
import { enableMapSet } from 'immer';
import { parse } from './parser';
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

  return [
    chalk.blue(util.inspect(result != null ? result : result)),
    type != null ? ' ' + type.toString() : '',
  ].join('');
};

const wrappedParse = async (source: string): Promise<AST.Statement> => {
  const parsed = parse([
    {
      id: '<repl>',
      source,
    },
  ])[0];

  if (parsed.solutions.length > 1) {
    for (let i = 0; i < parsed.solutions.length; i++) {
      console.error(
        `Solution ${i}: `,
        util.inspect(parsed.solutions[i], { depth: Infinity })
      );
    }
    throw new Error('ambiguous parsed syntax!');
  }

  return parsed.solutions[0].args[0];
};

let wholeProgram = '';
let realm = new Realm();
let inferContext = makeInferContext();

const reset = () => {
  wholeProgram = '';
  realm = new Realm();
  inferContext = makeInferContext();
};

async function execDeci(source: string) {
  source = source.trim();

  try {
    // Syntax check
    await wrappedParse(source)
      .catch(() => null)
      .then((value) => {
        if (value == null) {
          throw new repl.Recoverable(new Error('continue'));
        } else {
          return value;
        }
      });

    const ast = await wrappedParse(source);

    const type = inferStatement(inferContext, ast);

    if (type.errorCause != null) {
      return type.toString();
    }

    const value = await runOne(ast, realm);

    wholeProgram += '\n' + source;

    return stringifyResult(value, type);
  } catch (error) {
    if (error instanceof repl.Recoverable) {
      throw error;
    } else {
      console.error(error);
      return '< Crashed >';
    }
  }
}

reset();

export const replEval = (
  cmd: string,
  _context: unknown,
  _filename: unknown,
  callback: (e: Error | null, result: string | null) => void
) => {
  if (!cmd.trim()) return callback(null, null);

  execDeci(cmd).then(
    (result) => callback(null, result),
    (error) => callback(error, null)
  );
};

/* istanbul ignore if */
if (module.parent == null) {
  console.log('\nWelcome to the deci language REPL');
  const r = repl.start({
    prompt: '🐙 > ',
    eval: replEval,
    writer: (str) => str,
  });

  r.on('reset', reset);

  r.defineCommand('print', () => {
    console.log(wholeProgram);
  });
}
