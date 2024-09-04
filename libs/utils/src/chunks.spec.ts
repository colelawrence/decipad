import { expect, test } from 'vitest';
import { chunks } from './chunks';

test('chunks', () => {
  expect(() => chunks([], 0)).toThrow('Invalid');
  expect(chunks([], 100)).toMatchInlineSnapshot(`[]`);
  expect(chunks([1, 2], 100)).toMatchInlineSnapshot(`
    [
      [
        1,
        2,
      ],
    ]
  `);
  expect(chunks([1, 2, 3, 5, 5, 6], 1)).toMatchInlineSnapshot(`
    [
      [
        1,
      ],
      [
        2,
      ],
      [
        3,
      ],
      [
        5,
      ],
      [
        5,
      ],
      [
        6,
      ],
    ]
  `);

  expect(chunks([1, 2, 3, 5, 5, 6], 10)).toMatchInlineSnapshot(`
    [
      [
        1,
        2,
        3,
        5,
        5,
        6,
      ],
    ]
  `);

  expect(chunks([1, 2, 3, 5, 5, 6, 7], 2)).toMatchInlineSnapshot(`
    [
      [
        1,
        2,
      ],
      [
        3,
        5,
      ],
      [
        5,
        6,
      ],
      [
        7,
      ],
    ]
  `);
});
