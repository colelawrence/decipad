import { AST } from '..';
import {
  F,
  c,
  l,
  n,
  col,
  range,
  seq,
  date,
  timeQuantity,
  funcDef,
  tableDef,
  table,
  prop,
  block,
  assign,
  r,
  as,
} from '../utils';
import { parseUTCDate } from '../date';
import { runAST } from '../testUtils';

import { run, runOne } from './index';

it('evaluates and returns', async () => {
  const basicProgram = [
    n('block', c('+', l(1), l(1))),
    n('block', n('assign', n('def', 'A'), l(42))),
  ];

  expect(await run(basicProgram, ['A'])).toEqual([F(42)]);
});

it('Gets specific statement', async () => {
  const basicProgram = [n('block', c('+', l(1), l(1)))];

  expect(await run(basicProgram, [[0, 0]])).toEqual([F(2)]);
});

it('can return multiple results', async () => {
  const multipleResults = n(
    'block',
    n('assign', n('def', 'Variable'), l(1)),
    c('+', n('ref', 'Variable'), l(2))
  );

  expect(await run([multipleResults], ['Variable', [0, 1]])).toEqual([
    F(1),
    F(3),
  ]);
});

it('evaluates conditions', async () => {
  const condition = c('if', l(true), l(1), l(0));

  expect(await runOne(condition)).toEqual(F(1));
});

describe('ranges', () => {
  it('evaluates ranges', async () => {
    const r = range(1, 10);

    expect(await runOne(r)).toEqual([F(1), F(10)]);

    // Contains
    expect(await runOne(c('contains', r, l(1)))).toEqual(true);
    expect(await runOne(c('contains', r, l(10)))).toEqual(true);

    // Does not contain
    expect(await runOne(c('contains', r, l(0)))).toEqual(false);
    expect(await runOne(c('contains', r, l(11)))).toEqual(false);
  });

  it('evaluates ranges of dates', async () => {
    const d = parseUTCDate;

    const r = range(date('2020-01', 'month'), date('2020-11', 'month'));

    expect(await runOne(r)).toEqual([
      F(d('2020-01-01')),
      F(d('2020-12-01') - 1n),
    ]);

    expect(
      await runOne(c('containsdate', r, date('2020-01', 'month')))
    ).toEqual(true);
    expect(
      await runOne(c('containsdate', r, date('2020-02', 'month')))
    ).toEqual(true);
    expect(
      await runOne(c('containsdate', r, date('2020-11', 'month')))
    ).toEqual(true);
    expect(
      await runOne(c('containsdate', r, date('2020-11-30', 'day')))
    ).toEqual(true);

    expect(
      await runOne(c('containsdate', r, date('2019-12-31', 'day')))
    ).toEqual(false);

    expect(
      await runOne(c('containsdate', r, date('2020-12', 'month')))
    ).toEqual(false);
    expect(
      await runOne(c('containsdate', r, date('2020-12-01', 'day')))
    ).toEqual(false);
  });

  it('evaluates ranges of dates (2)', async () => {
    expect(
      await runOne(range(n('date', 'year', 2020n), n('date', 'year', 2022n)))
    ).toEqual([F(Date.UTC(2020, 0)), F(Date.UTC(2023, 0) - 1)]);
  });
});

describe('sequences', () => {
  it('can be evaluated', async () => {
    expect(await runOne(seq(l(1), l(5), l(1)))).toEqual([
      F(1),
      F(2),
      F(3),
      F(4),
      F(5),
    ]);

    expect(
      await runOne(
        seq(
          date('2020-01', 'month'),
          date('2020-02', 'month'),
          n('ref', 'month')
        )
      )
    ).toEqual([parseUTCDate('2020-01'), parseUTCDate('2020-02')]);

    const dates = (await runOne(
      seq(date('2020-01', 'year'), date('2020-01', 'year'), n('ref', 'month'))
    )) as bigint[];

    expect(dates.length).toEqual(12);
    expect(dates[0]).toEqual(parseUTCDate('2020-01'));
    expect(dates[11]).toEqual(parseUTCDate('2020-12'));
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

    expect(await run([usingFunctions], [0])).toEqual([F(3)]);
  });
});

it('Can use variables', async () => {
  const withVariables = n(
    'block',
    n('assign', n('def', 'Some Variable'), l(1)),
    n('ref', 'Some Variable')
  );

  expect(await run([withVariables], [0])).toEqual([F(1)]);
});

describe('columns', () => {
  it('evaluates columns', async () => {
    const column = col(1, 2, 3);
    const programWithArray = n(
      'block',
      n('assign', n('def', 'Array'), column),
      c('+', n('ref', 'Array'), col(3, c('+', l(1), l(1)), 1))
    );

    expect(await run([programWithArray], [0])).toEqual([[F(4), F(4), F(4)]]);
  });

  it('can perform calculations between columns and single numbers', async () => {
    expect(await runOne(c('*', col(1, 2, 3), l(2)))).toEqual([
      F(2),
      F(4),
      F(6),
    ]);

    expect(await runOne(c('/', col(1, 2, 3), l(2)))).toEqual([
      F(1, 2),
      F(1),
      F(3, 2),
    ]);

    expect(await runOne(c('+', l(1), col(1, 2, 3)))).toEqual([
      F(2),
      F(3),
      F(4),
    ]);
  });

  it('evaluates columns of ranges', async () => {
    const column = col(range(1, 2), range(3, 4), range(5, 6));

    expect(await runOne(column)).toEqual([
      [F(1), F(2)],
      [F(3), F(4)],
      [F(5), F(6)],
    ]);

    expect(await runOne(c('contains', column, l(3)))).toEqual([
      false,
      true,
      false,
    ]);

    expect(await runOne(c('contains', column, col(1, 5, 5)))).toEqual([
      true,
      false,
      true,
    ]);
  });
});

