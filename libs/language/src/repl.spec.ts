import chalk from 'chalk';
import repl from 'repl';

import { Type } from './type';
import { replEval, stringifyResult } from './repl';

it('can evaluate stuff', (done) => {
  expect.assertions(1);

  replEval('1 + 1', null, null, (...args) => {
    expect(args).toEqual([null, `${chalk.blue('2')} <number>`]);

    done();
  });
});

it('detects unfinished syntax and raises a Recoverable error', (done) => {
  expect.assertions(1);

  replEval('Table = {', null, null, (error) => {
    expect(error).toBeInstanceOf(repl.Recoverable);

    done();
  });
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
