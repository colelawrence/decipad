import { c, l, n, col, funcDef, tableDef } from '../utils';
import { run } from './index';

it('wraps getTensorWithTargets, evaluates and returns', async () => {
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

it('Returns columns', async () => {
  expect(await run([n('block', col(1, 2, 3))], [[0, 0]])).toEqual([[1, 2, 3]]);
})

it("can return multiple results", async () => {
  const multipleResults = n(
    "block",
    n("assign", n("def", "Variable"), l(1)),
    c("+", n("ref", "Variable"), l(2))
  );

  expect(await run([multipleResults], ["Variable", [0, 1]])).toEqual([1, 3]);
});

describe("functions", () => {
  it("can create and use functions", async () => {
    const usingFunctions = n(
      'block',
      funcDef(
        "Function Name",
        ["Arg 1", "Arg 2"],
        c("+", n("ref", "Arg 1"), n("ref", "Arg 2"))
      ),
      c(
        "Function Name",
        n("literal", "number", 1, null),
        n("literal", "number", 2, null)
      )
    );

    expect(await run([usingFunctions], [0])).toEqual([3]);
  });
});

it("Can use variables", async () => {
  const withVariables = n(
    "block",
    n("assign", n("def", "Some Variable"), n("literal", "number", 1, null)),
    n("ref", "Some Variable")
  );

  expect(await run([withVariables], [0])).toEqual([1]);
});

it('evaluates columns', async () => {
  const column = col(1, 2, 3)
  const programWithArray = n(
    'block',
    n('assign', n('def', 'Array'), column),
    c('+',
      n('ref', 'Array'),
      col(
        3,
        c('+', l(1), l(1)),
        1
      )
    )
  )

  expect(await run([programWithArray], [0])).toEqual([[4, 4, 4]])
})

it('can evaluate tables', async () => {
  const testGetTable = async (table: AST.TableDefinition) => {
    const result = await run([n('block', table)], [0])
    const pairs = [...(result[0] as any).entries()]
      .map(([key, f32Array]) => [key, [...f32Array]])
    return Object.fromEntries(pairs)
  }

  expect(await testGetTable(
    tableDef('Table', {
      Col1: col(1, 2, 3),
      Col2: l(2)
    })
  )).toEqual({
    Col1: [1, 2, 3],
    Col2: [2, 2, 2],
  })

  expect(await testGetTable(
    tableDef('Table', {
      Col1: l(1),
      Col2: l(2)
    })
  )).toEqual({
    Col1: [1],
    Col2: [2],
  })

  expect(await testGetTable(
    tableDef('Table', {
      Col1: col(1, 2, 3),
      Col2: c('*', n('ref', 'Col1'), l(2))
    })
  )).toEqual({
    Col1: [1, 2, 3],
    Col2: [2, 4, 6]
  })
})
