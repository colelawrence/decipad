import { getDefined } from '@decipad/utils';
import { Computer } from './computer';
import { getIdentifiedBlocks } from './testUtils';
import { getExprRef, materializeResult } from '.';

describe('abstract refs', () => {
  it('no ref works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('2');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult = results.blockResults['block-0']?.result;
    expect(columnResult && (await materializeResult(columnResult)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      }
    `);
  });

  it('no ref operation works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 2', '_B = _A + 1');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const result = results.blockResults['block-1']?.result;
    expect(result && (await materializeResult(result))).toMatchInlineSnapshot(`
      Object {
        "type": Object {
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
  });

  it('recompute with no ref works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 2', '_B = _A + 1');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const result = results.blockResults['block-1']?.result;

    const results2 = getDefined(await computer.computeRequest({ program: p1 }));
    const result2 = results2.blockResults['block-1']?.result;
    expect(result2 && (await materializeResult(result2))).toEqual(result);
  });

  it('recompute with new block with no ref works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 2', '_B = _A + 1');
    await computer.computeRequest({ program: p1 });

    // add a block
    p1.push(getIdentifiedBlocks('_A = 2', '_B = _A + 1', '_C = _B + 2')[2]);
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const result = results.blockResults['block-2']?.result;
    expect(result && (await materializeResult(result))).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      }
    `);
  });

  it('recompute with removed block with no ref works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 2', '_B = _A + 1');
    await computer.computeRequest({ program: p1 });

    // add a block
    p1.push(getIdentifiedBlocks('_A = 2', '_B = _A + 1', '_C = _B + 2')[2]);
    await computer.computeRequest({ program: p1 });

    p1.splice(0, 1);
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const result = results.blockResults['block-2']?.result;
    expect(result && (await materializeResult(result))).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      }
    `);
  });

  it('column name equal to global name works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks(
      'A1 = 2',
      'T1 = {}',
      'T1.A1 = [1, 2, 3]',
      'T1.B1 = A1 + 10'
    );
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult = results.blockResults['block-3']?.result;
    expect(columnResult && (await materializeResult(columnResult)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_block_1",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 13n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('column name equal to global name works (exprRefs)', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks(
      'A1 = 123',
      'T1 = {}',
      'T1.A1 = [1, 2, 3]',
      `T1.B1 = ${getExprRef('block-2')} + ${getExprRef('block-0')}`
    );
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult1 = results.blockResults['block-3']?.result;
    expect(columnResult1 && (await materializeResult(columnResult1)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_block_1",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 124n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 125n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 126n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('expression ref to column assign works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks(
      'T1 = {}',
      'T1.A1 = [1, 2, 3]',
      `C2 = ${getExprRef('block-1')} + 10`
    );
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult1 = results.blockResults['block-2']?.result;
    expect(columnResult1 && (await materializeResult(columnResult1)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": null,
          },
          "indexedBy": "exprRef_block_0",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 11n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 12n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 13n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('expression ref to block with expression works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('123', `${getExprRef('block-0')} + 10`);
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult1 = results.blockResults['block-1']?.result;
    expect(columnResult1 && (await materializeResult(columnResult1)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 133n,
          "s": 1n,
        },
      }
    `);

    const columnResult2 = results.blockResults['block-4']?.result;
    expect(
      columnResult2 && (await materializeResult(columnResult2))
    ).toMatchInlineSnapshot(`undefined`);

    const columnResult3 = results.blockResults['block-5']?.result;
    expect(
      columnResult3 && (await materializeResult(columnResult3))
    ).toMatchInlineSnapshot(`undefined`);
  });

  it('variable name equal to constant works', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('B = 2', 'B');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    const columnResult = results.blockResults['block-1']?.result;
    expect(columnResult && (await materializeResult(columnResult)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      }
    `);
  });

  it('column name equal to table name works', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(`T1 = {
      T1 = [1, 2]
      T2 = T1 + 10
    }`);
    const results = getDefined(await computer.computeRequest({ program }));
    const columnResult = results.blockResults['block-0']?.result;
    expect(columnResult && (await materializeResult(columnResult)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "T1",
            "T2",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_block_0",
          "indexName": "exprRef_block_0",
          "kind": "table",
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
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 11n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 12n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });

  it('column assignments with expr refs all over works', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      `T1 = {}`,
      `T1.A = [1, 2, 3 ]`,
      `T2 = {}`,
      `T2.A =  [4, 5, 6 ]`,
      `T3 = concatenate(T1, T2)`,
      `T3.Col1 = [1, 2, 3]`,
      `T3`
    );

    const results = getDefined(await computer.computeRequest({ program }));
    const columnResult = results.blockResults['block-6']?.result;
    expect(columnResult && (await materializeResult(columnResult)))
      .toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "columnNames": Array [
            "A",
            "Col1",
          ],
          "columnTypes": Array [
            Object {
              "kind": "number",
              "unit": null,
            },
            Object {
              "kind": "number",
              "unit": null,
            },
          ],
          "delegatesIndexTo": "exprRef_block_0",
          "indexName": "exprRef_block_4",
          "kind": "table",
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
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 5n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 6n,
              "s": 1n,
            },
          ],
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
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 3n,
              "s": 1n,
            },
          ],
        ],
      }
    `);
  });

  it('user units work', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      'feather = 3 grams',
      '10 kg in feather'
    );
    const results = getDefined(await computer.computeRequest({ program }));
    const result = results.blockResults['block-1']?.result;
    expect(result).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
              "aliasFor": Array [
                Object {
                  "baseQuantity": "mass",
                  "baseSuperQuantity": "mass",
                  "exp": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "known": true,
                  "multiplier": DeciNumber {
                    "d": 1n,
                    "infinite": false,
                    "n": 1n,
                    "s": 1n,
                  },
                  "unit": "grams",
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
              "unit": "feather",
            },
          ],
        },
        "value": DeciNumber {
          "d": 3n,
          "infinite": false,
          "n": 10000n,
          "s": 1n,
        },
      }
    `);
  });

  it('over works', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      `Cars = {
        Type = ["suv", "hybrid", "standard"],
        FuelConsumption = [ 23 miles/gallon, 45 miles/gallon, 28 miles/gallon]
      }`,
      `BaseFuelPrice = 4 USD/gallon`,
      `Fuel = {
        Year = [date(2020) .. date(2025) by year],
        InterestRateFromYear = 1.08 ** (Year - date(2020) as years),
        Price = round(BaseFuelPrice * InterestRateFromYear, 2)
      }`,
      `EstimatedUsage = 100000 miles`,
      `GallonsSpent = (1 / Cars.FuelConsumption) * EstimatedUsage`,
      `DollarsSpentPerYear = round(Fuel.Price * GallonsSpent)`,
      `total(DollarsSpentPerYear over Cars)`
    );

    const results = getDefined(await computer.computeRequest({ program }));
    const result = await materializeResult(
      getDefined(results.blockResults['block-6']?.result)
    );
    expect(result).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "cellType": Object {
            "kind": "number",
            "unit": Array [
              Object {
                "baseQuantity": "USD",
                "baseSuperQuantity": "currency",
                "exp": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "known": true,
                "multiplier": DeciNumber {
                  "d": 1n,
                  "infinite": false,
                  "n": 1n,
                  "s": 1n,
                },
                "unit": "USD",
              },
            ],
          },
          "indexedBy": "exprRef_block_0",
          "kind": "column",
        },
        "value": Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 127608n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 65223n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 104823n,
            "s": 1n,
          },
        ],
      }
    `);
  });

  it('custom units work', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      `flour = 2 kg of flour`,
      `butter = 150 g of butter`,
      `ratio = butter / flour`
    );

    const results = getDefined(await computer.computeRequest({ program }));
    const result = await materializeResult(
      getDefined(results.blockResults['block-2']?.result)
    );
    expect(result).toMatchInlineSnapshot(`
      Object {
        "type": Object {
          "kind": "number",
          "unit": Array [
            Object {
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
                "n": 1000n,
                "s": 1n,
              },
              "quality": "flour",
              "unit": "g",
            },
            Object {
              "baseQuantity": "mass",
              "baseSuperQuantity": "mass",
              "exp": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "known": true,
              "multiplier": DeciNumber {
                "d": 1n,
                "infinite": false,
                "n": 1n,
                "s": 1n,
              },
              "quality": "butter",
              "unit": "g",
            },
          ],
        },
        "value": DeciNumber {
          "d": 40n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
      }
    `);
  });

  it.todo('column name with spaces works');
});
