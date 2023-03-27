import { IndexNames } from './common';
import { getReductionPlan } from './getReductionPlan';
import { buildType, Type } from '../type';

const testReduction = (
  cardinalities: number[],
  expectedCardinalities: number[],
  indexNames: IndexNames
) => {
  // getReductionPlan wants something that's instanceof Column
  const mockCardinality = (cardinality: number, index: string | null): Type => {
    if (cardinality === 1) {
      return buildType.string();
    } else {
      return buildType.column(mockCardinality(cardinality - 1, null), index);
    }
  };

  const whichToReduce = getReductionPlan(
    cardinalities.map((cardinality, index) =>
      mockCardinality(cardinality, indexNames[index])
    ),
    expectedCardinalities
  );

  return whichToReduce.flatMap((doReduce, index) => (doReduce ? [index] : []));
};

it('figures out what to reduce first', () => {
  expect(testReduction([1, 3], [1, 2], [null, null])).toEqual([1]);
  expect(testReduction([2, 2], [1, 2], [null, null])).toEqual([0]);
});

it('given two possible, unnamed dimensions, picks both', () => {
  expect(testReduction([2, 3], [1, 2], [null, null])).toEqual([0, 1]);
});

it('gives priority to indices', () => {
  expect(testReduction([2, 2], [1, 1], [null, 'Index'])).toEqual([1]);
  expect(testReduction([2, 2], [1, 1], ['Index', null])).toEqual([0]);
});

it('iterates two same-named indices at once', () => {
  expect(testReduction([2, 2], [1, 1], ['Same', 'Same'])).toEqual([0, 1]);
});

it('can also find nothing to do', () => {
  expect(testReduction([1, 1], [1, 1], [null, null])).toEqual([]);
  expect(testReduction([1, 1], [1, 1], ['Idx', 'Idx'])).toEqual([]);
  expect(testReduction([2, 2], [2, 2], ['Idx', 'Idx'])).toEqual([]);
  expect(testReduction([2, 2], [2, 2], [null, 'Idx'])).toEqual([]);
});

it('if an index is already fully reduced, goes to the next one', () => {
  expect(testReduction([2, 3], [2, 2], ['Idx', null])).toEqual([1]);
});

it('and what if an index can be recursed on one end, but not both?', () => {
  expect(testReduction([2, 3], [2, 2], ['Idx', 'Idx'])).toEqual([1]);
});

it('can choose the first index if two different ones are given and available', () => {
  expect(
    testReduction([2, 1, 2], [1, 1, 1], ['IndexOne', null, 'IndexTwo'])
  ).toEqual([0]);
});

describe('multi-index arguments', () => {
  interface MockArg {
    indices: IndexNames;
    targetCardinality?: number;
  }
  const testMultiIndexReduction = (...mockArgs: MockArg[]) => {
    const mockType = (indices: IndexNames): Type => {
      if (!indices.length) {
        return buildType.number();
      } else {
        const [index, ...nextIndices] = indices;
        return buildType.column(mockType(nextIndices), index);
      }
    };

    return getReductionPlan(
      mockArgs.map((a) => mockType(a.indices)),
      mockArgs.map((a) => a.targetCardinality ?? 1)
    ).join(', ');
  };

  it('Supports arguments with more than one index', () => {
    expect(
      testMultiIndexReduction({ indices: ['X', 'Y', 'Z'] })
    ).toMatchInlineSnapshot(`"true"`);
  });

  it('Finds a common index', () => {
    expect(
      testMultiIndexReduction({ indices: ['X', 'Y'] }, { indices: ['X', 'Y'] })
    ).toMatchInlineSnapshot(`"true, true"`);
  });

  it('Finds a common index even if it is out of order', () => {
    expect(
      testMultiIndexReduction(
        { indices: ['X', 'Y'] },
        { indices: ['Rows', 'Y'] }
      )
    ).toMatchInlineSnapshot(`"true, true"`);
  });

  it('Supports null index names', () => {
    expect(
      testMultiIndexReduction({ indices: [null] }, { indices: [null] })
    ).toMatchInlineSnapshot(`"true, true"`);
  });
});
