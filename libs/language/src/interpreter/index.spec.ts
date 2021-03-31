import { c, l, n, col, range, date, funcDef, tableDef } from '../utils';
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

it('can evaluate tables', async () => {
  const testGetTable = async (table: AST.TableDefinition) => {
    const out = (await runOne(table)) as Interpreter.ResultTable;
    return Object.fromEntries(out.entries());
  };

  expect(
    await testGetTable(
      tableDef('Table', {
        Col1: col(1, 2, 3),
        Col2: l(2),
        Col3: c('>', n('ref', 'Col1'), n('ref', 'Col2')),
      })
    )
  ).toEqual({
    Col1: [1, 2, 3],
    Col2: [2, 2, 2],
    Col3: [false, false, true],
  });

  /*
  TODO what's the design here?
  expect(
    await testGetTable(
      tableDef('Table', {
        Col1: l(1),
        Col2: l(2),
      })
    )
  ).toEqual({
    Col1: [1],
    Col2: [2],
  });
  */

  expect(
    await testGetTable(
      tableDef('Table', {
        Col1: col(1, 2, 3),
        Col2: c('*', n('ref', 'Col1'), l(2)),
      })
    )
  ).toEqual({
    Col1: [1, 2, 3],
    Col2: [2, 4, 6],
  });
});
