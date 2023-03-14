/* eslint-disable no-console */
/* eslint-disable import/no-import-module-exports */
import repl from 'repl';
import chalk from 'chalk';
import {
  AST,
  parseBlock,
  Realm,
  runBlock,
  inferBlock,
  makeContext as makeInferContext,
} from '@decipad/language';
import { formatError, formatResult } from '@decipad/format';

const DEFAULT_LOCALE = 'en-US';

let accumulatedSource = '';
let inferContext = makeInferContext();
let realm = new Realm(inferContext);

export const reset = () => {
  accumulatedSource = '';
  inferContext = makeInferContext();
  realm = new Realm(inferContext);
};

async function execDeci(ast: AST.Block) {
  try {
    const type = inferBlock(ast, inferContext);

    if (type.errorCause != null) {
      return `Error: ${formatError(DEFAULT_LOCALE, type.errorCause.spec)}`;
    }

    const value = await runBlock(ast, realm);

    return formatResult(DEFAULT_LOCALE, value, type, chalk.blue);
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

  const block = parseBlock(cmd).solution;

  if (block == null) {
    const pleaseContinueTyping = new repl.Recoverable(new Error('continue'));
    callback(pleaseContinueTyping, null);
  } else {
    accumulatedSource += `\n${cmd}`;

    execDeci(block).then(
      (result) => callback(null, result),
      (error) => callback(error, null)
    );
  }
};

/* istanbul ignore if */
if (module.parent == null) {
  if (process.argv.length > 2) {
    const string = process.argv[2];
    replEval(string, null, null, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        console.log(result);
      }
    });
  } else {
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
}
