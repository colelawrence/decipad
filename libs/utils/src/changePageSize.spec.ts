import { it, expect } from 'vitest';
import { changePageSize } from './changePageSize';

it('keeps same page if going from smaller to bigger', () => {
  expect(
    changePageSize({ currentPage: 1, currentPageSize: 10, newPageSize: 25 })
  ).toBe(1);

  expect(
    changePageSize({ currentPage: 1, currentPageSize: 10, newPageSize: 100 })
  ).toBe(1);
});

it('changes page if items would be moved', () => {
  // 5 * 10 (Shows 51-60)
  // 25 * 3 (Shows 51-75)
  expect(
    changePageSize({ currentPage: 5, currentPageSize: 10, newPageSize: 25 })
  ).toBe(3);

  // 8 * 20 (Shows 161-180)
  // 25 * 7 (Shows 176-200)
  // Can't quite get that second one perfect without dodgy shifting.
  expect(
    changePageSize({ currentPage: 8, currentPageSize: 20, newPageSize: 25 })
  ).toBe(7);
});

it('works on moving to lower pages', () => {
  // 10 * 20 (Shows 200-219)
  // 10 * 21 (Shows 210-219)
  expect(
    changePageSize({ currentPage: 10, currentPageSize: 20, newPageSize: 10 })
  ).toBe(21);

  // 5 * 50 (Shows 250-299)
  // 26 * 10 (Shows 260-269)
  expect(
    changePageSize({ currentPage: 5, currentPageSize: 50, newPageSize: 10 })
  ).toBe(26);
});
