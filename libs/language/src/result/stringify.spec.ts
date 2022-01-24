import chalk from 'chalk';

import { F } from '../utils';
import { build as t } from '../type';
import { parseUTCDate } from '../date';
import { stringifyResult } from './stringify';

describe('stringify', () => {
  it('stringifies basic stuff', () => {
    expect(stringifyResult(F(10), t.number())).toEqual(`${chalk.blue('10')}`);

    expect(stringifyResult([F(1), F(10)], t.range(t.number()))).toEqual(
      `range(${chalk.blue('1')} to ${chalk.blue('10')})`
    );

    expect(stringifyResult(parseUTCDate('2020-01'), t.date('month'))).toEqual(
      `month ${chalk.blue('2020-01')}`
    );

    expect(stringifyResult([F(1n), F(2n)], t.column(t.number(), 2))).toEqual(
      `[ ${chalk.blue('1')}, ${chalk.blue('2')} ]`
    );

    expect(
      stringifyResult(
        [
          [F(1n), F(2n)],
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
