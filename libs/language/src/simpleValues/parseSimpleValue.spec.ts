import { expect, it } from 'vitest';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { num } from '@decipad/language-utils';
import { parseSimpleValue } from './parseSimpleValue';

setupDeciNumberSnapshotSerializer();

it('parses a simple value and its unit', () => {
  expect(parseSimpleValue('')).toMatchInlineSnapshot(`undefined`);
  expect(parseSimpleValue('10')).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      },
      "unit": undefined,
    }
  `);
  expect(parseSimpleValue('10%')).toMatchInlineSnapshot(`
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
  expect(parseSimpleValue('10 km/s**-1')).toMatchInlineSnapshot(`
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
                  "km",
                ],
                "end": {
                  "char": 4,
                  "column": 5,
                  "line": 1,
                },
                "start": {
                  "char": 3,
                  "column": 4,
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
                          "s",
                        ],
                        "end": {
                          "char": 6,
                          "column": 7,
                          "line": 1,
                        },
                        "start": {
                          "char": 6,
                          "column": 7,
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
                            "n": 1n,
                            "s": -1n,
                          },
                        ],
                        "end": {
                          "char": 10,
                          "column": 11,
                          "line": 1,
                        },
                        "start": {
                          "char": 9,
                          "column": 10,
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
  expect(parseSimpleValue('$10/hour')).toMatchInlineSnapshot(`
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
                  "hour",
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
  expect(parseSimpleValue('10.33 seconds')).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 100n,
        "infinite": false,
        "n": 1033n,
        "s": 1n,
      },
      "unit": {
        "args": [
          "seconds",
        ],
        "end": {
          "char": 12,
          "column": 13,
          "line": 1,
        },
        "start": {
          "char": 6,
          "column": 7,
          "line": 1,
        },
        "type": "ref",
      },
    }
  `);
  expect(parseSimpleValue('10.33%')).toMatchInlineSnapshot(`
    {
      "ast": DeciNumber {
        "d": 100n,
        "infinite": false,
        "n": 1033n,
        "s": 1n,
      },
      "unit": "%",
    }
  `);
  expect(
    parseSimpleValue('10 definedvar', new Set(['definedvar']))
  ).toMatchInlineSnapshot(`undefined`);
});

it('disallows corner case numbers', () => {
  expect(parseSimpleValue(num(N(1, 0)))).toEqual(undefined);
  expect(parseSimpleValue(num(N(1, 3)))).toEqual(undefined);
});

it('works with edge cases', () => {
  expect(parseSimpleValue('-($5)')).toMatchInlineSnapshot(`undefined`);
});
