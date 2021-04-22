import chalk from 'chalk';
import repl from 'repl';

import { Type } from './type';
import { replEval, stringifyResult } from './repl';

const testEval = (source: string) =>
  new Promise((resolve, reject) => {
    replEval(source, null, null, (err, val) => {
      if (err) reject(err);
      else resolve(val);
    });
  });

it('ignores empty lines', async () => {
  expect(await testEval('')).toEqual(null);
});

it('can evaluate stuff', async () => {
  expect(await testEval('1 + 1')).toEqual(`${chalk.blue('2')} <number>`);
});

it('can display type errors', async () => {
  expect(await testEval('1 + "two"')).toMatch(/^Error: /);
});

it('detects unfinished syntax and raises a Recoverable error', async () => {
  await expect(() => testEval('Unfinished = [')).rejects.toBeInstanceOf(
    repl.Recoverable
  );
});

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(stringifyResult(10, Type.Number)).toEqual(
      `${chalk.blue('10')} <number>`
    );

    expect(
      stringifyResult([1, 10], Type.build({ type: 'number', rangeness: true }))
    ).toEqual(
      `range [ ${chalk.blue('1')} <number> ... ${chalk.blue('10')} <number> ]`
    );

    expect(
      stringifyResult(
        [Date.UTC(2020, 0), Date.UTC(2020, 1) - 1],
        Type.buildDate('month')
      )
    ).toEqual(`month ${chalk.blue('2020-01')}`);
  });
});
