import { expect, describe, it } from 'vitest';
import type { Result, Unit } from '@decipad/language-interfaces';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { hydrateResult } from './hydrateResult';
import { materializeResult } from '..';
import { getDefined } from '@decipad/utils';

setupDeciNumberSnapshotSerializer();

describe('hydrateResult result', () => {
  it('works for numbers and units', () => {
    expect(
      hydrateResult({
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
        value: { n: 1, d: 1, s: 1 } as unknown as Result.OneResult,
        meta: undefined,
      })
    ).toMatchInlineSnapshot(`
      {
        "type": {
          "kind": "number",
          "unit": [
            {
              "aliasFor": [
                {
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

  it('works for columns of numbers', async () => {
    const hydratedResult: Result.Result = getDefined(
      hydrateResult({
        type: {
          kind: 'column',
          indexedBy: '',
          atParentIndex: null,
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
        ] as unknown as Result.OneResult,
        meta: () => ({
          labels: Promise.resolve([['1', '2']]),
        }),
      })
    );
    expect(await materializeResult(hydratedResult)).toMatchInlineSnapshot(`
      {
        "type": {
          "atParentIndex": null,
          "cellType": {
            "kind": "number",
            "unit": [
              {
                "aliasFor": [
                  {
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
          "kind": "column",
        },
        "value": [
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

  it('works for tables with columns of numbers', async () => {
    const hydratedResult: Result.Result = getDefined(
      hydrateResult({
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
        ] as unknown as Result.OneResult,
        meta: () => ({
          labels: Promise.resolve([['1', '2']]),
        }),
      })
    );
    expect(await materializeResult(hydratedResult)).toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "Column1",
          ],
          "columnTypes": [
            {
              "kind": "number",
              "unit": [
                {
                  "aliasFor": [
                    {
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
          "kind": "table",
        },
        "value": [
          [
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

  it('works for tables with columns of dates', async () => {
    const hydratedResult: Result.Result = getDefined(
      hydrateResult({
        type: {
          kind: 'table',
          indexName: 'Column1',
          columnNames: ['Column1'],
          columnTypes: [
            {
              kind: 'date',
              date: 'day',
            },
          ],
        },
        value: [[230293223n, 2392302123n]] as unknown as Result.OneResult,
        meta: () => ({
          labels: Promise.resolve([['2020-01-01', '2020-01-02']]),
        }),
      })
    );
    expect(await materializeResult(hydratedResult)).toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "Column1",
          ],
          "columnTypes": [
            {
              "date": "day",
              "kind": "date",
            },
          ],
          "indexName": "Column1",
          "kind": "table",
        },
        "value": [
          [
            230293223n,
            2392302123n,
          ],
        ],
      }
    `);
  });

  it('works for tables with columns of columns', async () => {
    const hydratedResult: Result.Result = getDefined(
      hydrateResult({
        type: {
          kind: 'table',
          indexName: 'Column1',
          columnNames: ['Column1'],
          columnTypes: [
            {
              kind: 'column',
              indexedBy: '',
              atParentIndex: null,
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
          ],
        },
        value: [
          [
            [N(1), N(2)],
            [N(3), N(4)],
          ],
        ] as unknown as Result.OneResult,
        meta: () => ({
          labels: Promise.resolve([['1', '2']]),
        }),
      })
    );
    expect(await materializeResult(hydratedResult)).toMatchInlineSnapshot(`
      {
        "type": {
          "columnNames": [
            "Column1",
          ],
          "columnTypes": [
            {
              "atParentIndex": null,
              "cellType": {
                "kind": "number",
                "unit": [
                  {
                    "aliasFor": [
                      {
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
              "kind": "column",
            },
          ],
          "indexName": "Column1",
          "kind": "table",
        },
        "value": [
          [
            [
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
            [
              DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 3n,
                "s": 1n,
              },
              DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 4n,
                "s": 1n,
              },
            ],
          ],
        ],
      }
    `);
  });
});
