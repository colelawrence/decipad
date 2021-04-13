import repl from 'repl';
import util from 'util';
import chalk from 'chalk';
import { enableMapSet } from 'immer';
import { parse } from './parser';
import { run } from './interpreter';
import { inferProgram } from './infer';
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
    )} ... ${stringifyResult((result as any)[1], contentT)} ]`;
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

const wrappedParse = async (source: string): Promise<AST.Node> => {
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

  return parsed.solutions[0];
};

let wholeProgram = '';

const reset = () => {
  wholeProgram = '';
};

async function execDeci(source: string) {
  source = source.trim();

  try {
    if (source === ':reset') {
      reset();

      return '';
    }

    if (source === ':print') {
      console.log(wholeProgram);

      return '';
    }

    wholeProgram = ''; // TODO don't reset every time

    const newProgram = wholeProgram + '\n' + source;

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

    const ast = await wrappedParse(newProgram);

    const program: AST.Block[] = [ast as AST.Block];
    const type = inferProgram(program).blockReturns[0];

    if (type != null && (type as any).returns != null) {
      const fType = (type as any).returns as Type;
      return chalk.blue('λ returns ' + fType.toString());
    }

    const result = (await run(program, [0]))[0];

    wholeProgram = newProgram;

    return stringifyResult(result, type);
  } catch (error) {
    if (error instanceof repl.Recoverable) {
      throw error;
    }

    console.error(error);
    return '< Crashed >';
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
  repl.start({
    prompt: '🐙 > ',
    eval: replEval,
    writer: (str) => str,
  });
}
