import { AST, astNode, Result } from '@decipad/language';

import { anyMappingToMap } from '@decipad/utils';
import {
  findSymbolErrors,
  findSymbolsAffectedByChange,
  getChangedBlocks,
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from './getStatementsToEvict';
import { testBlocks } from '../testUtils';

describe('findSymbolErrors', () => {
  it('finds variables which are reassigned', () => {
    expect(findSymbolErrors(testBlocks('A = 0'))).toEqual(new Set([]));

    expect(
      findSymbolErrors(testBlocks('A = 1', 'Unrelated = 2', 'A = 4'))
    ).toEqual(new Set(['A']));

    expect(findSymbolErrors(testBlocks('A = 0', 'A = 1'))).toEqual(
      new Set(['A'])
    );
  });

  it('finds symbols which are being used before being assigned', () => {
    expect(findSymbolErrors(testBlocks('A = B', 'B = 1'))).toEqual(
      new Set(['B'])
    );
  });

  it('works for categories', () => {
    expect(
      findSymbolErrors(
        testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix',
          'Matrix[Cat]'
        )
      )
    ).toEqual(new Set());
  });
});

describe('getChangedBlocks', () => {
  it('finds changed blocks', () => {
    expect(getChangedBlocks(testBlocks('A = 1'), testBlocks('A = 2'))).toEqual(
      new Set(['block-0'])
    );

    expect(getChangedBlocks(testBlocks('A = 1'), testBlocks('A = 1'))).toEqual(
      new Set([])
    );

    expect(getChangedBlocks(testBlocks(), testBlocks())).toEqual(new Set([]));
  });

  it('tricky cases', () => {
    // One missing block
    expect(
      getChangedBlocks(testBlocks('A = 1', 'B = 2'), testBlocks('A = 1'))
    ).toEqual(new Set(['block-1']));

    // A = 1 adopted a new ID
    expect(
      getChangedBlocks(testBlocks('A = 1', 'B = 2'), testBlocks('B = 2'))
    ).toEqual(new Set(['block-0', 'block-1']));

    // One block is now empty
    expect(
      getChangedBlocks(testBlocks('A = 1', 'B = 2'), testBlocks('', 'B = 2'))
    ).toEqual(new Set(['block-0']));
  });
});

describe('findSymbolsAffectedByChange', () => {
  it('finds symbols in changed blocks', () => {
    expect(
      findSymbolsAffectedByChange(testBlocks('A = 1'), testBlocks('B = 1'))
    ).toEqual(new Set(['A', 'B']));

    expect(
      findSymbolsAffectedByChange(testBlocks('A = 1'), testBlocks())
    ).toEqual(new Set(['A']));

    expect(
      findSymbolsAffectedByChange(testBlocks(), testBlocks('A = 1'))
    ).toEqual(new Set(['A']));
  });
});

