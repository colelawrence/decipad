import chalk from 'chalk';
import repl from 'repl';

import { F } from './utils';
import { build as t } from './type';
import { replEval, stringifyResult, reset } from './repl';

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

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(stringifyResult(F(10), t.number())).toEqual(`${chalk.blue('10')}`);

    expect(stringifyResult([F(1), F(10)], t.range(t.number()))).toEqual(
      `range [ ${chalk.blue('1')} through ${chalk.blue('10')} ]`
    );

    expect(stringifyResult(BigInt(Date.UTC(2020, 0)), t.date('month'))).toEqual(
      `month ${chalk.blue('2020-01')}`
    );

    expect(stringifyResult([1n, 2n], t.column(t.number(), 2))).toEqual(
      `[ ${chalk.blue('1')}, ${chalk.blue('2')} ]`
    );

    expect(
      stringifyResult(
        [
          [1n, 2n],
          ['hi', 'lol'],
        ],
        t.table({
          length: 2,
          columnTypes: [t.number(), t.string()],
          columnNames: ['Numbers', 'Strings'],
        })
      )
    ).toEqual(
      `{
  Numbers = [ ${chalk.blue('1')}, ${chalk.blue('2')} ],
  Strings = [ ${chalk.blue("'hi'")}, ${chalk.blue("'lol'")} ]
}`
    );
  });
});
