/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  afterAll,
  beforeAll,
} from 'vitest';
// eslint-disable-next-line no-restricted-imports
import { c, r } from '@decipad/language-utils';
import type { Result } from '@decipad/language-interfaces';
import { createRemoteComputerClient } from './RemoteComputerClient';
import { getIdentifiedBlocks, pushResultToComputer } from '../testUtils';
import type { RemoteComputerClient } from '../types/misc';
import { buildResult, materializeResult, runCode } from '..';
import { N } from '@decipad/number';
import { getDefined, timeout } from '@decipad/utils';
import { serializeResult } from '@decipad/computer-utils';
import { Subscription } from 'rxjs';

describe('remote computer client', () => {
  const onError = (err: Error) => {
    throw err;
  };

  let computer: RemoteComputerClient;

  beforeEach(async () => {
    computer = (await createRemoteComputerClient(
      'notebookId',
      onError
    )) as RemoteComputerClient;
  });

  afterEach(() => computer.terminate());

  const previousCaches = globalThis.caches;
  const previousLocation = globalThis.location;
  const hits = new Map<string, number>();

  afterEach(() => {
    hits.clear();
  });

  beforeAll(() => {
    const cache = new Map<string, Response>();
    globalThis.caches = {
      open: (cacheName: string) => {
        expect(cacheName).toBe('decipad');
        return {
          match: async (key: string) => {
            const got = cache.get(key);
            if (got) {
              hits.set(key, (hits.get(key) || 0) + 1);
            }
            return got;
          },
          put: async (key: string, value: Response) => {
            // console.log('putting', key, value);
            cache.set(key, value);
          },
        };
      },
    } as unknown as typeof globalThis.caches;

    globalThis.location = new URL('https://decipad.com') as unknown as Location;
  });

  afterAll(() => {
    globalThis.caches = previousCaches;
    globalThis.location = previousLocation;
  });

  it('can push compute delta and observe results', async () => {
    computer.pushComputeDelta({
      program: {
        upsert: getIdentifiedBlocks(
          'A = 1',
          'B = 2',
          'C = A + B',
          'T = {}',
          'T.C1 = [1, 2 ,3]'
        ),
      },
    });

    const waitForResult$ = async () => {
      await new Promise<void>((resolve, reject) => {
        const subscription = computer.results$
          .observe()
          .subscribe(async (results) => {
            try {
              if (!Object.values(results.blockResults).length) {
                return;
              }
              expect(results).toMatchInlineSnapshot(`
                {
                  "blockResults": {
                    "block-0": {
                      "epoch": 1n,
                      "id": "block-0",
                      "result": {
                        "meta": [Function],
                        "type": {
                          "kind": "number",
                          "unit": null,
                        },
                        "value": DeciNumber {
                          "d": 1n,
                          "infinite": false,
                          "n": 1n,
                          "s": 1n,
                        },
                      },
                      "type": "computer-result",
                      "usedNames": [],
                      "visibleVariables": {
                        "global": Set {
                          "exprRef_block_0",
                          "A",
                          "exprRef_block_1",
                          "B",
                          "exprRef_block_2",
                          "C",
                          "exprRef_block_3",
                          "exprRef_block_3.C1",
                          "T.C1",
                          "T",
                          "exprRef_block_4",
                        },
                        "local": Set {},
                      },
                    },
                    "block-1": {
                      "epoch": 1n,
                      "id": "block-1",
                      "result": {
                        "meta": [Function],
                        "type": {
                          "kind": "number",
                          "unit": null,
                        },
                        "value": DeciNumber {
                          "d": 1n,
                          "infinite": false,
                          "n": 2n,
                          "s": 1n,
                        },
                      },
                      "type": "computer-result",
                      "usedNames": [],
                      "visibleVariables": {
                        "global": Set {
                          "exprRef_block_0",
                          "A",
                          "exprRef_block_1",
                          "B",
                          "exprRef_block_2",
                          "C",
                          "exprRef_block_3",
                          "exprRef_block_3.C1",
                          "T.C1",
                          "T",
                          "exprRef_block_4",
                        },
                        "local": Set {},
                      },
                    },
                    "block-2": {
                      "epoch": 1n,
                      "id": "block-2",
                      "result": {
                        "meta": [Function],
                        "type": {
                          "kind": "number",
                          "unit": null,
                        },
                        "value": DeciNumber {
                          "d": 1n,
                          "infinite": false,
                          "n": 3n,
                          "s": 1n,
                        },
                      },
                      "type": "computer-result",
                      "usedNames": [
                        [
                          "",
                          "A",
                        ],
                        [
                          "",
                          "B",
                        ],
                      ],
                      "visibleVariables": {
                        "global": Set {
                          "exprRef_block_0",
                          "A",
                          "exprRef_block_1",
                          "B",
                          "exprRef_block_2",
                          "C",
                          "exprRef_block_3",
                          "exprRef_block_3.C1",
                          "T.C1",
                          "T",
                          "exprRef_block_4",
                        },
                        "local": Set {},
                      },
                    },
                    "block-3": {
                      "epoch": 1n,
                      "id": "block-3",
                      "result": {
                        "meta": [Function],
                        "type": {
                          "columnNames": [
                            "C1",
                          ],
                          "columnTypes": [
                            {
                              "kind": "number",
                              "unit": null,
                            },
                          ],
                          "delegatesIndexTo": "exprRef_block_3",
                          "indexName": "exprRef_block_3",
                          "kind": "table",
                        },
                        "value": [
                          [Function],
                        ],
                      },
                      "type": "computer-result",
                      "usedNames": [],
                      "visibleVariables": {
                        "global": Set {
                          "exprRef_block_0",
                          "A",
                          "exprRef_block_1",
                          "B",
                          "exprRef_block_2",
                          "C",
                          "exprRef_block_3",
                          "exprRef_block_3.C1",
                          "T.C1",
                          "T",
                          "exprRef_block_4",
                        },
                        "local": Set {
                          "C1",
                        },
                      },
                    },
                    "block-4": {
                      "epoch": 1n,
                      "id": "block-4",
                      "result": {
                        "meta": [Function],
                        "type": {
                          "cellType": {
                            "kind": "number",
                            "unit": null,
                          },
                          "indexedBy": "exprRef_block_3",
                          "kind": "column",
                        },
                        "value": [Function],
                      },
                      "type": "computer-result",
                      "usedNames": [],
                      "visibleVariables": {
                        "global": Set {
                          "exprRef_block_0",
                          "A",
                          "exprRef_block_1",
                          "B",
                          "exprRef_block_2",
                          "C",
                          "exprRef_block_3",
                          "exprRef_block_3.C1",
                          "T.C1",
                          "T",
                          "exprRef_block_4",
                        },
                        "local": Set {
                          "C1",
                        },
                      },
                    },
                  },
                }
              `);
              subscription?.unsubscribe();
              resolve();
            } catch (err) {
              reject(err);
            }
          });
      });
    };

    const waitForResult = async () => {
      return new Promise<void>((resolve, reject) => {
        const subscription = computer.results.subscribe((results) => {
          try {
            if (!Object.values(results.blockResults).length) {
              return;
            }
            expect(results).toMatchInlineSnapshot(`
              {
                "blockResults": {
                  "block-0": {
                    "epoch": 1n,
                    "id": "block-0",
                    "result": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 1n,
                        "s": 1n,
                      },
                    },
                    "type": "computer-result",
                    "usedNames": [],
                    "visibleVariables": {
                      "global": Set {
                        "exprRef_block_0",
                        "A",
                        "exprRef_block_1",
                        "B",
                        "exprRef_block_2",
                        "C",
                        "exprRef_block_3",
                        "exprRef_block_3.C1",
                        "T.C1",
                        "T",
                        "exprRef_block_4",
                      },
                      "local": Set {},
                    },
                  },
                  "block-1": {
                    "epoch": 1n,
                    "id": "block-1",
                    "result": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 2n,
                        "s": 1n,
                      },
                    },
                    "type": "computer-result",
                    "usedNames": [],
                    "visibleVariables": {
                      "global": Set {
                        "exprRef_block_0",
                        "A",
                        "exprRef_block_1",
                        "B",
                        "exprRef_block_2",
                        "C",
                        "exprRef_block_3",
                        "exprRef_block_3.C1",
                        "T.C1",
                        "T",
                        "exprRef_block_4",
                      },
                      "local": Set {},
                    },
                  },
                  "block-2": {
                    "epoch": 1n,
                    "id": "block-2",
                    "result": {
                      "meta": [Function],
                      "type": {
                        "kind": "number",
                        "unit": null,
                      },
                      "value": DeciNumber {
                        "d": 1n,
                        "infinite": false,
                        "n": 3n,
                        "s": 1n,
                      },
                    },
                    "type": "computer-result",
                    "usedNames": [
                      [
                        "",
                        "A",
                      ],
                      [
                        "",
                        "B",
                      ],
                    ],
                    "visibleVariables": {
                      "global": Set {
                        "exprRef_block_0",
                        "A",
                        "exprRef_block_1",
                        "B",
                        "exprRef_block_2",
                        "C",
                        "exprRef_block_3",
                        "exprRef_block_3.C1",
                        "T.C1",
                        "T",
                        "exprRef_block_4",
                      },
                      "local": Set {},
                    },
                  },
                  "block-3": {
                    "epoch": 1n,
                    "id": "block-3",
                    "result": {
                      "meta": [Function],
                      "type": {
                        "columnNames": [
                          "C1",
                        ],
                        "columnTypes": [
                          {
                            "kind": "number",
                            "unit": null,
                          },
                        ],
                        "delegatesIndexTo": "exprRef_block_3",
                        "indexName": "exprRef_block_3",
                        "kind": "table",
                      },
                      "value": [
                        [Function],
                      ],
                    },
                    "type": "computer-result",
                    "usedNames": [],
                    "visibleVariables": {
                      "global": Set {
                        "exprRef_block_0",
                        "A",
                        "exprRef_block_1",
                        "B",
                        "exprRef_block_2",
                        "C",
                        "exprRef_block_3",
                        "exprRef_block_3.C1",
                        "T.C1",
                        "T",
                        "exprRef_block_4",
                      },
                      "local": Set {
                        "C1",
                      },
                    },
                  },
                  "block-4": {
                    "epoch": 1n,
                    "id": "block-4",
                    "result": {
                      "meta": [Function],
                      "type": {
                        "cellType": {
                          "kind": "number",
                          "unit": null,
                        },
                        "indexedBy": "exprRef_block_3",
                        "kind": "column",
                      },
                      "value": [Function],
                    },
                    "type": "computer-result",
                    "usedNames": [],
                    "visibleVariables": {
                      "global": Set {
                        "exprRef_block_0",
                        "A",
                        "exprRef_block_1",
                        "B",
                        "exprRef_block_2",
                        "C",
                        "exprRef_block_3",
                        "exprRef_block_3.C1",
                        "T.C1",
                        "T",
                        "exprRef_block_4",
                      },
                      "local": Set {
                        "C1",
                      },
                    },
                  },
                },
              }
            `);
            subscription?.unsubscribe();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      });
    };

    await Promise.all([waitForResult$(), waitForResult()]);

    expect(await computer.getBlockIdResult('block-0')).toMatchInlineSnapshot(`
      {
        "epoch": 1n,
        "id": "block-0",
        "result": {
          "meta": [Function],
          "type": {
            "kind": "number",
            "unit": null,
          },
          "value": DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        },
        "type": "computer-result",
        "usedNames": [],
        "visibleVariables": {
          "global": Set {
            "exprRef_block_0",
            "A",
            "exprRef_block_1",
            "B",
            "exprRef_block_2",
            "C",
            "exprRef_block_3",
            "exprRef_block_3.C1",
            "T.C1",
            "T",
            "exprRef_block_4",
          },
          "local": Set {},
        },
      }
    `);

    expect(await computer.expressionResult(r('A'))).toMatchInlineSnapshot(`
      {
        "__encoded": {
          "meta": ArrayBuffer [],
          "type": ArrayBuffer [],
          "value": ArrayBuffer [],
        },
        "meta": [Function],
        "type": {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
      }
    `);

    expect(await computer.getStatement('block-0')).toMatchInlineSnapshot(
      `
      {
        "args": [
          {
            "args": [
              "A",
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
            "type": "def",
          },
          {
            "args": [
              "number",
              DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
            ],
            "end": {
              "char": 4,
              "column": 5,
              "line": 1,
            },
            "start": {
              "char": 4,
              "column": 5,
              "line": 1,
            },
            "type": "literal",
          },
        ],
        "end": {
          "char": 4,
          "column": 5,
          "line": 1,
        },
        "start": {
          "char": 0,
          "column": 1,
          "line": 1,
        },
        "type": "assign",
      }
    `
    );

    expect(
      await computer.getSymbolDefinedInBlock('block-0')
    ).toMatchInlineSnapshot(`"A"`);

    expect(computer.variableExists('A')).toBe(true);
    expect(computer.variableExists('DOES NOT EXIST')).toBe(false);

    expect(computer.getAvailableIdentifier('A')).toBe('A2');
    expect(computer.getAvailableIdentifier('A', 10)).toBe('A10');
    expect(computer.getAvailableIdentifier('Z', 1, true)).toBe('Z');
    expect(computer.getVarBlockId('A')).toBe('block-0');
    expect(computer.getVarBlockId('Z')).toBe(undefined);

    expect(
      await computer.expressionType(
        c('+', r('exprRef_block_0'), r('exprRef_block_1'))
      )
    ).toMatchInlineSnapshot(`
      {
        "kind": "number",
        "unit": undefined,
      }
    `);

    expect(await computer.getNamesDefined('block-0')).toMatchInlineSnapshot(`
      [
        {
          "blockId": "block-1",
          "kind": "variable",
          "name": "B",
          "type": {
            "kind": "number",
            "unit": null,
          },
        },
        {
          "blockId": "block-2",
          "kind": "variable",
          "name": "C",
          "type": {
            "kind": "number",
            "unit": null,
          },
        },
        {
          "blockId": "block-3",
          "kind": "variable",
          "name": "T",
          "type": {
            "columnNames": [],
            "columnTypes": [],
            "indexName": "exprRef_block_3",
            "kind": "table",
          },
        },
        {
          "blockId": "block-3",
          "columnId": "block-4",
          "inTable": "T",
          "isLocal": false,
          "kind": "column",
          "name": "T.C1",
          "type": {
            "cellType": {
              "kind": "number",
              "unit": null,
            },
            "indexedBy": "exprRef_block_3",
            "kind": "column",
          },
        },
      ]
    `);

    expect(await computer.getUnitFromText('32 bananas per squaremile'))
      .toMatchInlineSnapshot(`
        [
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
          {
            "aliasFor": undefined,
            "baseQuantity": "area",
            "baseSuperQuantity": "area",
            "exp": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": -1n,
            },
            "known": true,
            "multiplier": DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 1n,
              "s": 1n,
            },
            "unit": "squaremiles",
          },
        ]
      `);

    let subscription: Subscription | undefined;

    // test listeners
    await new Promise<void>((resolve) => {
      subscription = computer.getParseableTypeInBlock$
        .observe('block-0')
        .subscribe((result) => {
          if (result == null) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            {
              "kind": "number",
              "varName": "exprRef_block_0",
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getBlockIdResult$
        .observe('block-2')
        .subscribe((result) => {
          if (result == null) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            {
              "epoch": 1n,
              "id": "block-2",
              "result": {
                "meta": [Function],
                "type": {
                  "kind": "number",
                  "unit": null,
                },
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 3n,
                  "s": 1n,
                },
              },
              "type": "computer-result",
              "usedNames": [
                [
                  "",
                  "A",
                ],
                [
                  "",
                  "B",
                ],
              ],
              "visibleVariables": {
                "global": Set {
                  "exprRef_block_0",
                  "A",
                  "exprRef_block_1",
                  "B",
                  "exprRef_block_2",
                  "C",
                  "exprRef_block_3",
                  "exprRef_block_3.C1",
                  "T.C1",
                  "T",
                  "exprRef_block_4",
                },
                "local": Set {},
              },
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer
        .expressionResultFromText$('C')
        .subscribe((result) => {
          if (result.type.kind === 'anything') {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            {
              "__encoded": {
                "meta": ArrayBuffer [],
                "type": ArrayBuffer [],
                "value": ArrayBuffer [],
              },
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": null,
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 3n,
                "s": 1n,
              },
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer
        .blockResultFromText$('32 kilomenters per mile')
        .subscribe((result) => {
          if (result.type.kind === 'anything') {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            {
              "__encoded": {
                "meta": ArrayBuffer [],
                "type": ArrayBuffer [],
                "value": ArrayBuffer [],
              },
              "meta": [Function],
              "type": {
                "kind": "number",
                "unit": [
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
                      "n": 1000n,
                      "s": 1n,
                    },
                    "unit": "menters",
                  },
                  {
                    "aliasFor": undefined,
                    "baseQuantity": "length",
                    "baseSuperQuantity": "length",
                    "exp": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 1n,
                      "s": -1n,
                    },
                    "known": true,
                    "multiplier": DeciNumber {
                      "d": 1n,
                      "infinite": false,
                      "n": 1n,
                      "s": 1n,
                    },
                    "unit": "miles",
                  },
                ],
              },
              "value": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 32000n,
                "s": 1n,
              },
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getVarResult$
        .observe('exprRef_block_2')
        .subscribe((result) => {
          if (result == null) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            {
              "epoch": 1n,
              "id": "block-2",
              "result": {
                "meta": [Function],
                "type": {
                  "kind": "number",
                  "unit": null,
                },
                "value": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 3n,
                  "s": 1n,
                },
              },
              "type": "computer-result",
              "usedNames": [
                [
                  "",
                  "A",
                ],
                [
                  "",
                  "B",
                ],
              ],
              "visibleVariables": {
                "global": Set {
                  "exprRef_block_0",
                  "A",
                  "exprRef_block_1",
                  "B",
                  "exprRef_block_2",
                  "C",
                  "exprRef_block_3",
                  "exprRef_block_3.C1",
                  "T.C1",
                  "T",
                  "exprRef_block_4",
                },
                "local": Set {},
              },
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getSetOfNamesDefined$
        .observe()
        .subscribe((result) => {
          if (result.size === 0) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            Set {
              "A",
              "B",
              "C",
              "T",
            }
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getNamesDefined$.observe().subscribe((result) => {
        if (result.length === 0) {
          return;
        }
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "blockId": "block-0",
                "kind": "variable",
                "name": "A",
                "type": {
                  "kind": "number",
                  "unit": null,
                },
              },
              {
                "blockId": "block-1",
                "kind": "variable",
                "name": "B",
                "type": {
                  "kind": "number",
                  "unit": null,
                },
              },
              {
                "blockId": "block-2",
                "kind": "variable",
                "name": "C",
                "type": {
                  "kind": "number",
                  "unit": null,
                },
              },
              {
                "blockId": "block-3",
                "kind": "variable",
                "name": "T",
                "type": {
                  "columnNames": [],
                  "columnTypes": [],
                  "indexName": "exprRef_block_3",
                  "kind": "table",
                },
              },
              {
                "blockId": "block-3",
                "columnId": "block-4",
                "inTable": "T",
                "isLocal": false,
                "kind": "column",
                "name": "T.C1",
                "type": {
                  "cellType": {
                    "kind": "number",
                    "unit": null,
                  },
                  "indexedBy": "exprRef_block_3",
                  "kind": "column",
                },
              },
            ]
          `);
        resolve();
      });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.blocksInUse$
        .observe('block-0', 'block-1', 'block-2')
        .subscribe((result) => {
          if (result.length === 0) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            [
              {
                "dependentBlockIds": [
                  "block-2",
                ],
                "inBlockId": "block-0",
                "varName": "A",
              },
              {
                "dependentBlockIds": [
                  "block-2",
                ],
                "inBlockId": "block-1",
                "varName": "B",
              },
            ]
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getSymbolDefinedInBlock$
        .observe('block-3')
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`"T"`);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getColumnNameDefinedInBlock$
        .observe('block-4')
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`"C1"`);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getVarBlockId$
        .observe('T')
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`"block-3"`);
          resolve();
        });
    });
    subscription?.unsubscribe();

    let columnResult: Result.Result<'column'>;

    await new Promise<void>((resolve) => {
      subscription = computer.getAllColumns$
        .observe('block-3')
        .subscribe(async (result) => {
          if (!result.length) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            [
              {
                "blockId": "block-4",
                "blockType": {
                  "cellType": {
                    "kind": "number",
                    "unit": null,
                  },
                  "indexedBy": "exprRef_block_3",
                  "kind": "column",
                },
                "columnName": "C1",
                "readableTableName": "T",
                "result": {
                  "__encoded": {
                    "meta": ArrayBuffer [],
                    "type": ArrayBuffer [],
                    "value": ArrayBuffer [],
                  },
                  "meta": [Function],
                  "type": {
                    "cellType": {
                      "kind": "number",
                      "unit": null,
                    },
                    "indexedBy": "exprRef_block_3",
                    "kind": "column",
                  },
                  "value": [Function],
                },
                "tableName": "exprRef_block_3",
              },
            ]
          `);
          columnResult = result[0].result;
          expect(await materializeResult(result[0].result))
            .toMatchInlineSnapshot(`
              {
                "__encoded": {
                  "meta": ArrayBuffer [],
                  "type": ArrayBuffer [],
                  "value": ArrayBuffer [],
                },
                "meta": [Function],
                "type": {
                  "cellType": {
                    "kind": "number",
                    "unit": null,
                  },
                  "indexedBy": "exprRef_block_3",
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
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 3n,
                    "s": 1n,
                  },
                ],
              }
            `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getBlockIdAndColumnId$
        .observe('block-4')
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`
            [
              "block-3",
              "block-4",
            ]
          `);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.explainDimensions$
        .observe(columnResult)
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`Promise {}`);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.getSymbolOrTableDotColumn$
        .observe('block-4', 'T')
        .subscribe((result) => {
          if (!result) {
            return;
          }
          expect(result).toMatchInlineSnapshot(`"T.C1"`);
          resolve();
        });
    });
    subscription?.unsubscribe();

    await new Promise<void>((resolve) => {
      subscription = computer.blockToMathML$('block-1').subscribe((result) => {
        if (!result) {
          return;
        }
        expect(result).toMatchInlineSnapshot(`"<math><mn>2</mn></math>"`);
        resolve();
      });
    });
    subscription?.unsubscribe();

    await computer.pushComputeDelta({
      external: {
        upsert: {
          'external-ref-id-1': buildResult(
            {
              kind: 'materialized-column',
              indexedBy: null,
              cellType: { kind: 'number', unit: null },
            },
            [N(10), N(20), N(30)]
          ),
        },
      },
      extra: {
        upsert: new Map([
          [
            'block-extra-1',
            [
              {
                type: 'identified-block',
                id: 'block-extra-1',
                block: {
                  type: 'block',
                  id: 'block-extra-1',
                  args: [
                    {
                      type: 'assign',
                      args: [
                        {
                          type: 'def',
                          args: ['exported-1'],
                        },
                        {
                          type: 'externalref',
                          args: ['external-ref-id-1'],
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          ],
        ]),
      },
    });

    await timeout(1000); // TODO: remove

    await new Promise<void>((resolve) => {
      subscription = computer.getVarResult$
        .observe('exported-1')
        .subscribe(async (result) => {
          if (result == null) {
            return;
          }
          expect(await materializeResult(getDefined(result.result)))
            .toMatchInlineSnapshot(`
              {
                "meta": [Function],
                "type": {
                  "cellType": {
                    "kind": "number",
                    "unit": null,
                  },
                  "indexedBy": null,
                  "kind": "column",
                },
                "value": [
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 10n,
                    "s": 1n,
                  },
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 20n,
                    "s": 1n,
                  },
                  DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 30n,
                    "s": 1n,
                  },
                ],
              }
            `);
          resolve();
        });
    });
    subscription?.unsubscribe();
  }, 10000);

  it('can push tables and columns', async () => {
    const { type, value } = await runCode(
      'Table1 = { Column1 = [1], Column2 = [2] }\nTable1'
    );
    const result = serializeResult(type, value, undefined);

    pushResultToComputer(computer, 'block-id', 'varName', result);

    let subscription: Subscription | undefined;

    await new Promise<void>((resolve, reject) => {
      subscription = computer.results$.observe().subscribe(async (results) => {
        try {
          if (!Object.values(results.blockResults).length) {
            return;
          }
          subscription?.unsubscribe();
          expect(results).toMatchInlineSnapshot(`
            {
              "blockResults": {
                "block-id": {
                  "epoch": 1n,
                  "id": "block-id",
                  "result": {
                    "meta": [Function],
                    "type": {
                      "columnNames": [
                        "Column1",
                        "Column2",
                      ],
                      "columnTypes": [
                        {
                          "kind": "number",
                          "unit": null,
                        },
                        {
                          "kind": "number",
                          "unit": null,
                        },
                      ],
                      "delegatesIndexTo": "exprRef_block_id",
                      "indexName": "exprRef_block_id",
                      "kind": "table",
                    },
                    "value": [
                      [Function],
                      [Function],
                    ],
                  },
                  "type": "computer-result",
                  "usedNames": [],
                  "visibleVariables": {
                    "global": Set {
                      "exprRef_block_id",
                      "exprRef_block_id.Column1",
                      "exprRef_block_id.Column2",
                      "varName.Column1",
                      "varName.Column2",
                      "varName",
                      "exprRef_block_id__0",
                      "exprRef_block_id__1",
                    },
                    "local": Set {
                      "Column1",
                      "Column2",
                    },
                  },
                },
                "block-id--0": {
                  "epoch": 1n,
                  "id": "block-id--0",
                  "result": {
                    "meta": [Function],
                    "type": {
                      "cellType": {
                        "kind": "number",
                        "unit": null,
                      },
                      "indexedBy": "exprRef_block_id",
                      "kind": "column",
                    },
                    "value": [Function],
                  },
                  "type": "computer-result",
                  "usedNames": [],
                  "visibleVariables": {
                    "global": Set {
                      "exprRef_block_id",
                      "exprRef_block_id.Column1",
                      "exprRef_block_id.Column2",
                      "varName.Column1",
                      "varName.Column2",
                      "varName",
                      "exprRef_block_id__0",
                      "exprRef_block_id__1",
                    },
                    "local": Set {
                      "Column1",
                      "Column2",
                    },
                  },
                },
                "block-id--1": {
                  "epoch": 1n,
                  "id": "block-id--1",
                  "result": {
                    "meta": [Function],
                    "type": {
                      "cellType": {
                        "kind": "number",
                        "unit": null,
                      },
                      "indexedBy": "exprRef_block_id",
                      "kind": "column",
                    },
                    "value": [Function],
                  },
                  "type": "computer-result",
                  "usedNames": [],
                  "visibleVariables": {
                    "global": Set {
                      "exprRef_block_id",
                      "exprRef_block_id.Column1",
                      "exprRef_block_id.Column2",
                      "varName.Column1",
                      "varName.Column2",
                      "varName",
                      "exprRef_block_id__0",
                      "exprRef_block_id__1",
                    },
                    "local": Set {
                      "Column1",
                      "Column2",
                    },
                  },
                },
              },
            }
          `);
          resolve();
        } catch (err) {
          return reject(err);
        }
      });
    });
    subscription?.unsubscribe();
  }, 10000);
});
