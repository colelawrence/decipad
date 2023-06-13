import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { num } from '../utils';
import { parseSimpleValue } from './parseSimpleValue';

setupDeciNumberSnapshotSerializer();

it('parses a simple value and its unit', () => {
  expect(parseSimpleValue('')).toMatchInlineSnapshot(`undefined`);
  expect(parseSimpleValue('10')).toMatchInlineSnapshot(`
    Object {
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
    Object {
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
    Object {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      },
      "unit": Object {
        "args": Array [
          Object {
            "args": Array [
              "/",
            ],
            "type": "funcref",
          },
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "km",
                ],
                "end": Object {
                  "char": 4,
                  "column": 5,
                  "line": 1,
                },
                "start": Object {
                  "char": 3,
                  "column": 4,
                  "line": 1,
                },
                "type": "ref",
              },
              Object {
                "args": Array [
                  Object {
                    "args": Array [
                      "**",
                    ],
                    "type": "funcref",
                  },
                  Object {
                    "args": Array [
                      Object {
                        "args": Array [
                          "s",
                        ],
                        "end": Object {
                          "char": 6,
                          "column": 7,
                          "line": 1,
                        },
                        "start": Object {
                          "char": 6,
                          "column": 7,
                          "line": 1,
                        },
                        "type": "ref",
                      },
                      Object {
                        "args": Array [
                          "number",
                          DeciNumber {
                            "d": 1n,
                            "infinite": false,
                            "n": 1n,
                            "s": -1n,
                          },
                        ],
                        "end": Object {
                          "char": 10,
                          "column": 11,
                          "line": 1,
                        },
                        "start": Object {
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
    Object {
      "ast": DeciNumber {
        "d": 1n,
        "infinite": false,
        "n": 10n,
        "s": 1n,
      },
      "unit": Object {
        "args": Array [
          Object {
            "args": Array [
              "/",
            ],
            "type": "funcref",
          },
          Object {
            "args": Array [
              Object {
                "args": Array [
                  "$",
                ],
                "end": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "start": Object {
                  "char": 0,
                  "column": 1,
                  "line": 1,
                },
                "type": "ref",
              },
              Object {
                "args": Array [
                  "hour",
                ],
                "end": Object {
                  "char": 7,
                  "column": 8,
                  "line": 1,
                },
                "start": Object {
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
    Object {
      "ast": DeciNumber {
        "d": 100n,
        "infinite": false,
        "n": 1033n,
        "s": 1n,
      },
      "unit": Object {
        "args": Array [
          "seconds",
        ],
        "end": Object {
          "char": 12,
          "column": 13,
          "line": 1,
        },
        "start": Object {
          "char": 6,
          "column": 7,
          "line": 1,
        },
        "type": "ref",
      },
    }
  `);
  expect(parseSimpleValue('10.33%')).toMatchInlineSnapshot(`
    Object {
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
