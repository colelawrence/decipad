import { test, expect, describe } from 'vitest';
import type { ItemBlockId } from './match-item-blocks';
import { matchItemBlocks } from './match-item-blocks';

interface Test {
  readonly secondItem: ItemBlockId;
  readonly menuIndexToMatch?: number;
}

const menu: ItemBlockId[] = [
  { name: 'revenue', blockId: '400', columnId: '600' },
  { name: 'revenue.revenue', blockId: '400', columnId: '600' },
  { name: 'revenue', blockId: '500' },
  { name: 'revenue', blockId: '400' },
];

const searches: Test[] = [
  { secondItem: { name: 'revenue' }, menuIndexToMatch: 2 },
  {
    secondItem: { name: 'revenue', blockId: '400', columnId: '600' },
    menuIndexToMatch: 0,
  },
  {
    secondItem: {
      name: 'revenue.revenue',
      blockId: '400',
      columnId: '600',
    },
    menuIndexToMatch: 1,
  },
  {
    secondItem: { name: 'revenue', blockId: '400' },
    menuIndexToMatch: 3,
  },
  {
    secondItem: { name: 'revenue', blockId: '400', columnId: '700' },
  },
];

const matchingSearches = searches.filter((testObject) => {
  const { menuIndexToMatch } = testObject;
  const menuMatched =
    typeof menuIndexToMatch === 'number' ? menu[menuIndexToMatch] : undefined;
  return !!menuMatched;
});

const nonMatchingSearches = searches.filter((testObject) => {
  const { menuIndexToMatch } = testObject;
  const menuMatched =
    typeof menuIndexToMatch === 'number' ? menu[menuIndexToMatch] : undefined;
  return !menuMatched;
});

describe('ItemBlockId', () => {
  describe('Matching items', () => {
    matchingSearches.forEach((testObject) => {
      const { secondItem, menuIndexToMatch } = testObject;
      test(`${JSON.stringify(testObject)} matches in the menu`, () => {
        const match = menu.some((firstItem) =>
          matchItemBlocks(firstItem, secondItem)
        );
        expect(match).toBe(true);
      });

      test(`... and it matches the right element`, () => {
        const menuMatched =
          typeof menuIndexToMatch === 'number'
            ? menu[menuIndexToMatch]
            : undefined;

        expect(menuMatched).toBeTruthy(); // Because all tests cases are matching

        expect(matchItemBlocks(secondItem, menuMatched)).toBe(true);
      });
    });
  });

  describe('Non-matching items', () => {
    nonMatchingSearches.forEach((testObject) => {
      const { secondItem, menuIndexToMatch } = testObject;
      test(`${JSON.stringify(test)} does not matches in the menu`, () => {
        const match = menu.some((firstItem) => {
          return matchItemBlocks(firstItem, secondItem);
        });
        expect(match).toBe(false);
      });

      test(`... and it matches no element`, () => {
        expect(menuIndexToMatch).toBe(undefined);
      });
    });
  });
});
