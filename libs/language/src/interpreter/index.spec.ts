import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { Time, materializeOneResult } from '@decipad/language-types';
import {
  c,
  l,
  n,
  col,
  range,
  seq,
  date,
  funcDef,
  tableDef,
  prop,
  r,
} from '../utils';
import { runAST } from '../testUtils';
import { run, runOne } from './index';

it('evaluates and returns', async () => {
  const basicProgram = [
    n('block', c('+', l(1), l(1))),
    n('block', n('assign', n('def', 'A'), l(42))),
  ];

  expect(await run(basicProgram, ['A'])).toEqual([N(42)]);
});

it('Gets specific statement', async () => {
  const basicProgram = [n('block', c('+', l(1), l(1)))];

  expect(await run(basicProgram, [[0, 0]])).toEqual([N(2)]);
});

it('can return multiple results', async () => {
  const multipleResults = n(
    'block',
    n('assign', n('def', 'Variable'), l(1)),
    c('+', n('ref', 'Variable'), l(2))
  );

  expect(await run([multipleResults], ['Variable', [0, 1]])).toEqual([
    N(1),
    N(3),
  ]);
});

it('evaluates conditions', async () => {
  const condition = c('if', l(true), l(1), l(0));

  expect(await runOne(condition)).toEqual(N(1));
});

describe('ranges', () => {
  it('evaluates ranges', async () => {
    const r = range(1, 10);

    expect(await runOne(r)).toEqual([N(1), N(10)]);

    // Contains
    expect(await runOne(c('contains', r, l(1)))).toEqual(true);
    expect(await runOne(c('contains', r, l(10)))).toEqual(true);

    // Does not contain
    expect(await runOne(c('contains', r, l(0)))).toEqual(false);
    expect(await runOne(c('contains', r, l(11)))).toEqual(false);
  });

  it('evaluates ranges of dates', async () => {
    const d = Time.parseUTCDate;

    const r = range(date('2020-01', 'month'), date('2020-11', 'month'));

    expect(await runOne(r)).toEqual([d('2020-01-01'), d('2020-12-01') - 1n]);

    const rContains = async (...args: Parameters<typeof date>) =>
      runOne(c('contains', r, date(...args)));

    expect(await rContains('2020-01', 'month')).toEqual(true);
    expect(await rContains('2020-02', 'month')).toEqual(true);
    expect(await rContains('2020-11', 'month')).toEqual(true);
    expect(await rContains('2020-11-30', 'day')).toEqual(true);

    expect(await rContains('2019-12-31', 'day')).toEqual(false);
    expect(await rContains('2020-12', 'month')).toEqual(false);
    expect(await rContains('2020-12-01', 'day')).toEqual(false);
  });

  it('evaluates ranges of dates (2)', async () => {
    expect(
      await runOne(range(n('date', 'year', 2020n), n('date', 'year', 2022n)))
    ).toEqual([Time.parseUTCDate('2020'), Time.parseUTCDate('2023') - 1n]);
  });
});