describe('dates', () => {
  const d = parseUTCDate;

  it('can evaluate dates', async () => {
    expect(await runOne(date('2021-10-11', 'month'))).toEqual(d('2021-10'));
  });

  it('can evaluate date functions', async () => {
    expect(
      await runOne(
        c('dateequals', date('2021-10', 'month'), date('2021-11', 'month'))
      )
    ).toEqual(false);

    expect(
      await runOne(
        c('dateequals', date('2021-10', 'month'), date('2021-10', 'month'))
      )
    ).toEqual(true);
  });
});

describe('Time quantities', () => {
  it('can be evaluated', async () => {
    const q = timeQuantity({ year: 4n, day: 3n });
    expect(await runOne(q)).toEqual([
      ['year', 4n],
      ['day', 3n],
    ]);
  });
});

describe('Tables', () => {
  it('can evaluate tables', async () => {
    expect(
      await runOne(
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: l(2),
          Col3: c('>', n('ref', 'Col1'), n('ref', 'Col2')),
        })
      )
    ).toEqual([
      [F(1), F(2), F(3)],
      [F(2), F(2), F(2)],
      [false, false, true],
    ]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: l(1),
          Col2: l(2),
        })
      )
    ).toEqual([[F(1)], [F(2)]]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: c('*', n('ref', 'Col1'), l(2)),
        })
      )
    ).toEqual([
      [F(1), F(2), F(3)],
      [F(2), F(4), F(6)],
    ]);
  });

  it('Tables with scalar item get turned to tables with 1 row', async () => {
    expect(
      await runOne(
        tableDef('Table', {
          Col1: l(101),
        })
      )
    ).toEqual([[F(101)]]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: c('previous', l(101)),
        })
      )
    ).toEqual([[F(101)]]);
  });

  it('can get a column from a table', async () => {
    const block = n(
      'block',
      tableDef('Table', {
        Col: col('hi', 'there'),
      }),
      prop('Table', 'Col')
    );

    expect(await run([block], [0])).toEqual([['hi', 'there']]);
  });

  it('sets the "previous" reference', async () => {
    expect(
      await runOne(
        table({
          Col1: col(1, 2, 3),
          Col2: c('+', c('previous', l(0)), l(1)),
        })
      )
    ).toEqual([
      [F(1), F(2), F(3)],
      [F(1), F(2), F(3)],
    ]);
  });

  it('can spread another table and add columns', async () => {
    const { value } = await runAST(
      block(
        tableDef('OldTable', {
          Idx: col('One', 'Two'),
        }),

        assign(
          'Extended',
          n(
            'table',
            n('table-spread', r('OldTable')),
            n('table-column', n('coldef', 'Col'), col(1, 2)),
            n(
              'table-column',
              n('coldef', 'UsingPrevious'),
              c('+', l(1), c('previous', l(10)))
            ),
            n('table-column', n('coldef', 'JustOne'), l(1))
          )
        )
      )
    );

    expect(value).toEqual([
      ['One', 'Two'],
      [F(1), F(2)],
      [F(11), F(12)],
      [F(1), F(1)],
    ]);
  });
});

describe('higher dimensions', () => {
  it('Can operate upon 2D columns', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await runOne(column)).toEqual([
      [F(1), F(2), F(3)],
      [F(4), F(5), F(6)],
    ]);

    expect(await runOne(c('+', column, column))).toEqual([
      [F(2), F(4), F(6)],
      [F(8), F(10), F(12)],
    ]);
  });

  it('can mix columns with other dimensions', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await runOne(c('+', column, l(1)))).toEqual([
      [F(2), F(3), F(4)],
      [F(5), F(6), F(7)],
    ]);
    expect(await runOne(c('+', l(1), column))).toEqual([
      [F(2), F(3), F(4)],
      [F(5), F(6), F(7)],
    ]);

    expect(await runOne(c('/', column, col(l(1), l(2))))).toEqual([
      [F(1), F(2), F(3)],
      [F(2), F(5, 2), F(3)],
    ]);
  });
});

it('Can create columns with disparate types / dims', async () => {
  expect(
    await runOne(
      col(col(l(1), l(2), l(3)), col(l('s'), l(5), l(false), col(l(1))))
    )
  ).toEqual([
    [F(1), F(2), F(3)],
    ['s', F(5), false, [F(1)]],
  ]);
});

it('can expand directives', async () => {
  const minutes: AST.Unit = {
    unit: 'minutes',
    exp: 1n,
    multiplier: 1,
    known: true,
  };
  const hours: AST.Unit = {
    unit: 'hours',
    exp: 1n,
    multiplier: 1,
    known: true,
  };
  expect(
    await runOne(as(l(1, hours), n('units', minutes)))
  ).toMatchInlineSnapshot(`Fraction(60)`);
});
