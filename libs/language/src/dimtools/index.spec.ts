import * as Values from '../interpreter/Value';
import { Type, build as t } from '../type';
import { automapTypes, automapValues } from '.';

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

  it('can automap types', () => {
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
    const result = automapValues([multiDim, scalar], ([v1, v2]) => {
      calledOnValues.push(Values.Column.fromValues([v1, v2]));
      return Values.fromJS((v1.getData() as number) * (v2.getData() as number));
    });

    expect(result.getData()).toEqual([
      [
        [4, 8],
        [16, 32],
        [64, 128],
      ],
    ]);
    expect(calledOnValues.map((v) => v.getData())).toEqual([
      [2, 2],
      [4, 2],
      [8, 2],
      [16, 2],
      [32, 2],
      [64, 2],
    ]);
  });

  describe('automapping', () => {
    const sumOne = ([val]: Values.SimpleValue[]) =>
      Values.fromJS((val.getData() as number[]).reduce((a, b) => a + b));

    it('does not reduce the last dimension, leaving the mapfn to it', () => {
      const values = Values.fromJS([1, 2, 4]);

      const result = automapValues([values], sumOne, [2]);

      expect(result.getData()).toEqual(7);
    });

    it('supports reducing the last of many dimensions', () => {
      const deepValues = Values.fromJS([
        [1, 2, 4],
        [8, 16, 32],
      ]);

      const result = automapValues([deepValues], sumOne, [2]);

      expect(result.getData()).toEqual([7, 56]);
    });

    it('supports reducing one of multiple args', () => {
      const args = [Values.fromJS([1, 2]), Values.fromJS([1, 2, 3])];

      const calls: unknown[] = [];
      const result = automapValues(
        args,
        ([a1, a2]: Values.SimpleValue[]) => {
          const v1 = a1.getData() as number;
          const v2 = a2.getData() as number[];

          calls.push([v1, v2]);

          return Values.fromJS(v2.map((v) => v + v1));
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

    describe('raising a dimension', () => {
      const combine = (values: Values.SimpleValue[]) =>
        Values.fromJS(
          values
            .map((v) => v.getData())
            .map(String)
            .join('')
        );

      it('supports raising a dimension', () => {
        expect(
          automapValues(
            [Values.fromJS(['A', 'B']), Values.fromJS([1, 2, 3])],
            combine,
            [1, 1],
            ['Dimone', null]
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
              Values.fromJS(['A', 'B']),
              Values.fromJS('-'),
              Values.fromJS([1, 2, 3]),
            ],
            combine,
            [1, 1, 1],
            ['IndexOne', null, 'IndexTwo']
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
              Values.fromJS(['A']),
              Values.fromJS([1, 2]),
              Values.fromJS(['a', 'b', 'c']),
            ],
            combine,
            [1, 1, 1],
            ['DimZero', 'DimOne', 'DimTwo']
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
              Values.fromJS(['A', 'B']),
              Values.fromJS([',', ';']),
              Values.fromJS([1, 2]),
            ],

            combine,
            [1, 1, 1],
            ['Index1', 'DiffIndex', 'Index1']
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

    it('panics with less than 1 dimension', () => {
      expect(() => {
        automapValues([Values.fromJS(1)], sumOne, [2]);
      }).toThrow(/Panic/i);
    });
  });
});