describe('sequences', () => {
  it('can be evaluated', async () => {
    expect(await materializeOneResult(runOne(seq(l(1), l(5), l(1))))).toEqual([
      N(1),
      N(2),
      N(3),
      N(4),
      N(5),
    ]);

    expect(await materializeOneResult(runOne(seq(l(5), l(1), l(-1))))).toEqual([
      N(5),
      N(4),
      N(3),
      N(2),
      N(1),
    ]);

    expect(
      await materializeOneResult(
        runOne(
          seq(
            date('2020-01', 'month'),
            date('2020-02', 'month'),
            n('ref', 'month')
          )
        )
      )
    ).toEqual([Time.parseUTCDate('2020-01'), Time.parseUTCDate('2020-02')]);

    expect(
      await materializeOneResult(
        runOne(
          seq(
            date('2020-02', 'month'),
            date('2020-01', 'month'),
            n('ref', 'month')
          )
        )
      )
    ).toEqual([Time.parseUTCDate('2020-02'), Time.parseUTCDate('2020-01')]);

    const dates = (await materializeOneResult(
      runOne(
        seq(date('2020-01', 'year'), date('2020-01', 'year'), n('ref', 'month'))
      )
    )) as bigint[];

    expect(dates.length).toEqual(12);
    expect(dates[0]).toEqual(Time.parseUTCDate('2020-01'));
    expect(dates[11]).toEqual(Time.parseUTCDate('2020-12'));
  });

  it('can omit the increment', async () => {
    expect(
      await materializeOneResult(
        runOne(seq(date('2020-01', 'month'), date('2020-02', 'month')))
      )
    ).toEqual([Time.parseUTCDate('2020-01'), Time.parseUTCDate('2020-02')]);

    expect(
      await materializeOneResult(
        runOne(seq(date('2020-02', 'month'), date('2020-01', 'month')))
      )
    ).toEqual([Time.parseUTCDate('2020-02'), Time.parseUTCDate('2020-01')]);

    expect(await materializeOneResult(runOne(seq(l(1), l(3))))).toEqual([
      N(1),
      N(2),
      N(3),
    ]);
    expect(await materializeOneResult(runOne(seq(l(3), l(1))))).toEqual([
      N(3),
      N(2),
      N(1),
    ]);
  });
});

describe('functions', () => {
  it('can create and use functions', async () => {
    const usingFunctions = n(
      'block',
      funcDef(
        'Function Name',
        ['Arg 1', 'Arg 2'],
        c('+', n('ref', 'Arg 1'), n('ref', 'Arg 2'))
      ),
      c('Function Name', l(1), l(2))
    );

    expect(await materializeOneResult(run([usingFunctions], [0]))).toEqual([
      N(3),
    ]);
  });
});

it('Can use variables', async () => {
  const withVariables = n(
    'block',
    n('assign', n('def', 'Some Variable'), l(1)),
    n('ref', 'Some Variable')
  );

  expect(await materializeOneResult(run([withVariables], [0]))).toEqual([N(1)]);
});

describe('columns', () => {
  it('evaluates columns', async () => {
    const column = col(1, 2, 3);
    const programWithArray = n(
      'block',
      n('assign', n('def', 'Array'), column),
      c('+', n('ref', 'Array'), col(3, c('+', l(1), l(1)), 1))
    );

    expect(await materializeOneResult(run([programWithArray], [0]))).toEqual([
      [N(4), N(4), N(4)],
    ]);
  });

  it('can perform calculations between columns and single numbers', async () => {
    expect(
      await materializeOneResult(runOne(c('*', col(1, 2, 3), l(2))))
    ).toEqual([N(2), N(4), N(6)]);

    expect(
      await materializeOneResult(runOne(c('/', col(1, 2, 3), l(2))))
    ).toEqual([N(1, 2), N(1), N(3, 2)]);

    expect(
      await materializeOneResult(runOne(c('+', l(1), col(1, 2, 3))))
    ).toEqual([N(2), N(3), N(4)]);
  });

  it('evaluates columns of ranges', async () => {
    const column = col(range(1, 2), range(3, 4), range(5, 6));

    expect(await materializeOneResult(runOne(column))).toEqual([
      [N(1), N(2)],
      [N(3), N(4)],
      [N(5), N(6)],
    ]);

    expect(
      await materializeOneResult(runOne(c('contains', column, l(3))))
    ).toEqual([false, true, false]);

    expect(
      await materializeOneResult(runOne(c('contains', column, col(1, 5, 5))))
    ).toEqual([true, false, true]);
  });
});

describe('dates', () => {
  const d = Time.parseUTCDate;

  it('can evaluate dates', async () => {
    expect(
      await materializeOneResult(runOne(date('2021-10-11', 'month')))
    ).toEqual(d('2021-10'));
  });

  it('can evaluate date functions', async () => {
    expect(
      await materializeOneResult(
        runOne(c('==', date('2021-10', 'month'), date('2021-11', 'month')))
      )
    ).toEqual(false);

    expect(
      await materializeOneResult(
        runOne(c('==', date('2021-10', 'month'), date('2021-10', 'month')))
      )
    ).toEqual(true);
  });
});

