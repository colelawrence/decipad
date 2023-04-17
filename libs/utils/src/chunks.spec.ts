import { chunks } from './chunks';

test('chunks', () => {
  expect(() => chunks([], 0)).toThrow('Invalid');
  expect(chunks([], 100)).toMatchInlineSnapshot(`Array []`);
  expect(chunks([1, 2], 100)).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
        2,
      ],
    ]
  `);
  expect(chunks([1, 2, 3, 5, 5, 6], 1)).toMatchInlineSnapshot(`
    Array [
      Array [
        1,
      ],
      Array [
        2,
      ],
      Array [
        3,
      ],
      Array [
        5,
      ],
      Array [
        5,
      ],
      Array [
        6,
      ],
    ]
  `);

  expect(chunks([1, 2, 3, 5, 5, 6], 10)).toMatchInlineSnapshot(`
    Array [
      Array [
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
    Array [
      Array [
        1,
        2,
      ],
      Array [
        3,
        5,
      ],
      Array [
        5,
        6,
      ],
      Array [
        7,
      ],
    ]
  `);
});
