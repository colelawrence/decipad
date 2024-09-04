import { expect, it } from 'vitest';
import { getDefined } from '@decipad/utils';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { parseSimpleValue } from './parseSimpleValue';
import { simpleValueToString } from './simpleValueToString';

setupDeciNumberSnapshotSerializer();

it('can perform some operations on unitless numbers', () => {
  const num = getDefined(parseSimpleValue('1'));

  expect(num).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
      "unit": undefined,
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"1"`);

  num.unit = '%';
  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"1%"`);
});

it('can perform some operations on numbers with units', () => {
  const num = getDefined(parseSimpleValue('1 meter/second**2'));

  expect(num).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 1n,
        "s": 1n,
      },
      "unit": {
        "args": [
          {
            "args": [
              "/",
            ],
            "type": "funcref",
          },
          {
            "args": [
              {
                "args": [
                  "meter",
                ],
                "end": {
                  "char": 6,
                  "column": 7,
                  "line": 1,
                },
                "start": {
                  "char": 2,
                  "column": 3,
                  "line": 1,
                },
                "type": "ref",
              },
              {
                "args": [
                  {
                    "args": [
                      "**",
                    ],
                    "type": "funcref",
                  },
                  {
                    "args": [
                      {
                        "args": [
                          "second",
                        ],
                        "end": {
                          "char": 13,
                          "column": 14,
                          "line": 1,
                        },
                        "start": {
                          "char": 8,
                          "column": 9,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                      {
                        "args": [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 2n,
                            "s": 1n,
                          },
                        ],
                        "end": {
                          "char": 16,
                          "column": 17,
                          "line": 1,
                        },
                        "start": {
                          "char": 16,
                          "column": 17,
                          "line": 1,
                        },
                        "type": "literal",
                      },
                    ],
                    "type": "argument-list",
                  },
                ],
                "type": "function-call",
              },
            ],
            "type": "argument-list",
          },
        ],
        "type": "function-call",
      },
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(
    `"1 meter / second ** 2"`
  );
});

it('can perform some operations on percentages', () => {
  const num = getDefined(parseSimpleValue('10%'));

  expect(num).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      },
      "unit": "%",
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"10%"`);
});

it('simplifies expressions as we go', () => {
  const num = getDefined(parseSimpleValue('$10/sqft'));

  expect(num).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      },
      "unit": {
        "args": [
          {
            "args": [
              "/",
            ],
            "type": "funcref",
          },
          {
            "args": [
              {
                "args": [
                  "$",
                ],
                "end": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "start": {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "ref",
              },
              {
                "args": [
                  "sqft",
                ],
                "end": {
                  "char": 7,
                  "column": 8,
                  "line": 1,
                },
                "start": {
                  "char": 4,
                  "column": 5,
                  "line": 1,
                },
                "type": "ref",
              },
            ],
            "type": "argument-list",
          },
        ],
        "type": "function-call",
      },
    }
  `);

  expect(simpleValueToString(num)).toMatchInlineSnapshot(`"10 $ / sqft"`);
});
