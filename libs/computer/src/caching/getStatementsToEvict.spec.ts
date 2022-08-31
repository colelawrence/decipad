import { AST, InjectableExternalData, astNode } from '@decipad/language';

import { anyMappingToMap } from '@decipad/utils';
import {
  findSymbolErrors,
  findSymbolsAffectedByChange,
  getChangedBlocks,
  getStatementsToEvict,
  GetStatementsToEvictArgs,
} from './getStatementsToEvict';
import { parse } from '../testUtils';

describe('findSymbolErrors', () => {
  it('finds variables which are reassigned', () => {
    expect(findSymbolErrors(parse('A = 0'))).toEqual(new Set([]));

    expect(findSymbolErrors(parse('A = 1', 'Unrelated = 2', 'A = 4'))).toEqual(
      new Set(['var:A'])
    );

    expect(findSymbolErrors(parse('A = 0', 'A = 1'))).toEqual(
      new Set(['var:A'])
    );
  });

  it('finds symbols which are being used before being assigned', () => {
    expect(findSymbolErrors(parse('A = B', 'B = 1'))).toEqual(
      new Set(['var:B'])
    );
  });

  it('works for categories', () => {
    expect(
      findSymbolErrors(
        parse(
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
    expect(getChangedBlocks(parse('A = 1'), parse('A = 2'))).toEqual(
      new Set(['block-0'])
    );

    expect(getChangedBlocks(parse('A = 1'), parse('A = 1'))).toEqual(
      new Set([])
    );

    expect(getChangedBlocks(parse(), parse())).toEqual(new Set([]));
  });

  it('tricky cases', () => {
    // One missing block
    expect(getChangedBlocks(parse('A = 1', 'B = 2'), parse('A = 1'))).toEqual(
      new Set(['block-1'])
    );

    // A = 1 adopted a new ID
    expect(getChangedBlocks(parse('A = 1', 'B = 2'), parse('B = 2'))).toEqual(
      new Set(['block-0', 'block-1'])
    );

    // One block is now empty
    expect(
      getChangedBlocks(parse('A = 1', 'B = 2'), parse('', 'B = 2'))
    ).toEqual(new Set(['block-0']));
  });
});

describe('findSymbolsAffectedByChange', () => {
  it('finds symbols in changed blocks', () => {
    expect(findSymbolsAffectedByChange(parse('A = 1'), parse('B = 1'))).toEqual(
      new Set(['var:A', 'var:B'])
    );

    expect(findSymbolsAffectedByChange(parse('A = 1'), parse())).toEqual(
      new Set(['var:A'])
    );

    expect(findSymbolsAffectedByChange(parse(), parse('A = 1'))).toEqual(
      new Set(['var:A'])
    );
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
      oldBlocks: parse('A = 1', 'B = A + 10', 'B + 9', 'A + 1'),
      newBlocks: parse('A = 1', 'B = A + 99', 'B + 9', 'A + 1'),
      expectEvicted: [1, 2],
    });
  });

  it('evicts non-symbol usages', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'A + 1'),
      newBlocks: parse('A = 9', 'A + 1'),
      expectEvicted: [0, 1],
    });
  });

  it('evicts non-symbol locs which changed', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'A + 1'),
      newBlocks: parse('A = 1', 'A + 9'),

      expectEvicted: [1],
    });
  });

  it('propagates to deps of disappearing variables', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'A + 1'),
      newBlocks: parse('NotA = 1', 'A + 9'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates to deps of disappearing variables (2)', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'A + 1'),
      newBlocks: parse('NotA = 1', 'A + 1'),

      expectEvicted: [0, 1],
    });
  });

  it('propagates through indirect deps', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 0', 'C = B + 10', 'D = C + 100'),
      newBlocks: parse('A = 0', 'B = A + 1', 'C = B + 10', ''),

      expectEvicted: [1, 2],
    });

    testEvictBlocks({
      oldBlocks: parse('A = 0', 'B = A + 1', 'C = B + 10', 'D = C + 100'),
      newBlocks: parse('A = 0', 'C = B + 10', ''),

      expectEvicted: [1, 2, 3],
    });
  });

  it('deals with a variable being moved elsewhere', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'B = 2', 'A + 1'),
      newBlocks: parse('B = 2', 'A = 1', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'B = 2', 'A + 1'),
      newBlocks: parse('A = 1', 'A = 9', 'A + 1'),

      expectEvicted: [0, 1, 2],
    });
  });

  it('deals with a variable with the same name appearing (2)', () => {
    testEvictBlocks({
      oldBlocks: parse('A = 1', 'A + 1'),
      newBlocks: parse('A = 1', 'A + 1', 'A = 9'),

      expectEvicted: [0, 1], // block 2 doesn't exist in the old program
    });
  });

  it('deals with a dependency loop', () => {
    testEvictBlocks({
      oldBlocks: parse('A = B', 'B = A'),
      newBlocks: parse('A = B + 9', 'B = A + 9'),

      expectEvicted: [0, 1],
    });
  });

  describe('sets/matrices', () => {
    it('deals with matrices', () => {
      testEvictBlocks({
        oldBlocks: parse(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newBlocks: parse(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix[Cat]'
        ),

        expectEvicted: [1, 2],
      });

      testEvictBlocks({
        oldBlocks: parse(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix'
        ),
        newBlocks: parse(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 2',
          'Matrix'
        ),

        expectEvicted: [1, 2],
      });
    });

    it('propagates changes in the set', () => {
      testEvictBlocks({
        oldBlocks: parse('Cat = categories [1, 2]', 'Matrix[Cat] = 1'),
        newBlocks: parse('Cat = categories [1, 2, 3]', 'Matrix[Cat] = 1'),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldBlocks: parse('Cat = categories [1, 2]', 'Matrix[Cat] = 1'),
        newBlocks: parse('Cat = categories [1, 2, 3]', 'Matrix[Cat] = 2'),

        expectEvicted: [0, 1],
      });

      testEvictBlocks({
        oldBlocks: parse(
          'Cat = categories [1, 2]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),
        newBlocks: parse(
          'Cat = categories [1, 2, 3]',
          'Matrix[Cat] = 1',
          'Matrix[Cat]'
        ),

        expectEvicted: [0, 1, 2],
      });
    });

    it('deals with nothing having changed', () => {
      const old = parse(
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
      extDataId: 1 as unknown as InjectableExternalData,
    });
    const externalDataMap2 = anyMappingToMap({
      extDataId: 2 as unknown as InjectableExternalData,
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
