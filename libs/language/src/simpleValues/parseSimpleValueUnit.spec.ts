import { parseSimpleValueUnit } from './parseSimpleValueUnit';

it('doesnt read numbers', () => {
  expect(parseSimpleValueUnit('10 km')).toMatchInlineSnapshot(`undefined`);
});

it('gets a unit from user input', () => {
  expect(parseSimpleValueUnit('')).toMatchInlineSnapshot(`undefined`);

  expect(parseSimpleValueUnit('%')).toMatchInlineSnapshot(`"%"`);

  expect(parseSimpleValueUnit('meter')).toMatchInlineSnapshot(`
    Object {
      "args": Array [
        "meter",
      ],
      "end": Object {
        "char": 4,
        "column": 5,
        "line": 1,
      },
      "start": Object {
        "char": 0,
        "column": 1,
        "line": 1,
      },
      "type": "ref",
    }
  `);

  expect(parseSimpleValueUnit('km/second**2')).toMatchInlineSnapshot(`
    Object {
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
                "char": 1,
                "column": 2,
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
                        "second",
                      ],
                      "end": Object {
                        "char": 8,
                        "column": 9,
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
                        "number",
                        DeciNumber {
                          "d": 1n,
                          "infinite": false,
                          "n": 2n,
                          "s": 1n,
                        },
                      ],
                      "end": Object {
                        "char": 11,
                        "column": 12,
                        "line": 1,
                      },
                      "start": Object {
                        "char": 11,
                        "column": 12,
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
    }
  `);
});

it('ignores syntax errors and non-simplevalues', () => {
  expect(parseSimpleValueUnit('syntax//error')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(parseSimpleValueUnit('complex(expression)')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(parseSimpleValueUnit('complex(expression)')).toMatchInlineSnapshot(
    `undefined`
  );

  expect(
    parseSimpleValueUnit('ImNotACustomUnit', new Set(['ImNotACustomUnit']))
  ).toMatchInlineSnapshot(`undefined`);
});
