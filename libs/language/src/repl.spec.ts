import chalk from 'chalk';
import repl from 'repl';

import { replEval, reset } from './repl';

const testEval = (source: string) =>
  new Promise((resolve, reject) => {
    replEval(source, null, null, (err, val) => {
      if (err) reject(err);
      else resolve(val);
    });
  });

afterEach(() => {
  reset();
});
it('ignores empty lines', async () => {
  expect(await testEval('')).toEqual(undefined);
});

it('can evaluate stuff', async () => {
  expect(await testEval('1 + 1')).toEqual(`${chalk.blue('2')}`);
});

it('can display type errors', async () => {
  expect(await testEval('1 + "two"')).toMatch(/^Error: /);
});

it('detects unfinished syntax and raises a Recoverable error', async () => {
  await expect(() => testEval('Unfinished = [')).rejects.toBeInstanceOf(
    repl.Recoverable
  );
});