describe('evictCache', () => {
  interface TestArgs extends GetStatementsToEvictArgs {
    expectEvicted: number[];
  }

  const testEvictBlocks = ({ expectEvicted, ...evictOptions }: TestArgs) => {
    const expected = expectEvicted.map((i) => `block-${i}`);

    expect(getStatementsToEvict(evictOptions)).toEqual(expected);
  };

  /* eslint-disable jest/expect-expect */
  it('evicts location and symbol cache for changed stuff and dependent stuff', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'B = A + 10', 'B + 9', 'A + 1'),
      newBlocks: testBlocks('A = 1', 'B = A + 99', 'B + 9', 'A + 1'),
      expectEvicted: [1, 2],
    });
  });

  it('evicts non-symbol usages', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'A + 1'),
      newBlocks: testBlocks('A = 9', 'A + 1'),
      expectEvicted: [0, 1],
    });
  });

  it('evicts non-symbol locs which changed', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'A + 1'),
      newBlocks: testBlocks('A = 1', 'A + 9'),

      expectEvicted: [1],
    });
  });

  it('propagates to deps of disappearing variables', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'A + 1'),
      newBlocks: testBlocks('NotA = 1', 'A + 9'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates to deps of disappearing variables (2)', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'A + 1'),
      newBlocks: testBlocks('NotA = 1', 'A + 1'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates through indirect deps', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 0', 'C = B + 10', 'D = C + 100'),
      newBlocks: testBlocks('A = 0', 'B = A + 1', 'C = B + 10', ''),

      expectEvicted: [1, 2],
    });

    testEvictBlocks({
      oldBlocks: testBlocks('A = 0', 'B = A + 1', 'C = B + 10', 'D = C + 100'),
      newBlocks: testBlocks('A = 0', 'C = B + 10', ''),

      expectEvicted: [1, 2, 3],
    });
  });

  it('deals with a variable being moved elsewhere', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'B = 2', 'A + 1'),
      newBlocks: testBlocks('B = 2', 'A = 1', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'B = 2', 'A + 1'),
      newBlocks: testBlocks('A = 1', 'A = 9', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing (2)', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = 1', 'A + 1'),
      newBlocks: testBlocks('A = 1', 'A + 1', 'A = 9'),

      expectEvicted: [0, 1], // block 2 doesn't exist in the old program
    });
  });

  it('deals with a dependency loop', () => {
    testEvictBlocks({
      oldBlocks: testBlocks('A = B', 'B = A'),
      newBlocks: testBlocks('A = B + 9', 'B = A + 9'),

      expectEvicted: [0, 1],
    });
  });

  describe('sets/matrices', () => {
    it('deals with matrices', () => {
      testEvictBlocks({
        oldBlocks: testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newBlocks: testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix[Cat]'
        ),

        expectEvicted: [1, 2],
      });

      testEvictBlocks({
        oldBlocks: testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix'
        ),
        newBlocks: testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix'
        ),

        expectEvicted: [1, 2],
      });
    });

    it('propagates changes in the set', () => {
      testEvictBlocks({
        oldBlocks: testBlocks('Cat = categories [1, 2]', 'Matrix[Cat] = 1'),
        newBlocks: testBlocks('Cat = categories [1, 2, 3]', 'Matrix[Cat] = 1'),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldBlocks: testBlocks('Cat = categories [1, 2]', 'Matrix[Cat] = 1'),
        newBlocks: testBlocks('Cat = categories [1, 2, 3]', 'Matrix[Cat] = 2'),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldBlocks: testBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newBlocks: testBlocks(
          'Cat = categories [1, 2, 3]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),

        expectEvicted: [0, 1, 2],
      });
    });

    it('deals with nothing having changed', () => {
      const old = testBlocks(
        'Cat = categories [1, 2]',
        'Matrix[Cat] = 1',
        'Matrix',
        'Matrix[Cat]'
      );
      testEvictBlocks({
        oldBlocks: old,
        newBlocks: [...old],

        expectEvicted: [],
      });
    });
  });

  it('evicts blocks if the external data changed', () => {
    const externalDataMap1 = anyMappingToMap({
      extDataId: 1 as unknown as Result.Result,
    });
    const externalDataMap2 = anyMappingToMap({
      extDataId: 2 as unknown as Result.Result,
    });

    const useExternalData: AST.Block[] = [
      {
        id: 'block-0',
        type: 'block',
        args: [astNode('externalref', 'extDataId')],
      },
    ];

    testEvictBlocks({
      oldBlocks: useExternalData,
      newBlocks: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: externalDataMap1,

      expectEvicted: [],
    });

    // Now it evicts the first block
    testEvictBlocks({
      oldBlocks: useExternalData,
      newBlocks: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: externalDataMap2,

      expectEvicted: [0],
    });

    // And also if it got removed
    testEvictBlocks({
      oldBlocks: useExternalData,
      newBlocks: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: new Map(),

      expectEvicted: [0],
    });
  });
  /* eslint-enable jest/expect-expect */
});
