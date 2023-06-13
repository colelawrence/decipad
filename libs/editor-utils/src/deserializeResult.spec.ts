import { Unit } from '@decipad/computer';
import { OneResult } from 'libs/language/src/result';
import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { deserializeResult } from './deserializeResult';
// eslint-disable-next-line import/no-relative-packages

setupDeciNumberSnapshotSerializer();

describe('deserialize result', () => {
  it('works for numbers and units', () => {
    expect(
      deserializeResult({
        type: {
          kind: 'number',
          unit: [
            {
              exp: { n: 1, d: 1, s: 1 },
              multiplier: { n: 1, d: 1, s: 1 },
              aliasFor: [
                {
                  exp: { n: 1, d: 1, s: 1 },
                  multiplier: { n: 1, d: 1, s: 1 },
                  unit: 'bananas',
                  known: false,
                },
              ],

              unit: 'bananas',
              known: false,
            } as unknown as Unit,
          ],
        },
        value: { n: 1, d: 1, s: 1 } as unknown as OneResult,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "aliasFor": Array [
                Object {
                  "aliasFor": undefined,
                  "exp": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "known": false,
                  "multiplier": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "unit": "bananas",
                },
              ],
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": false,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "unit": "bananas",
            },
          ],
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
      }
    `);
  });

  it('works for columns of numbers', () => {
    expect(
      deserializeResult({
        type: {
          kind: 'column',
          indexedBy: '',
          cellType: {
            kind: 'number',
            unit: [
              {
                exp: { n: 1, d: 1, s: 1 },
                multiplier: { n: 1, d: 1, s: 1 },
                aliasFor: [
                  {
                    exp: { n: 1, d: 1, s: 1 },
                    multiplier: { n: 1, d: 1, s: 1 },
                    unit: 'bananas',
                    known: false,
                  },
                ],

                unit: 'bananas',
                known: false,
              } as unknown as Unit,
            ],
          },
        },
        value: [
          { n: 1, d: 1, s: 1 },
          { n: 2, d: 1, s: 1 },
        ] as unknown as OneResult,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": Array [
              Object {
                "aliasFor": Array [
                  Object {
                    "aliasFor": undefined,
                    "exp": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 1n,
                      "s": 1n,
                    },
                    "known": false,
                    "multiplier": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 1n,
                      "s": 1n,
                    },
                    "unit": "bananas",
                  },
                ],
                "exp": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "known": false,
                "multiplier": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "unit": "bananas",
              },
            ],
          },
          "indexedBy": "",
          "kind": "materialized-column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('works for tables with columns of numbers', () => {
    expect(
      deserializeResult({
        type: {
          kind: 'table',
          indexName: 'Column1',
          columnNames: ['Column1'],
          columnTypes: [
            {
              kind: 'number',
              unit: [
                {
                  exp: { n: 1, d: 1, s: 1 },
                  multiplier: { n: 1, d: 1, s: 1 },
                  aliasFor: [
                    {
                      exp: { n: 1, d: 1, s: 1 },
                      multiplier: { n: 1, d: 1, s: 1 },
                      unit: 'bananas',
                      known: false,
                    },
                  ],

                  unit: 'bananas',
                  known: false,
                } as unknown as Unit,
              ],
            },
          ],
        },
        value: [
          [
            { n: 1, d: 1, s: 1 },
            { n: 2, d: 1, s: 1 },
          ],
        ] as unknown as OneResult,
      })
    ).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "Column1",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": Array [
                Object {
                  "aliasFor": Array [
                    Object {
                      "aliasFor": undefined,
                      "exp": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 1n,
                        "s": 1n,
                      },
                      "known": false,
                      "multiplier": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 1n,
                        "s": 1n,
                      },
                      "unit": "bananas",
                    },
                  ],
                  "exp": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "known": false,
                  "multiplier": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "unit": "bananas",
                },
              ],
            },
          ],
          "indexName": "Column1",
          "kind": "materialized-table",
        },
        "value": Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 2n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });
});
