import FFraction from '@decipad/fraction';

import {
  isEdgeCaseNumber,
  formatEdgeCaseNumber,
  large,
  small,
} from './formatEdgeCaseNumbers';

it('can detect super large and super smol numbers', () => {
  expect(isEdgeCaseNumber(large)).toMatchInlineSnapshot(`"large"`);
  expect(isEdgeCaseNumber(large.neg())).toMatchInlineSnapshot(`"large"`);
  expect(isEdgeCaseNumber(small)).toMatchInlineSnapshot(`"small"`);
  expect(isEdgeCaseNumber(small.neg())).toMatchInlineSnapshot(`"small"`);
  expect(isEdgeCaseNumber(new FFraction(100n))).toMatchInlineSnapshot(
    `undefined`
  );
});

it('can print those numbers', () => {
  expect(formatEdgeCaseNumber(large, 2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "integer",
        "value": "1000000000000000000000",
      },
    ]
  `);
  expect(formatEdgeCaseNumber(small, 2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "integer",
        "value": "0",
      },
      Object {
        "type": "decimal",
        "value": ".",
      },
      Object {
        "type": "fraction",
        "value": "00",
      },
    ]
  `);
  expect(formatEdgeCaseNumber(new FFraction(100n), 2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "integer",
        "value": "100",
      },
    ]
  `);
});

it('deals with repeating fractions', () => {
  expect(formatEdgeCaseNumber(new FFraction(1n, 3n), 2)).toMatchInlineSnapshot(`
    Array [
      Object {
        "type": "integer",
        "value": "0",
      },
      Object {
        "type": "decimal",
        "value": ".",
      },
      Object {
        "type": "fraction",
        "value": "33",
      },
      Object {
        "type": "ellipsis",
        "value": "...",
      },
    ]
  `);
});
