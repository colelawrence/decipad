import { Unit } from '@decipad/computer';
import { OneResult } from 'libs/language/src/result';
import { deserializeResult } from './deserializeResult';

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
                  "exp": DeciNumber(1),
                  "known": false,
                  "multiplier": DeciNumber(1),
                  "unit": "bananas",
                },
              ],
              "exp": DeciNumber(1),
              "known": false,
              "multiplier": DeciNumber(1),
              "unit": "bananas",
            },
          ],
        },
        "value": DeciNumber(1),
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
                    "exp": DeciNumber(1),
                    "known": false,
                    "multiplier": DeciNumber(1),
                    "unit": "bananas",
                  },
                ],
                "exp": DeciNumber(1),
                "known": false,
                "multiplier": DeciNumber(1),
                "unit": "bananas",
              },
            ],
          },
          "indexedBy": "",
          "kind": "column",
        },
        "value": Array [
          DeciNumber(1),
          DeciNumber(2),
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
                      "exp": DeciNumber(1),
                      "known": false,
                      "multiplier": DeciNumber(1),
                      "unit": "bananas",
                    },
                  ],
                  "exp": DeciNumber(1),
                  "known": false,
                  "multiplier": DeciNumber(1),
                  "unit": "bananas",
                },
              ],
            },
          ],
          "indexName": "Column1",
          "kind": "table",
        },
        "value": Array [
          Array [
            DeciNumber(1),
            DeciNumber(2),
          ],
        ],
      }
    `);
  });
});
