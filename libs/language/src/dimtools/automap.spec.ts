import Fraction from '@decipad/fraction';
import * as Values from '../interpreter/Value';
import { Type, build as t } from '../type';
import {
  automapTypes,
  automapTypesForReducer,
  automapValues,
  automapValuesForReducer,
} from './automap';
import { F } from '../utils';

// needed because JSON.stringify(BigInt) does not work
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON =
  function toJSON() {
    return this.toString();
  };

const bool = t.boolean();
const num = t.number();
const str = t.string();

describe('automapTypes', () => {
  it('shallow', () => {
    const calledOnTypes: Type[][] = [];

    const result = automapTypes([num, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(num);
    expect(calledOnTypes).toEqual([[num, str]]);
  });

  it('columns can be mapped with single type mapFns', () => {
    const type = t.column(str, 10);

    const calledOnTypes: Type[][] = [];
    const result = automapTypes([type, type], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('can bump dimensions recursively', () => {
    const type = t.column(t.column(t.column(str, 10), 11), 12);

    const calledOnTypes: Type[][] = [];
    const result = automapTypes([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  it('compares columns and scalars on equal footing', () => {
    const type = t.column(str, 10);

    const calledOnTypes: Type[][] = [];
    const result = automapTypes([type, str], ([t1, t2]) => {
      calledOnTypes.push([t1, t2]);
      return t1;
    });

    expect(result).toEqual(type);
    expect(calledOnTypes).toEqual([[str, str]]);
  });

  const typeId = (t: Type[]) => t[0];

  it('errors with incompatible dims', () => {
    const diffColLengths = automapTypes(
      [t.column(num, 1), t.column(num, 2)],
      typeId
    );
    expect(diffColLengths.errorCause).not.toBeNull();
  });

  /* eslint-disable-next-line jest/no-disabled-tests */
  it.skip('can automap types', () => {
    const total = ([a]: Type[]) => a.reduced();

    expect(automapTypes([t.column(num, 5)], total, [2])).toEqual(num);

    expect(automapTypes([t.column(t.column(num, 5), 1)], total, [2])).toEqual(
      t.column(num, 1)
    );

    expect(
      automapTypes(
        [t.column(num, 4), t.column(num, 5)],
        ([scalar, col]: Type[]) =>
          Type.combine(scalar.isScalar('number'), col.isColumn(5), str),
        [1, 2]
      )
    ).toEqual(t.column(str, 4));

    expect(automapTypes([num], total, [2])).toEqual(
      t.impossible('A column is required')
    );
  });

  it('Propagates errors from mapFn', () => {
    const cond = ([a, b, c]: Type[]) =>
      Type.combine(a.isScalar('boolean'), c.sameAs(b));
    const card = [1, 1, 1];

    expect(
      automapTypes(
        [t.column(bool, 3), t.column(str, 3), t.column(num, 3)],
        cond,
        card
      ).errorCause
    ).toBeDefined();
  });

  it('takes indexedBy of operands into account', () => {
    expect(
      automapTypes(
        [t.column(num, 5, 'Idx1'), t.column(num, 5, 'Idx1')],
        () => str
      )
    ).toMatchObject({
      indexedBy: 'Idx1',
    });

    const twoIndices = t.column(t.column(str, 1, 'Idx2d'), 5, 'Idx1');
    expect(automapTypes([twoIndices], () => str)).toMatchObject({
      indexedBy: 'Idx1',
      cellType: {
        indexedBy: 'Idx2d',
      },
    });

    const indicesTwo = t.column(t.column(str, 1, 'Idx2d'), 5, 'Idx1');
    expect(automapTypes([indicesTwo], () => str)).toMatchObject({
      indexedBy: 'Idx1',
      columnSize: 5,
      cellType: {
        columnSize: 1,
        indexedBy: 'Idx2d',
      },
    });
  });

  it('Can operate on two higher-dimensional types', () => {
    expect(
      automapTypes(
        [
          t.column(t.column(num, 3, 'Index2'), 2, 'Index1'),
          t.column(t.column(num, 2, 'Index1'), 3, 'Index2'),
        ],
        ([a, b]) => Type.combine(a.sameAs(b).isScalar('number'), str)
      )
    ).toMatchObject({
      indexedBy: 'Index1',
      cellType: {
        indexedBy: 'Index2',
        cellType: str,
      },
    });
  });

  it('Can heighten dimensions when it sees two index names', () => {
    expect(
      automapTypes(
        [t.column(num, 2, 'Index1'), t.column(num, 3, 'Index2')],
        () => str
      )
    ).toMatchObject({
      indexedBy: 'Index1',
      cellType: {
        indexedBy: 'Index2',
      },
    });

    expect(
      automapTypes(
        [
          t.column(num, 2, 'Index1'),
          t.column(num, 3, 'Index2'),
          t.column(num, 1, 'Index3'),
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

  it('can take tables as arguments', () => {
    const table = t.table({ columnNames: [], columnTypes: [], length: 123 });
    const callee = jest.fn(([x]: Type[]) => x);

    expect(automapTypes([table], callee)).toEqual(table);
    expect(callee).toHaveBeenCalledWith([table]);
    callee.mockClear();

    const col = t.column(table, 123);
    expect(automapTypes([col], callee)).toEqual(col);
    expect(callee).toHaveBeenCalledWith([table]);
    callee.mockClear();
  });
});

describe('automapValues', () => {
  it('can bump dimensions recursively', () => {
    const multiDim = Values.Column.fromValues([
      Values.Column.fromValues([
        Values.fromJS([2, 4]),
        Values.fromJS([8, 16]),
        Values.fromJS([32, 64]),
      ]),
    ]);

    const scalar = Values.fromJS(2);

    const calledOnValues: Values.Value[] = [];
    const result = automapValues(
      [t.column(t.column(t.column(t.number(), 2), 3), 1), t.number()],
      [multiDim, scalar],
      ([v1, v2]) => {
        calledOnValues.push(Values.Column.fromValues([v1, v2]));
        return Values.fromJS(
          (v1.getData() as Fraction).mul(v2.getData() as Fraction)
        );
      }
    );

    expect(result.getData()).toMatchInlineSnapshot(`
      Array [
        Array [
          Array [
            Fraction(4),
            Fraction(8),
          ],
          Array [
            Fraction(16),
            Fraction(32),
          ],
          Array [
            Fraction(64),
            Fraction(128),
          ],
        ],
      ]
    `);
    expect(calledOnValues.map((v) => v.getData())).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          Fraction(2),
        ],
        Array [
          Fraction(4),
          Fraction(2),
        ],
        Array [
          Fraction(8),
          Fraction(2),
        ],
        Array [
          Fraction(16),
          Fraction(2),
        ],
        Array [
          Fraction(32),
          Fraction(2),
        ],
        Array [
          Fraction(64),
          Fraction(2),
        ],
      ]
    `);
  });

  describe('automapping', () => {
    const sumOne = ([val]: Values.Value[]) =>
      Values.fromJS((val.getData() as Fraction[]).reduce((a, b) => a.add(b)));

    const combine = (values: Values.Value[]) =>
      Values.fromJS(
        values
          .map((v) => v.getData())
          .map(String)
          .join('')
      );

    it('does not map a column, if mapFn already takes that cardinality', () => {
      const result = automapValues(
        [t.number(), t.number()],
        [Values.fromJS(10), Values.fromJS(1)],
        combine,
        [1, 1]
      );

      expect(result.getData()).toEqual('101');
    });

    it('does not map a column, if mapFn already takes that cardinality (2D)', () => {
      const values = Values.fromJS([1, 2, 4]);

      const result = automapValues(
        [t.column(t.number(), 3)],
        [values],
        sumOne,
        [2]
      );

      expect(result.getData()).toEqual(F(7));
    });

    /* eslint-disable-next-line jest/no-disabled-tests */
    it.skip('supports reducing the last of many dimensions', () => {
      const deepValues = Values.fromJS([
        [1n, 2n, 4n],
        [8n, 16n, 32n],
      ]);

      const result = automapValues(
        [t.column(t.column(t.number(), 3), 2)],
        [deepValues],
        sumOne,
        [2]
      );

      expect(result.getData()).toEqual([7, 56]);
    });

    /* eslint-disable-next-line jest/no-disabled-tests */
    it.skip('supports reducing one of multiple args', () => {
      const args = [Values.fromJS([1, 2]), Values.fromJS([1, 2, 3])];

      const calls: unknown[] = [];
      const result = automapValues(
        [t.column(t.number(), 2), t.column(t.number(), 3)],
        args,
        ([a1, a2]: Values.Value[]) => {
          const v1 = a1.getData() as Fraction;
          const v2 = a2.getData() as Fraction[];

          calls.push([v1, v2]);

          return Values.fromJS(v2.map((v) => v.add(v1)));
        },
        [1, 2]
      );

      expect(calls).toEqual([
        [1, [1, 2, 3]],
        [2, [1, 2, 3]],
      ]);
      expect(result.getData()).toEqual([
        [2, 3, 4],
        [3, 4, 5],
      ]);
    });

    it('can go through a 2D array while picking non-top dimensions', () => {
      const args = [
        Values.fromJS([
          ['1', '2'],
          ['3', '4'],
        ]),
        Values.fromJS(['-a', '-b']),
      ];

      const result = automapValues(
        [
          t.column(t.column(t.number(), 2, 'X'), 2),
          t.column(t.number(), 2, 'X'),
        ],
        args,
        combine
      );

      expect(result.getData()).toEqual([
        ['1-a', '2-b'],
        ['3-a', '4-b'],
      ]);
    });

    describe('raising a dimension', () => {
      it('supports raising a dimension', () => {
        expect(
          automapValues(
            [t.column(t.string(), 2, 'Dimone'), t.column(t.number(), 3)],
            [Values.fromJS(['A', 'B']), Values.fromJS([1, 2, 3])],
            combine,
            [1, 1]
          ).getData()
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

      it('supports not raising all the dimensions', () => {
        expect(
          automapValues(
            [
              t.column(t.string(), 2, 'IndexOne'),
              t.string(),
              t.column(t.number(), 3, 'IndexTwo'),
            ],
            [
              Values.fromJS(['A', 'B']),
              Values.fromJS('-'),
              Values.fromJS([1, 2, 3]),
            ],
            combine,
            [1, 1, 1]
          ).getData()
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

      it('supports raising dims deeply', () => {
        expect(
          automapValues(
            [
              t.column(t.string(), 1, 'DimZero'),
              t.column(t.number(), 2, 'DimOne'),
              t.column(t.string(), 3, 'DimTwo'),
            ],
            [
              Values.fromJS(['A']),
              Values.fromJS([1, 2]),
              Values.fromJS(['a', 'b', 'c']),
            ],
            combine,
            [1, 1, 1]
          ).getData()
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

      it('can raise the same dimension together in 2 different args', () => {
        expect(
          automapValues(
            [
              t.column(t.string(), 2, 'Index1'),
              t.column(t.string(), 2, 'DiffIndex'),
              t.column(t.number(), 2, 'Index1'),
            ],
            [
              Values.fromJS(['A', 'B']),
              Values.fromJS([',', ';']),
              Values.fromJS([1, 2]),
            ],
            combine,
            [1, 1, 1]
          ).getData()
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

    it('can operate between two higher-dimensional arguments', () => {
      expect(
        automapValues(
          [
            t.column(t.column(str, 3, 'Letters'), 2, 'Numbers'),
            t.column(t.column(str, 2, 'Numbers'), 3, 'Letters'),
          ],
          [
            Values.fromJS([
              ['a1 ', 'b1 ', 'c1 '],
              ['a2 ', 'b2 ', 'c2 '],
            ]),
            Values.fromJS([
              ['A1', 'A2'],
              ['B1', 'B2'],
              ['C1', 'C2'],
            ]),
          ],
          combine,
          [1, 1, 1]
        ).getData()
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

    it('panics with less than 1 dimension', () => {
      expect(() => {
        automapValues([t.number()], [Values.fromJS(1)], sumOne, [2]);
      }).toThrow(/Panic/i);
    });
  });

  it('can take tables as arguments', () => {
    const table = t.table({
      columnNames: ['Col'],
      columnTypes: [t.number()],
      length: 123,
    });
    const tableVal = Values.Table.fromNamedColumns(
      [Values.fromJS([1])],
      ['Col']
    );
    const otherTable = Values.Table.fromNamedColumns(
      [Values.fromJS([2])],
      ['Col']
    );
    const callee = jest.fn(() => otherTable);

    expect(automapValues([table], [tableVal], callee)).toEqual(otherTable);
    expect(callee).toHaveBeenCalledWith([tableVal]);
    callee.mockClear();

    const colVal = Values.Column.fromValues([tableVal]);
    const col = t.column(table, 1);
    expect(automapValues([col], [colVal], callee)).toEqual(
      Values.Column.fromValues([otherTable])
    );
    expect(callee).toHaveBeenCalledWith([tableVal]);
    callee.mockClear();
  });
});

describe('automap for reducers', () => {
  const sum = ([value]: Values.Value[]) =>
    Values.fromJS((value.getData() as Fraction[]).reduce((a, b) => a.add(b)));
  const sumFunctor = ([type]: Type[]) => type.reduced().isScalar('number');

  it('automapTypesForReducer can call a reducer', () => {
    const oneDeeType = t.column(t.number(), 1, 'X');

    expect(
      automapTypesForReducer(oneDeeType, sumFunctor).toString()
    ).toMatchInlineSnapshot(`"<number>"`);
  });

  it('automapTypesForReducer can reduce', () => {
    const twoDeeType = t.column(t.column(t.number(), 1, 'X'), 2, 'Y');

    expect(
      automapTypesForReducer(twoDeeType, sumFunctor).toString()
    ).toMatchInlineSnapshot(`"<number> x 2"`);
  });

  it('automapTypesForReducer can reduce the other way', () => {
    const twoDeeType = t.column(t.column(t.number(), 2, 'X'), 1, 'Y');

    expect(
      automapTypesForReducer(twoDeeType, sumFunctor).toString()
    ).toMatchInlineSnapshot(`"<number> x 1"`);
  });

  it('automapValuesForReducer can call a reducer', () => {
    const oneDeeType = t.column(t.number(), 1, 'X');
    const oneDeeValue = Values.fromJS([1, 2]);

    expect(
      automapValuesForReducer(
        oneDeeType,
        oneDeeValue as Values.Column,
        sum
      )?.getData()
    ).toMatchInlineSnapshot(`Fraction(3)`);
  });

  it('automapValuesForReducer can reduce', () => {
    const twoDeeType = t.column(t.column(t.number(), 1, 'X'), 2, 'Y');
    const twoDeeValue = Values.fromJS([[1n], [2n]]);

    expect(
      automapValuesForReducer(
        twoDeeType,
        twoDeeValue as Values.Column,
        sum
      )?.getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
      ]
    `);
  });

  it('automapValuesForReducer can reduce the other way', () => {
    const twoDeeType = t.column(t.column(t.number(), 2, 'X'), 1, 'Y');
    const twoDeeValue = Values.fromJS([[1n, 2n]]);

    expect(
      automapValuesForReducer(
        twoDeeType,
        twoDeeValue as Values.Column,
        sum
      )?.getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(3),
      ]
    `);
  });
});
