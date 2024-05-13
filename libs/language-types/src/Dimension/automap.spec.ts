import type DeciNumber from '@decipad/number';
import { N, ZERO, setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { Type, buildType as t } from '../Type';
import {
  automapTypes,
  automapTypesForReducer,
  automapValues,
  automapValuesForReducer,
} from './automap';
import { materializeOneResult } from '../utils/materializeOneResult';
import type { Value } from '../Value';
import { Column, Scalar, Table, fromJS, getColumnLike } from '../Value';
import { makeContext } from './testUtils';

setupDeciNumberSnapshotSerializer();

// needed because JSON.stringify(BigInt) does not work
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

const bool = t.boolean();
const num = t.number();
const str = t.string();

const sumOne = async ([val]: Value[]): Promise<Value> => {
  let sum = ZERO;
  for await (const v of getColumnLike(val).values()) {
    sum = sum.add((await v.getData()) as DeciNumber);
  }
  return Scalar.fromValue(sum);
};

const sumFunctor = async ([type]: Type[]) =>
  (await type.reduced()).isScalar('number');

describe('automapTypes', () => {
  it('shallow', async () => {
    const calledOnTypes: Type[][] = [];

    const result = await automapTypes(makeContext(), [num, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(num);
    expect(calledOnTypes).toEqual([[num, str]]);
  });

  it('columns can be mapped with single type mapFns', async () => {
    const type = t.column(str);

    const calledOnTypes: Type[][] = [];
    const result = await automapTypes(
      makeContext(),
      [type, type],
      ([t1, t2]) => {
        calledOnTypes.push([t1, t2]);
        return t1;
      }
    );

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('can bump dimensions recursively', async () => {
    const type = t.column(t.column(t.column(str)));

    const calledOnTypes: Type[][] = [];
    const result = await automapTypes(
      makeContext(),
      [type, str],
      ([t1, t2]) => {
        calledOnTypes.push([t1, t2]);
        return t1;
      }
    );

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('compares columns and scalars on equal footing', async () => {
    const type = t.column(str);

    const calledOnTypes: Type[][] = [];
    const result = await automapTypes(
      makeContext(),
      [type, str],
      ([t1, t2]) => {
        calledOnTypes.push([t1, t2]);
        return t1;
      }
    );

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  const typeId = (t: Type[]) => t[0];

  it('ensures that cardinality is high enough for the expectedCardinality array', async () => {
    const error = await automapTypes(makeContext(), [t.number()], typeId, [
      [2],
    ]);
    expect(error.errorCause?.spec).toMatchObject({
      errType: 'expected-but-got',
      expectedButGot: [t.column(t.anything()), t.number()],
    });
  });

  /* eslint-disable-next-line jest/no-disabled-tests */
  it.skip('can automap types', async () => {
    const total = async ([a]: Type[]) => a.reduced();

    expect(
      await automapTypes(makeContext(), [t.column(num)], total, [[2]])
    ).toEqual(num);

    expect(
      await automapTypes(makeContext(), [t.column(t.column(num))], total, [[2]])
    ).toEqual(t.column(num));

    expect(
      await automapTypes(
        makeContext(),
        [t.column(num), t.column(num)],
        async ([scalar, col]: Type[]) =>
          Type.combine(scalar.isScalar('number'), col.isColumn(), str),
        [[1, 2]]
      )
    ).toEqual(t.column(str));

    expect(automapTypes(makeContext(), [num], total, [[2]])).toEqual(
      t.impossible('A column is required')
    );
  });

  it('Propagates errors from mapFn', async () => {
    const cond = async ([a, b, c]: Type[]) =>
      Type.combine(a.isScalar('boolean'), c.sameAs(b));
    const card = [[1, 1, 1]];

    expect(
      (
        await automapTypes(
          makeContext(),
          [t.column(bool), t.column(str), t.column(num)],
          cond,
          card
        )
      ).errorCause
    ).toBeDefined();
  });

  it('takes indexedBy of operands into account', async () => {
    expect(
      await automapTypes(
        makeContext(),
        [t.column(num, 'Idx1'), t.column(num, 'Idx1')],
        () => str
      )
    ).toMatchObject({
      indexedBy: 'Idx1',
    });

    const twoIndices = t.column(t.column(str, 'Idx2d'), 'Idx1');
    expect(
      await automapTypes(makeContext(), [twoIndices], () => str)
    ).toMatchObject({
      indexedBy: 'Idx1',
      cellType: {
        indexedBy: 'Idx2d',
      },
    });

    const indicesTwo = t.column(t.column(str, 'Idx2d'), 'Idx1');
    expect(
      await automapTypes(makeContext(), [indicesTwo], () => str)
    ).toMatchObject({
      indexedBy: 'Idx1',
      cellType: {
        indexedBy: 'Idx2d',
      },
    });
  });

  it('Can operate on two higher-dimensional types', async () => {
    expect(
      await automapTypes(
        makeContext(),
        [
          t.column(t.column(num, 'Index2'), 'Index1'),
          t.column(t.column(num, 'Index1'), 'Index2'),
        ],
        async ([a, b]) =>
          Type.combine((await a.sameAs(b)).isScalar('number'), str)
      )
    ).toMatchObject({
      indexedBy: 'Index1',
      cellType: {
        indexedBy: 'Index2',
        cellType: str,
      },
    });
  });

  it('Can heighten dimensions when it sees two index names', async () => {
    expect(
      await automapTypes(
        makeContext(),
        [t.column(num, 'Index1'), t.column(num, 'Index2')],
        () => str
      )
    ).toMatchObject({
      indexedBy: 'Index1',
      cellType: {
        indexedBy: 'Index2',
      },
    });

    expect(
      await automapTypes(
        makeContext(),
        [
          t.column(num, 'Index1'),
          t.column(num, 'Index2'),
          t.column(num, 'Index3'),
        ],
        () => str
      )
    ).toMatchObject({
      indexedBy: 'Index1',
      cellType: {
        indexedBy: 'Index2',
        cellType: {
          indexedBy: 'Index3',
        },
      },
    });
  });

  it('can take tables as arguments', async () => {
    const table = t.table({ columnNames: [], columnTypes: [] });
    const callee = jest.fn(([x]: Type[]) => x);

    expect(await automapTypes(makeContext(), [table], callee)).toEqual(table);
    expect(callee).toHaveBeenCalledWith([table]);
    callee.mockClear();

    const col = t.column(table);
    expect(await automapTypes(makeContext(), [col], callee)).toEqual(col);
    expect(callee).toHaveBeenCalledWith([table]);
    callee.mockClear();
  });
});

describe('automapValues', () => {
  it('can bump dimensions recursively', async () => {
    const multiDim = Column.fromValues([
      Column.fromValues([fromJS([2, 4]), fromJS([8, 16]), fromJS([32, 64])]),
    ]);

    const scalar = fromJS(2);

    const calledOnValues: Value[] = [];
    const result = await automapValues(
      makeContext(),
      [t.column(t.column(t.column(t.number()))), t.number()],
      [multiDim, scalar],
      async ([v1, v2]) => {
        calledOnValues.push(Column.fromValues([v1, v2]));
        return fromJS(
          ((await v1.getData()) as DeciNumber).mul(
            (await v2.getData()) as DeciNumber
          )
        );
      }
    );

    expect(await materializeOneResult(result.getData())).toMatchInlineSnapshot(`
      Array [
        Array [
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 4n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 8n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 16n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 32n,
              "s": 1n,
            },
          ],
          Array [
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 64n,
              "s": 1n,
            },
            DeciNumber {
              "d": 1n,
              "infinite": false,
              "n": 128n,
              "s": 1n,
            },
          ],
        ],
      ]
    `);
    expect(
      await materializeOneResult(
        await Promise.all(calledOnValues.map(async (v) => v.getData()))
      )
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
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
            "n": 4n,
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
            "n": 8n,
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
            "n": 16n,
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
            "n": 32n,
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
            "n": 64n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
        ],
      ]
    `);
  });

  describe('automapping', () => {
    const combine = async (values: Value[]) =>
      fromJS(
        (await Promise.all(values.map(async (v) => v.getData())))
          .map(String)
          .join('')
      );

    it('does not map a column, if mapFn already takes that cardinality', async () => {
      const result = await automapValues(
        makeContext(),
        [t.number(), t.number()],
        [fromJS(10), fromJS(1)],
        combine,
        [[1, 1]]
      );

      expect(await materializeOneResult(result.getData())).toEqual('101');
    });

    it('does not map a column, if mapFn already takes that cardinality (2D)', async () => {
      const values = fromJS([1, 2, 4]);

      const result = await automapValues(
        makeContext(),
        [t.column(t.number())],
        [values],
        sumOne,
        [[2]]
      );

      expect(await materializeOneResult(result.getData())).toEqual(N(7));
    });

    /* eslint-disable-next-line jest/no-disabled-tests */
    it.skip('supports reducing the last of many dimensions', async () => {
      const deepValues = fromJS([
        [1n, 2n, 4n],
        [8n, 16n, 32n],
      ]);

      const result = await automapValues(
        makeContext(),
        [t.column(t.column(t.number()))],
        [deepValues],
        sumOne,
        [[2]]
      );

      expect(await materializeOneResult(result.getData())).toEqual([7, 56]);
    });

    /* eslint-disable-next-line jest/no-disabled-tests */
    it.skip('supports reducing one of multiple args', async () => {
      const args = [fromJS([1, 2]), fromJS([1, 2, 3])];

      const calls: unknown[] = [];
      const result = await automapValues(
        makeContext(),
        [t.column(t.number()), t.column(t.number())],
        args,
        async ([a1, a2]: Value[]) => {
          const v1 = (await a1.getData()) as DeciNumber;
          const v2 = (await a2.getData()) as DeciNumber[];

          calls.push([v1, v2]);

          return fromJS(v2.map((v) => v.add(v1)));
        },
        [[1, 2]]
      );

      expect(calls).toEqual([
        [1, [1, 2, 3]],
        [2, [1, 2, 3]],
      ]);
      expect(await materializeOneResult(await result.getData())).toEqual([
        [2, 3, 4],
        [3, 4, 5],
      ]);
    });

    it('can go through a 2D array while picking non-top dimensions', async () => {
      const args = [
        fromJS([
          ['1', '2'],
          ['3', '4'],
        ]),
        fromJS(['-a', '-b']),
      ];

      const result = await automapValues(
        makeContext(),
        [t.column(t.column(t.number(), 'X')), t.column(t.number(), 'X')],
        args,
        combine
      );

      expect(await materializeOneResult(await result.getData())).toEqual([
        ['1-a', '2-b'],
        ['3-a', '4-b'],
      ]);
    });

    describe('raising a dimension', () => {
      it('supports raising a dimension', async () => {
        expect(
          await materializeOneResult(
            (
              await automapValues(
                makeContext(),
                [t.column(t.string(), 'Dimone'), t.column(t.number())],
                [fromJS(['A', 'B']), fromJS([1, 2, 3])],
                combine,
                [[1, 1]]
              )
            ).getData()
          )
        ).toMatchInlineSnapshot(`
          Array [
            Array [
              "A1",
              "A2",
              "A3",
            ],
            Array [
              "B1",
              "B2",
              "B3",
            ],
          ]
        `);
      });

      it('supports not raising all the dimensions', async () => {
        expect(
          await materializeOneResult(
            (
              await automapValues(
                makeContext(),
                [
                  t.column(t.string(), 'IndexOne'),
                  t.string(),
                  t.column(t.number(), 'IndexTwo'),
                ],
                [fromJS(['A', 'B']), fromJS('-'), fromJS([1, 2, 3])],
                combine,
                [[1, 1, 1]]
              )
            ).getData()
          )
        ).toMatchInlineSnapshot(`
          Array [
            Array [
              "A-1",
              "A-2",
              "A-3",
            ],
            Array [
              "B-1",
              "B-2",
              "B-3",
            ],
          ]
        `);
      });

      it('supports raising dims deeply', async () => {
        expect(
          await materializeOneResult(
            (
              await automapValues(
                makeContext(),
                [
                  t.column(t.string(), 'DimZero'),
                  t.column(t.number(), 'DimOne'),
                  t.column(t.string(), 'DimTwo'),
                ],
                [fromJS(['A']), fromJS([1, 2]), fromJS(['a', 'b', 'c'])],
                combine,
                [[1, 1, 1]]
              )
            ).getData()
          )
        ).toMatchInlineSnapshot(`
          Array [
            Array [
              Array [
                "A1a",
                "A1b",
                "A1c",
              ],
              Array [
                "A2a",
                "A2b",
                "A2c",
              ],
            ],
          ]
        `);
      });

      it('can raise the same dimension together in 2 different args', async () => {
        expect(
          await materializeOneResult(
            (
              await automapValues(
                makeContext(),
                [
                  t.column(t.string(), 'Index1'),
                  t.column(t.string(), 'DiffIndex'),
                  t.column(t.number(), 'Index1'),
                ],
                [fromJS(['A', 'B']), fromJS([',', ';']), fromJS([1, 2])],
                combine,
                [[1, 1, 1]]
              )
            ).getData()
          )
        ).toMatchInlineSnapshot(`
          Array [
            Array [
              "A,1",
              "A;1",
            ],
            Array [
              "B,2",
              "B;2",
            ],
          ]
        `);
      });
    });

    it('can operate between two higher-dimensional arguments', async () => {
      expect(
        await materializeOneResult(
          (
            await automapValues(
              makeContext(),
              [
                t.column(t.column(str, 'Letters'), 'Numbers'),
                t.column(t.column(str, 'Numbers'), 'Letters'),
              ],
              [
                fromJS([
                  ['a1 ', 'b1 ', 'c1 '],
                  ['a2 ', 'b2 ', 'c2 '],
                ]),
                fromJS([
                  ['A1', 'A2'],
                  ['B1', 'B2'],
                  ['C1', 'C2'],
                ]),
              ],
              combine,
              [[1, 1]]
            )
          ).getData()
        )
      ).toMatchInlineSnapshot(`
        Array [
          Array [
            "a1 A1",
            "b1 B1",
            "c1 C1",
          ],
          Array [
            "a2 A2",
            "b2 B2",
            "c2 C2",
          ],
        ]
      `);
    });
  });

  it('can take tables as arguments', async () => {
    const table = t.table({
      columnNames: ['Col'],
      columnTypes: [t.number()],
    });
    const tableVal = Table.fromNamedColumns([fromJS([1])], ['Col']);
    const otherTable = Table.fromNamedColumns([fromJS([2])], ['Col']);
    const callee = jest.fn(() => otherTable);

    const ctx = makeContext();
    expect(await automapValues(ctx, [table], [tableVal], callee)).toEqual(
      otherTable
    );
    expect(callee).toHaveBeenCalledWith([tableVal], [table], ctx);
    callee.mockClear();

    const colVal = Column.fromValues([tableVal]);
    const col = t.column(table);
    const ctx2 = makeContext();
    expect(
      await materializeOneResult(
        await (await automapValues(ctx2, [col], [colVal], callee)).getData()
      )
    ).toEqual(
      await materializeOneResult(
        await Column.fromValues([otherTable]).getData()
      )
    );
    expect(callee).toHaveBeenCalledWith([tableVal], [table], ctx2);
    callee.mockClear();
  });

  it('can pass the correct types to the map function', async () => {
    const mapFn = jest.fn(() => fromJS(1n));

    const type = t.number();
    const value = fromJS(1n);

    const ctx = makeContext();
    await automapValues(ctx, [type], [value], mapFn);

    expect(mapFn).toHaveBeenCalledWith([value], [type], ctx);
  });

  it('can pass the correct types to the map function (when reducing)', async () => {
    const mapFn = jest.fn(() => fromJS(1n));

    const reducedType = t.number();
    const type = t.column(reducedType);
    const reducedValue = fromJS(1n);
    const value = Column.fromValues([reducedValue]);

    const ctx = makeContext();
    const hc = await automapValues(ctx, [type], [value], mapFn);

    await materializeOneResult(hc.getData()); // trigger lazy execution

    expect(mapFn).toHaveBeenCalledWith([reducedValue], [reducedType], ctx);
  });
});

describe('automap for reducers', () => {
  describe('automapTypesForReducer', () => {
    it('automapTypesForReducer can call a reducer', async () => {
      const oneDeeType = t.column(t.number(), 'X');

      expect(
        await automapTypesForReducer(oneDeeType, sumFunctor)
      ).toMatchObject({
        type: 'number',
      });
    });

    it('automapTypesForReducer can reduce', async () => {
      const twoDeeType = t.column(t.column(t.number(), 'X'), 'Y');

      expect(
        await automapTypesForReducer(twoDeeType, sumFunctor)
      ).toMatchObject({
        indexedBy: 'Y',
        cellType: {
          type: 'number',
        },
      });
    });

    it('automapTypesForReducer can reduce the other way', async () => {
      const twoDeeType = t.column(t.column(t.number(), 'X'), 'Y');

      expect(
        await automapTypesForReducer(twoDeeType, sumFunctor)
      ).toMatchObject({
        cellType: {
          type: 'number',
        },
        indexedBy: 'Y',
      });
    });

    it('ensures that cardinality is high enough', async () => {
      const error = await automapTypesForReducer(t.number(), ([ret]) => ret);
      expect(error.errorCause?.spec).toMatchObject({
        errType: 'expected-but-got',
        expectedButGot: [t.column(t.anything()), t.number()],
      });
    });
  });

  describe('automapValuesForReducer', () => {
    it('automapValuesForReducer can call a reducer', async () => {
      const oneDeeType = t.column(t.number(), 'X');
      const oneDeeValue = fromJS([1, 2]);

      expect(
        await materializeOneResult(
          (
            await automapValuesForReducer(
              oneDeeType,
              oneDeeValue as Column,
              makeContext(),
              sumOne
            )
          )?.getData()
        )
      ).toMatchInlineSnapshot(`
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        }
      `);
    });

    it('automapValuesForReducer can reduce', async () => {
      const twoDeeType = t.column(t.column(t.number(), 'X'), 'Y');
      const twoDeeValue = fromJS([[1n], [2n]]);

      expect(
        await materializeOneResult(
          (
            await automapValuesForReducer(
              twoDeeType,
              twoDeeValue,
              makeContext(),
              sumOne
            )
          )?.getData()
        )
      ).toMatchInlineSnapshot(`
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
        ]
      `);
    });

    it('automapValuesForReducer can reduce the other way', async () => {
      const twoDeeType = t.column(t.column(t.number(), 'X'), 'Y');
      const twoDeeValue = fromJS([[1n, 2n]]);

      expect(
        await materializeOneResult(
          (
            await automapValuesForReducer(
              twoDeeType,
              twoDeeValue as Column,
              makeContext(),
              sumOne
            )
          )?.getData()
        )
      ).toMatchInlineSnapshot(`
        Array [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
        ]
      `);
    });

    it('can pass the correct types to the function', async () => {
      const mapFn = jest.fn(() => fromJS(1));

      const oneDeeType = t.column(t.number(), 'X');
      const oneDeeValue = fromJS([1n, 2n]);

      const ctx = makeContext();
      await automapValuesForReducer(
        oneDeeType,
        oneDeeValue as Column,
        ctx,
        mapFn
      );

      expect(mapFn).toHaveBeenCalledWith([oneDeeValue], [oneDeeType], ctx);
    });

    it('can pass the correct types to the function (with higher-dimensional args)', async () => {
      const mapFn = jest.fn(() => fromJS(1));

      const oneDeeType = t.column(t.number(), 'X');
      const twoDeeType = t.column(oneDeeType, 'Y');
      const oneDeeValue = fromJS([1n, 2n]);
      const twoDeeValue = Column.fromValues([oneDeeValue]);

      const ctx = makeContext();
      await materializeOneResult(
        (
          await automapValuesForReducer(
            twoDeeType,
            twoDeeValue as Column,
            ctx,
            mapFn
          )
        ).getData()
      );

      expect(mapFn).toHaveBeenCalledWith([oneDeeValue], [oneDeeType], ctx);
    });
  });
});
