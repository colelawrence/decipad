import {
  c,
  l,
  n,
  col,
  range,
  seq,
  date,
  timeQuantity,
  given,
  funcDef,
  tableDef,
  table,
  prop,
} from '../utils';
import { parseUTCDate } from '../date';
import { run, runOne } from './index';

it('evaluates and returns', async () => {
  const basicProgram = [
    n('block', c('+', l(1), l(1))),
    n('block', n('assign', n('def', 'A'), l(42))),
  ];

  expect(await run(basicProgram, ['A'])).toEqual([42]);
});

it('Gets specific statement', async () => {
  const basicProgram = [n('block', c('+', l(1), l(1)))];

  expect(await run(basicProgram, [[0, 0]])).toEqual([2]);
});

it('can return multiple results', async () => {
  const multipleResults = n(
    'block',
    n('assign', n('def', 'Variable'), l(1)),
    c('+', n('ref', 'Variable'), l(2))
  );

  expect(await run([multipleResults], ['Variable', [0, 1]])).toEqual([1, 3]);
});

it('evaluates conditions', async () => {
  const condition = c('if', l(true), l(1), l(0));

  expect(await runOne(condition)).toEqual(1);
});

describe('ranges', () => {
  it('evaluates ranges', async () => {
    const r = range(1, 10);

    expect(await runOne(r)).toEqual([1, 10]);

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

    expect(await runOne(r)).toEqual([d('2020-01-01'), d('2020-12-01') - 1]);

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
});

describe('sequences', () => {
  it('can be evaluated', async () => {
    expect(await runOne(seq(l(1), l(5), l(1)))).toEqual([1, 2, 3, 4, 5]);

    expect(
      await runOne(
        seq(
          date('2020-01', 'month'),
          date('2020-02', 'month'),
          n('ref', 'month')
        )
      )
    ).toEqual([
      [parseUTCDate('2020-01'), parseUTCDate('2020-02') - 1],
      [parseUTCDate('2020-02'), parseUTCDate('2020-03') - 1],
    ]);
  });

  it('ensures the time quantity is not more specific than the date', async () => {
    expect.assertions(2);

    await runOne(
      seq(date('2020-01', 'month'), date('2020-02', 'month'), n('ref', 'day'))
    ).catch(() => {
      expect(true).toBe(true);
    });

    await runOne(
      seq(
        date('2020-01-01', 'day'),
        date('2020-02-01', 'day'),
        n('ref', 'hour')
      )
    ).catch(() => {
      expect(true).toBe(true);
    });
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
      c(
        'Function Name',
        n('literal', 'number', 1, null),
        n('literal', 'number', 2, null)
      )
    );

    expect(await run([usingFunctions], [0])).toEqual([3]);
  });
});

it('Can use variables', async () => {
  const withVariables = n(
    'block',
    n('assign', n('def', 'Some Variable'), n('literal', 'number', 1, null)),
    n('ref', 'Some Variable')
  );

  expect(await run([withVariables], [0])).toEqual([1]);
});

describe('columns', () => {
  it('evaluates columns', async () => {
    const column = col(1, 2, 3);
    const programWithArray = n(
      'block',
      n('assign', n('def', 'Array'), column),
      c('+', n('ref', 'Array'), col(3, c('+', l(1), l(1)), 1))
    );

    expect(await run([programWithArray], [0])).toEqual([[4, 4, 4]]);
  });

  it('can perform calculations between columns and single numbers', async () => {
    expect(await runOne(c('*', col(1, 2, 3), l(2)))).toEqual([2, 4, 6]);

    expect(await runOne(c('/', col(1, 2, 3), l(2)))).toEqual([0.5, 1, 1.5]);

    expect(await runOne(c('+', l(1), col(1, 2, 3)))).toEqual([2, 3, 4]);
  });

  it('evaluates columns of ranges', async () => {
    const column = col(range(1, 2), range(3, 4), range(5, 6));

    expect(await runOne(column)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
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
    expect(await runOne(date('2021-10-11', 'month'))).toEqual([
      d('2021-10'),
      d('2021-11') - 1, // Last millisecond of october
    ]);
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
    const q = timeQuantity({
      year: 4,
      day: 3,
    });
    expect(await runOne(q)).toEqual([
      ['year', 4],
      ['day', 3],
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
    ).toEqual([[1, 2, 3], 2, [false, false, true]]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: l(1),
          Col2: l(2),
        })
      )
    ).toEqual([1, 2]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: col(1, 2, 3),
          Col2: c('*', n('ref', 'Col1'), l(2)),
        })
      )
    ).toEqual([
      [1, 2, 3],
      [2, 4, 6],
    ]);
  });

  it('Tables can have one item', async () => {
    expect(
      await runOne(
        tableDef('Table', {
          Col1: l(101),
        })
      )
    ).toEqual([101]);

    expect(
      await runOne(
        tableDef('Table', {
          Col1: c('previous', l(101)),
        })
      )
    ).toEqual([[101]]);
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
      [1, 2, 3],
      [1, 2, 3],
    ]);
  });
});

