import { ItemBlockId, matchItemBlocks } from './match-item-blocks';

interface TestObject {
  readonly secondItem: ItemBlockId;
  readonly menuIndexToMatch?: number;
}

const menu: ItemBlockId[] = [
  { identifier: 'revenue', blockId: '400', columnId: '600' },
  { identifier: 'revenue.revenue', blockId: '400', columnId: '600' },
  { identifier: 'revenue', blockId: '500' },
  { identifier: 'revenue', blockId: '400' },
];

const searches: TestObject[] = [
  { secondItem: { identifier: 'revenue' }, menuIndexToMatch: 2 },
  {
    secondItem: { identifier: 'revenue', blockId: '400', columnId: '600' },
    menuIndexToMatch: 0,
  },
  {
    secondItem: {
      identifier: 'revenue.revenue',
      blockId: '400',
      columnId: '600',
    },
    menuIndexToMatch: 1,
  },
  {
    secondItem: { identifier: 'revenue', blockId: '400' },
    menuIndexToMatch: 3,
  },
  {
    secondItem: { identifier: 'revenue', blockId: '400', columnId: '700' },
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
      test(`Object ${JSON.stringify(testObject)} matches in the menu`, () => {
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
      test(`Object ${JSON.stringify(
        testObject
      )} does not matches in the menu`, () => {
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
