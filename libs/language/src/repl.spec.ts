import chalk from 'chalk';
import repl from 'repl';

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
    expect(stringifyResult(10, t.number())).toEqual(
      `${chalk.blue('10')} <number>`
    );

    expect(stringifyResult([1, 10], t.range(t.number()))).toEqual(
      `range [ ${chalk.blue('1')} <number> through ${chalk.blue(
        '10'
      )} <number> ]`
    );

    expect(
      stringifyResult(
        [Date.UTC(2020, 0), Date.UTC(2020, 1) - 1],
        t.date('month')
      )
    ).toEqual(`month ${chalk.blue('2020-01')}`);

    expect(stringifyResult([1, 2], t.column(t.number(), 2))).toEqual(
      `[ ${chalk.blue('1')} <number>, ${chalk.blue('2')} <number> ]`
    );

    expect(
      stringifyResult(
        [
          [1, 2],
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
  Numbers = [ ${chalk.blue('1')} <number>, ${chalk.blue('2')} <number> ],
  Strings = [ ${chalk.blue("'hi'")} <string>, ${chalk.blue("'lol'")} <string> ]
}`
    );
  });
});