describe('Tables', () => {
  it('can evaluate tables', async () => {
    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: col(1, 2, 3),
            Col2: l(2),
            Col3: c('>', n('ref', 'Col1'), n('ref', 'Col2')),
          })
        )
      )
    ).toEqual([
      [N(1), N(2), N(3)],
      [N(2), N(2), N(2)],
      [false, false, true],
    ]);

    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: l(1),
            Col2: l(2),
          })
        )
      )
    ).toEqual([[N(1)], [N(2)]]);

    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: col(1, 2, 3),
            Col2: c('*', n('ref', 'Col1'), l(2)),
          })
        )
      )
    ).toEqual([
      [N(1), N(2), N(3)],
      [N(2), N(4), N(6)],
    ]);
  });

  it('Tables with scalar item get turned to tables with 1 row', async () => {
    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: l(101),
          })
        )
      )
    ).toEqual([[N(101)]]);

    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: c('previous', l(101)),
          })
        )
      )
    ).toEqual([[N(101)]]);
  });

  it('can get a column from a table', async () => {
    const block = n(
      'block',
      tableDef('Table', {
        Col: col('hi', 'there'),
      }),
      prop('Table', 'Col')
    );

    expect(await materializeOneResult(run([block], [0]))).toEqual([
      ['hi', 'there'],
    ]);
  });

  it('sets the "previous" reference', async () => {
    expect(
      await materializeOneResult(
        runOne(
          tableDef('Table', {
            Col1: col(1, 2, 3),
            Col2: c('+', c('previous', l(0)), l(1)),
          })
        )
      )
    ).toEqual([
      [N(1), N(2), N(3)],
      [N(1), N(2), N(3)],
    ]);
  });

  it('Refers to other columns by name (and gets a cell)', async () => {
    const block = n(
      'block',
      tableDef('Table', {
        MaybeNegative: col(1, -2, 3),
        Positive: c('max', col(r('MaybeNegative'), 0)),
      })
    );

    expect(await runAST(block)).toMatchObject({
      type: {
        columnNames: ['MaybeNegative', 'Positive'],
        columnTypes: [{ type: 'number' }, { type: 'number' }],
      },
      value: [
        [N(1), N(-2), N(3)],
        [N(1), N(0), N(3)],
      ],
    });
  });
});

describe('higher dimensions', () => {
  it('Can operate upon 2D columns', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await materializeOneResult(runOne(column))).toEqual([
      [N(1), N(2), N(3)],
      [N(4), N(5), N(6)],
    ]);

    expect(await materializeOneResult(runOne(c('+', column, column)))).toEqual([
      [N(2), N(4), N(6)],
      [N(8), N(10), N(12)],
    ]);
  });

  it('can mix columns with other dimensions', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await materializeOneResult(runOne(c('+', column, l(1))))).toEqual([
      [N(2), N(3), N(4)],
      [N(5), N(6), N(7)],
    ]);
    expect(await materializeOneResult(runOne(c('+', l(1), column)))).toEqual([
      [N(2), N(3), N(4)],
      [N(5), N(6), N(7)],
    ]);

    expect(
      await materializeOneResult(runOne(c('/', column, col(l(1), l(2)))))
    ).toEqual([
      [N(1), N(2), N(3)],
      [N(2), N(5, 2), N(3)],
    ]);
  });
});

it('Can create columns with disparate types / dims', async () => {
  expect(
    await materializeOneResult(
      runOne(col(col(l(1), l(2), l(3)), col(l('s'), l(5), l(false), col(l(1)))))
    )
  ).toEqual([
    [N(1), N(2), N(3)],
    ['s', N(5), false, [N(1)]],
  ]);
});
