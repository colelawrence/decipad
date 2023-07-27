import { astNode, Result } from '@decipad/language';

import { anyMappingToMap } from '@decipad/utils';
import {
  findSymbolErrors,
  findSymbolsAffectedByChange,
  getChangedBlocks,
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from './getStatementsToEvict';
import { testBlocks, testProgramBlocks } from '../testUtils';
import { ComputerProgram } from '../types';
import { programToComputerProgram } from '../utils/programToComputerProgram';

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
    expect(
      getChangedBlocks(testProgramBlocks('A = 1'), testProgramBlocks('A = 2'))
    ).toEqual(new Set(['block-0']));

    expect(
      getChangedBlocks(testProgramBlocks('A = 1'), testProgramBlocks('A = 1'))
    ).toEqual(new Set([]));

    expect(getChangedBlocks(testProgramBlocks(), testProgramBlocks())).toEqual(
      new Set([])
    );
  });

  it('tricky cases', () => {
    // One missing block
    expect(
      getChangedBlocks(
        testProgramBlocks('A = 1', 'B = 2'),
        testProgramBlocks('A = 1')
      )
    ).toEqual(new Set(['block-1']));

    // A = 1 adopted a new ID
    expect(
      getChangedBlocks(
        testProgramBlocks('A = 1', 'B = 2'),
        testProgramBlocks('B = 2')
      )
    ).toEqual(new Set(['block-0', 'block-1']));

    // One block is now empty
    expect(
      getChangedBlocks(
        testProgramBlocks('A = 1', 'B = 2'),
        testProgramBlocks('', 'B = 2')
      )
    ).toEqual(new Set(['block-0']));
  });
});

describe('findSymbolsAffectedByChange', () => {
  it('finds symbols in changed blocks', () => {
    expect(
      findSymbolsAffectedByChange(
        testBlocks('A = 1'),
        testBlocks('B = 1'),
        new Set(['block-0'])
      )
    ).toEqual(new Set(['A', 'B']));

    expect(
      findSymbolsAffectedByChange(
        testBlocks('A = 1'),
        testBlocks(),
        new Set(['block-0'])
      )
    ).toEqual(new Set(['A']));

    expect(
      findSymbolsAffectedByChange(
        testBlocks(),
        testBlocks('A = 1'),
        new Set(['block-0'])
      )
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
      oldProgram: testProgramBlocks('A = 1', 'B = A + 10', 'B + 9', 'A + 1'),
      newProgram: testProgramBlocks('A = 1', 'B = A + 99', 'B + 9', 'A + 1'),
      expectEvicted: [1, 2],
    });
  });

  it('evicts non-symbol usages', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'A + 1'),
      newProgram: testProgramBlocks('A = 9', 'A + 1'),
      expectEvicted: [0, 1],
    });
  });

  it('evicts non-symbol locs which changed', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'A + 1'),
      newProgram: testProgramBlocks('A = 1', 'A + 9'),

      expectEvicted: [1],
    });
  });

  it('propagates to deps of disappearing variables', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'A + 1'),
      newProgram: testProgramBlocks('NotA = 1', 'A + 9'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates to deps of disappearing variables (2)', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'A + 1'),
      newProgram: testProgramBlocks('NotA = 1', 'A + 1'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates through indirect deps', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 0', 'C = B + 10', 'D = C + 100'),
      newProgram: testProgramBlocks('A = 0', 'B = A + 1', 'C = B + 10', ''),

      expectEvicted: [1, 2],
    });

    testEvictBlocks({
      oldProgram: testProgramBlocks(
        'A = 0',
        'B = A + 1',
        'C = B + 10',
        'D = C + 100'
      ),
      newProgram: testProgramBlocks('A = 0', 'C = B + 10', ''),

      expectEvicted: [1, 2, 3],
    });
  });

  it('deals with a variable being moved elsewhere', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'B = 2', 'A + 1'),
      newProgram: testProgramBlocks('B = 2', 'A = 1', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'B = 2', 'A + 1'),
      newProgram: testProgramBlocks('A = 1', 'A = 9', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing (2)', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = 1', 'A + 1'),
      newProgram: testProgramBlocks('A = 1', 'A + 1', 'A = 9'),

      expectEvicted: [0, 1], // block 2 doesn't exist in the old program
    });
  });

  it('deals with a dependency loop', () => {
    testEvictBlocks({
      oldProgram: testProgramBlocks('A = B', 'B = A'),
      newProgram: testProgramBlocks('A = B + 9', 'B = A + 9'),

      expectEvicted: [0, 1],
    });
  });

  describe('tables', () => {
    it('evicts table columns', () => {
      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Table = {}',
          'Table.Column = [1, 2, 3]',
          'Table2 = {}',
          'Table2.Column = Table.Column'
        ),
        newProgram: testProgramBlocks(
          'Table = {}',
          'Table.Column = [1, 2, 4]',
          'Table2 = {}',
          'Table2.Column = Table.Column'
        ),

        expectEvicted: [0, 1, 2, 3],
      });
    });
  });

  describe('sets/matrices', () => {
    it('deals with matrices', () => {
      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix[Cat]'
        ),

        expectEvicted: [1, 2],
      });

      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix'
        ),
        newProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix'
        ),

        expectEvicted: [1, 2],
      });
    });

    it('propagates changes in the set', () => {
      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1'
        ),
        newProgram: testProgramBlocks(
          'Cat = categories [1, 2, 3]',
          'Matrix[Cat] = 1'
        ),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1'
        ),
        newProgram: testProgramBlocks(
          'Cat = categories [1, 2, 3]',
          'Matrix[Cat] = 2'
        ),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldProgram: testProgramBlocks(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newProgram: testProgramBlocks(
          'Cat = categories [1, 2, 3]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),

        expectEvicted: [0, 1, 2],
      });
    });

    it('deals with nothing having changed', () => {
      const old = testProgramBlocks(
        'Cat = categories [1, 2]',
        'Matrix[Cat] = 1',
        'Matrix',
        'Matrix[Cat]'
      );
      testEvictBlocks({
        oldProgram: old,
        newProgram: programToComputerProgram([...old.asSequence]),

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

    const useExternalData: ComputerProgram = programToComputerProgram([
      {
        id: 'block-0',
        type: 'identified-block',
        block: {
          id: 'block-0',
          type: 'block',
          args: [astNode('externalref', 'extDataId')],
        },
      },
    ]);

    testEvictBlocks({
      oldProgram: useExternalData,
      newProgram: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: externalDataMap1,

      expectEvicted: [],
    });

    // Now it evicts the first block
    testEvictBlocks({
      oldProgram: useExternalData,
      newProgram: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: externalDataMap2,

      expectEvicted: [0],
    });

    // And also if it got removed
    testEvictBlocks({
      oldProgram: useExternalData,
      newProgram: useExternalData,
      oldExternalData: externalDataMap1,
      newExternalData: new Map(),

      expectEvicted: [0],
    });
  });
  /* eslint-enable jest/expect-expect */
});