describe('higher dimensions', () => {
  it('Can operate upon 2D columns', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await runOne(column)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);

    expect(await runOne(c('+', column, column))).toEqual([
      [2, 4, 6],
      [8, 10, 12],
    ]);
  });

  it('can mix columns with other dimensions', async () => {
    const column = col(col(l(1), l(2), l(3)), col(l(4), l(5), l(6)));

    expect(await runOne(c('+', column, l(1)))).toEqual([
      [2, 3, 4],
      [5, 6, 7],
    ]);
    expect(await runOne(c('+', l(1), column))).toEqual([
      [2, 3, 4],
      [5, 6, 7],
    ]);

    expect(await runOne(c('/', column, col(l(1), l(2))))).toEqual([
      [1, 2, 3],
      [4 / 2, 5 / 2, 6 / 2],
    ]);

    expect(
      await runOne(c('+', column, col(l(1), col(l(5), l(4), l(3)))))
    ).toEqual([
      [2, 3, 4],
      [9, 9, 9],
    ]);
  });
});

describe('Dimensions', () => {
  describe('given', () => {
    const runWithCol = async (expr: AST.Expression) => {
      const assignCol = n('assign', n('def', 'Col'), col(l(1), l(2), l(3)));
      const [result] = await run(
        [n('block', assignCol, given('Col', expr))],
        [0]
      );

      return result;
    };

    it('can raise a dimension by acting like a map function', async () => {
      expect(await runWithCol(l('hi'))).toEqual(['hi', 'hi', 'hi']);

      expect(await runWithCol(c('+', n('ref', 'Col'), l(1)))).toEqual([
        2, 3, 4,
      ]);

      expect(await runWithCol(col(n('ref', 'Col'), l(1)))).toEqual([
        [1, 1],
        [2, 1],
        [3, 1],
      ]);
    });

    const runWithTable = async (expr: AST.Expression) => {
      const assignTable = tableDef('Table', {
        Nums: col(1, 2, 3),
      });
      const [result] = await run(
        [n('block', assignTable, given('Table', expr))],
        [0]
      );

      return result;
    };

    it('can map over a table by providing rows', async () => {
      expect(await runWithTable(l('hi'))).toEqual(['hi', 'hi', 'hi']);

      expect(await runWithTable(c('+', prop('Table', 'Nums'), l(1)))).toEqual([
        2, 3, 4,
      ]);

      expect(await runWithTable(col(prop('Table', 'Nums'), l(1)))).toEqual([
        [1, 1],
        [2, 1],
        [3, 1],
      ]);
    });
  });

  describe('(sum nums)', () => {
    it('evaluates total', async () => {
      expect(await runOne(c('total', col(1, 2, 3)))).toEqual(6);

      expect(await runOne(c('total', col(col(1, 2, 3), col(3, 3, 3))))).toEqual(
        [6, 9]
      );
    });
  });
});

it('Can create columns with disparate types / dims', async () => {
  expect(
    await runOne(
      col(col(l(1), l(2), l(3)), col(l('s'), l(5), l(false), col(l(1))))
    )
  ).toEqual([
    [1, 2, 3],
    ['s', 5, false, [1]],
  ]);
});
